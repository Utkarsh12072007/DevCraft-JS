function isString(value) {
  return typeof value === "string";
}

/** Checks common email syntax without checking whether the address exists. Whitespace is rejected. */
export function isEmail(value) {
  if (!isString(value) || value !== value.trim()) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [localPart, domain] = parts;
  if (!localPart || !domain || /\s/u.test(value)) return false;
  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) return false;
  if (!/^[\w.!#$%&'*+/=?^`{|}~-]+$/u.test(localPart)) return false;
  const labels = domain.split(".");
  return labels.length >= 2 && labels.every((label) =>
    /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/iu.test(label),
  );
}

/** Checks an absolute HTTP(S) URL. Localhost is allowed; a protocol is required. */
export function isURL(value) {
  if (!isString(value) || value.trim() !== value || /\s/u.test(value)) return false;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) return false;

    const hostname = url.hostname;
    if (hostname.startsWith("[") && hostname.endsWith("]")) return true;
    if (hostname === "localhost") return true;

    const labels = hostname.split(".");
    return labels.every((label) =>
      /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/iu.test(label),
    );
  } catch {
    return false;
  }
}

/** Checks general phone formatting with 7–15 digits; this does not verify assignment or reachability. */
export function isPhoneNumber(value) {
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

/** Checks configurable password rules; length is counted in Unicode code points. Special means non-letter/non-number. */
export function isStrongPassword(value, options = {}) {
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
    ...options,
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
  if (settings.requireUppercase && !/\p{Lu}/u.test(value)) return false;
  if (settings.requireLowercase && !/\p{Ll}/u.test(value)) return false;
  if (settings.requireNumbers && !/\p{N}/u.test(value)) return false;
  if (settings.requireSpecialChars && !/[^\p{L}\p{N}]/u.test(value)) return false;
  return true;
}

/** Checks emptiness for nullish values, whitespace strings, arrays, and plain objects; other values are non-empty. */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (isString(value)) return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return (prototype === Object.prototype || prototype === null) && Object.keys(value).length === 0;
}

/** Checks finite numbers or numeric strings; whitespace around strings is accepted, hex and scientific notation are supported. */
export function isNumeric(value) {
  if (typeof value === "number") return Number.isFinite(value);
  if (!isString(value) || value.trim() === "") return false;
  return Number.isFinite(Number(value));
}

/** Returns whether JSON.parse accepts the string; does not evaluate JavaScript. */
export function isJSON(value) {
  if (!isString(value)) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/** Checks for one or more Unicode letters, without trimming. */
export function isAlpha(value) {
  return isString(value) && value.length > 0 && /^\p{L}+$/u.test(value);
}

/** Checks for one or more Unicode letters or numbers, without trimming. */
export function isAlphanumeric(value) {
  return isString(value) && value.length > 0 && /^[\p{L}\p{N}]+$/u.test(value);
}
