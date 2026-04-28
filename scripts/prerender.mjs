import puppeteer from "puppeteer";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../dist");

const routes = [
  "/",
  "/browse",
  "/dupes",
  "/ingredient-analyzer",
  "/compare",
  "/ingredients",
  "/quiz",
  "/skin-story",
  "/brands",
  "/routine-builder",
  "/skin-guide",
  "/about",
  "/methodology",
  "/community",
  "/blog",
  "/blog/niacinamide-complete-guide",
  "/blog/retinoid-beginners-guide",
  "/blog/routine-for-sensitive-skin",
  "/contact",
  "/privacy",
  "/terms",
  "/disclaimer",
];

// When Helmet injects a tag (marked with data-rh="true"), the static tag
// from index.html remains in the DOM too. Keep the Helmet version, drop the
// static duplicate — otherwise Google sees conflicting canonical/description
// tags and refuses to index the route as distinct from the homepage.
const HELMET_MANAGED_SELECTORS = [
  "title",
  'link[rel="canonical"]',
  'meta[name="description"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:url"]',
  'meta[property="og:image"]',
  'meta[property="og:image:alt"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'meta[name="twitter:image"]',
  'meta[name="twitter:image:alt"]',
];

function dedupeHelmetTags(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  for (const selector of HELMET_MANAGED_SELECTORS) {
    const nodes = [...doc.querySelectorAll(selector)];
    const hasHelmet = nodes.some((n) => n.getAttribute("data-rh") === "true");
    if (!hasHelmet) continue;
    for (const node of nodes) {
      if (node.getAttribute("data-rh") !== "true") node.remove();
    }
  }
  return dom.serialize();
}

function getFreePort() {
  return new Promise((resolve) => {
    const s = createServer();
    s.listen(0, () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}

async function startServer(port) {
  const server = spawn(
    "node",
    ["node_modules/.bin/serve", "dist", "-p", port, "--no-clipboard", "--single"],
    { stdio: "ignore" }
  );
  // Give server a moment to start
  await new Promise((r) => setTimeout(r, 1500));
  return server;
}

async function prerender() {
  const port = await getFreePort();
  console.log(`Starting preview server on port ${port}...`);
  const server = await startServer(port);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const route of routes) {
      const url = `http://localhost:${port}${route}`;
      console.log(`Prerendering ${route}...`);

      const page = await browser.newPage();
      try {
        // networkidle2 tolerates up to 2 in-flight requests, which prevents
        // hanging forever when the app fires backend API calls that have no
        // server running during prerender.
        await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
      } catch {
        // If navigation still times out, continue with whatever was rendered.
        console.warn(`  ⚠ Navigation timeout for ${route} — saving partial render`);
      }

      // Wait for React to fully render
      await new Promise((r) => setTimeout(r, 1000));

      const html = await page.content();
      await page.close();

      const cleanedHtml = dedupeHelmetTags(html);

      // Determine output path
      const outputDir =
        route === "/"
          ? distDir
          : path.join(distDir, ...route.split("/").filter(Boolean));

      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(path.join(outputDir, "index.html"), cleanedHtml, "utf-8");
      console.log(`  ✓ Saved to dist${route}/index.html`);
    }
  } finally {
    await browser.close();
    server.kill();
  }

  console.log("\nPrerendering complete!");
}

prerender().catch((err) => {
  console.error("Prerender failed:", err);
  // Exit 0 so CI/build doesn't fail — prerender is best-effort for SEO.
  process.exit(0);
});
