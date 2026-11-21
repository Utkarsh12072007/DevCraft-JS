import { describe, expect, it } from "vitest";
import {
  capitalize,
  camelCase,
  kebabCase,
  snakeCase,
  truncate,
  reverse,
  countWords,
  isPalindrome,
} from "../src/string/index.js";

describe("capitalize", () => {
  it("capitalizes only the first character", () => {
    expect(capitalize("hello world")).toBe("Hello world");
    expect(capitalize("hELLO")).toBe("HELLO");
    expect(capitalize("Already")).toBe("Already");
  });
  it("handles empty and Unicode strings and rejects non-strings", () => {
    expect(capitalize("")).toBe("");
    expect(capitalize("🙂hello")).toBe("🙂hello");
    expect(() => capitalize(null)).toThrow(TypeError);
  });
});

describe("camelCase", () => {
  it("converts separators and mixed naming styles", () => {
    expect(camelCase("hello world")).toBe("helloWorld");
    expect(camelCase("hello-world")).toBe("helloWorld");
    expect(camelCase("hello_world")).toBe("helloWorld");
    expect(camelCase("  XMLHttpRequest__API  ")).toBe("xmlHttpRequestApi");
  });
  it("handles repeated separators, digits, punctuation, and empty input", () => {
    expect(camelCase("  version 2--release ")).toBe("version2Release");
    expect(camelCase("hello, world!")).toBe("hello,World!");
    expect(camelCase("")).toBe("");
    expect(() => camelCase(1)).toThrow(TypeError);
  });
});

describe("kebabCase", () => {
  it("converts camel, Pascal, and separated words", () => {
    expect(kebabCase("helloWorld")).toBe("hello-world");
    expect(kebabCase("Hello World")).toBe("hello-world");
    expect(kebabCase("XMLHttpRequest")).toBe("xml-http-request");
    expect(kebabCase("hello__world---again")).toBe("hello-world-again");
  });
  it("trims separators and preserves punctuation inside words", () => {
    expect(kebabCase(" _Hello, World!_ ")).toBe("hello,-world!");
    expect(kebabCase("")).toBe("");
    expect(() => kebabCase(undefined)).toThrow(TypeError);
  });
});

describe("snakeCase", () => {
  it("converts camel, Pascal, and separated words", () => {
    expect(snakeCase("helloWorld")).toBe("hello_world");
    expect(snakeCase("Hello World")).toBe("hello_world");
    expect(snakeCase("XMLHttpRequest")).toBe("xml_http_request");
    expect(snakeCase("hello--world__again")).toBe("hello_world_again");
  });
  it("handles empty input and invalid values", () => {
    expect(snakeCase("")).toBe("");
    expect(() => snakeCase({})).toThrow(TypeError);
  });
});

describe("truncate", () => {
  it("returns short input unchanged and truncates to the maximum output length", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
    expect(truncate("JavaScript is awesome", 10)).toBe("JavaScr...");
    expect(truncate("Hello World", 8, "…")).toBe("Hello W…");
    expect(truncate("🙂abc", 3, "…")).toBe("🙂a…");
  });
  it("handles zero length, long suffixes, and invalid arguments", () => {
    expect(truncate("hello", 0)).toBe("");
    expect(truncate("hello", 2, "long")).toBe("lo");
    expect(() => truncate("x", -1)).toThrow(RangeError);
    expect(() => truncate("x", 1.2)).toThrow(RangeError);
    expect(() => truncate("x", 1, null)).toThrow(TypeError);
  });
});

describe("reverse", () => {
  it("reverses text, spaces, and punctuation", () => {
    expect(reverse("hello")).toBe("olleh");
    expect(reverse("JavaScript")).toBe("tpircSavaJ");
    expect(reverse("a b!")).toBe("!b a");
  });
  it("handles empty, single-code-point, and emoji input", () => {
    expect(reverse("")).toBe("");
    expect(reverse("x")).toBe("x");
    expect(reverse("A🙂B")).toBe("B🙂A");
    expect(() => reverse(false)).toThrow(TypeError);
  });
});

describe("countWords", () => {
  it("counts whitespace-separated words despite repeated whitespace", () => {
    expect(countWords("Hello World")).toBe(2);
    expect(countWords("  Hello   World  ")).toBe(2);
    expect(countWords("JavaScript is powerful")).toBe(3);
    expect(countWords("one\ttwo\nthree")).toBe(3);
  });
  it("returns zero for whitespace and treats punctuation as part of tokens", () => {
    expect(countWords("")).toBe(0);
    expect(countWords(" \t\n ")).toBe(0);
    expect(countWords("Hello, world!")).toBe(2);
    expect(() => countWords([])).toThrow(TypeError);
  });
});

describe("isPalindrome", () => {
  it("ignores case, spaces, and punctuation", () => {
    expect(isPalindrome("madam")).toBe(true);
    expect(isPalindrome("RaceCar")).toBe(true);
    expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true);
    expect(isPalindrome("hello")).toBe(false);
  });
  it("handles empty, numeric, and Unicode letters", () => {
    expect(isPalindrome("")).toBe(true);
    expect(isPalindrome("7, 8, 7")).toBe(true);
    expect(isPalindrome("été")).toBe(true);
    expect(isPalindrome("🙂a🙂")).toBe(true);
    expect(() => isPalindrome(null)).toThrow(TypeError);
  });
});
