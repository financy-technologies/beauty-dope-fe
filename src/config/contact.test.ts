import { describe, it, expect } from "vitest";
import { SUPPORT_EMAIL, contactMailto } from "./contact";

describe("contact", () => {
  it("uses the support address", () => {
    expect(SUPPORT_EMAIL).toBe("support@skinevora.com");
  });

  it("addresses the form to support with subject and signed body", () => {
    const url = new URL(contactMailto({ name: " Asha ", email: "asha@example.com", subject: "Dupe for La Mer?", message: "Is there one & under ₹2000?" }));
    expect(url.protocol).toBe("mailto:");
    expect(url.pathname).toBe("support@skinevora.com");
    expect(url.searchParams.get("subject")).toBe("Dupe for La Mer?");
    expect(url.searchParams.get("body")).toBe("Is there one & under ₹2000?\n\n— Asha (asha@example.com)");
  });

  it("can't be used to add recipients via the subject", () => {
    const url = contactMailto({ name: "x", email: "x@y.z", subject: "hi&cc=evil@x.com", message: "m" });
    expect(new URL(url).searchParams.get("cc")).toBeNull();
  });
});
