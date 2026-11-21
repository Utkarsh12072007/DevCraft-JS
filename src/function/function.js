function assertFunction(fn, name = "fn") {
  if (typeof fn !== "function") {
    throw new TypeError(`${name} must be a function`);
  }
}

/** Runs a function once, caching successful results; failed calls may be retried. */
export function once(fn) {
  assertFunction(fn);
  let hasResult = false;
  let result;

  return function (...args) {
    if (hasResult) return result;
    const nextResult = fn.apply(this, args);
    result = nextResult;
    hasResult = true;
    return result;
  };
}

function createCacheNode() {
  return { values: new Map(), result: undefined, hasResult: false };
}

function getArgumentCache(root, args) {
  let node = root;
  for (const argument of args) {
    if (!node.values.has(argument)) node.values.set(argument, createCacheNode());
    node = node.values.get(argument);
  }
  return node;
}

/** Memoizes by argument identity/value and receiver; resolver results use a Map key. */
export function memoize(fn, options = {}) {
  assertFunction(fn);
  if (options === null || typeof options !== "object") {
    throw new TypeError("Options must be an object");
  }
  const { resolver } = options;
  if (resolver !== undefined) assertFunction(resolver, "resolver");

  const receiverCaches = new WeakMap();
  const primitiveReceiverCaches = new Map();

  return function (...args) {
    const receiver = this;
    const receiverIsObject =
      (typeof receiver === "object" && receiver !== null) ||
      typeof receiver === "function";
    const receiverCachesMap = receiverIsObject
      ? receiverCaches
      : primitiveReceiverCaches;
    let root = receiverCachesMap.get(receiver);
    if (!root) {
      root = resolver ? new Map() : createCacheNode();
      receiverCachesMap.set(receiver, root);
    }

    let entry;
    if (resolver) {
      const key = resolver.apply(receiver, args);
      if (!root.has(key)) root.set(key, { result: undefined, hasResult: false });
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

/** Curries by fn.length; extra arguments are passed through once arity is met. */
export function curry(fn) {
  assertFunction(fn);
  const arity = fn.length;
  if (arity === 0) return function (...args) { return fn.apply(this, args); };

  function collect(previousArguments, receiver) {
    return function (...nextArguments) {
      const allArguments = [...previousArguments, ...nextArguments];
      const currentReceiver = this === undefined ? receiver : this;
      if (allArguments.length >= arity) {
        return fn.apply(currentReceiver, allArguments);
      }
      return collect(allArguments, currentReceiver);
    };
  }
  return collect([], undefined);
}

function validateFunctions(functions, name) {
  functions.forEach((fn, index) => assertFunction(fn, `${name}[${index}]`));
}

/** Composes synchronous functions right to left; Promise values are passed through unchanged. */
export function compose(...functions) {
  validateFunctions(functions, "functions");
  if (functions.length === 0) return (value) => value;
  return function (...args) {
    let result = functions.at(-1).apply(this, args);
    for (let index = functions.length - 2; index >= 0; index -= 1) {
      result = functions[index].call(this, result);
    }
    return result;
  };
}

/** Pipes synchronous functions left to right; Promise values are not automatically awaited. */
export function pipe(...functions) {
  validateFunctions(functions, "functions");
  if (functions.length === 0) return (value) => value;
  return function (...args) {
    let result = functions[0].apply(this, args);
    for (let index = 1; index < functions.length; index += 1) {
      result = functions[index].call(this, result);
    }
    return result;
  };
}

/** Creates a partially applied function, preserving the call-time receiver. */
export function partial(fn, ...presetArguments) {
  assertFunction(fn);
  return function (...laterArguments) {
    return fn.apply(this, [...presetArguments, ...laterArguments]);
  };
}

/** Debounces calls and invokes once with the latest context and arguments; returns undefined immediately. */
export function debounce(fn, delay) {
  assertFunction(fn);
  if (typeof delay !== "number" || !Number.isFinite(delay) || delay < 0) {
    throw new RangeError("Delay must be a finite non-negative number");
  }

  let timer;
  return function (...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(context, args), delay);
  };
}
