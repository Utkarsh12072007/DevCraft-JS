# DevCraft JS

A modular JavaScript utility toolkit for developers.

DevCraft JS provides reusable helpers for common array, object, string, asynchronous, function-composition, and validation tasks. It is distributed as an npm package with both ES module (ESM) and CommonJS entry points.

> **Release status:** The package is being prepared for its first npm release. The examples below document the implementation in this repository. TypeScript declaration files are not included in the initial release.

## Contents

- [Features](#features)
- [Installation](#installation)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Module overview](#module-overview)
- [API reference](#api-reference)
  - [Array utilities](#1-array-utilities)
  - [Object utilities](#2-object-utilities)
  - [String utilities](#3-string-utilities)
  - [Async utilities](#4-async-utilities)
  - [Function utilities](#5-function-utilities)
  - [Validation utilities](#6-validation-utilities)
- [Error handling and behavior notes](#error-handling-and-behavior-notes)
- [Module formats](#module-formats)
- [Project structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- 48 utility functions across six focused modules.
- ESM and CommonJS builds.
- Tree-friendly named exports from the package root.
- No declared runtime dependencies.
- Input validation for many utility functions.
- Automated tests using Vitest.
- Build output generated with tsup.

## Installation

After `devcraft-js` is published to npm, install it with:

```bash
npm install devcraft-js
```

For the current local repository, build the package first:

```bash
npm install
npm run build
```

Then you can test it from a separate project by installing the generated `.tgz` archive (see [Testing a packed installation](#testing-a-packed-installation)).

## Requirements

- Node.js **18 or newer**, as declared in `package.json`.
- npm or another compatible package manager.

The package provides JavaScript ESM and CommonJS entry points. TypeScript declaration files are not currently included, so this release should not be described as having first-party TypeScript type declarations.

## Quick start

### ES modules

```js
import {
  chunk,
  unique,
  deepClone,
  camelCase,
  retry,
  isEmail,
} from "devcraft-js";

console.log(chunk([1, 2, 3, 4, 5], 2));
// [[1, 2], [3, 4], [5]]

console.log(unique([1, 2, 2, 3]));
// [1, 2, 3]

console.log(deepClone({ user: { name: "Utkarsh" } }));
// { user: { name: "Utkarsh" } }

console.log(camelCase("hello_world"));
// "helloWorld"

const result = await retry(
  async () => {
    // Replace with an operation that may fail temporarily.
    return "Request completed";
  },
  { retries: 2, delay: 250 },
);

console.log(result);
// "Request completed"

console.log(isEmail("developer@example.com"));
// true
```

### CommonJS

```js
const {
  chunk,
  groupBy,
  sleep,
  isURL,
} = require("devcraft-js");

console.log(chunk([1, 2, 3, 4], 2));
// [[1, 2], [3, 4]]

console.log(
  groupBy(
    [
      { name: "A", role: "admin" },
      { name: "B", role: "user" },
      { name: "C", role: "admin" },
    ],
    "role",
  ),
);
// {
//   admin: [{ name: "A", role: "admin" }, { name: "C", role: "admin" }],
//   user: [{ name: "B", role: "user" }]
// }

sleep(100).then(() => {
  console.log(isURL("https://example.com"));
  // true
});
```

## Module overview

| Module | Functions | Purpose |
| --- | ---: | --- |
| Array | 8 | Transform, group, filter, flatten, and compare arrays |
| Object | 9 | Clone, merge, select, access, mutate, and sort object data |
| String | 8 | Change string casing, truncate, reverse, count, and inspect text |
| Async | 7 | Work with delays, retries, timeouts, concurrency, and promises |
| Function | 7 | Build reusable functions through caching, currying, composition, and debouncing |
| Validation | 9 | Check common string, number, URL, JSON, password, and emptiness rules |
| **Total** | **48** | |

# API reference

All functions are available as named exports from the package root:

```js
import { chunk, deepClone, isEmail } from "devcraft-js";
```

The examples use ESM syntax. The same named exports are available through `require("devcraft-js")` in CommonJS projects.

## 1. Array utilities

Import from the package root:

```js
import {
  chunk,
  unique,
  uniqueBy,
  groupBy,
  partition,
  shuffle,
  flatten,
  difference,
} from "devcraft-js";
```

### `chunk(array, size)`

Splits an array into consecutive smaller arrays containing at most `size` elements each. The final chunk may contain fewer elements. The input array is not mutated.

```js
chunk([1, 2, 3, 4, 5], 2);
// [[1, 2], [3, 4], [5]]
```

- `array` (`Array`): Input array.
- `size` (`number`): Positive integer maximum size of each chunk.
- Returns: A new array containing shallow copies of the chunks.
- Throws: `TypeError` if the input is not an array; `RangeError` if `size` is not a positive integer.

### `unique(array)`

Removes duplicate values while preserving the order of their first occurrence. It uses JavaScript `Set` equality (SameValueZero); objects are considered equal only when they are the same reference.

```js
unique([1, 2, 2, 3, 1, NaN, NaN]);
// [1, 2, 3, NaN]
```

- `array` (`Array`): Input array.
- Returns: A new array containing unique values.
- Throws: `TypeError` if the input is not an array.

### `uniqueBy(array, keyOrFn)`

Removes duplicate elements according to a property name or a callback. The first element for each computed key is retained.

```js
const users = [
  { id: 1, name: "Asha" },
  { id: 2, name: "Ravi" },
  { id: 1, name: "Asha duplicate" },
];

uniqueBy(users, "id");
// [{ id: 1, name: "Asha" }, { id: 2, name: "Ravi" }]

uniqueBy(users, (user) => user.name.length);
// Keeps the first user for each distinct name length.
```

- `array` (`Array`): Input array.
- `keyOrFn` (`string | Function`): Property name or callback called with `(item, index)`.
- Returns: A new array containing the first element for each unique key.
- Throws: `TypeError` if the input is not an array or `keyOrFn` is neither a string nor a function.

### `groupBy(array, keyOrFn)`

Groups elements into an object using a property name or callback result as the group key. Each key is converted to a string. Group order follows the first occurrence of each key.

```js
const products = [
  { name: "Mouse", category: "Accessories" },
  { name: "Keyboard", category: "Accessories" },
  { name: "Monitor", category: "Displays" },
];

groupBy(products, "category");
// {
//   Accessories: [
//     { name: "Mouse", category: "Accessories" },
//     { name: "Keyboard", category: "Accessories" }
//   ],
//   Displays: [{ name: "Monitor", category: "Displays" }]
// }

groupBy(products, (product) => product.name.length);
```

- `array` (`Array`): Input array.
- `keyOrFn` (`string | Function`): Property name or callback called with `(item, index)`.
- Returns: An object whose properties contain arrays of grouped elements. Callback results are converted with `String(key)`.
- Throws: `TypeError` if the input is not an array or `keyOrFn` is neither a string nor a function.

### `partition(array, predicate)`

Splits an array into two arrays: elements for which the predicate returns a truthy value, followed by elements for which it returns a falsy value.

```js
const [adults, minors] = partition(
  [12, 18, 25, 16, 32],
  (age) => age >= 18,
);

console.log(adults); // [18, 25, 32]
console.log(minors); // [12, 16]
```

- `array` (`Array`): Input array.
- `predicate` (`Function`): Called with `(value, index)` for each present array element.
- Returns: A two-element array `[matched, unmatched]`.
- Notes: Sparse array holes are skipped, like `Array.prototype.forEach`.
- Throws: `TypeError` if the input is not an array or the predicate is not a function.

### `shuffle(array)`

Returns a shuffled shallow copy using the Fisher–Yates algorithm. The original array is not mutated.

```js
const values = [1, 2, 3, 4, 5];
const shuffled = shuffle(values);

console.log(shuffled); // A shuffled ordering
console.log(values);   // [1, 2, 3, 4, 5]
```

- `array` (`Array`): Input array.
- Returns: A new array in randomized order.
- Notes: Uses `Math.random()`; it is not intended for cryptographic or security-sensitive randomness.
- Throws: `TypeError` if the input is not an array.

### `flatten(array, depth = 1)`

Flattens nested arrays up to the specified depth. The default depth is `1`, matching the default behavior of `Array.prototype.flat`.

```js
flatten([1, [2, [3, [4]]]]);
// [1, 2, [3, [4]]]

flatten([1, [2, [3, [4]]]], 2);
// [1, 2, 3, [4]]

flatten([1, [2, [3]]], Infinity);
// [1, 2, 3]
```

- `array` (`Array`): Input array.
- `depth` (`number`, optional): Non-negative integer or `Infinity`; defaults to `1`.
- Returns: A new flattened array.
- Notes: Sparse slots are skipped, following `Array.prototype.flat`.
- Throws: `TypeError` if the input is not an array; `RangeError` for an invalid depth.

### `difference(array, other)`

Returns the values from the first array that are not present in the second array. Membership uses `Set`/SameValueZero semantics. The order and duplicates from the first array are preserved when a value is not excluded.

```js
difference([1, 2, 2, 3, 4], [2, 4]);
// [1, 3]

difference(["a", "b", "c"], ["b"]);
// ["a", "c"]
```

- `array` (`Array`): Array whose values are filtered.
- `other` (`Array`): Values to exclude.
- Returns: A new array; neither input is mutated.
- Throws: `TypeError` if either argument is not an array.

## 2. Object utilities

Import from the package root:

```js
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
} from "devcraft-js";
```

### `deepClone(value)`

Creates a deep clone of supported values. It preserves circular references and shared references between properties. It also supports common built-in data structures such as `Date`, `RegExp`, `Map`, `Set`, `ArrayBuffer`, typed-array views, and `DataView`.

```js
const original = {
  user: { name: "Asha" },
  createdAt: new Date("2025-01-01"),
};

const copy = deepClone(original);

copy.user.name = "Ravi";

console.log(original.user.name); // "Asha"
console.log(copy.user.name);     // "Ravi"
```

Circular and shared references are preserved:

```js
const shared = { enabled: true };
const original = { first: shared, second: shared };
original.self = original;

const copy = deepClone(original);

console.log(copy.first === copy.second); // true
console.log(copy.self === copy);          // true
```

- `value` (`any`): Value to clone.
- Returns: A cloned value.
- Notes:
  - Functions and primitive values are returned unchanged; functions are retained by reference.
  - Property descriptors and symbol keys are preserved by the implementation's object-cloning path.
  - `Promise`, `WeakMap`, `WeakSet`, `SharedArrayBuffer`, and host objects with unsupported internal slots are not supported and may throw.
  - The optional internal `seen` parameter is used for tracking already-cloned references; normal callers should omit it.
- Throws: `TypeError` for explicitly unsupported values.

### `deepMerge(target, ...sources)`

Deeply merges one or more source objects into a cloned target. Nested plain objects are merged recursively. Arrays and non-plain/special values replace the corresponding target value and are cloned. The original target and sources are not mutated.

```js
const target = {
  user: {
    name: "Asha",
    preferences: { theme: "light" },
  },
  tags: ["javascript"],
};

const source = {
  user: {
    preferences: { language: "en" },
  },
  tags: ["nodejs"],
};

const result = deepMerge(target, source);

console.log(result);
// {
//   user: {
//     name: "Asha",
//     preferences: { theme: "light", language: "en" }
//   },
//   tags: ["nodejs"]
// }
```

- `target` (`Object`): Initial plain object.
- `sources` (`...Object[]`): One or more source plain objects.
- Returns: A new merged object.
- Notes:
  - Only plain objects (objects with `Object.prototype` or `null` prototype) are accepted as target and sources.
  - Arrays and special values are replaced rather than recursively merged.
  - Unsafe property names `__proto__`, `constructor`, and `prototype` are skipped during source merging.
  - Cyclic source objects are rejected.
- Throws: `TypeError` if target or any source is not a plain object, or if a source contains a cycle.

### `pick(object, keys)`

Creates a new object containing only the requested own properties that exist on the input object.

```js
const user = {
  id: 7,
  name: "Asha",
  password: "hidden",
};

pick(user, ["id", "name"]);
// { id: 7, name: "Asha" }
```

- `object` (`Object`): Source object.
- `keys` (`Array`): Property keys to include.
- Returns: A new object containing the selected own properties.
- Notes: The function checks own properties, not inherited properties. Values are copied by reference; this is not a deep clone.
- Throws: `TypeError` if the input is null/non-object or `keys` is not an array.

### `omit(object, keys)`

Creates a new object containing the input object's own enumerable string-keyed properties except those listed in `keys`.

```js
const user = {
  id: 7,
  name: "Asha",
  password: "hidden",
};

omit(user, ["password"]);
// { id: 7, name: "Asha" }
```

- `object` (`Object`): Source object.
- `keys` (`Array`): Property keys to exclude.
- Returns: A new object without the excluded properties.
- Notes: This implementation iterates `Object.keys()`, so it copies own enumerable string-keyed properties. It is a shallow operation.
- Throws: `TypeError` if the input is null/non-object or `keys` is not an array.

### `get(object, path, fallback)`

Reads a nested own property using a dot-separated string path or an array of path segments. Returns `fallback` if any path segment is missing. If the property exists with the value `undefined`, it returns `undefined` rather than the fallback.

```js
const user = {
  profile: {
    address: {
      city: "Ujjain",
    },
  },
};

get(user, "profile.address.city");
// "Ujjain"

get(user, "profile.address.country", "India");
// "India"

get(user, ["profile", "address", "city"]);
// "Ujjain"
```

- `object` (`Object`): Value from which to read.
- `path` (`string | Array`): Dot-separated path or array of segments.
- `fallback` (`any`, optional): Value returned when a segment is absent.
- Returns: The resolved property value or fallback.
- Notes: Only own properties are traversed. Empty path segments and the unsafe segments `__proto__`, `constructor`, and `prototype` are rejected.
- Throws: `TypeError` for an invalid path.

### `set(root, path, value)`

Sets a nested own property and mutates the supplied root object. Missing intermediate objects are created automatically. If the next path segment is numeric, an array is created for that level.

```js
const user = {};

set(user, "profile.name", "Asha");
set(user, "profile.skills.0", "JavaScript");

console.log(user);
// {
//   profile: {
//     name: "Asha",
//     skills: ["JavaScript"]
//   }
// }
```

- `root` (`Object`): Root object to modify.
- `path` (`string | Array`): Dot-separated path or array of segments.
- `value` (`any`): Value to assign.
- Returns: The same root object after mutation.
- Notes: Unsafe path segments `__proto__`, `constructor`, and `prototype` are rejected.
- Throws: `TypeError` if root is null/non-object or path is invalid.

### `has(object, path)`

Checks whether a nested own property exists. It returns `true` even if the final property's value is `undefined`.

```js
const settings = {
  user: {
    nickname: undefined,
  },
};

has(settings, "user.nickname"); // true
has(settings, "user.email");    // false
```

- `object` (`Object`): Object to inspect.
- `path` (`string | Array`): Dot-separated path or array of segments.
- Returns: Boolean indicating whether every path segment exists as an own property.
- Notes: Inherited properties do not count. Unsafe path segments are rejected.
- Throws: `TypeError` for an invalid path.

### `sortByKey(array, key, order = "asc")`

Returns a stable sorted copy of an array of objects using one property as the sorting key. The original array is not mutated.

```js
const users = [
  { name: "Ravi", age: 25 },
  { name: "Asha", age: 20 },
  { name: "Kabir", age: 23 },
];

sortByKey(users, "age");
// Asha (20), Kabir (23), Ravi (25)

sortByKey(users, "age", "desc");
// Ravi (25), Kabir (23), Asha (20)
```

- `array` (`Array`): Input array.
- `key` (`string`): Property name used for comparison.
- `order` (`"asc" | "desc"`, optional): Sort direction; defaults to `"asc"`.
- Returns: A new stable-sorted array.
- Notes:
  - Missing and nullish values sort last in both directions.
  - String values are compared with `localeCompare` using base sensitivity.
  - Other values use JavaScript relational comparison.
- Throws: `TypeError` if `array` is not an array or `key` is not a string; `RangeError` for an invalid order.

### `sortByMultiple(array, criteria)`

Returns a stable sorted copy using multiple sorting rules in priority order. Each criterion must contain a `key` and an `order`.

```js
const employees = [
  { name: "Asha", department: "Engineering", salary: 70000 },
  { name: "Ravi", department: "Engineering", salary: 80000 },
  { name: "Kabir", department: "Design", salary: 75000 },
];

sortByMultiple(employees, [
  { key: "department", order: "asc" },
  { key: "salary", order: "desc" },
]);
// First by department ascending, then salary descending.
```

- `array` (`Array`): Input array.
- `criteria` (`Array<{ key: string, order: "asc" | "desc" }>`): Ordered sorting criteria.
- Returns: A new stable-sorted array.
- Notes: Missing and nullish values sort last for each criterion. If all criteria compare equal, original order is retained.
- Throws: `TypeError` if the array or criteria structure is invalid.

## 3. String utilities

Import from the package root:

```js
import {
  capitalize,
  camelCase,
  kebabCase,
  snakeCase,
  truncate,
  reverse,
  countWords,
  isPalindrome,
} from "devcraft-js";
```

### `capitalize(str)`

Converts the first Unicode code point to uppercase and leaves the rest of the string unchanged.

```js
capitalize("hello world"); // "Hello world"
capitalize("javascript");  // "Javascript"
capitalize("");            // ""
```

- `str` (`string`): Input string.
- Returns: Capitalized string.
- Throws: `TypeError` if the input is not a string.

### `camelCase(str)`

Converts separated words to camelCase. It recognizes whitespace, hyphens, underscores, and common lower-to-upper or acronym-to-word boundaries.

```js
camelCase("hello world");       // "helloWorld"
camelCase("hello_world");       // "helloWorld"
camelCase("background-color");  // "backgroundColor"
camelCase("XMLHttpRequest");    // "xmlHttpRequest"
```

- `str` (`string`): Input string.
- Returns: camelCase string.
- Notes: Punctuation within words is retained.
- Throws: `TypeError` if the input is not a string.

### `kebabCase(str)`

Converts separated words to lowercase kebab-case, using hyphens between words.

```js
kebabCase("Hello World");       // "hello-world"
kebabCase("backgroundColor");   // "background-color"
kebabCase("user_profile_name"); // "user-profile-name"
```

- `str` (`string`): Input string.
- Returns: kebab-case string.
- Notes: Punctuation within words is retained.
- Throws: `TypeError` if the input is not a string.

### `snakeCase(str)`

Converts separated words to lowercase snake_case, using underscores between words.

```js
snakeCase("Hello World");       // "hello_world"
snakeCase("backgroundColor");   // "background_color"
snakeCase("user-profile-name"); // "user_profile_name"
```

- `str` (`string`): Input string.
- Returns: snake_case string.
- Notes: Punctuation within words is retained.
- Throws: `TypeError` if the input is not a string.

### `truncate(str, length, suffix = "...")`

Limits a string to a maximum number of Unicode code points. If truncation is needed, the suffix is included within the requested maximum length.

```js
truncate("JavaScript utilities", 12);
// "JavaScript..."

truncate("JavaScript utilities", 12, "…");
// "JavaScript …"

truncate("Developer", 5, "~");
// "Deve~"
```

- `str` (`string`): Input string.
- `length` (`number`): Non-negative integer maximum length, including the suffix.
- `suffix` (`string`, optional): Suffix appended when truncation occurs; defaults to `"..."`.
- Returns: Truncated string or the original string if it already fits.
- Notes: If the suffix length is equal to or greater than `length`, the suffix itself is cut to fit. A length of `0` returns an empty string when truncation is needed.
- Throws: `TypeError` if `str` or `suffix` is not a string; `RangeError` if `length` is invalid.

### `reverse(str)`

Reverses a string by Unicode code points.

```js
reverse("hello"); // "olleh"
reverse("12345"); // "54321"
```

- `str` (`string`): Input string.
- Returns: Reversed string.
- Notes: This is code-point-aware, but not grapheme-cluster-aware. Combining marks and joined emoji sequences may not remain visually grouped.
- Throws: `TypeError` if the input is not a string.

### `countWords(str)`

Counts whitespace-separated tokens. Punctuation remains attached to each token and is not used to split words.

```js
countWords("JavaScript is useful");       // 3
countWords("  Learn   JavaScript today "); // 3
countWords("");                            // 0
```

- `str` (`string`): Input string.
- Returns: Number of whitespace-separated tokens.
- Throws: `TypeError` if the input is not a string.

### `isPalindrome(str)`

Checks whether a string reads the same forward and backward after converting it to lowercase and removing all characters that are not Unicode letters or numbers.

```js
isPalindrome("Racecar");                 // true
isPalindrome("A man, a plan, a canal: Panama"); // true
isPalindrome("JavaScript");              // false
```

- `str` (`string`): Input string.
- Returns: Boolean.
- Notes: Case, whitespace, and punctuation are ignored. An empty or punctuation-only string returns `true` because the normalized sequence is empty.
- Throws: `TypeError` if the input is not a string.

## 4. Async utilities

Import from the package root:

```js
import {
  sleep,
  retry,
  withTimeout,
  mapAsync,
  pLimit,
  debounceAsync,
  promiseAllSettled,
} from "devcraft-js";
```

### `sleep(ms)`

Returns a promise that resolves after the specified number of milliseconds. It does not block the JavaScript event loop.

```js
console.log("Before");
await sleep(500);
console.log("After 500 milliseconds");
```

- `ms` (`number`): Finite, non-negative delay in milliseconds.
- Returns: `Promise<void>`.
- Throws: `RangeError` if the duration is invalid.

### `retry(fn, options = {})`

Runs a synchronous or asynchronous function and retries it when it throws or rejects. The `retries` option counts additional attempts after the first attempt.

```js
let attempts = 0;

const result = await retry(
  async () => {
    attempts += 1;

    if (attempts < 3) {
      throw new Error("Temporary failure");
    }

    return "Success";
  },
  {
    retries: 3,
    delay: 200,
    backoff: 2,
  },
);

console.log(result);   // "Success"
console.log(attempts); // 3
```

- `fn` (`Function`): Function to execute. It is called without arguments.
- `options` (`Object`, optional):
  - `retries` (`number`, default `3`): Non-negative integer number of additional attempts.
  - `delay` (`number`, default `1000`): Initial delay in milliseconds.
  - `backoff` (`number`, default `1`): Non-negative multiplier applied to the delay after each failed attempt.
- Returns: A promise resolving to the function's result.
- Notes: Delays follow `delay * backoff ** attempt`, where the first retry uses `attempt = 0`. The final error is rethrown when retries are exhausted.
- Throws/rejects: `TypeError` for invalid function/options; `RangeError` for invalid retry or timing values; rejects with the final function error if all attempts fail.

### `withTimeout(promise, ms)`

Waits for a promise-like value to settle, but rejects if the timeout duration elapses first.

```js
const result = await withTimeout(
  fetch("https://example.com"),
  5000,
);
```

- `promise` (`Promise | any`): Promise or value to observe.
- `ms` (`number`): Finite, non-negative timeout in milliseconds.
- Returns: A promise that settles with the input result if it finishes before the timeout.
- Notes: A timeout does **not** cancel the underlying operation. The original operation may continue after the returned promise rejects.
- Rejects: With an `Error` containing the timeout duration if the timer fires, or with the original rejection reason if the input rejects.
- Throws: `RangeError` for an invalid timeout.

### `mapAsync(array, fn, concurrency = Infinity)`

Maps an array with an asynchronous or synchronous callback while limiting the number of callbacks running at the same time. Results remain in input order, even if tasks finish in a different order.

```js
const userIds = [1, 2, 3, 4, 5];

const users = await mapAsync(
  userIds,
  async (id) => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },
  2,
);
```

- `array` (`Array`): Input array.
- `fn` (`Function`): Callback called with `(value, index, array)`.
- `concurrency` (`number`, optional): Positive integer limit or `Infinity`; defaults to `Infinity`.
- Returns: A promise resolving to a result array in input order.
- Notes: If a callback fails, the returned promise rejects and no new work is scheduled by workers that have not yet started another item. Callbacks already running continue.
- Throws/rejects: `TypeError` for invalid array or callback; `RangeError` for invalid concurrency; rejects if a callback rejects.

### `pLimit(concurrency)`

Creates a reusable function that schedules tasks with a maximum number of concurrently running operations.

```js
const limit = pLimit(2);

const tasks = [1, 2, 3, 4].map((number) =>
  limit(async (value) => {
    await sleep(200);
    return value * 2;
  }, number),
);

const results = await Promise.all(tasks);

console.log(results); // [2, 4, 6, 8]
```

- `concurrency` (`number`): Positive integer maximum number of active tasks.
- Returns: A limiter function. Call it as `limit(fn, ...args)` to queue a function and pass arguments to it.
- The returned call produces a promise for that task's result.
- Notes: Synchronous exceptions thrown by a task become promise rejections. Tasks are started in queue order.
- Throws: `RangeError` if concurrency is not a positive integer; the limiter call throws `TypeError` if its callback is not a function.

### `debounceAsync(fn, delay)`

Debounces asynchronous function calls. When several calls occur within the delay window, the wrapped function runs once using the latest call's arguments and `this` context. Every pending caller receives the same result or rejection from that execution.

```js
const search = debounceAsync(
  async (query) => {
    const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },
  300,
);

const first = search("jav");
const second = search("javascript");

const [firstResult, secondResult] = await Promise.all([first, second]);
// Both promises receive the result for "javascript".
```

- `fn` (`Function`): Function to invoke after the calls settle.
- `delay` (`number`): Finite, non-negative delay in milliseconds.
- Returns: A debounced function that returns a promise for each call.
- Notes: All calls in the same debounce window settle with the result of the latest invocation.
- Throws: `TypeError` if `fn` is not a function; `RangeError` for an invalid delay. The returned promises reject if the wrapped function rejects.

### `promiseAllSettled(promises)`

A convenience wrapper around `Promise.allSettled()`. It fulfills with an outcome record for every input promise or value, preserving input order.

```js
const results = await promiseAllSettled([
  Promise.resolve("success"),
  Promise.reject(new Error("failure")),
  42,
]);

console.log(results);
// [
//   { status: "fulfilled", value: "success" },
//   { status: "rejected", reason: Error("failure") },
//   { status: "fulfilled", value: 42 }
// ]
```

- `promises` (`Iterable`): Iterable of promises or ordinary values.
- Returns: The same kind of result as `Promise.allSettled()`.
- Throws: `TypeError` if the input is null, undefined, or not iterable.

## 5. Function utilities

Import from the package root:

```js
import {
  once,
  memoize,
  curry,
  compose,
  pipe,
  partial,
  debounce,
} from "devcraft-js";
```

### `once(fn)`

Creates a wrapper that invokes a function at most once and returns the first successful return value on later calls.

```js
let calls = 0;

const initialize = once(() => {
  calls += 1;
  return "initialized";
});

initialize(); // "initialized"
initialize(); // "initialized"

console.log(calls); // 1
```

- `fn` (`Function`): Function to wrap.
- Returns: A function that caches the first returned value.
- Notes: If `fn` throws synchronously, the result is not cached and a later call can retry. If `fn` returns a promise that later rejects, that returned promise has already been cached.
- Throws: `TypeError` if `fn` is not a function; propagates synchronous errors from `fn`.

### `memoize(fn, options = {})`

Caches function results so repeated calls with the same receiver and arguments can reuse a previous result. By default, arguments are cached by their JavaScript `Map` key identity/value semantics. An optional resolver can generate a single cache key from the arguments.

```js
const calculate = memoize((number) => {
  console.log("Calculating...");
  return number * number;
});

calculate(5); // Logs "Calculating...", returns 25
calculate(5); // Returns cached 25
```

Using a resolver:

```js
const getUser = memoize(
  (id, includePosts) => ({ id, includePosts }),
  {
    resolver: (id, includePosts) => `${id}:${includePosts}`,
  },
);

getUser(7, true);
getUser(7, true); // Uses the cached result.
```

- `fn` (`Function`): Function whose results should be cached.
- `options` (`Object`, optional):
  - `resolver` (`Function`, optional): Called with the same receiver and arguments; its return value is used as the cache key.
- Returns: A memoized function.
- Notes:
  - Cache entries are separated by the call-time `this` receiver.
  - Without a resolver, each argument is used as a key in a nested `Map` cache.
  - The implementation does not expose cache clearing or automatic eviction.
  - Rejected promises returned by an async function are cached as returned values.
- Throws: `TypeError` if the function, options, or resolver is invalid; propagates errors from the wrapped function or resolver.

### `curry(fn)`

Transforms a function into a curried function. Arguments can be supplied across multiple calls until the original function's declared arity (`fn.length`) is reached. Any additional arguments in the call that reaches the arity are passed through as well.

```js
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6
curriedAdd(1)(2, 3); // 6
```

- `fn` (`Function`): Function to curry.
- Returns: A curried function.
- Notes: Arity is based on `fn.length`. A function with arity `0` is returned as a wrapper that invokes the original function immediately. The implementation does not provide placeholder arguments.
- Throws: `TypeError` if `fn` is not a function.

### `compose(...functions)`

Creates a function that applies the supplied functions from right to left. The rightmost function receives the initial arguments; each function to its left receives the previous result.

```js
const addOne = (value) => value + 1;
const double = (value) => value * 2;

const transform = compose(addOne, double);

transform(3); // 7: addOne(double(3))
```

- `functions` (`...Function[]`): Functions to compose.
- Returns: A composed function.
- Notes: Composition is synchronous. Promise values are passed to the next function as ordinary values; they are not automatically awaited. With no functions, the returned function returns its first argument.
- Throws: `TypeError` if any supplied item is not a function.

### `pipe(...functions)`

Creates a function that applies the supplied functions from left to right. The leftmost function receives the initial arguments; each later function receives the previous result.

```js
const addOne = (value) => value + 1;
const double = (value) => value * 2;

const transform = pipe(addOne, double);

transform(3); // 8: double(addOne(3))
```

- `functions` (`...Function[]`): Functions to pipe.
- Returns: A piped function.
- Notes: Piping is synchronous. Promise values are not automatically awaited. With no functions, the returned function returns its first argument.
- Throws: `TypeError` if any supplied item is not a function.

### `partial(fn, ...presetArguments)`

Creates a function with preset arguments. Preset arguments are placed before the arguments supplied when the returned function is called.

```js
function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

const sayHello = partial(greet, "Hello");

sayHello("Asha"); // "Hello, Asha!"
```

- `fn` (`Function`): Function to partially apply.
- `presetArguments` (`...any[]`): Arguments to provide before later arguments.
- Returns: A partially applied function.
- Notes: The call-time `this` receiver is preserved. This implementation does not use placeholder arguments.
- Throws: `TypeError` if `fn` is not a function; propagates errors from `fn`.

### `debounce(fn, delay)`

Creates a debounced function that delays invocation until calls have stopped for the specified duration. If called repeatedly during the delay, only the latest call is executed with its arguments and receiver.

```js
const saveDraft = debounce((text) => {
  console.log("Saving:", text);
}, 500);

saveDraft("First version");
saveDraft("Updated version");
// After 500 ms without another call: "Saving: Updated version"
```

- `fn` (`Function`): Function to debounce.
- `delay` (`number`): Finite, non-negative delay in milliseconds.
- Returns: A debounced function.
- Notes: The wrapper returns `undefined` immediately. It does not expose `cancel()` or `flush()` methods.
- Throws: `TypeError` if `fn` is not a function; `RangeError` if delay is invalid.

## 6. Validation utilities

Import from the package root:

```js
import {
  isEmail,
  isURL,
  isPhoneNumber,
  isStrongPassword,
  isEmpty,
  isNumeric,
  isJSON,
  isAlpha,
  isAlphanumeric,
} from "devcraft-js";
```

Validation helpers return booleans for the values they inspect, except that invalid options supplied to `isStrongPassword` cause an error.

### `isEmail(value)`

Checks common email-address syntax. It does not send a message or verify that the address exists or can receive email.

```js
isEmail("developer@example.com"); // true
isEmail("not-an-email");          // false
isEmail(" user@example.com ");    // false
```

- `value` (`any`): Value to inspect.
- Returns: Boolean.
- Notes: Requires one `@`, a non-empty local part, and a domain with at least two valid labels. Leading/trailing whitespace is rejected.

### `isURL(value)`

Checks whether a string is an absolute HTTP or HTTPS URL with a valid hostname according to the implementation's checks. `localhost` is allowed.

```js
isURL("https://example.com");       // true
isURL("http://localhost:3000");     // true
isURL("ftp://example.com");         // false
isURL("http://-invalid.com");       // false
```

- `value` (`any`): Value to inspect.
- Returns: Boolean.
- Notes: A protocol is required. Only `http:` and `https:` are accepted. This is syntax validation, not a network request or proof that the destination is reachable.

### `isPhoneNumber(value)`

Checks a general phone-number format containing 7 to 15 digits. It permits an optional leading plus sign, spaces, hyphens, and one balanced pair of parentheses around digits.

```js
isPhoneNumber("+1 (555) 123-4567"); // true
isPhoneNumber("555-123-4567");     // true
isPhoneNumber("12345");            // false
isPhoneNumber("12(34)56)");        // false
```

- `value` (`any`): Value to inspect.
- Returns: Boolean.
- Notes: It does not verify country-specific numbering plans, assignment, ownership, or reachability.

### `isStrongPassword(value, options = {})`

Checks a string against configurable password composition rules.

```js
isStrongPassword("Secure@123");
// true with the default rules

isStrongPassword("javascript", {
  minLength: 10,
  requireUppercase: false,
  requireLowercase: true,
  requireNumbers: false,
  requireSpecialChars: false,
});
// true
```

Default options:

| Option | Default | Meaning |
| --- | --- | --- |
| `minLength` | `8` | Minimum number of Unicode code points |
| `requireUppercase` | `true` | Requires at least one uppercase Unicode letter |
| `requireLowercase` | `true` | Requires at least one lowercase Unicode letter |
| `requireNumbers` | `true` | Requires at least one Unicode number |
| `requireSpecialChars` | `true` | Requires at least one character that is neither a Unicode letter nor number |

- `value` (`any`): Value to inspect.
- `options` (`Object`, optional): Overrides for the rules above.
- Returns: Boolean indicating whether all enabled rules pass.
- Throws: `TypeError` for invalid options or non-boolean rule flags; `RangeError` if `minLength` is not a positive integer.
- Notes: This checks composition rules only. It is not a password-strength estimator and does not check breached-password databases.

### `isEmpty(value)`

Checks whether a value is empty according to the following rules:

- `null` and `undefined` are empty.
- Strings containing only whitespace are empty.
- Arrays with length `0` are empty.
- Plain objects with no own enumerable string-keyed properties are empty.
- Other values, including numbers and booleans, are not empty.

```js
isEmpty(null);          // true
isEmpty("   ");         // true
isEmpty([]);            // true
isEmpty({});            // true
isEmpty(0);             // false
isEmpty(false);         // false
isEmpty({ name: "A" }); // false
```

- `value` (`any`): Value to inspect.
- Returns: Boolean.

### `isNumeric(value)`

Checks whether a value is a finite number or a non-empty string that converts to a finite number with JavaScript's `Number()` conversion.

```js
isNumeric(42);       // true
isNumeric("42");     // true
isNumeric(" 42 ");   // true
isNumeric("1e3");    // true
isNumeric("0xFF");   // true
isNumeric("hello");  // false
isNumeric("");       // false
isNumeric(Infinity); // false
```

- `value` (`any`): Value to inspect.
- Returns: Boolean.
- Notes: JavaScript numeric string forms accepted by `Number()` are accepted, including hexadecimal and scientific notation. Empty/whitespace-only strings and non-finite numbers are rejected.

### `isJSON(value)`

Checks whether a string can be parsed by `JSON.parse()`. It does not execute JavaScript.

```js
isJSON('{"name":"Asha"}'); // true
isJSON("[1, 2, 3]");       // true
isJSON("{name: 'Asha'}");  // false
isJSON("undefined");       // false
```

- `value` (`any`): Value to inspect.
- Returns: Boolean.
- Notes: Valid JSON primitives such as `"42"`, `"true"`, and `"null"` are accepted because `JSON.parse()` accepts them.

### `isAlpha(value)`

Checks whether a non-empty string contains only Unicode letters. Whitespace, numbers, and punctuation are not accepted.

```js
isAlpha("Developer"); // true
isAlpha("Utkarsh");   // true
isAlpha("User123");   // false
isAlpha("Hello!");    // false
```

- `value` (`any`): Value to inspect.
- Returns: Boolean.
- Notes: The string is not trimmed; leading or trailing whitespace causes the check to fail.

### `isAlphanumeric(value)`

Checks whether a non-empty string contains only Unicode letters and numbers.

```js
isAlphanumeric("User123"); // true
isAlphanumeric("2026");   // true
isAlphanumeric("User_123"); // false
isAlphanumeric("Hello!"); // false
```

- `value` (`any`): Value to inspect.
- Returns: Boolean.
- Notes: The string is not trimmed; whitespace and punctuation are rejected.

## Error handling and behavior notes

Many utilities validate their inputs and throw a `TypeError` or `RangeError` when an argument has an invalid type or value. Validation helpers generally return `false` for values that do not satisfy their checks.

A few important behavior distinctions:

- **Mutation:** `set()` intentionally mutates its root object. Most array helpers return new arrays. `deepMerge()` returns a new object and does not mutate its inputs.
- **Shallow versus deep:** `chunk()`, `shuffle()`, `pick()`, and `omit()` do not deep-clone nested values.
- **Equality:** `unique()`, `difference()`, and the key tracking used by `uniqueBy()` use `Set` semantics. Objects are compared by reference unless a callback computes another key.
- **Async cancellation:** `withTimeout()` stops waiting after the timeout but does not cancel the underlying operation.
- **Debouncing:** `debounce()` returns immediately with `undefined`; `debounceAsync()` returns promises to callers and shares the latest invocation's outcome.
- **Function pipelines:** `compose()` and `pipe()` do not automatically await promises.
- **Validation scope:** Email, URL, phone, and password helpers perform local format/rule checks. They do not verify real-world identity, deliverability, reachability, or password safety against external databases.

## Module formats

DevCraft JS publishes two builds:

| File | Format | Typical consumer |
| --- | --- | --- |
| `dist/index.js` | ES module | `import { chunk } from "devcraft-js"` |
| `dist/index.cjs` | CommonJS | `const { chunk } = require("devcraft-js")` |

The package uses the `exports` field in `package.json` to route ESM `import` and CommonJS `require` consumers to the appropriate build.

## Project structure

```text
devcraft-js/
├── src/
│   ├── array/
│   │   ├── array.js
│   │   └── index.js
│   ├── async/
│   │   ├── async.js
│   │   └── index.js
│   ├── function/
│   │   ├── function.js
│   │   └── index.js
│   ├── object/
│   │   ├── object.js
│   │   └── index.js
│   ├── string/
│   │   ├── string.js
│   │   └── index.js
│   ├── validation/
│   │   ├── validation.js
│   │   └── index.js
│   └── index.js
├── tests/
│   ├── array.test.js
│   ├── async.test.js
│   ├── function.test.js
│   ├── object.test.js
│   ├── string.test.js
│   └── validation.test.js
├── dist/
│   ├── index.js
│   └── index.cjs
├── package.json
├── package-lock.json
├── README.md
└── LICENSE
```

## Development

Clone the repository and install development dependencies:

```bash
git clone https://github.com/Utkarsh12072007/DevCraft-JS.git
cd DevCraft-JS
npm install
```

Build both module formats:

```bash
npm run build
```

The build command uses tsup to bundle `src/index.js` into:

- `dist/index.js` (ESM)
- `dist/index.cjs` (CommonJS)

The build script cleans the previous `dist` directory before generating fresh output.

## Testing

Run the complete test suite:

```bash
npm test
```

Run Vitest in watch mode while developing:

```bash
npm run test:watch
```

The repository contains separate test files for the six utility modules.

## Testing a packed installation

To check the package as a consumer would receive it:

1. Build the package:

   ```bash
   npm run build
   ```

2. Create a package archive:

   ```bash
   npm pack
   ```

3. Create a separate test project:

   ```bash
   mkdir devcraft-js-smoke-test
   cd devcraft-js-smoke-test
   npm init -y
   ```

4. Install the `.tgz` archive created in the package directory:

   ```bash
   npm install ../devcraft-js/devcraft-js-0.1.0.tgz
   ```

   Adjust the relative path if your folders are in a different location.

5. Test ESM in an `.mjs` file:

   ```js
   import { chunk, isEmail } from "devcraft-js";

   console.log(chunk([1, 2, 3], 2));
   console.log(isEmail("developer@example.com"));
   ```

6. Test CommonJS in a `.cjs` file:

   ```js
   const { unique, capitalize } = require("devcraft-js");

   console.log(unique([1, 1, 2]));
   console.log(capitalize("hello"));
   ```

This verifies the packed artifact rather than importing directly from the source directory.

## Contributing

Contributions, bug reports, and suggestions are welcome.

Before opening a pull request:

1. Create a focused branch for your change.
2. Keep changes limited to the relevant utility or module.
3. Add or update tests for changed behavior.
4. Run `npm test`.
5. Run `npm run build`.
6. Update the README if the public API or behavior changes.
7. Open a pull request describing the change and its tests.

For bugs or feature requests, use the repository's GitHub Issues page.

## License

This project is intended to be released under the **MIT License**. See the [`LICENSE`](./LICENSE) file for the full license text.
