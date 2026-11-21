var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  camelCase: () => camelCase,
  capitalize: () => capitalize,
  chunk: () => chunk,
  compose: () => compose,
  countWords: () => countWords,
  curry: () => curry,
  debounce: () => debounce,
  debounceAsync: () => debounceAsync,
  deepClone: () => deepClone,
  deepMerge: () => deepMerge,
  difference: () => difference,
  flatten: () => flatten,
  get: () => get,
  groupBy: () => groupBy,
  has: () => has,
  isAlpha: () => isAlpha,
  isAlphanumeric: () => isAlphanumeric,
  isEmail: () => isEmail,
  isEmpty: () => isEmpty,
  isJSON: () => isJSON,
  isNumeric: () => isNumeric,
  isPalindrome: () => isPalindrome,
  isPhoneNumber: () => isPhoneNumber,
  isStrongPassword: () => isStrongPassword,
  isURL: () => isURL,
  kebabCase: () => kebabCase,
  mapAsync: () => mapAsync,
  memoize: () => memoize,
  omit: () => omit,
  once: () => once,
  pLimit: () => pLimit,
  partial: () => partial,
  partition: () => partition,
  pick: () => pick,
  pipe: () => pipe,
  promiseAllSettled: () => promiseAllSettled,
  retry: () => retry,
  reverse: () => reverse,
  set: () => set,
  shuffle: () => shuffle,
  sleep: () => sleep,
  snakeCase: () => snakeCase,
  sortByKey: () => sortByKey,
  sortByMultiple: () => sortByMultiple,
  truncate: () => truncate,
  unique: () => unique,
  uniqueBy: () => uniqueBy,
  withTimeout: () => withTimeout
});
module.exports = __toCommonJS(index_exports);

