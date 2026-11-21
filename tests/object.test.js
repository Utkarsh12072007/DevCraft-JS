import { describe, expect, it } from "vitest";
import {
  deepClone,
  deepMerge,
  pick,
  omit,
  get,
  set,
  has,
  sortByKey,
  sortByMultiple,
} from "../src/object/index.js";

describe("deepClone()", () => {
  it("returns primitive and null values unchanged", () => {
    expect(deepClone(null)).toBeNull();
    expect(deepClone(42)).toBe(42);
    expect(deepClone("value")).toBe("value");
  });

  it("deeply copies nested objects and arrays independently", () => {
    const original = { profile: { tags: ["js"] } };
    const clone = deepClone(original);
    clone.profile.tags.push("testing");
    expect(original.profile.tags).toEqual(["js"]);
  });

  it("clones Date, RegExp, Map, and Set values", () => {
    const original = {
      date: new Date("2020-01-01T00:00:00Z"),
      expression: /hello/gi,
      map: new Map([[{ id: 1 }, { active: true }]]),
      set: new Set([{ value: 2 }]),
    };
    const clone = deepClone(original);
    expect(clone.date).not.toBe(original.date);
    expect(clone.date).toEqual(original.date);
    expect(clone.expression).toEqual(original.expression);
    expect(clone.map).not.toBe(original.map);
    expect(clone.set).not.toBe(original.set);
    expect([...clone.map.keys()][0]).not.toBe([...original.map.keys()][0]);
    expect([...clone.set][0]).not.toBe([...original.set][0]);
  });

  it("preserves circular and shared references", () => {
    const shared = { value: 1 };
    const original = { left: shared, right: shared };
    original.self = original;
    const clone = deepClone(original);
    expect(clone.self).toBe(clone);
    expect(clone.left).toBe(clone.right);
    expect(clone.left).not.toBe(shared);
  });

  it("preserves aliases, RegExp state, custom properties, and shared view buffers", () => {
    const date = new Date("2024-01-01T00:00:00Z");
    date.label = { name: "created" };
    const expression = /item/gi;
    expression.lastIndex = 3;
    expression.label = "matcher";
    const buffer = new ArrayBuffer(8);
    const firstView = new Uint8Array(buffer, 0, 4);
    const secondView = new DataView(buffer, 2, 4);
    const input = { firstDate: date, secondDate: date, firstExpression: expression, secondExpression: expression, firstView, secondView };

    const clone = deepClone(input);

    expect(clone.firstDate).toBe(clone.secondDate);
    expect(clone.firstDate).not.toBe(date);
    expect(clone.firstDate.label).not.toBe(date.label);
    expect(clone.firstExpression).toBe(clone.secondExpression);
    expect(clone.firstExpression.lastIndex).toBe(3);
    expect(clone.firstExpression.label).toBe("matcher");
    expect(clone.firstView).not.toBe(firstView);
    expect(clone.secondView).not.toBe(secondView);
    expect(clone.firstView.buffer).toBe(clone.secondView.buffer);
    expect(clone.firstView.buffer).not.toBe(buffer);
  });

  it("clones custom enumerable properties on Map, Set, and ArrayBuffer", () => {
    const map = new Map([["key", "value"]]);
    map.metadata = { nested: true };
    const setValue = new Set([1]);
    setValue.metadata = { nested: true };
    const buffer = new ArrayBuffer(4);
    buffer.metadata = { nested: true };

    const clone = deepClone({ map, setValue, buffer });

    expect(clone.map.metadata).toEqual({ nested: true });
    expect(clone.map.metadata).not.toBe(map.metadata);
    expect(clone.setValue.metadata).toEqual({ nested: true });
    expect(clone.setValue.metadata).not.toBe(setValue.metadata);
    expect(clone.buffer.metadata).toEqual({ nested: true });
    expect(clone.buffer.metadata).not.toBe(buffer.metadata);
  });

  it("rejects types that cannot be cloned safely", () => {
    expect(() => deepClone(new WeakMap())).toThrow(TypeError);
    expect(() => deepClone(Promise.resolve("value"))).toThrow(TypeError);
    if (typeof SharedArrayBuffer !== "undefined") {
      expect(() => deepClone(new SharedArrayBuffer(4))).toThrow(TypeError);
    }
  });
});

