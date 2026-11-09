import puppeteer from "puppeteer";
import { createServer, connect } from "node:net";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../dist");
const SITE = "https://skinevora.com";

/** VITE_API_URL from the environment, else .env.production / .env (same precedence as `vite build`). */
async function apiUrl() {
  if (process.env.VITE_API_URL) return process.env.VITE_API_URL;
  for (const file of [".env.production", ".env"]) {
    try {
      const text = await fs.readFile(path.join(__dirname, "..", file), "utf-8");
      const m = text.match(/^\s*VITE_API_URL\s*=\s*"?([^"\n#]+)"?/m);
      if (m) return m[1].trim();
    } catch {
      /* file missing */
    }
  }
  return null;
}

/** Published posts from the API (Sanity), so new posts get prerendered + into the sitemap. */
async function loadBlogPosts() {
  const base = await apiUrl();
  if (!base) {
    console.warn("⚠ VITE_API_URL not set — skipping blog post pages");
    return [];
  }
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/blog/posts`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const posts = await res.json();
    const valid = posts.filter((p) => typeof p.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug));
    console.log(`Found ${valid.length} blog post(s) in Sanity`);
    return valid;
  } catch (err) {
    console.warn(`⚠ Couldn't load blog posts from ${base}: ${err.message} — skipping blog post pages`);
    return [];
  }
}

/** Replace the blog-post block of dist/sitemap.xml with the current posts. */
async function writeBlogSitemap(posts) {
  if (!posts.length) return; // keep whatever the static sitemap has
  const file = path.join(distDir, "sitemap.xml");
  const xml = await fs.readFile(file, "utf-8");
  const start = xml.indexOf("<!-- Blog posts -->");
  const end = xml.indexOf("<!--", start + 1);
  if (start === -1 || end === -1) {
    console.warn("⚠ sitemap.xml has no <!-- Blog posts --> section — not updated");
    return;
  }
  const entries = posts
    .map((p) => {
      const lastmod = (p.updatedAt || p.publishedAt || "").slice(0, 10);
      return `  <url>\n    <loc>${SITE}/blog/${p.slug}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <changefreq>monthly</changefreq>\n    <priority>0.75</priority>\n  </url>\n`;
    })
    .join("\n");
  await fs.writeFile(file, `${xml.slice(0, start)}<!-- Blog posts -->\n${entries}\n  ${xml.slice(end)}`, "utf-8");
  console.log(`Updated sitemap.xml with ${posts.length} blog post(s)`);
}

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
  // Individual posts come from Sanity — see loadBlogPosts() below.
  "/newsletter",
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

function waitForPort(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const sock = connect(port, "localhost");
      sock.once("connect", () => {
        sock.destroy();
        resolve();
      });
      sock.once("error", () => {
        sock.destroy();
        if (Date.now() > deadline) reject(new Error("not accepting connections"));
        else setTimeout(attempt, 150);
      });
    };
    attempt();
  });
}

// Wait until the preview server really accepts connections. --no-port-switching
// stops `serve` from silently moving to another port if ours got taken in the
// meantime (which would make every page below a browser error page).
async function startServer() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const port = await getFreePort();
    const server = spawn(
      "node",
      ["node_modules/.bin/serve", "dist", "-p", String(port), "--no-clipboard", "--single", "--no-port-switching"],
      { stdio: "ignore" }
    );
    const exited = new Promise((_, reject) => server.once("exit", (code) => reject(new Error(`exited with code ${code}`))));
    try {
      await Promise.race([waitForPort(port), exited]);
      return { server, port };
    } catch (err) {
      server.kill();
      console.warn(`  ⚠ Preview server on port ${port} ${err.message}${attempt < 3 ? " — retrying" : ""}`);
    }
  }
  throw new Error("Could not start the preview server");
}

async function prerender() {
  const posts = await loadBlogPosts();
  routes.push(...posts.map((p) => `/blog/${p.slug}`));
  await writeBlogSitemap(posts);

  const { server, port } = await startServer();
  console.log(`Preview server ready on port ${port}`);
  const skipped = [];

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

      // Never save a browser error page or an empty app as the page's HTML —
      // leaving it un-prerendered (plain SPA) is far better for SEO. One bad
      // route (e.g. a detached frame after a timeout) must not stop the rest.
      let html = null;
      try {
        const rendered = await page.evaluate(
          () => !document.getElementById("main-frame-error") && (document.getElementById("root")?.childElementCount ?? 0) > 0
        );
        if (rendered) html = await page.content();
      } catch (err) {
        console.warn(`  ⚠ ${route}: ${err.message.split("\n")[0]}`);
      }
      await page.close().catch(() => {});
      if (!html) {
        console.warn(`  ⚠ ${route} didn't render — not saved`);
        skipped.push(route);
        continue;
      }

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

  if (skipped.length) {
    console.warn(`\n⚠ ${skipped.length} route(s) were not prerendered and will be served as the plain app: ${skipped.join(", ")}`);
  }
  console.log("\nPrerendering complete!");
}

prerender().catch((err) => {
  console.error("Prerender failed:", err);
  // Exit 0 so CI/build doesn't fail — prerender is best-effort for SEO.
  process.exit(0);
});