// src/array/array.js
function chunk(array, size) {
  if (!Array.isArray(array)) {
    throw new TypeError("Expected an array");
  }
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError("Chunk size must be a positive integer");
  }
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
function unique(array) {
  if (!Array.isArray(array)) {
    throw new TypeError("Expected an array");
  }
  return [...new Set(array)];
}
function uniqueBy(array, keyOrFn) {
  if (!Array.isArray(array)) {
    throw new TypeError("Expected an array");
  }
  if (typeof keyOrFn !== "string" && typeof keyOrFn !== "function") {
    throw new TypeError("Expected a property name or callback");
  }
  const seen = /* @__PURE__ */ new Set();
  return array.filter((item, index) => {
    const key = typeof keyOrFn === "function" ? keyOrFn(item, index) : item == null ? void 0 : item[keyOrFn];
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
function groupBy(array, keyOrFn) {
  if (!Array.isArray(array)) {
    throw new TypeError("Expected an array");
  }
  if (typeof keyOrFn !== "string" && typeof keyOrFn !== "function") {
    throw new TypeError("Expected a property name or callback");
  }
  return array.reduce((result, item, index) => {
    const key = typeof keyOrFn === "function" ? keyOrFn(item, index) : item == null ? void 0 : item[keyOrFn];
    const groupKey = String(key);
    if (!Object.hasOwn(result, groupKey)) {
      Object.defineProperty(result, groupKey, {
        value: [],
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    result[groupKey].push(item);
    return result;
  }, {});
}
function partition(array, predicate) {
  assertArray(array);
  assertFunction(predicate, "predicate");
  const matched = [];
  const unmatched = [];
  array.forEach((value, index) => (predicate(value, index) ? matched : unmatched).push(value));
  return [matched, unmatched];
}
function shuffle(array) {
  assertArray(array);
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function flatten(array, depth = 1) {
  assertArray(array);
  if (depth !== Infinity && (!Number.isInteger(depth) || depth < 0)) {
    throw new RangeError("Depth must be a non-negative integer or Infinity");
  }
  return array.flat(depth);
}
function difference(array, other) {
  assertArray(array);
  assertArray(other, "second argument");
  const excluded = new Set(other);
  return array.filter((value) => !excluded.has(value));
}
function assertArray(value, name = "input") {
  if (!Array.isArray(value)) throw new TypeError(`Expected ${name} to be an array`);
}
function assertFunction(value, name) {
  if (typeof value !== "function") throw new TypeError(`Expected ${name} to be a function`);
}

// src/object/object.js
var unsafeKeys = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function assertObject(value, name = "object") {
  if (value === null || typeof value !== "object") {
    throw new TypeError(`Expected ${name} to be an object`);
  }
}
function getPathParts(path) {
  if (typeof path !== "string" && !Array.isArray(path)) {
    throw new TypeError("Path must be a string or array");
  }
  const parts = Array.isArray(path) ? path : path.split(".");
  const hasInvalidPart = parts.some(
    (part) => part === "" || part === null || part === void 0 || unsafeKeys.has(String(part))
  );
  if (parts.length === 0 || hasInvalidPart) {
    throw new TypeError("Path contains an invalid or unsafe segment");
  }
  return parts;
}
function cloneEnumerableProperties(source, target, seen, skipArrayIndexes = false) {
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (!descriptor.enumerable) continue;
    if (skipArrayIndexes && typeof key === "string" && /^(0|[1-9]\d*)$/u.test(key)) {
      continue;
    }
    if ("value" in descriptor) {
      descriptor.value = deepClone(descriptor.value, seen);
    }
    Object.defineProperty(target, key, descriptor);
  }
}
function deepClone(value, seen = /* @__PURE__ */ new WeakMap()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return seen.get(value);
  if (value instanceof Promise || value instanceof WeakMap || value instanceof WeakSet || typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer) {
    throw new TypeError("Cannot deep-clone Promise, weak collection, or shared buffer values");
  }
  if (value instanceof Date) {
    const clone2 = new Date(value.getTime());
    seen.set(value, clone2);
    cloneEnumerableProperties(value, clone2, seen);
    return clone2;
  }
  if (value instanceof RegExp) {
    const clone2 = new RegExp(value.source, value.flags);
    seen.set(value, clone2);
    clone2.lastIndex = value.lastIndex;
    cloneEnumerableProperties(value, clone2, seen);
    return clone2;
  }
  if (value instanceof Map) {
    const clone2 = /* @__PURE__ */ new Map();
    seen.set(value, clone2);
    for (const [key, entryValue] of value) {
      clone2.set(deepClone(key, seen), deepClone(entryValue, seen));
    }
    cloneEnumerableProperties(value, clone2, seen);
    return clone2;
  }
  if (value instanceof Set) {
    const clone2 = /* @__PURE__ */ new Set();
    seen.set(value, clone2);
    for (const entry of value) clone2.add(deepClone(entry, seen));
    cloneEnumerableProperties(value, clone2, seen);
    return clone2;
  }
  if (ArrayBuffer.isView(value)) {
    const clonedBuffer = deepClone(value.buffer, seen);
    const clone2 = value instanceof DataView ? new DataView(clonedBuffer, value.byteOffset, value.byteLength) : new value.constructor(clonedBuffer, value.byteOffset, value.length);
    seen.set(value, clone2);
    cloneEnumerableProperties(value, clone2, seen, !(value instanceof DataView));
    return clone2;
  }
  if (value instanceof ArrayBuffer) {
    const clone2 = value.slice(0);
    seen.set(value, clone2);
    cloneEnumerableProperties(value, clone2, seen);
    return clone2;
  }
  const clone = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, clone);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if ("value" in descriptor) {
      descriptor.value = deepClone(descriptor.value, seen);
    }
    Object.defineProperty(clone, key, descriptor);
  }
  return clone;
}
function deepMerge(target, ...sources) {
  assertObject(target, "target");
  if (!isPlainObject(target)) {
    throw new TypeError("Target must be a plain object");
  }
  function mergeInto(result2, source) {
    const activeSources = /* @__PURE__ */ new WeakSet();
    function mergeSource(sourceObject, targetObject) {
      if (activeSources.has(sourceObject)) {
        throw new TypeError("Cannot deep-merge a cyclic source object");
      }
      activeSources.add(sourceObject);
      try {
        for (const key of Object.keys(sourceObject)) {
          if (unsafeKeys.has(key)) continue;
          const sourceValue = sourceObject[key];
          if (isPlainObject(sourceValue)) {
            const targetValue = isPlainObject(targetObject[key]) ? targetObject[key] : {};
            targetObject[key] = mergeSource(sourceValue, targetValue);
          } else {
            targetObject[key] = deepClone(sourceValue);
          }
        }
      } finally {
        activeSources.delete(sourceObject);
      }
      return targetObject;
    }
    return mergeSource(source, result2);
  }
  const result = deepClone(target);
  for (const source of sources) {
    assertObject(source, "source");
    if (!isPlainObject(source)) {
      throw new TypeError("Sources must be plain objects");
    }
    mergeInto(result, source);
  }
  return result;
}
function pick(object, keys) {
  assertObject(object);
  if (!Array.isArray(keys)) throw new TypeError("Keys must be an array");
  const result = {};
  for (const key of keys) {
    if (!Object.hasOwn(object, key)) continue;
    Object.defineProperty(result, key, {
      value: object[key],
      enumerable: true,
      configurable: true,
      writable: true
    });
  }
  return result;
}
function omit(object, keys) {
  assertObject(object);
  if (!Array.isArray(keys)) throw new TypeError("Keys must be an array");
  const excludedKeys = new Set(keys);
  const result = {};
  for (const key of Object.keys(object)) {
    if (excludedKeys.has(key)) continue;
    Object.defineProperty(result, key, {
      value: object[key],
      enumerable: true,
      configurable: true,
      writable: true
    });
  }
  return result;
}
function get(object, path, fallback) {
  const parts = getPathParts(path);
  let current = object;
  for (const part of parts) {
    if (current === null || current === void 0 || !Object.hasOwn(Object(current), part)) {
      return fallback;
    }
    current = current[part];
  }
  return current;
}
function set(root, path, value) {
  assertObject(root, "root");
  const parts = getPathParts(path);
  let current = root;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (current[part] === null || typeof current[part] !== "object") {
      current[part] = /^\d+$/.test(String(parts[index + 1])) ? [] : {};
    }
    current = current[part];
  }
  Object.defineProperty(current, parts.at(-1), {
    value,
    enumerable: true,
    configurable: true,
    writable: true
  });
  return root;
}
function has(object, path) {
  const parts = getPathParts(path);
  let current = object;
  for (const part of parts) {
    if (current === null || current === void 0 || !Object.hasOwn(Object(current), part)) {
      return false;
    }
    current = current[part];
  }
  return true;
}
function compareValues(left, right) {
  if (left == null) return right == null ? 0 : 1;
  if (right == null) return -1;
  if (typeof left === "string" && typeof right === "string") {
    return left.localeCompare(right, void 0, { sensitivity: "base" });
  }
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
function sortByKey(array, key, order = "asc") {
  if (!Array.isArray(array)) throw new TypeError("Expected an array");
  if (typeof key !== "string") throw new TypeError("Key must be a string");
  if (order !== "asc" && order !== "desc") {
    throw new RangeError("Order must be 'asc' or 'desc'");
  }
  return array.map((value, index) => ({ value, index })).sort((left, right) => {
    var _a, _b;
    const leftValue = (_a = left.value) == null ? void 0 : _a[key];
    const rightValue = (_b = right.value) == null ? void 0 : _b[key];
    if (leftValue == null || rightValue == null) {
      return compareValues(leftValue, rightValue) || left.index - right.index;
    }
    const direction = order === "asc" ? 1 : -1;
    return compareValues(leftValue, rightValue) * direction || left.index - right.index;
  }).map(({ value }) => value);
}
function sortByMultiple(array, criteria) {
  if (!Array.isArray(array)) throw new TypeError("Expected an array");
  const invalidCriteria = !Array.isArray(criteria) || criteria.some(
    (criterion) => !criterion || typeof criterion.key !== "string" || !["asc", "desc"].includes(criterion.order)
  );
  if (invalidCriteria) {
    throw new TypeError("Criteria must contain { key, order: 'asc'|'desc' }");
  }
  return array.map((value, index) => ({ value, index })).sort((left, right) => {
    var _a, _b;
    for (const { key, order } of criteria) {
      const leftValue = (_a = left.value) == null ? void 0 : _a[key];
      const rightValue = (_b = right.value) == null ? void 0 : _b[key];
      const direction = order === "asc" ? 1 : -1;
      const comparison = leftValue == null || rightValue == null ? compareValues(leftValue, rightValue) : compareValues(leftValue, rightValue) * direction;
      if (comparison !== 0) return comparison;
    }
    return left.index - right.index;
  }).map(({ value }) => value);
}

// src/string/string.js
function assertString(value, name = "input") {
  if (typeof value !== "string") {
    throw new TypeError(`Expected ${name} to be a string`);
  }
}
function splitWords(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2").split(/[\s_-]+/u).filter(Boolean);
}
function capitalize(str) {
  assertString(str);
  if (str.length === 0) return str;
  const [firstCharacter, ...remainingCharacters] = Array.from(str);
  return firstCharacter.toUpperCase() + remainingCharacters.join("");
}
function camelCase(str) {
  assertString(str);
  const words = splitWords(str);
  if (words.length === 0) return "";
  return words.map((word, index) => {
    const lowerWord = word.toLowerCase();
    return index === 0 ? lowerWord : lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
  }).join("");
}
function convertSeparatedCase(str, separator) {
  return splitWords(str).map((word) => word.toLowerCase()).join(separator);
}
function kebabCase(str) {
  assertString(str);
  return convertSeparatedCase(str, "-");
}
function snakeCase(str) {
  assertString(str);
  return convertSeparatedCase(str, "_");
}
function truncate(str, length, suffix = "...") {
  assertString(str);
  assertString(suffix, "suffix");
  if (!Number.isInteger(length) || length < 0) {
    throw new RangeError("Length must be a non-negative integer");
  }
  const characters = Array.from(str);
  if (characters.length <= length) return str;
  if (length === 0) return "";
  const suffixCharacters = Array.from(suffix);
  if (suffixCharacters.length >= length) {
    return suffixCharacters.slice(0, length).join("");
  }
  return characters.slice(0, length - suffixCharacters.length).join("") + suffix;
}
function reverse(str) {
  assertString(str);
  return Array.from(str).reverse().join("");
}
function countWords(str) {
  assertString(str);
  const trimmed = str.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/u).length;
}
function isPalindrome(str) {
  assertString(str);
  const normalized = Array.from(str.toLocaleLowerCase()).filter(
    (character) => /[\p{L}\p{N}]/u.test(character)
  );
  return normalized.every(
    (character, index) => character === normalized[normalized.length - 1 - index]
  );
}

// src/async/async.js
function validateDuration(milliseconds, name) {
  if (typeof milliseconds !== "number" || !Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new RangeError(`${name} must be a finite non-negative number`);
  }
}
function validateFunction(fn, name = "fn") {
  if (typeof fn !== "function") throw new TypeError(`${name} must be a function`);
}
function sleep(ms) {
  validateDuration(ms, "Duration");
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function retry(fn, options = {}) {
  validateFunction(fn);
  if (options === null || typeof options !== "object") throw new TypeError("Options must be an object");
  const { retries = 3, delay = 1e3, backoff = 1 } = options;
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
function withTimeout(promise, ms) {
  validateDuration(ms, "Timeout");
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Operation timed out after ${ms} ms`)), ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
async function mapAsync(array, fn, concurrency = Infinity) {
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
function pLimit(concurrency) {
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
function debounceAsync(fn, delay) {
  validateFunction(fn);
  validateDuration(delay, "Delay");
  let timer;
  let pendingCalls = [];
  let latestContext;
  let latestArguments;
  return function(...args) {
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
function promiseAllSettled(promises) {
  if (promises === null || promises === void 0 || typeof promises[Symbol.iterator] !== "function") {
    throw new TypeError("Expected an iterable of promises or values");
  }
  return Promise.allSettled(promises);
}

// src/function/function.js
function assertFunction2(fn, name = "fn") {
  if (typeof fn !== "function") {
    throw new TypeError(`${name} must be a function`);
  }
}
function once(fn) {
  assertFunction2(fn);
  let hasResult = false;
  let result;
  return function(...args) {
    if (hasResult) return result;
    const nextResult = fn.apply(this, args);
    result = nextResult;
    hasResult = true;
    return result;
  };
}
function createCacheNode() {
  return { values: /* @__PURE__ */ new Map(), result: void 0, hasResult: false };
}
function getArgumentCache(root, args) {
  let node = root;
  for (const argument of args) {
    if (!node.values.has(argument)) node.values.set(argument, createCacheNode());
    node = node.values.get(argument);
  }
  return node;
}
function memoize(fn, options = {}) {
  assertFunction2(fn);
  if (options === null || typeof options !== "object") {
    throw new TypeError("Options must be an object");
  }
  const { resolver } = options;
  if (resolver !== void 0) assertFunction2(resolver, "resolver");
  const receiverCaches = /* @__PURE__ */ new WeakMap();
  const primitiveReceiverCaches = /* @__PURE__ */ new Map();
  return function(...args) {
    const receiver = this;
    const receiverIsObject = typeof receiver === "object" && receiver !== null || typeof receiver === "function";
    const receiverCachesMap = receiverIsObject ? receiverCaches : primitiveReceiverCaches;
    let root = receiverCachesMap.get(receiver);
    if (!root) {
      root = resolver ? /* @__PURE__ */ new Map() : createCacheNode();
      receiverCachesMap.set(receiver, root);
    }
    let entry;
    if (resolver) {
      const key = resolver.apply(receiver, args);
      if (!root.has(key)) root.set(key, { result: void 0, hasResult: false });
      entry = root.get(key);
    } else {
      entry = getArgumentCache(root, args);
    }
    if (entry.hasResult) return entry.result;
    const result = fn.apply(receiver, args);
    entry.result = result;
    entry.hasResult = true;
    return result;
  };
}
function curry(fn) {
  assertFunction2(fn);
  const arity = fn.length;
  if (arity === 0) return function(...args) {
    return fn.apply(this, args);
  };
  function collect(previousArguments, receiver) {
    return function(...nextArguments) {
      const allArguments = [...previousArguments, ...nextArguments];
      const currentReceiver = this === void 0 ? receiver : this;
      if (allArguments.length >= arity) {
        return fn.apply(currentReceiver, allArguments);
      }
      return collect(allArguments, currentReceiver);
    };
  }
  return collect([], void 0);
}
function validateFunctions(functions, name) {
  functions.forEach((fn, index) => assertFunction2(fn, `${name}[${index}]`));
}
function compose(...functions) {
  validateFunctions(functions, "functions");
  if (functions.length === 0) return (value) => value;
  return function(...args) {
    let result = functions.at(-1).apply(this, args);
    for (let index = functions.length - 2; index >= 0; index -= 1) {
      result = functions[index].call(this, result);
    }
    return result;
  };
}
function pipe(...functions) {
  validateFunctions(functions, "functions");
  if (functions.length === 0) return (value) => value;
  return function(...args) {
    let result = functions[0].apply(this, args);
    for (let index = 1; index < functions.length; index += 1) {
      result = functions[index].call(this, result);
    }
    return result;
  };
}
function partial(fn, ...presetArguments) {
  assertFunction2(fn);
  return function(...laterArguments) {
    return fn.apply(this, [...presetArguments, ...laterArguments]);
  };
}
function debounce(fn, delay) {
  assertFunction2(fn);
  if (typeof delay !== "number" || !Number.isFinite(delay) || delay < 0) {
    throw new RangeError("Delay must be a finite non-negative number");
  }
  let timer;
  return function(...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(context, args), delay);
  };
}

// src/validation/validation.js
function isString(value) {
  return typeof value === "string";
}
function isEmail(value) {
  if (!isString(value) || value !== value.trim()) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [localPart, domain] = parts;
  if (!localPart || !domain || /\s/u.test(value)) return false;
  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) return false;
  if (!/^[\w.!#$%&'*+/=?^`{|}~-]+$/u.test(localPart)) return false;
  const labels = domain.split(".");
  return labels.length >= 2 && labels.every(
    (label) => /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/iu.test(label)
  );
}
function isURL(value) {
  if (!isString(value) || value.trim() !== value || /\s/u.test(value)) return false;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) return false;
    const hostname = url.hostname;
    if (hostname.startsWith("[") && hostname.endsWith("]")) return true;
    if (hostname === "localhost") return true;
    const labels = hostname.split(".");
    return labels.every(
      (label) => /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/iu.test(label)
    );
  } catch {
    return false;
  }
}
function isPhoneNumber(value) {
  if (!isString(value) || !value || !/^\+?[\d ()-]+$/u.test(value)) return false;
  const openingParentheses = value.match(/\(/gu) ?? [];
  const closingParentheses = value.match(/\)/gu) ?? [];
  if (openingParentheses.length !== closingParentheses.length || openingParentheses.length > 1) {
    return false;
  }
  if (openingParentheses.length === 1) {
    const openingIndex = value.indexOf("(");
    const closingIndex = value.indexOf(")");
    if (closingIndex < openingIndex || !/^\d+$/u.test(value.slice(openingIndex + 1, closingIndex))) {
      return false;
    }
  }
  const digits = value.replace(/\D/gu, "");
  return digits.length >= 7 && digits.length <= 15;
}
function isStrongPassword(value, options = {}) {
  if (!isString(value)) return false;
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("Options must be an object");
  }
  const settings = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    ...options
  };
  if (!Number.isInteger(settings.minLength) || settings.minLength < 1) {
    throw new RangeError("minLength must be a positive integer");
  }
  for (const optionName of ["requireUppercase", "requireLowercase", "requireNumbers", "requireSpecialChars"]) {
    if (typeof settings[optionName] !== "boolean") {
      throw new TypeError(`${optionName} must be a boolean`);
    }
  }
  if (value.length === 0 || Array.from(value).length < settings.minLength) return false;
  if (settings.requireUppercase && !new RegExp("\\p{Lu}", "u").test(value)) return false;
  if (settings.requireLowercase && !new RegExp("\\p{Ll}", "u").test(value)) return false;
  if (settings.requireNumbers && !new RegExp("\\p{N}", "u").test(value)) return false;
  if (settings.requireSpecialChars && !/[^\p{L}\p{N}]/u.test(value)) return false;
  return true;
}
function isEmpty(value) {
  if (value === null || value === void 0) return true;
  if (isString(value)) return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return (prototype === Object.prototype || prototype === null) && Object.keys(value).length === 0;
}
function isNumeric(value) {
  if (typeof value === "number") return Number.isFinite(value);
  if (!isString(value) || value.trim() === "") return false;
  return Number.isFinite(Number(value));
}
function isJSON(value) {
  if (!isString(value)) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
function isAlpha(value) {
  return isString(value) && value.length > 0 && new RegExp("^\\p{L}+$", "u").test(value);
}
function isAlphanumeric(value) {
  return isString(value) && value.length > 0 && /^[\p{L}\p{N}]+$/u.test(value);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  camelCase,
  capitalize,
  chunk,
  compose,
  countWords,
  curry,
  debounce,
  debounceAsync,
  deepClone,
  deepMerge,
  difference,
  flatten,
  get,
  groupBy,
  has,
  isAlpha,
  isAlphanumeric,
  isEmail,
  isEmpty,
  isJSON,
  isNumeric,
  isPalindrome,
  isPhoneNumber,
  isStrongPassword,
  isURL,
  kebabCase,
  mapAsync,
  memoize,
  omit,
  once,
  pLimit,
  partial,
  partition,
  pick,
  pipe,
  promiseAllSettled,
  retry,
  reverse,
  set,
  shuffle,
  sleep,
  snakeCase,
  sortByKey,
  sortByMultiple,
  truncate,
  unique,
  uniqueBy,
  withTimeout
});
