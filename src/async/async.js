function validateDuration(milliseconds, name) {
  if (typeof milliseconds !== "number" || !Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new RangeError(`${name} must be a finite non-negative number`);
  }
}

function validateFunction(fn, name = "fn") {
  if (typeof fn !== "function") throw new TypeError(`${name} must be a function`);
}

/** Resolves after the given non-negative number of milliseconds without blocking the event loop. */
export function sleep(ms) {
  validateDuration(ms, "Duration");
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retries sync or async function failures; retries counts additional attempts. */
export async function retry(fn, options = {}) {
  validateFunction(fn);
  if (options === null || typeof options !== "object") throw new TypeError("Options must be an object");
  const { retries = 3, delay = 1000, backoff = 1 } = options;
  if (!Number.isInteger(retries) || retries < 0) throw new RangeError("Retries must be a non-negative integer");
  validateDuration(delay, "Delay");
  if (typeof backoff !== "number" || !Number.isFinite(backoff) || backoff < 0) {
    throw new RangeError("Backoff must be a finite non-negative number");
  }

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries) throw error;
      await sleep(delay * backoff ** attempt);
      attempt += 1;
    }
  }
}

/** Settles with the input result or a timeout error; timeout does not cancel the operation. */
export function withTimeout(promise, ms) {
  validateDuration(ms, "Timeout");
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Operation timed out after ${ms} ms`)), ms);
    Promise.resolve(promise).then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}

/** Maps in input order with bounded concurrency. Already-running callbacks continue after a failure. */
export async function mapAsync(array, fn, concurrency = Infinity) {
  if (!Array.isArray(array)) throw new TypeError("Expected an array");
  validateFunction(fn);
  if (concurrency !== Infinity && (!Number.isInteger(concurrency) || concurrency < 1)) {
    throw new RangeError("Concurrency must be a positive integer or Infinity");
  }
  const results = new Array(array.length);
  let nextIndex = 0;
  let failed = false;
  async function worker() {
    while (!failed) {
      const index = nextIndex++;
      if (index >= array.length) return;
      try {
        results[index] = await fn(array[index], index, array);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  }
  const workers = Array.from({ length: Math.min(array.length, concurrency) }, () => worker());
  await Promise.all(workers);
  return results;
}

/** Creates a reusable limiter for async tasks; sync throws become rejected promises. */
export function pLimit(concurrency) {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new RangeError("Concurrency must be a positive integer");
  let activeCount = 0;
  const queue = [];
  function runNext() {
    if (activeCount >= concurrency || queue.length === 0) return;
    const task = queue.shift();
    activeCount += 1;
    Promise.resolve().then(task.fn).then(task.resolve, task.reject).finally(() => {
      activeCount -= 1;
      runNext();
    });
    runNext();
  }
  return (fn, ...args) => {
    validateFunction(fn);
    return new Promise((resolve, reject) => {
      queue.push({ fn: () => fn(...args), resolve, reject });
      runNext();
    });
  };
}

/** Debounces calls; all pending callers receive the result for the latest call's arguments and context. */
export function debounceAsync(fn, delay) {
  validateFunction(fn);
  validateDuration(delay, "Delay");
  let timer;
  let pendingCalls = [];
  let latestContext;
  let latestArguments;
  return function (...args) {
    latestContext = this;
    latestArguments = args;
    clearTimeout(timer);
    const result = new Promise((resolve, reject) => pendingCalls.push({ resolve, reject }));
    timer = setTimeout(async () => {
      const callers = pendingCalls;
      pendingCalls = [];
      try {
        const value = await fn.apply(latestContext, latestArguments);
        callers.forEach(({ resolve }) => resolve(value));
      } catch (error) {
        callers.forEach(({ reject }) => reject(error));
      }
    }, delay);
    return result;
  };
}

/** Returns Promise.allSettled results in input order and rejects non-iterable inputs. */
export function promiseAllSettled(promises) {
  if (promises === null || promises === undefined || typeof promises[Symbol.iterator] !== "function") {
    throw new TypeError("Expected an iterable of promises or values");
  }
  return Promise.allSettled(promises);
}
