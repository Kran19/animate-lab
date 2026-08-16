import { chromium } from 'playwright';

async function inspectDzinrStructure() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://dzinrstudio.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const elements = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('body > *, main > *, [class*="hero"], [class*="showcase"], section, header, footer'));
    return nodes.map((n, i) => {
      const rect = n.getBoundingClientRect();
      return {
        index: i,
        tagName: n.tagName,
        className: n.className.toString(),
        id: n.id,
        rect: { y: Math.round(rect.y + window.scrollY), height: Math.round(rect.height), width: Math.round(rect.width) },
        hasVideo: !!n.querySelector('video'),
        hasImg: !!n.querySelector('img'),
        hasCanvas: !!n.querySelector('canvas'),
        textPreview: (n.textContent || '').trim().slice(0, 80),
      };
    }).filter(n => n.rect.height > 100);
  });

  console.log(JSON.stringify(elements, null, 2));
  await browser.close();
}

inspectDzinrStructure();
