function assertString(value, name = "input") {
  if (typeof value !== "string") {
    throw new TypeError(`Expected ${name} to be a string`);
  }
}

function splitWords(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .split(/[\s_-]+/u)
    .filter(Boolean);
}

/** Capitalizes the first Unicode code point and leaves the remainder unchanged. */
export function capitalize(str) {
  assertString(str);
  if (str.length === 0) return str;
  const [firstCharacter, ...remainingCharacters] = Array.from(str);
  return firstCharacter.toUpperCase() + remainingCharacters.join("");
}

/** Converts separated words to camelCase; punctuation is retained within words. */
export function camelCase(str) {
  assertString(str);
  const words = splitWords(str);
  if (words.length === 0) return "";
  return words
    .map((word, index) => {
      const lowerWord = word.toLowerCase();
      return index === 0
        ? lowerWord
        : lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
    })
    .join("");
}

function convertSeparatedCase(str, separator) {
  return splitWords(str).map((word) => word.toLowerCase()).join(separator);
}

/** Converts words to kebab-case; punctuation is retained within words. */
export function kebabCase(str) {
  assertString(str);
  return convertSeparatedCase(str, "-");
}

/** Converts words to snake_case; punctuation is retained within words. */
export function snakeCase(str) {
  assertString(str);
  return convertSeparatedCase(str, "_");
}

/** Truncates by Unicode code points, counting the suffix within maximum length. */
export function truncate(str, length, suffix = "...") {
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

/** Reverses Unicode code points; combining marks and joined emoji are not grapheme-aware. */
export function reverse(str) {
  assertString(str);
  return Array.from(str).reverse().join("");
}

/** Counts whitespace-separated tokens; punctuation remains part of each word. */
export function countWords(str) {
  assertString(str);
  const trimmed = str.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/u).length;
}

/** Checks a case-insensitive palindrome after removing non-letter/non-number characters. */
export function isPalindrome(str) {
  assertString(str);
  const normalized = Array.from(str.toLocaleLowerCase()).filter((character) =>
    /[\p{L}\p{N}]/u.test(character),
  );
  return normalized.every(
    (character, index) => character === normalized[normalized.length - 1 - index],
  );
}
