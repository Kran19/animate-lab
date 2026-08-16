import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function fixAuthenticExtractionStyles() {
  console.log('[STYLES_FIX] Launching Playwright to capture all stylesheet links, inline styles, and font tags from https://trionn.com/ ...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });

  await page.goto('https://trionn.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // Extract all stylesheets and head elements
  const headData = await page.evaluate(() => {
    const stylesheets: string[] = [];
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link: any) => {
      if (link.href) stylesheets.push(link.href);
    });

    const inlineStyles: string[] = [];
    document.querySelectorAll('style').forEach((style: any) => {
      inlineStyles.push(style.innerHTML);
    });

    return {
      stylesheets,
      inlineStyles,
      fontLinks: Array.from(document.querySelectorAll('link[rel="preconnect"], link[rel="stylesheet"][href*="font"]')).map((l: any) => l.outerHTML),
    };
  });

  console.log(`[STYLES_FIX] Captured ${headData.stylesheets.length} external stylesheets and ${headData.inlineStyles.length} inline style blocks.`);

  // Find the latest trionn run directory
  const baseTrionnDir = path.join(process.cwd(), 'benchmark-runs', 'trionn');
  const runs = fs.readdirSync(baseTrionnDir).filter((d) => fs.statSync(path.join(baseTrionnDir, d)).isDirectory());
  runs.sort().reverse();
  const latestRunDir = path.join(baseTrionnDir, runs[0]);
  const packagesDir = path.join(latestRunDir, 'packages');
  const reproductionDir = path.join(latestRunDir, 'reproduction');

  console.log(`[STYLES_FIX] Updating packages in: ${latestRunDir}`);

  const packageDirs = fs.readdirSync(packagesDir).filter((d) => fs.statSync(path.join(packagesDir, d)).isDirectory());

  for (const pkgName of packageDirs) {
    const pkgPath = path.join(packagesDir, pkgName);
    const repPath = path.join(reproductionDir, pkgName);
    fs.mkdirSync(repPath, { recursive: true });

    // Read the evidence DOM
    const evidenceDomPath = path.join(pkgPath, 'evidence', 'dom.html');
    let sectionHtml = '';
    if (fs.existsSync(evidenceDomPath)) {
      sectionHtml = fs.readFileSync(evidenceDomPath, 'utf-8');
    }

    const stylesheetTags = headData.stylesheets.map((href) => `<link rel="stylesheet" href="${href}">`).join('\n  ');
    const inlineStyleTags = headData.inlineStyles.map((css) => `<style>${css}</style>`).join('\n  ');

    // Generate comprehensive standalone HTML that renders with exact original CSS & assets
    const completeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <base href="https://trionn.com/" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pkgName} — Authentic Extracted Reproduction</title>
  ${headData.fontLinks.join('\n  ')}
  ${stylesheetTags}
  ${inlineStyleTags}
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #000;
      color: #fff;
      overflow-x: hidden;
    }
  </style>
</head>
<body>
  ${sectionHtml}
</body>
</html>`;

    fs.writeFileSync(path.join(pkgPath, 'index.html'), completeHtml, 'utf-8');
    fs.writeFileSync(path.join(repPath, 'index.html'), completeHtml, 'utf-8');
  }

  await browser.close();
  console.log('[STYLES_FIX] All section packages updated with complete stylesheet cascade, base href, and font links.');
}

fixAuthenticExtractionStyles().catch(console.error);
