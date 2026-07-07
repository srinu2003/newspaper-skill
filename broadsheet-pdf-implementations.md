# Broadsheet Newspaper PDF — Implementation Documentation

This document covers three different ways to generate a blank **broadsheet newspaper spread** (two pages side by side, 30in × 22.75in landscape, with an outer border and a dashed center fold line). Each implementation solves the same visual output using a different toolchain, with different trade-offs.

---

## 1. Overview

| Spec | Value |
|---|---|
| Single broadsheet page | 15in × 22.75in |
| Two-page spread (final output) | 30in × 22.75in (landscape) |
| Margin | 0.5in |
| Border | 2pt solid, around the full spread |
| Fold line | 1pt dashed, vertical, centered |

Three implementations were built:

1. **Python + reportlab** — server-side PDF generation
2. **JavaScript + pdf-lib** — no-dependency-on-Python PDF generation
3. **HTML + CSS + vanilla JS** — no PDF library at all; relies on the browser's native print-to-PDF engine

---

## 2. Implementation A — Python (reportlab)

### Approach
Draws directly onto a PDF canvas at exact point dimensions (1 inch = 72 points).

### Code
```python
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

PAGE_W = 15 * inch
PAGE_H = 22.75 * inch
WIDTH = PAGE_W * 2   # 30in
HEIGHT = PAGE_H      # 22.75in

c = canvas.Canvas("broadsheet_spread.pdf", pagesize=(WIDTH, HEIGHT))
margin = 0.5 * inch

# Outer border
c.setLineWidth(2)
c.rect(margin, margin, WIDTH - 2*margin, HEIGHT - 2*margin)

# Dashed center fold line
c.setDash(6, 4)
c.setLineWidth(1)
c.line(WIDTH/2, margin, WIDTH/2, HEIGHT - margin)
c.setDash()

c.save()
```

### Characteristics
- **Output is deterministic** — no browser or rendering engine involved, so the PDF is pixel/point-exact every time.
- **Runs headless** — good for batch generation, servers, CLI pipelines.
- **Dependency**: requires `reportlab` installed (`pip install reportlab`).
- **No preview step** — you get the PDF directly; nothing to click or interact with.

### Best for
Automated / scripted PDF generation where a human never needs to see an intermediate step.

---

## 3. Implementation B — JavaScript (pdf-lib)

### Approach
Same drawing logic as reportlab, but using pdf-lib's page/graphics API in Node.js. Since pdf-lib has no built-in dashed-line primitive, the dashed fold line is manually constructed from short line segments.

### Code
```javascript
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';

async function createBroadsheetSpread() {
  const inch = 72;
  const PAGE_W = 15 * inch;
  const PAGE_H = 22.75 * inch;
  const WIDTH = PAGE_W * 2;
  const HEIGHT = PAGE_H;
  const margin = 0.5 * inch;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([WIDTH, HEIGHT]);

  page.drawRectangle({
    x: margin, y: margin,
    width: WIDTH - 2 * margin,
    height: HEIGHT - 2 * margin,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });

  // Manual dash simulation (pdf-lib has no native dash support)
  const dashLength = 6, gapLength = 4, x = WIDTH / 2;
  let y = margin;
  while (y < HEIGHT - margin) {
    const segEnd = Math.min(y + dashLength, HEIGHT - margin);
    page.drawLine({
      start: { x, y }, end: { x, y: segEnd },
      thickness: 1, color: rgb(0, 0, 0),
    });
    y += dashLength + gapLength;
  }

  fs.writeFileSync('broadsheet_spread_js.pdf', await pdfDoc.save());
}
```

### Characteristics
- **Same determinism as reportlab** — pdf-lib builds the PDF byte structure directly, no rendering engine in the loop.
- **Runs in Node.js or the browser** — pdf-lib is isomorphic, useful if the rest of the stack is already JS (e.g. a Next.js backend or Electron app).
- **More manual work for niceties** — no native dashed-line or some higher-level drawing helpers that reportlab provides out of the box.
- **Dependency**: requires `pdf-lib` (`npm install pdf-lib`).

