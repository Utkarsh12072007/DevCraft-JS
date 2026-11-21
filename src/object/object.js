const unsafeKeys = new Set(["__proto__", "constructor", "prototype"]);

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
    (part) =>
      part === "" ||
      part === null ||
      part === undefined ||
      unsafeKeys.has(String(part)),
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
    if (
      skipArrayIndexes &&
      typeof key === "string" &&
      /^(0|[1-9]\d*)$/u.test(key)
    ) {
      continue;
    }
    if ("value" in descriptor) {
      descriptor.value = deepClone(descriptor.value, seen);
    }
    Object.defineProperty(target, key, descriptor);
  }
}

/**
 * Deep-clones supported values while preserving cycles, aliases, and shared view buffers.
 * Functions are retained by reference; Promise, weak collection, SharedArrayBuffer,
 * and host objects with internal slots are unsupported.
 */
export function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return seen.get(value);
  if (
    value instanceof Promise ||
    value instanceof WeakMap ||
    value instanceof WeakSet ||
    (typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer)
  ) {
    throw new TypeError("Cannot deep-clone Promise, weak collection, or shared buffer values");
  }
  if (value instanceof Date) {
    const clone = new Date(value.getTime());
    seen.set(value, clone);
    cloneEnumerableProperties(value, clone, seen);
    return clone;
  }
  if (value instanceof RegExp) {
    const clone = new RegExp(value.source, value.flags);
    seen.set(value, clone);
    clone.lastIndex = value.lastIndex;
    cloneEnumerableProperties(value, clone, seen);
    return clone;
  }

  if (value instanceof Map) {
    const clone = new Map();
    seen.set(value, clone);
    for (const [key, entryValue] of value) {
      clone.set(deepClone(key, seen), deepClone(entryValue, seen));
    }
    cloneEnumerableProperties(value, clone, seen);
    return clone;
  }

  if (value instanceof Set) {
    const clone = new Set();
    seen.set(value, clone);
    for (const entry of value) clone.add(deepClone(entry, seen));
    cloneEnumerableProperties(value, clone, seen);
    return clone;
  }

  if (ArrayBuffer.isView(value)) {
    const clonedBuffer = deepClone(value.buffer, seen);
    const clone = value instanceof DataView
      ? new DataView(clonedBuffer, value.byteOffset, value.byteLength)
      : new value.constructor(clonedBuffer, value.byteOffset, value.length);
    seen.set(value, clone);
    cloneEnumerableProperties(value, clone, seen, !(value instanceof DataView));
    return clone;
  }
  if (value instanceof ArrayBuffer) {
    const clone = value.slice(0);
    seen.set(value, clone);
    cloneEnumerableProperties(value, clone, seen);
    return clone;
  }

  const clone = Array.isArray(value)
    ? []
    : Object.create(Object.getPrototypeOf(value));
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

/** Recursively merges plain objects; arrays and special values replace and are cloned. */
export function deepMerge(target, ...sources) {
  assertObject(target, "target");
  if (!isPlainObject(target)) {
    throw new TypeError("Target must be a plain object");
  }

  function mergeInto(result, source) {
    const activeSources = new WeakSet();
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
    return mergeSource(source, result);
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

/** Returns a new object containing the requested own properties. */
export function pick(object, keys) {
  assertObject(object);
  if (!Array.isArray(keys)) throw new TypeError("Keys must be an array");

  const result = {};
  for (const key of keys) {
    if (!Object.hasOwn(object, key)) continue;
    Object.defineProperty(result, key, {
      value: object[key],
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  return result;
}

/** Returns a new object without the requested own enumerable properties. */
export function omit(object, keys) {
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
      writable: true,
    });
  }
  return result;
}

/** Reads an own nested property, returning fallback only when a path part is absent. */
export function get(object, path, fallback) {
  const parts = getPathParts(path);
  let current = object;
  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      !Object.hasOwn(Object(current), part)
    ) {
      return fallback;
    }
    current = current[part];
  }
  return current;
}

/** Sets an own nested property, mutates root, and returns root. */
export function set(root, path, value) {
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
    writable: true,
  });
  return root;
}

/** Checks whether an own nested property exists, even when its value is undefined. */
export function has(object, path) {
  const parts = getPathParts(path);
  let current = object;
  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      !Object.hasOwn(Object(current), part)
    ) {
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
    return left.localeCompare(right, undefined, { sensitivity: "base" });
  }
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

/** Returns a stable sorted copy; nullish or missing values sort last in either direction. */
export function sortByKey(array, key, order = "asc") {
  if (!Array.isArray(array)) throw new TypeError("Expected an array");
  if (typeof key !== "string") throw new TypeError("Key must be a string");
  if (order !== "asc" && order !== "desc") {
    throw new RangeError("Order must be 'asc' or 'desc'");
  }

  return array
    .map((value, index) => ({ value, index }))
    .sort((left, right) => {
      const leftValue = left.value?.[key];
      const rightValue = right.value?.[key];
      if (leftValue == null || rightValue == null) {
        return compareValues(leftValue, rightValue) || left.index - right.index;
      }
      const direction = order === "asc" ? 1 : -1;
      return (
        compareValues(leftValue, rightValue) * direction ||
        left.index - right.index
      );
    })
    .map(({ value }) => value);
}

/** Returns a stable sorted copy using ordered key and direction criteria. */
export function sortByMultiple(array, criteria) {
  if (!Array.isArray(array)) throw new TypeError("Expected an array");
  const invalidCriteria =
    !Array.isArray(criteria) ||
    criteria.some(
      (criterion) =>
        !criterion ||
        typeof criterion.key !== "string" ||
        !["asc", "desc"].includes(criterion.order),
    );
  if (invalidCriteria) {
    throw new TypeError("Criteria must contain { key, order: 'asc'|'desc' }");
  }

  return array
    .map((value, index) => ({ value, index }))
    .sort((left, right) => {
      for (const { key, order } of criteria) {
        const leftValue = left.value?.[key];
        const rightValue = right.value?.[key];
        const direction = order === "asc" ? 1 : -1;
        const comparison =
          leftValue == null || rightValue == null
            ? compareValues(leftValue, rightValue)
            : compareValues(leftValue, rightValue) * direction;
        if (comparison !== 0) return comparison;
      }
      return left.index - right.index;
    })
    .map(({ value }) => value);
}
