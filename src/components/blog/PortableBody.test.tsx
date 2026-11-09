import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PortableBody from "./PortableBody";
import { safeHref, sanityImageUrl, tagClasses } from "@/lib/blog";

const span = (text: string, marks: string[] = []) => ({ _type: "span", _key: text.slice(0, 8), text, marks });
const block = (style: string, children: unknown[], markDefs: unknown[] = []) => ({
  _type: "block",
  _key: Math.random().toString(36).slice(2),
  style,
  markDefs,
  children,
});

// One of everything an editor can put in a post (see studio/schemaTypes/blocks.ts).
const BODY = [
  block("h2", [span("What is Niacinamide?")]),
  block("h3", [span("How it works")]),
  block(
    "normal",
    [span("Read "), span("our method", ["m1"]), span(" or "), span("this study", ["m2"]), span(" — "), span("bad", ["m3"]), span(" — "), span("bold", ["strong"])],
    [
      { _key: "m1", _type: "link", href: "/methodology" },
      { _key: "m2", _type: "link", href: "https://pubmed.ncbi.nlm.nih.gov/123" },
      { _key: "m3", _type: "link", href: "javascript:alert(1)" },
    ],
  ),
  { _type: "ingredientCards", _key: "ic", layout: "grid", items: [{ _key: "i1", name: "Niacinamide", inci: "Niacinamide", benefit: "Calms redness", skinTypes: ["Oily", "Sensitive"], caution: "Start at 2%" }] },
  { _type: "callout", _key: "c1", tone: "tip", text: "Patch test first." },
  { _type: "callout", _key: "c2", tone: "warning", text: "Avoid with vitamin C at night." },
  { _type: "dataTable", _key: "t1", headers: ["Strength", "For"], rows: [{ _key: "r1", cells: ["2%", "Sensitive"] }, { _key: "r2", cells: ["10%", "Oily"] }] },
  { _type: "productPicks", _key: "p1", products: [{ _key: "pp", brand: "Minimalist", name: "10% Niacinamide", price: "₹599", why: "Fragrance-free" }] },
  { _type: "checklist", _key: "cl", items: [{ _key: "x", label: "Week 1", note: "Every other night" }] },
  { _type: "image", _key: "img", url: "https://cdn.sanity.io/images/p/d/abc-1600x900.jpg", alt: "Serum bottle", caption: "A serum", width: 1600, height: 900 },
  { _type: "someFutureBlock", _key: "zz", foo: "bar" },
];

function renderBody() {
  return render(
    <MemoryRouter>
      <PortableBody value={BODY} />
    </MemoryRouter>,
  );
}

describe("PortableBody", () => {
  it("renders headings and paragraphs", () => {
    renderBody();
    expect(screen.getByRole("heading", { level: 2, name: "What is Niacinamide?" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "How it works" })).toBeInTheDocument();
    expect(screen.getByText("bold").tagName).toBe("STRONG");
  });

  it("renders internal links in-app and external links in a new tab", () => {
    renderBody();
    expect(screen.getByRole("link", { name: "our method" })).toHaveAttribute("href", "/methodology");
    const ext = screen.getByRole("link", { name: "this study" });
    expect(ext).toHaveAttribute("target", "_blank");
    expect(ext).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders unsafe links as plain text", () => {
    const { container } = renderBody();
    expect(screen.queryByRole("link", { name: "bad" })).toBeNull();
    expect(container.innerHTML).not.toContain("javascript:");
  });

  it("renders every custom block", () => {
    renderBody();
    expect(screen.getByText("Calms redness")).toBeInTheDocument();
    expect(screen.getByText("Start at 2%")).toBeInTheDocument();
    expect(screen.getByText("Patch test first.")).toBeInTheDocument();
    expect(screen.getByText("Avoid with vitamin C at night.")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Strength" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "10%" })).toBeInTheDocument();
    expect(screen.getByText("₹599")).toBeInTheDocument();
    expect(screen.getByText("Week 1")).toBeInTheDocument();
    const img = screen.getByRole("img", { name: "Serum bottle" });
    expect(img.getAttribute("src")).toContain("w=1200");
    expect(screen.getByText("A serum")).toBeInTheDocument();
  });

  it("skips unknown block types instead of crashing", () => {
    const { container } = renderBody();
    expect(container.innerHTML).not.toContain("someFutureBlock");
  });
});

describe("blog helpers", () => {
  it("safeHref", () => {
    expect(safeHref("/dupes")).toEqual({ href: "/dupes", internal: true });
    expect(safeHref("https://skinevora.com/blog/x?y=1")).toEqual({ href: "/blog/x?y=1", internal: true });
    expect(safeHref("https://example.com/a")).toEqual({ href: "https://example.com/a", internal: false });
    expect(safeHref("mailto:hello@skinevora.com")?.internal).toBe(false);
    for (const bad of ["javascript:alert(1)", "data:text/html,x", "//evil.com", "", null, 42]) expect(safeHref(bad)).toBeNull();
  });

  it("sanityImageUrl only rewrites Sanity CDN URLs", () => {
    expect(sanityImageUrl("https://cdn.sanity.io/images/p/d/a.jpg", 600)).toBe("https://cdn.sanity.io/images/p/d/a.jpg?w=600&auto=format&fit=max");
    expect(sanityImageUrl("https://example.com/a.jpg", 600)).toBe("https://example.com/a.jpg");
  });

  it("tagClasses falls back to teal", () => {
    expect(tagClasses("rose")).toContain("rose");
    expect(tagClasses("neon")).toBe(tagClasses("teal"));
  });
});