describe("deepMerge()", () => {
  it("recursively merges nested objects from multiple sources", () => {
    expect(deepMerge({ nested: { a: 1 } }, { nested: { b: 2 } }, { c: 3 })).toEqual({
      nested: { a: 1, b: 2 },
      c: 3,
    });
  });

  it("replaces arrays and preserves null and undefined values", () => {
    expect(deepMerge({ list: [1, 2], value: 1 }, { list: [3], value: null, other: undefined })).toEqual({
      list: [3],
      value: null,
      other: undefined,
    });
  });

  it("does not mutate target or sources and clones nested values", () => {
    const target = { nested: { first: true } };
    const source = { nested: { second: true } };
    const result = deepMerge(target, source);
    result.nested.first = false;
    expect(target.nested.first).toBe(true);
    expect(source.nested.second).toBe(true);
  });

  it("handles empty objects and ignores unsafe keys", () => {
    const unsafeSource = JSON.parse('{"__proto__":{"polluted":true},"safe":1}');
    expect(deepMerge({}, {}, unsafeSource)).toEqual({ safe: 1 });
    expect({}.polluted).toBeUndefined();
  });

  it("rejects direct and nested cycles without mutating inputs", () => {
    const directCycle = {};
    directCycle.self = directCycle;
    const nestedCycle = { nested: {} };
    nestedCycle.nested.parent = nestedCycle;
    const target = { preserved: true };

    expect(() => deepMerge(target, directCycle)).toThrow("cyclic source object");
    expect(() => deepMerge(target, nestedCycle)).toThrow("cyclic source object");
    expect(target).toEqual({ preserved: true });
    expect(directCycle.self).toBe(directCycle);
  });

  it("still merges repeated non-cyclic references and multiple sources", () => {
    const shared = { value: 1 };
    expect(deepMerge({}, { first: shared, second: shared }, { third: { value: 3 } })).toEqual({
      first: { value: 1 },
      second: { value: 1 },
      third: { value: 3 },
    });
    expect(deepMerge({ items: [1, 2] }, { items: [3] }).items).toEqual([3]);
  });
});

describe("pick()", () => {
  it("selects existing own properties and ignores missing keys", () => {
    expect(pick({ name: "Ava", age: 20 }, ["name", "missing"])).toEqual({ name: "Ava" });
  });

  it("supports empty keys and keeps nested values without mutating input", () => {
    const nested = { value: 1 };
    const input = { nested };
    expect(pick(input, [])).toEqual({});
    expect(pick(input, ["nested"]).nested).toBe(nested);
    expect(input).toEqual({ nested });
  });

  it("does not select inherited properties and validates keys", () => {
    const input = Object.create({ inherited: true });
    input.own = true;
    expect(pick(input, ["inherited", "own"])).toEqual({ own: true });
    expect(() => pick({}, "key")).toThrow(TypeError);
  });
});

describe("omit()", () => {
  it("omits requested properties and ignores absent keys", () => {
    expect(omit({ name: "Ava", secret: 1 }, ["secret", "missing"])).toEqual({ name: "Ava" });
  });

  it("returns a shallow copy for empty exclusions without mutating input", () => {
    const input = { nested: { value: 1 } };
    const result = omit(input, []);
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
    expect(result.nested).toBe(input.nested);
  });

  it("validates the exclusion list", () => {
    expect(() => omit({}, null)).toThrow(TypeError);
  });
});

describe("get()", () => {
  it("reads nested dot paths, array paths, and array indexes", () => {
    const input = { users: [{ profile: { name: "Ava" } }] };
    expect(get(input, "users.0.profile.name")).toBe("Ava");
    expect(get(input, ["users", 0, "profile", "name"])).toBe("Ava");
  });

  it("uses fallback only for missing paths and handles nullish intermediates", () => {
    const input = { present: undefined, blocked: null };
    expect(get(input, "missing", "fallback")).toBe("fallback");
    expect(get(input, "present", "fallback")).toBeUndefined();
    expect(get(input, "blocked.child", "fallback")).toBe("fallback");
    expect(get(null, "a.b", "fallback")).toBe("fallback");
  });

  it("rejects malformed and unsafe paths", () => {
    expect(() => get({}, "a..b")).toThrow(TypeError);
    expect(() => get({}, ["__proto__"])).toThrow(TypeError);
    expect(() => get({}, 4)).toThrow(TypeError);
  });
});

