import { afterEach, describe, expect, it, vi } from "vitest";
import {
  once,
  memoize,
  curry,
  compose,
  pipe,
  partial,
  debounce,
} from "../src/function/index.js";

afterEach(() => vi.useRealTimers());

describe("once", () => {
  it("runs once and returns its cached first result", () => {
    const fn = vi.fn((value) => value * 2);
    const wrapped = once(fn);
    expect(wrapped(3)).toBe(6);
    expect(wrapped(9)).toBe(6);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it("passes arguments and receiver, and retries after a throw", () => {
    const fn = vi.fn(function (a, b) {
      return this.value + a + b;
    });
    const wrapped = once(fn);
    expect(wrapped.call({ value: 2 }, 3, 4)).toBe(9);
    expect(wrapped.call({ value: 5 }, 8, 9)).toBe(9);
    const flaky = vi
      .fn()
      .mockImplementationOnce(() => {
        throw Error("retry");
      })
      .mockReturnValue("ok");
    const safe = once(flaky);
    expect(() => safe()).toThrow("retry");
    expect(safe()).toBe("ok");
    expect(flaky).toHaveBeenCalledTimes(2);
  });
  it("validates its input", () => expect(() => once(null)).toThrow(TypeError));
});

describe("memoize", () => {
  it("caches argument combinations and supports nullish values", () => {
    const fn = vi.fn((...args) => args.length);
    const cached = memoize(fn);
    expect(cached(1, 2)).toBe(2);
    expect(cached(1, 2)).toBe(2);
    cached(2, 1);
    cached(undefined);
    cached(null);
    expect(fn).toHaveBeenCalledTimes(4);
  });
  it("uses object identity, custom resolver, and receiver in cache keys", () => {
    const object = {};
    const fn = vi.fn(function (item) {
      return this.prefix + String(item.id);
    });
    const cached = memoize(fn);
    const receiver = { prefix: "a" };
    expect(cached.call(receiver, object)).toBe("aundefined");
    cached.call(receiver, object);
    expect(fn).toHaveBeenCalledTimes(1);
    const byId = memoize((item) => item.id, { resolver: (item) => item.id });
    expect(byId({ id: 1 })).toBe(1);
    expect(byId({ id: 1 })).toBe(1);
  });
  it("does not cache thrown errors and validates options", () => {
    const fn = vi
      .fn()
      .mockImplementationOnce(() => {
        throw Error("fail");
      })
      .mockReturnValue(2);
    const cached = memoize(fn);
    expect(() => cached(1)).toThrow("fail");
    expect(cached(1)).toBe(2);
    expect(() => memoize(1)).toThrow(TypeError);
    expect(() => memoize(() => 1, { resolver: 2 })).toThrow(TypeError);
  });
});

describe("curry", () => {
  it("accepts one or several arguments at a time", () => {
    const add = curry((a, b, c) => a + b + c);
    expect(add(1)(2)(3)).toBe(6);
    expect(add(1, 2)(3)).toBe(6);
    expect(add(1)(2, 3)).toBe(6);
    expect(add(1, 2, 3)).toBe(6);
  });
  it("waits for declared arity, passes extra arguments, and supports zero arity", () => {
    const fn = vi.fn((a, b) => a + b);
    const staged = curry(fn)(1);
    expect(fn).not.toHaveBeenCalled();
    expect(staged(2, 3)).toBe(3);
    expect(curry(() => "done")()).toBe("done");
    expect(() => curry(null)).toThrow(TypeError);
  });
});

describe("compose", () => {
  it("executes from right to left and supports empty and single compositions", () => {
    const calculate = compose(
      (value) => value - 1,
      (value) => value * 3,
      (value) => value + 2,
    );
    expect(calculate(5)).toBe(20);
    expect(compose((value) => value * 2)(3)).toBe(6);
    expect(compose()(3)).toBe(3);
  });
  it("passes initial arguments and propagates errors", () => {
    expect(
      compose(
        (value) => value + 1,
        (a, b) => a + b,
      )(2, 3),
    ).toBe(6);
    expect(() =>
      compose(() => {
        throw Error("failure");
      })(),
    ).toThrow("failure");
    expect(() => compose(() => {}, null)).toThrow(TypeError);
  });
});

describe("pipe", () => {
  it("executes from left to right and supports empty and single pipelines", () => {
    const calculate = pipe(
      (value) => value + 2,
      (value) => value * 3,
      (value) => value - 1,
    );
    expect(calculate(5)).toBe(20);
    expect(pipe((value) => value * 2)(3)).toBe(6);
    expect(pipe()(3)).toBe(3);
  });
  it("passes initial arguments and propagates errors", () => {
    expect(
      pipe(
        (a, b) => a + b,
        (value) => value * 2,
      )(2, 3),
    ).toBe(10);
    expect(() => pipe(null)).toThrow(TypeError);
    expect(() =>
      pipe(() => {
        throw Error("failure");
      })(),
    ).toThrow("failure");
  });
});

describe("partial", () => {
  it("pre-fills multiple arguments in order and accepts remaining values", () => {
    const multiply = (a, b, c) => a * b * c;
    expect(partial(multiply, 2)(3, 4)).toBe(24);
    expect(partial((...values) => values.join("-"), "a", "b")("c")).toBe(
      "a-b-c",
    );
  });
  it("preserves call-time receiver without modifying the original function", () => {
    function greet(greeting, name) {
      return `${greeting}, ${this.title} ${name}`;
    }
    const wrapped = partial(greet, "Hello");
    expect(wrapped.call({ title: "Dr." }, "Ava")).toBe("Hello, Dr. Ava");
    expect(greet.length).toBe(2);
    expect(() => partial(null)).toThrow(TypeError);
  });
});

describe("debounce", () => {
  it("executes once after the delay using the latest arguments", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const wrapped = debounce(fn, 20);
    wrapped("first");
    vi.advanceTimersByTime(10);
    wrapped("last");
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(20);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("last");
  });
  it("preserves this, accepts zero delay, and validates arguments", () => {
    vi.useFakeTimers();
    const fn = vi.fn(function (value) {
      return this.prefix + value;
    });
    const wrapped = debounce(fn, 0);
    wrapped.call({ prefix: "x" }, "y");
    vi.runAllTimers();
    expect(fn).toHaveReturnedWith("xy");
    expect(() => debounce(null, 1)).toThrow(TypeError);
    expect(() => debounce(() => {}, -1)).toThrow(RangeError);
  });
});
