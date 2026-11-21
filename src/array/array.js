/**
 * Splits an array into smaller arrays of a specified size.
 *
 * @param {unknown[]} array - The input array.
 * @param {number} size - Positive integer maximum elements per chunk.
 * @returns {unknown[][]} A new array of shallow copies; the input is not mutated.
 */
export function chunk(array, size) {
    // Validate input array
    if (!Array.isArray(array)) {
        throw new TypeError("Expected an array");
    }

    // Validate chunk size
    if (!Number.isInteger(size) || size <= 0) {
        throw new RangeError("Chunk size must be a positive integer");
    }

    const result = [];

    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }

    return result;
}


/**
 * Removes duplicate values from an array.
 *
 * Uses SameValueZero equality (so NaN values are equal) and keeps first occurrences.
 * @param {unknown[]} array - The input array.
 * @returns {unknown[]} A new array; objects are compared by reference.
 */
export function unique(array) {
    if (!Array.isArray(array)) {
        throw new TypeError("Expected an array");
    }

    return [...new Set(array)];
}


/**
 * Removes duplicate elements based on a selected key or callback.
 *
 * @param {unknown[]} array - The input array.
 * @param {string|Function} keyOrFn - Property name or callback receiving (item, index).
 * @returns {unknown[]} First elements for each unique computed key.
 */
export function uniqueBy(array, keyOrFn) {
    if (!Array.isArray(array)) {
        throw new TypeError("Expected an array");
    }

    if (typeof keyOrFn !== "string" && typeof keyOrFn !== "function") {
        throw new TypeError("Expected a property name or callback");
    }

    const seen = new Set();

    return array.filter((item, index) => {
        const key = typeof keyOrFn === "function"
            ? keyOrFn(item, index)
            : item?.[keyOrFn];

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}


/**
 * Groups array elements based on a property or callback.
 *
 * @param {unknown[]} array - The input array.
 * @param {string|Function} keyOrFn - Property name or callback receiving (item, index).
 * @returns {Object<string, unknown[]>} An object grouped by String(key); key insertion order follows first occurrence.
 */
export function groupBy(array, keyOrFn) {
    if (!Array.isArray(array)) {
        throw new TypeError("Expected an array");
    }

    if (typeof keyOrFn !== "string" && typeof keyOrFn !== "function") {
        throw new TypeError("Expected a property name or callback");
    }

    return array.reduce((result, item, index) => {
        const key = typeof keyOrFn === "function"
            ? keyOrFn(item, index)
            : item?.[keyOrFn];

        const groupKey = String(key);

        if (!Object.hasOwn(result, groupKey)) {
            Object.defineProperty(result, groupKey, {
                value: [], enumerable: true, configurable: true, writable: true
            });
        }

        result[groupKey].push(item);

        return result;
    }, {});
}

/**
 * Splits an array into values matching a predicate and values that do not.
 * Holes in sparse arrays are skipped, matching Array.prototype.forEach.
 * @param {unknown[]} array Input array.
 * @param {Function} predicate Test applied to each value and its index.
 * @returns {[Array, Array]} Matching values followed by non-matching values.
 */
export function partition(array, predicate) {
    assertArray(array);
    assertFunction(predicate, "predicate");
    const matched = [];
    const unmatched = [];
    array.forEach((value, index) => (predicate(value, index) ? matched : unmatched).push(value));
    return [matched, unmatched];
}

/**
 * Returns a shuffled shallow copy using the unbiased Fisher-Yates algorithm.
 * @param {unknown[]} array Input array.
 * @returns {unknown[]} Shuffled copy; the input is not mutated.
 */
export function shuffle(array) {
    assertArray(array);
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Flattens nested arrays up to the requested depth (default 1). Non-array values
 * pass through unchanged. Sparse slots are skipped, as with Array.prototype.flat.
 * @param {unknown[]} array Input array.
 * @param {number} [depth=1] Non-negative integer or Infinity.
 * @returns {unknown[]} A new flattened array.
 */
export function flatten(array, depth = 1) {
    assertArray(array);
    if (depth !== Infinity && (!Number.isInteger(depth) || depth < 0)) {
        throw new RangeError("Depth must be a non-negative integer or Infinity");
    }
    return array.flat(depth);
}

/**
 * Returns values from the first array that are absent from the second, using
 * SameValueZero membership and preserving first-array order and duplicates.
 * @param {unknown[]} array Values to filter.
 * @param {unknown[]} other Values to exclude.
 * @returns {unknown[]} A new array; neither input is mutated.
 */
export function difference(array, other) {
    assertArray(array);
    assertArray(other, "second argument");
    const excluded = new Set(other);
    return array.filter(value => !excluded.has(value));
}

function assertArray(value, name = "input") {
    if (!Array.isArray(value)) throw new TypeError(`Expected ${name} to be an array`);
}

function assertFunction(value, name) {
    if (typeof value !== "function") throw new TypeError(`Expected ${name} to be a function`);
}