describe("set()", () => {
  it("sets and updates nested properties using dot or array paths", () => {
    const input = {};
    expect(set(input, "profile.name", "Ava")).toBe(input);
    set(input, ["profile", "age"], 20);
    expect(input).toEqual({ profile: { name: "Ava", age: 20 } });
  });

  it("creates arrays for numeric next path segments", () => {
    const input = {};
    set(input, "users.0.name", "Ava");
    expect(input).toEqual({ users: [{ name: "Ava" }] });
  });

  it("rejects invalid roots and unsafe paths", () => {
    expect(() => set(null, "a", 1)).toThrow(TypeError);
    expect(() => set({}, "constructor.prototype.x", true)).toThrow(TypeError);
    expect(() => set({}, "", 1)).toThrow(TypeError);
  });
});

describe("has()", () => {
  it("checks own nested properties and array indexes", () => {
    const input = { rows: [{ value: 0 }] };
    expect(has(input, "rows.0.value")).toBe(true);
    expect(has(input, ["rows", 0, "value"])).toBe(true);
    expect(has(input, "rows.1.value")).toBe(false);
  });

  it("counts false, zero, null, and undefined values as existing", () => {
    const input = { no: false, count: 0, empty: null, unset: undefined };
    for (const key of Object.keys(input)) expect(has(input, key)).toBe(true);
    expect(has(input, "missing")).toBe(false);
    expect(has({ child: null }, "child.value")).toBe(false);
  });
});

describe("sortByKey()", () => {
  it("sorts numbers and strings in ascending or descending order", () => {
    expect(sortByKey([{ n: 3 }, { n: 1 }, { n: 2 }], "n").map(x => x.n)).toEqual([1, 2, 3]);
    expect(sortByKey([{ n: 1 }, { n: 3 }, { n: 2 }], "n", "desc").map(x => x.n)).toEqual([3, 2, 1]);
    expect(sortByKey([{ s: "b" }, { s: "A" }], "s").map(x => x.s)).toEqual(["A", "b"]);
    expect(sortByKey([{ s: "A" }, { s: "b" }], "s", "desc").map(x => x.s)).toEqual(["b", "A"]);
  });

  it("keeps duplicate values stable, places nullish keys last, and does not mutate", () => {
    const input = [{ key: 1, id: "first" }, { key: 1, id: "second" }, { key: null }, {}, { key: 0 }];
    const result = sortByKey(input, "key");
    expect(result.map(x => x.id ?? x.key)).toEqual([0, "first", "second", null, undefined]);
    expect(input[0].id).toBe("first");
    expect(result).not.toBe(input);
  });

  it("handles empty and single-element arrays and validates order", () => {
    expect(sortByKey([], "x")).toEqual([]);
    const item = { x: 1 };
    expect(sortByKey([item], "x")).toEqual([item]);
    expect(() => sortByKey([], "x", "sideways")).toThrow(RangeError);
  });
});

describe("sortByMultiple()", () => {
  it("sorts by multiple keys with independent directions", () => {
    const input = [
      { team: "B", score: 1 },
      { team: "A", score: 1 },
      { team: "A", score: 3 },
    ];
    expect(sortByMultiple(input, [{ key: "team", order: "asc" }, { key: "score", order: "desc" }])).toEqual([
      input[2], input[1], input[0],
    ]);
  });

  it("sorts nullish and missing values last and remains stable on ties", () => {
    const input = [{ key: 1, id: "a" }, { key: 1, id: "b" }, { key: null }, {}];
    const result = sortByMultiple(input, [{ key: "key", order: "desc" }]);
    expect(result.map(item => item.id ?? item.key)).toEqual(["a", "b", null, undefined]);
    expect(result).not.toBe(input);
    expect(input[0].id).toBe("a");
  });

  it("handles empty and single-element arrays and rejects invalid configurations", () => {
    expect(sortByMultiple([], [])).toEqual([]);
    const item = { x: 1 };
    expect(sortByMultiple([item], [{ key: "x", order: "asc" }])).toEqual([item]);
    expect(() => sortByMultiple([], null)).toThrow(TypeError);
    expect(() => sortByMultiple([], [{ key: "x", order: "up" }])).toThrow(TypeError);
  });
});
