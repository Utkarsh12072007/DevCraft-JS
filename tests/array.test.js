import { describe, it, expect, vi } from "vitest";
import { chunk, unique, uniqueBy, groupBy, partition, shuffle, flatten, difference } from "../src/index.js";

describe("chunk()", () => {

    it("should divide an array into chunks", () => {
        const result = chunk([1, 2, 3, 4, 5, 6], 2);

        expect(result).toEqual([
            [1, 2],
            [3, 4],
            [5, 6]
        ]);
    });

    it("should handle the remaining elements", () => {
        const result = chunk([1, 2, 3, 4, 5], 2);

        expect(result).toEqual([
            [1, 2],
            [3, 4],
            [5]
        ]);
    });

    it("should return an empty array for empty input", () => {
        expect(chunk([], 3)).toEqual([]);
    });

    it("should reject non-array inputs", () => {
        expect(() => chunk("hello", 2)).toThrow(TypeError);
    });

    it("should reject zero or negative sizes", () => {
        expect(() => chunk([1, 2], 0)).toThrow(RangeError);
        expect(() => chunk([1, 2], -1)).toThrow(RangeError);
    });

    it("should reject decimal sizes", () => {
        expect(() => chunk([1, 2], 1.5)).toThrow(RangeError);
    });

});



describe("unique()", () => {

    it("should remove duplicate numbers", () => {
        expect(unique([1, 2, 2, 3, 3, 4])).toEqual([
            1, 2, 3, 4
        ]);
    });

    it("should remove duplicate strings", () => {
        expect(unique(["a", "b", "a", "c"])).toEqual([
            "a", "b", "c"
        ]);
    });

    it("should preserve original order", () => {
        expect(unique([3, 1, 2, 1, 3])).toEqual([
            3, 1, 2
        ]);
    });

    it("should handle empty arrays", () => {
        expect(unique([])).toEqual([]);
    });

    it("should handle arrays without duplicates", () => {
        expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("should reject non-array inputs", () => {
        expect(() => unique("hello")).toThrow(TypeError);
    });

});


describe("uniqueBy()", () => {

    const users = [
        { id: 1, name: "Utkarsh" },
        { id: 2, name: "Rahul" },
        { id: 1, name: "Aman" },
        { id: 3, name: "Priya" }
    ];

    it("should remove duplicate objects by property", () => {
        expect(uniqueBy(users, "id")).toEqual([
            { id: 1, name: "Utkarsh" },
            { id: 2, name: "Rahul" },
            { id: 3, name: "Priya" }
        ]);
    });

    it("should support callback-based uniqueness", () => {
        expect(uniqueBy(users, user => user.id)).toEqual([
            users[0],
            users[1],
            users[3]
        ]);
    });

    it("should preserve the original order", () => {
        const result = uniqueBy(users, "id");

        expect(result[0].name).toBe("Utkarsh");
        expect(result[1].name).toBe("Rahul");
    });

    it("should handle empty arrays", () => {
        expect(uniqueBy([], "id")).toEqual([]);
    });

    it("should reject non-array inputs", () => {
        expect(() => uniqueBy("hello", "id")).toThrow(TypeError);
    });

    it("should reject invalid key arguments", () => {
        expect(() => uniqueBy(users, 123)).toThrow(TypeError);
    });

});


describe("groupBy()", () => {

    const products = [
        { name: "iPhone", category: "Electronics" },
        { name: "Shirt", category: "Clothing" },
        { name: "Laptop", category: "Electronics" },
        { name: "Jeans", category: "Clothing" }
    ];

    it("should group elements by property", () => {
        const result = groupBy(products, "category");

        expect(result.Electronics).toHaveLength(2);
        expect(result.Clothing).toHaveLength(2);
    });

    it("should support callback-based grouping", () => {
        const result = groupBy(products, item => item.category);

        expect(result).toEqual(groupBy(products, "category"));
    });

    it("should preserve elements inside groups", () => {
        const result = groupBy(products, "category");

        expect(result.Electronics).toEqual([
            products[0],
            products[2]
        ]);
    });

    it("should handle empty arrays", () => {
        expect(groupBy([], "category")).toEqual({});
    });

    it("should reject non-array inputs", () => {
        expect(() => groupBy("hello", "category")).toThrow(TypeError);
    });

    it("should reject invalid key arguments", () => {
        expect(() => groupBy(products, 123)).toThrow(TypeError);
    });

});

describe("partition()", () => {
    it("partitions in one pass and preserves order", () => {
        const predicate = vi.fn(value => value % 2 === 0);
        expect(partition([1, 2, 3, 4], predicate)).toEqual([[2, 4], [1, 3]]);
        expect(predicate).toHaveBeenCalledTimes(4);
    });
    it("handles empty input and validates arguments", () => {
        expect(partition([], () => true)).toEqual([[], []]);
        expect(() => partition("x", () => true)).toThrow(TypeError);
        expect(() => partition([], 1)).toThrow(TypeError);
    });
});

describe("shuffle()", () => {
    it("returns a copy with the same values without mutating", () => {
        const input = [1, 2, 3, 4];
        const result = shuffle(input);
        expect(result).not.toBe(input);
        expect([...result].sort()).toEqual(input);
        expect(input).toEqual([1, 2, 3, 4]);
    });
    it("handles empty arrays and rejects invalid inputs", () => {
        expect(shuffle([])).toEqual([]);
        expect(() => shuffle(null)).toThrow(TypeError);
    });
});

describe("flatten()", () => {
    it("supports default, finite, and infinite depth", () => {
        const nested = [1, [2, [3]]];
        expect(flatten(nested)).toEqual([1, 2, [3]]);
        expect(flatten(nested, 2)).toEqual([1, 2, 3]);
        expect(flatten(nested, Infinity)).toEqual([1, 2, 3]);
        expect(nested).toEqual([1, [2, [3]]]);
    });
    it("handles empty input and invalid depths", () => {
        expect(flatten([])).toEqual([]);
        expect(() => flatten([], -1)).toThrow(RangeError);
        expect(() => flatten([], 1.5)).toThrow(RangeError);
        expect(() => flatten({})).toThrow(TypeError);
    });
});

describe("difference()", () => {
    it("preserves order and duplicates from the first array", () => {
        expect(difference([3, 1, 2, 1, 4], [2, 4])).toEqual([3, 1, 1]);
    });
    it("handles empty inputs and validates both arrays", () => {
        expect(difference([], [1])).toEqual([]);
        expect(difference([1], [])).toEqual([1]);
        expect(() => difference([], null)).toThrow(TypeError);
    });
});

describe("groupBy() special keys", () => {
    it("safely supports prototype-like keys", () => {
        expect(groupBy(["x"], () => "__proto__")["__proto__"]).toEqual(["x"]);
    });
});

describe("array utility edge cases", () => {
    it("chunk() accepts a chunk larger than the input and does not alter nested values", () => {
        const nested = { value: 1 };
        const input = [nested];
        const output = chunk(input, 20);
        expect(output).toEqual([[nested]]);
        expect(output).not.toBe(input);
        expect(() => chunk([1], NaN)).toThrow(RangeError);
        expect(() => chunk([1], Infinity)).toThrow(RangeError);
        expect(chunk([1, 2, 3, 4], 1)).toEqual([[1], [2], [3], [4]]);
    });

    it("unique() uses SameValueZero and object reference equality", () => {
        const object = {};
        expect(unique([NaN, NaN, null, undefined, undefined, object, object, {}])).toEqual([
            NaN, null, undefined, object, expect.any(Object)
        ]);
    });

    it("uniqueBy() handles missing keys, nullish values, and null elements", () => {
        const input = [{ id: undefined }, {}, null, { id: null }, { id: null }, null];
        expect(uniqueBy(input, "id")).toEqual([input[0], input[3]]);
        expect(uniqueBy([1, 2, 3], () => undefined)).toEqual([1]);
        expect(uniqueBy([1, 2, 3], () => null)).toEqual([1]);
        expect(() => uniqueBy([null], key => key.id)).toThrow(TypeError);
    });

    it("groupBy() coerces numeric and string-equivalent keys and groups missing keys", () => {
        const rows = [{ key: 1 }, { key: "1" }, {}, { key: undefined }];
        const result = groupBy(rows, "key");
        expect(result["1"]).toEqual(rows.slice(0, 2));
        expect(result.undefined).toEqual(rows.slice(2));
        expect(Object.hasOwn(result, "__proto__")).toBe(false);
    });

    it("partition() handles all and no matches and passes value and index", () => {
        const input = ["a", "b"];
        const predicate = vi.fn((value, index) => value === "b" && index === 1);
        expect(partition(input, () => true)).toEqual([input, []]);
        expect(partition(input, () => false)).toEqual([[], input]);
        expect(partition(input, predicate)).toEqual([["b"], ["a"]]);
        expect(predicate.mock.calls).toEqual([["a", 0], ["b", 1]]);
        expect(input).toEqual(["a", "b"]);
    });

    it("shuffle() follows Fisher-Yates swap boundaries under controlled randomness", () => {
        const random = vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValueOnce(0.999999);
        try {
            expect(shuffle(["a", "b", "c"])).toEqual(["c", "b", "a"]);
            expect(random).toHaveBeenCalledTimes(2);
        } finally {
            random.mockRestore();
        }
        expect(shuffle([1])).toEqual([1]);
        expect(shuffle(Array.from({ length: 5000 }, (_, index) => index))).toHaveLength(5000);
    });

    it("flatten() covers depth boundaries, non-arrays, and deeply nested input", () => {
        const nested = [1, [2, [3, [4]]], null, undefined];
        expect(flatten(nested, 0)).toEqual(nested);
        expect(flatten(nested, 1)).toEqual([1, 2, [3, [4]], null, undefined]);
        expect(flatten(nested, 2)).toEqual([1, 2, 3, [4], null, undefined]);
        expect(flatten([[[[["deep"]]]]], Infinity)).toEqual(["deep"]);
        expect(flatten([1, "x", null])).toEqual([1, "x", null]);
        expect(() => flatten([], -Infinity)).toThrow(RangeError);
        expect(() => flatten([], NaN)).toThrow(RangeError);
        expect(() => flatten([], "2")).toThrow(RangeError);
    });

    it("difference() uses SameValueZero, preserves duplicates and leaves inputs unchanged", () => {
        const left = [NaN, 1, 1, null, undefined, "x"];
        const right = [NaN, null, "absent"];
        expect(difference(left, right)).toEqual([1, 1, undefined, "x"]);
        expect(left).toEqual([NaN, 1, 1, null, undefined, "x"]);
        expect(right).toEqual([NaN, null, "absent"]);
        expect(difference([], [])).toEqual([]);
        expect(difference([1], [1])).toEqual([]);
        expect(() => difference(null, [])).toThrow(TypeError);
    });

    it("handles large arrays without changing their size or order semantics", () => {
        const values = Array.from({ length: 10000 }, (_, index) => index % 1000);
        expect(unique(values)).toHaveLength(1000);
        expect(chunk(values, 333)).toHaveLength(31);
        expect(difference(values, [0, 1])).toHaveLength(9980);
        expect(partition(values, value => value < 500)[0]).toHaveLength(5000);
    });
});
