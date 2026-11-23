# SEO FIX REPORT — sdesign.co.in — 23 Nov 2026

**Platform:** Next.js 13 (app router) with CMS‑driven content (no headless CMS API visible in this repo).  
**Baseline health score:** 63/100 (from the earlier audit).  
**Goal:** Bring the site to > 80/100 with minimal, non‑breaking changes.

---
## 🌐 Site‑wide files to create / modify

### 1️⃣ `public/robots.txt`
```text
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://sdesign.co.in/sitemap.xml
```
*Placement:* root of the domain (Next.js serves static files from `public/`).  
*Why:* Lets all major crawlers (including AI bots) discover pages and references the sitemap.

### 2️⃣ `public/sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9"
        xmlns:image="http://www.sitemap.org/schemas/sitemap/1.1">
  <!-- Homepage -->
  <url>
    <loc>https://sdesign.co.in/</loc>
    <lastmod>2026-11-23</lastmod>
    <changefreq> weekly </changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Static pages (if any) – add here if you have separate /about, /contact URLs -->
  <!-- Example:
  <url>
    <loc>https://sdesign.co.in/#contact</loc>
    <priority>0.8</priority>
  </url>
  -->

  <!-- Dynamic project pages – will be generated at build time (see script note below) -->
</urlset>
```
*Placement:* `public/sitemap.xml`.  
*Note:* A small Node script can be added to `scripts/sitemap.js` that queries `getPublishedProjectBySlug` and appends a `<url>` entry for each project. Run `node scripts/sitemap.js` after each deployment; the output can be overwritten into `public/sitemap.xml`.

### 3️⃣ `public/llms.txt`
```text
# S_Designs
> Independent architecture studio creating quiet, considered spaces for living, working and gathering.

## Key pages
- https://sdesign.co.in/: Home – studio overview, services, contact.
- https://sdesign.co.in/work/: Project case‑studies (list of residential, commercial, interior, landscape, renovation projects).

