import { describe, expect, it } from "vitest";
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
} from "../src/validation/index.js";

describe("isEmail", () => {
  it("accepts common addresses and subdomains", () => {
    expect(isEmail("user@example.com")).toBe(true);
    expect(isEmail("john.doe@gmail.com")).toBe(true);
    expect(isEmail("a+b@mail.example.co.uk")).toBe(true);
  });
  it("rejects malformed addresses, whitespace, and non-strings", () => {
    for (const value of ["", "invalid-email", "@example.com", "user@", "user@@example.com", " user@example.com", "u@d.com ", "a..b@example.com", "a@example", null, 42]) {
      expect(isEmail(value)).toBe(false);
    }
  });
});

describe("isURL", () => {
  it("accepts absolute HTTP(S) URLs with common components", () => {
    for (const value of ["https://example.com", "http://google.com", "https://example.com/about?q=1#top", "http://localhost:8080/path"]) {
      expect(isURL(value)).toBe(true);
    }
  });
  it("rejects absent protocols, hostnames, malformed inputs, and other schemes", () => {
    for (const value of ["", "example.com", "https://", "ftp://example.com", "https://exa mple.com", "http://-", "http://example-.com", "http://-example.com", "http://a..example.com", 4]) {
      expect(isURL(value)).toBe(false);
    }
  });

  it("preserves localhost and IPv4 support while rejecting invalid labels", () => {
    for (const value of ["https://sub.example.com", "http://localhost:3000", "http://127.0.0.1:8080"]) {
      expect(isURL(value)).toBe(true);
    }
    for (const value of ["https://example..com", "https://bad_host.com"]) {
      expect(isURL(value)).toBe(false);
    }
  });
});

describe("isPhoneNumber", () => {
  it("accepts 7–15 digits with supported formatting", () => {
    for (const value of ["9876543210", "+919876543210", "+1 234 567 8901", "123-456-7890", "(123) 456 7890"]) {
      expect(isPhoneNumber(value)).toBe(true);
    }
  });
  it("rejects invalid digit counts, alphabetic input, and non-strings", () => {
    for (const value of ["123", "1234567890123456", "abcdefghij", "", "12+34567", null]) {
      expect(isPhoneNumber(value)).toBe(false);
    }
  });

  it("accepts balanced phone groups and rejects malformed parentheses", () => {
    for (const value of ["+91 9876543210", "987-654-3210", "(987) 654-3210", "+1 (234) 567-8901"]) {
      expect(isPhoneNumber(value)).toBe(true);
    }
    for (const value of ["((1234567", "1234567)", "(1234567", "12()34567", "(12(34))567"]) {
      expect(isPhoneNumber(value)).toBe(false);
    }
  });
});

describe("isStrongPassword", () => {
  it("checks the default character and length rules", () => {
    expect(isStrongPassword("Password@123")).toBe(true);
    expect(isStrongPassword("password")).toBe(false);
    expect(isStrongPassword("PASSWORD123!")).toBe(false);
    expect(isStrongPassword("Pass@123")).toBe(true);
  });
  it("supports custom options and validates their types and values", () => {
    expect(isStrongPassword("abc", { minLength: 3, requireUppercase: false, requireNumbers: false, requireSpecialChars: false })).toBe(true);
    expect(isStrongPassword(42)).toBe(false);
    expect(isStrongPassword("")).toBe(false);
    expect(() => isStrongPassword("anything", { minLength: 0 })).toThrow(RangeError);
    expect(() => isStrongPassword("anything", { requireNumbers: 1 })).toThrow(TypeError);
    expect(() => isStrongPassword("anything", null)).toThrow(TypeError);
  });
});

describe("isEmpty", () => {
  it("recognizes empty strings, arrays, plain objects, null, and undefined", () => {
    for (const value of ["", " \t\n", [], {}, null, undefined]) expect(isEmpty(value)).toBe(true);
    for (const value of ["hello", [1], { name: "Ava" }, 0, false]) expect(isEmpty(value)).toBe(false);
  });
  it("treats Date, Map, and Set as non-empty special values", () => {
    expect(isEmpty(new Date(0))).toBe(false);
    expect(isEmpty(new Map())).toBe(false);
    expect(isEmpty(new Set())).toBe(false);
  });
});

describe("isNumeric", () => {
  it("accepts finite numbers and numeric strings", () => {
    for (const value of [123, "123", -12, "-12.5", 0, "0", "1e3", "0xFF", " 12 "]) {
      expect(isNumeric(value)).toBe(true);
    }
  });
  it("rejects empty, malformed, non-finite, and unsupported input types", () => {
    for (const value of ["", "  ", "abc", "12abc", NaN, Infinity, -Infinity, null, true]) {
      expect(isNumeric(value)).toBe(false);
    }
  });
});

describe("isJSON", () => {
  it("accepts every JSON value category", () => {
    for (const value of ['{"name":"Ava"}', "[1,2,3]", '"hello"', "123", "true", "null"]) {
      expect(isJSON(value)).toBe(true);
    }
  });
  it("rejects malformed JSON, JavaScript syntax, and non-strings", () => {
    for (const value of ["", "{name: 'Ava'}", "[1,]", "undefined", undefined, { a: 1 }]) {
      expect(isJSON(value)).toBe(false);
    }
  });
});

describe("isAlpha", () => {
  it("accepts Unicode letters but rejects digits, spaces, and punctuation", () => {
    for (const value of ["Hello", "UTKARSH", "Élodie", "東京"]) expect(isAlpha(value)).toBe(true);
    for (const value of ["", "Hello123", "Hello World", "Hello!", 12]) expect(isAlpha(value)).toBe(false);
  });
});

describe("isAlphanumeric", () => {
  it("accepts Unicode letters and numbers", () => {
    for (const value of ["Hello123", "Utkarsh2026", "Élodie", "東京１２３"]) expect(isAlphanumeric(value)).toBe(true);
  });
  it("rejects spaces, punctuation, special characters, empty, and non-strings", () => {
    for (const value of ["", "Hello World", "Hello@123", "abc-1", "🙂", undefined]) expect(isAlphanumeric(value)).toBe(false);
  });
});
