import { afterEach, describe, expect, it, vi } from "vitest";
import { sleep, retry, withTimeout, mapAsync, pLimit, debounceAsync, promiseAllSettled } from "../src/async/index.js";

afterEach(() => vi.useRealTimers());

describe("sleep", () => {
  it("resolves after the requested duration and accepts zero", async () => {
    vi.useFakeTimers();
    const pending = sleep(10);
    await vi.advanceTimersByTimeAsync(10);
    await expect(pending).resolves.toBeUndefined();
    const immediate = sleep(0);
    await vi.advanceTimersByTimeAsync(0);
    await expect(immediate).resolves.toBeUndefined();
  });
  it("rejects invalid durations", () => {
    expect(() => sleep(-1)).toThrow(RangeError);
    expect(() => sleep(Infinity)).toThrow(RangeError);
    expect(() => sleep("1")).toThrow(RangeError);
  });
});

describe("retry", () => {
  it("retries failures then returns the successful value", async () => {
    const fn = vi.fn().mockRejectedValueOnce(Error("first")).mockResolvedValue("ok");
    await expect(retry(fn, { retries: 1, delay: 0 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it("retries synchronous throws and rejects with the final error", async () => {
    const error = Error("final");
    const fn = vi.fn().mockImplementation(() => { throw error; });
    await expect(retry(fn, { retries: 2, delay: 0 })).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(3);
  });
  it("validates options", async () => {
    await expect(retry(null)).rejects.toThrow(TypeError);
    await expect(retry(() => 1, { retries: -1 })).rejects.toThrow(RangeError);
    await expect(retry(() => 1, { backoff: NaN })).rejects.toThrow(RangeError);
  });
});

describe("withTimeout", () => {
  it("passes through resolved and rejected outcomes", async () => {
    await expect(withTimeout(Promise.resolve(4), 100)).resolves.toBe(4);
    const error = Error("rejected");
    await expect(withTimeout(Promise.reject(error), 100)).rejects.toBe(error);
  });
  it("rejects when the deadline expires and validates timeout", async () => {
    vi.useFakeTimers();
    const pending = withTimeout(new Promise(() => {}), 5);
    const assertion = expect(pending).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(5);
    await assertion;
    expect(() => withTimeout(Promise.resolve(), -1)).toThrow(RangeError);
  });
});

describe("mapAsync", () => {
  it("maps in order with bounded parallel work", async () => {
    let active = 0;
    let peak = 0;
    const output = await mapAsync([1, 2, 3, 4], async (value) => {
      active += 1;
      peak = Math.max(peak, active);
      await Promise.resolve();
      active -= 1;
      return value * 2;
    }, 2);
    expect(output).toEqual([2, 4, 6, 8]);
    expect(peak).toBeLessThanOrEqual(2);
  });
  it("handles empty input, callback errors, and invalid concurrency", async () => {
    await expect(mapAsync([], async x => x)).resolves.toEqual([]);
    await expect(mapAsync([1], async () => { throw Error("bad"); })).rejects.toThrow("bad");
    await expect(mapAsync([], () => {}, 0)).rejects.toThrow(RangeError);
    await expect(mapAsync({}, () => {})).rejects.toThrow(TypeError);
  });
});

describe("pLimit", () => {
  it("limits active tasks and preserves each result", async () => {
    const limit = pLimit(2);
    let active = 0;
    let peak = 0;
    const tasks = [1, 2, 3].map(value => limit(async () => {
      active += 1;
      peak = Math.max(peak, active);
      await Promise.resolve();
      active -= 1;
      return value;
    }));
    await expect(Promise.all(tasks)).resolves.toEqual([1, 2, 3]);
    expect(peak).toBeLessThanOrEqual(2);
  });
  it("converts synchronous throws into rejections and validates limit", async () => {
    const limit = pLimit(1);
    await expect(limit(() => { throw Error("sync"); })).rejects.toThrow("sync");
    expect(() => pLimit(0)).toThrow(RangeError);
  });
});

describe("debounceAsync", () => {
  it("uses the latest call arguments and settles all waiting callers", async () => {
    vi.useFakeTimers();
    const fn = vi.fn(async value => value.toUpperCase());
    const debounced = debounceAsync(fn, 5);
    const first = debounced("old");
    const second = debounced("new");
    await vi.advanceTimersByTimeAsync(5);
    await expect(Promise.all([first, second])).resolves.toEqual(["NEW", "NEW"]);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it("rejects all callers on failure and preserves this context", async () => {
    vi.useFakeTimers();
    const object = { value: "ok", run: debounceAsync(async function () { return this.value; }, 2) };
    const result = object.run();
    await vi.advanceTimersByTimeAsync(2);
    await expect(result).resolves.toBe("ok");
  });
});

describe("promiseAllSettled", () => {
  it("returns ordered settlements for values and promises", async () => {
    const error = Error("no");
    await expect(promiseAllSettled([Promise.resolve(2), 3, Promise.reject(error)])).resolves.toEqual([
      { status: "fulfilled", value: 2 },
      { status: "fulfilled", value: 3 },
      { status: "rejected", reason: error },
    ]);
  });
  it("handles empty iterables and rejects non-iterable input", async () => {
    await expect(promiseAllSettled([])).resolves.toEqual([]);
    for (const value of [null, undefined, 2]) expect(() => promiseAllSettled(value)).toThrow(TypeError);
  });
});