## Contact
- Email: adithiruthiparambil12@gmail.com
- City: Chennai, India
```
*Placement:* root of the domain. Helps LLMs (ChatGPT, Perplexity, Gemini) understand the brand and service area.

---
## 📄 Page‑specific fixes

### 4️⃣ Homepage (`/`) – `app/layout.tsx` + `app/page.tsx`

| Element | Before (excerpt) | After (exact code to paste) |
|---------|------------------|------------------------------|
| **`<title>`** | `title: homeSeo?.seoTitle || `${data.settings.studioName} — ${data.settings.tagline}`` | Add a deterministic fallback that includes the primary service keyword: <br>`title: homeSeo?.seoTitle || `${data.settings.studioName} — Residential & Commercial Architecture, Chennai`` |
| **Meta description** (line 16‑17) | `'S_Designs is an independent architecture studio creating quiet, considered spaces for living, working and gathering.'` | **Meta** (replace the `description` value): <br>`description: homeSeo?.metaDescription || 'S_Designs offers residential, commercial & interior architecture design services in Chennai, India. Book a consultation for quiet, considered spaces.'` <br>*(≈150 chars, keyword front‑loaded, CTA included)* |
| **Open Graph** (lines 30‑35) | Already present for home; keep as‑is, just ensure `images` uses a high‑resolution logo: <br>`images: [homeSeo?.ogImage || '/s-design-logo.jpg']` |
| **Organization JSON‑LD** (new block, just before `</head>` in `layout.tsx`) | – | Insert **before the closing `</head>`** (or right after the `<Meta>` block): <br>`<script type="application/ld+json">{JSON.stringify({ "@context":"https://schema.org","@type":"Organization","name":data.settings.studioName,"url":"https://sdesign.co.in","logo":homeSeo?.ogImage || "/s-design-logo.jpg","sameAs":["https://instagram.com/","https://linkedin.com/"],"areaServed":"Chennai, India"})}</script>` |
| **H1** (not present on homepage; the first meaningful heading is `<h2>` inside studio section) | – | Add a **site‑wide `<h1>`** that is hidden visually but kept for SEO: <br>`<h1 className="sr-only">{data.settings.studioName} Architecture — Residential & Commercial Designer in Chennai</h1>` <br>Add CSS: `.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:clip;clip:rect(0,0,0,0);white-space:nowrap;border:0;}` |
| **Image alt attributes** (hero image in `HeroCinematic`) | `alt={homepage.heroAlt || "S_Designs Studio architecture and materiality"}` | Ensure the `alt` includes the location keyword: <br>`alt="S_Designs studio in Chennai – architectural materiality and design approach"` |

### 5️⃣ Project detail page (`/work/[slug]`) – `app/work/[slug]/page.tsx`

| Element | Before (excerpt) | After (exact code to paste) |
|---------|------------------|------------------------------|
| **`generateMetadata` title** (lines 26‑28) | `title: project.seoTitle || `${project.title} — ${siteData.settings.studioName} Architecture`` | **Title** (keyword‑rich, ≤60 chars): <br>`title: project.seoTitle || `${project.title} — {project.category} Architecture — S_Designs Chennai`` |
| **Meta description** (line 28) | `description: project.seoDescription || project.shortDescription || project.fullDescription` | **Meta** (140‑160 chars): <br>`description: project.seoDescription || `${project.shortDescription || project.fullDescription || "A {project.category.toLowerCase()} project by S_Designs in {project.location}". trim()}` |
| **Canonical URL** (new line inside the returned `Metadata`) | – | Add to the returned object: <br>`canonical: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/work/${project.slug}`, "https://sdesign.co.in").toString()` |
| **Open Graph** (new block, after the title block) | – | Insert: <br>`openGraph: { title: project.seoTitle || project.title, description: project.seoDescription || project.shortDescription, images: [project.mainImage || "/placeholder.jpg"], type: "website" }` |
| **Project JSON‑LD** (new block, right after the page’s `<head>` markup) | – | Insert **before the closing `</head>`** of the page: <br>`<script type="application/ld+json">{JSON.stringify({ "@context":"https://schema.org","@type":"CreativeWork","name":project.title,"description":project.shortDescription || project.fullDescription || "A residential project by S_Designs","author":{"@type":"Organization","name":"S_Designs"},"url":new URL(`/work/${project.slug}`, "https://sdesign.co.in").toString(),"image":project.mainImage || "/placeholder.jpg","datePublished":project.date ? new Date(project.date).toISOString() : new Date().toISOString()})}</script>` |
| **Answer block** (40‑60 word direct answer under the `<h1>`) | – | Add **right after the `<h1>` line** (line 168‑169 in the file): <br>`<p className="project-answer">{project.shortDescription || "We design bespoke residential and commercial spaces that blend light, material, and proportion to create enduring places for living and working in Chennai."}</p>` <br>Optional CSS: `.project-answer{margin-top:1rem;font-size:1rem;color:#555;}` |
| **H1** (already present as `<StaggeredHeading tag="h1" ...>`) | – | No change needed, but ensure it **exactly matches** the page’s primary keyword: the current `<h1>` renders `{project.title}` – keep as‑is; the title meta now adds location, which is consistent. |
| **Image alt attributes** (hero image in `DetailHeroMedia`) | `alt={project.mainImageAlt || \`${project.title} — ${project.location}\`}` | Improve: <br>`alt="Exterior view of {project.title} – a {project.category.toLowerCase()} project by S_Designs in {project.location}"` |
| **Internal link anchors** (next/prev project nav at bottom) | `<Link href={`/work/${nextProject.slug}`}>View {nextProject.title}</Link>` | **Better anchor** (includes category): <br>`<Link href={`/work/${nextProject.slug}`}>View the {nextProject.title} {nextProject.category} project</Link>` |

### 6️⃣ Global CSS tweak (optional, UI‑preserving)

Add **one rule** to `globals.css` (or any existing CSS file) to make the hidden `<h1>` accessible only to screen readers:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: clip;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

This keeps the visual design untouched while giving Google a clear `<h1>` signal.

---
## ✅ Checklist after implementation

| ✅ Item | How to verify |
|--------|----------------|
| **robots.txt** lives at `https://sdesign.co.in/robots.txt` | Browse the URL; confirm the content above. |
| **sitemap.xml** lives at `https://sdesign.co.in/sitemap.xml` | Browse; confirm it contains the home URL and (after running the script) project entries. |
| **llms.txt** at `https://sdesign.co.in/llms.txt` | Confirms brand info for AI crawlers. |
| **Organization JSON‑LD** on homepage validates at `https://validator.schema.org` | Use the Rich Results Test or Schema Validator. |
| **Project JSON‑LD** on a sample project page validates similarly. | Pick any live project URL; test. |
| **Canonical tags** present on each `/work/*` page and point to the clean URL. | View source → search for `<link rel="canonical"`. |
| **Title & meta** each page have 50‑60 char title and 140‑160 char description, keyword front‑loaded. | Use a browser extension or curl. |
| **Answer block** appears under the `<h1>` on project pages with readable text. | Inspect element. |
| **Image alt** text includes service + location keywords. | Check `alt` attributes in source. |
| **Internal links** in “Next/Prev” now contain category text. | Verify navigation. |
| **PageSpeed** (lab) – run `https://pagespeed.web.dev/?url=https://sdesign.co.in&strategy=mobile`; ensure LCP ≤ 2.5 s (or at least no regression). | Run test after deploying. |
| **Search Console** – submit the sitemap and request indexing for a few project URLs. | GSC → Sitemaps → Submit. |

---
## 📦 What to copy & paste (summary)

1. **Create three files** in the repository root (`public/`):
   - `robots.txt` (content as shown)
   - `sitemap.xml` (content as shown; run `node scripts/sitemap.js` to add projects)
   - `llms.txt` (content as shown)

2. **Edit `app/layout.tsx`**:
   - Replace the `title` fallback with the keyword‑rich version.
   - Replace the `description` value with the 150‑char version.
   - Add the `Organization` JSON‑LD block (see code snippet).
   - Add the hidden `<h1>` component and the accompanying CSS.

3. **Edit `app/work/[slug]/page.tsx`** (once, then copy for every project):
   - Update `generateMetadata` return object: add `title`, `description`, `canonical`, `openGraph`.
   - Insert the `Project` JSON‑LD block before `</head>`.
   - Add the `<p className="project-answer">` after the `<h1>`.
   - Improve the hero `alt` text.

4. **Edit `globals.css`** (or any existing stylesheet) to include the `.sr-only` class if it isn’t already present.

5. **Run the sitemap script** (optional but recommended):
   ```bash
   node scripts/sitemap.js   # generates project entries, overwrites public/sitemap.xml
   ```

6. **Deploy** ( Vercel, Netlify, etc.) and **verify** the items in the checklist.

---
### Expected impact

| Fix | Approx. SEO gain |
|-----|-------------------|
| Proper titles & meta descriptions (keyword‑rich, within length limits) | +8‑12 points |
| Canonical tags + sitemap + robots.txt | +5‑7 points |
| Organization + Project JSON‑LD | +5‑9 points (rich‑result eligibility) |
| Answer block + improved alt text | +3‑5 points (AI citation & image search) |
| Hidden `<h1>` + structured heading hierarchy | +2‑4 points |
| **Total potential uplift** | **≈ 23‑30 points**, moving the health score from **63 → ~ 86‑90**. |

---
**End of report**. Run the `seo-fixer` skill again after these changes go live to validate that all required elements are present and to receive any additional copy‑and‑paste snippets the tool may surface.