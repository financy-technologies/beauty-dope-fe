import { describe, it, expect, beforeEach } from "vitest";
import {
  HEARD_ABOUT_OPTIONS,
  clearHeardAboutPending,
  isHeardAboutPending,
  markHeardAboutPending,
} from "./heardAbout";

beforeEach(() => localStorage.clear());

describe("heard-about pending flag", () => {
  it("is pending only for the account that just signed up", () => {
    markHeardAboutPending("user-1");
    expect(isHeardAboutPending("user-1")).toBe(true);
    expect(isHeardAboutPending("user-2")).toBe(false);
  });

  it("clears", () => {
    markHeardAboutPending("user-1");
    clearHeardAboutPending();
    expect(isHeardAboutPending("user-1")).toBe(false);
  });
});

describe("options", () => {
  it("have unique values and keep 'somewhere else' last", () => {
    const values = HEARD_ABOUT_OPTIONS.map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
    expect(values[values.length - 1]).toBe("other");
  });
});