### Best for
JS/Node-only environments where introducing Python isn't desirable, or where the PDF needs to be generated client-side / in a serverless JS function.

---

## 4. Implementation C — HTML + CSS + Vanilla JS (browser print)

### Approach
No PDF library at all. A styled HTML page is sized in physical units (inches) using CSS. A "Print PDF" button calls the browser's native `window.print()`, and the `@page` CSS rule forces the print engine to output at the exact broadsheet spread dimensions. The border and fold line are just CSS (`border`, `border-left: dashed`) rather than drawn PDF primitives.

### Code
```html
<style>
  :root {
    --page-w: 15in;
    --page-h: 22.75in;
    --margin: 0.5in;
  }

  body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;   /* prevents overflow being clipped off-screen */
    overflow: auto;
  }

  .spread {
    width: calc(var(--page-w) * 2);
    height: var(--page-h);
    background: white;
    position: relative;
  }

  .border {
    position: absolute;
    top: var(--margin); left: var(--margin);
    right: var(--margin); bottom: var(--margin);
    border: 2px solid black;
  }

  .fold-line {
    position: absolute;
    top: var(--margin); bottom: var(--margin);
    left: 50%;
    border-left: 1px dashed black;
  }

  @media print {
    @page {
      size: 30in 22.75in;   /* literal value — @page doesn't support calc() */
      margin: 0;
    }

    html, body {
      width: calc(var(--page-w) * 2);
      height: var(--page-h);
      margin: 0; padding: 0;
      overflow: hidden;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .controls { display: none; }

    .spread {
      margin: 0;
      box-shadow: none;
      break-inside: avoid;
    }
  }
</style>

<div class="controls">
  <button onclick="window.print()">Print PDF</button>
</div>

<div class="spread">
  <div class="border"></div>
  <div class="fold-line"></div>
</div>
```

### Two layout modes, deliberately different
| | Screen mode | Print mode |
|---|---|---|
| `body` alignment | `flex-start`, scrollable | centered, `overflow: hidden` |
| Purpose | lets a human scroll and inspect a canvas wider than their screen | guarantees the output is exactly page-sized with no offset |

This split exists because of a real bug encountered along the way: centering a wider-than-viewport element with `align-items: center` pushes part of it into negative scroll space the browser won't let you reach. Screen mode uses `flex-start` + `overflow: auto` to keep everything reachable; print mode re-centers safely because at that point the container is locked to the exact page size, so there's no overflow to worry about.

### Characteristics
- **Zero backend dependencies** — no Python, no Node, no npm install. Just a browser.
- **Not fully deterministic** — the exact PDF bytes depend on which browser/print engine renders it (Chrome tends to be the most reliable for custom large page sizes; Firefox can be pickier).
- **Human-in-the-loop by design** — requires a click and (in most browsers) confirming "Save as PDF" in a print dialog; not suitable for unattended/headless generation without something like Puppeteer driving it.
- **Easiest to style richly** — since it's just HTML/CSS, gradients, web fonts, flexbox layout, etc. are all trivially available (as seen in the certificate template this pattern was adapted from).

### Best for
User-facing tools where someone interacts with a page and exports it themselves — templates, certificates, forms — rather than backend batch generation.

---

## 5. Comparison Summary

| | reportlab (Python) | pdf-lib (JS) | HTML/CSS/JS (browser print) |
|---|---|---|---|
| Runs headless / unattended | ✅ | ✅ | ❌ (needs a browser + user click, or a headless browser like Puppeteer) |
| Output determinism | ✅ Exact | ✅ Exact | ⚠️ Depends on browser's print engine |
| Requires install | `pip install reportlab` | `npm install pdf-lib` | None — just a browser |
| Styling flexibility | Manual drawing calls | Manual drawing calls | Full CSS (fonts, gradients, flexbox, etc.) |
| Best fit | Server-side / scripted generation | JS-only backend or serverless | Interactive, user-facing templates |

---

## 6. Files Produced

- `broadsheet_spread.pdf` — reportlab output
- `broadsheet_spread_js.pdf` — pdf-lib output
- `broadsheet_spread_print.html` — browser-print source (generates a PDF on demand via "Print PDF" → Save as PDF)
