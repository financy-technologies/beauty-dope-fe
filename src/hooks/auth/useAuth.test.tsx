import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./useAuth";
import { isHeardAboutPending } from "@/lib/heardAbout";

// Each test answers the next auth request with this body.
let nextResponse: Record<string, unknown> = {};
let lastBody: Record<string, unknown> | null = null;

beforeEach(() => {
  localStorage.clear();
  lastBody = null;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      lastBody = init?.body ? JSON.parse(init.body as string) : null;
      return new Response(JSON.stringify(nextResponse), { status: 200, headers: { "Content-Type": "application/json" } });
    }),
  );
});

afterEach(() => vi.unstubAllGlobals());

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

async function setup() {
  const { result } = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

describe("useAuth → heard-about prompt", () => {
  it("asks a brand-new Google account", async () => {
    const auth = await setup();
    nextResponse = { accessToken: "t", user: { id: "g-new", email: "a@b.c" }, isNewUser: true };
    await act(() => auth.current.signInWithGoogle("credential"));
    expect(isHeardAboutPending("g-new")).toBe(true);
  });

  it("does not ask a returning Google user", async () => {
    const auth = await setup();
    nextResponse = { accessToken: "t", user: { id: "g-old", email: "a@b.c" }, isNewUser: false };
    await act(() => auth.current.signInWithGoogle("credential"));
    expect(isHeardAboutPending("g-old")).toBe(false);
  });

  it("asks after email signup", async () => {
    const auth = await setup();
    nextResponse = { accessToken: "t", user: { id: "e-new", email: "a@b.c" }, isNewUser: true };
    await act(() => auth.current.signUp("a@b.c", "password123"));
    expect(isHeardAboutPending("e-new")).toBe(true);
  });

  it("does not ask on email login", async () => {
    const auth = await setup();
    nextResponse = { accessToken: "t", user: { id: "e-old", email: "a@b.c" } };
    await act(() => auth.current.signIn("a@b.c", "password123"));
    expect(isHeardAboutPending("e-old")).toBe(false);
  });

  it("still sends UTM attribution with Google signups", async () => {
    localStorage.setItem(
      "skinevora_attribution",
      JSON.stringify({
        first: { source: "reddit", landingPath: "/", at: new Date().toISOString() },
        last: { source: "reddit", landingPath: "/", at: new Date().toISOString() },
        expiresAt: Date.now() + 60_000,
      }),
    );
    const auth = await setup();
    nextResponse = { accessToken: "t", user: { id: "g2", email: "a@b.c" }, isNewUser: true };
    await act(() => auth.current.signInWithGoogle("credential"));
    expect(lastBody).toMatchObject({ credential: "credential", attribution: { first: { source: "reddit" } } });
  });
});
