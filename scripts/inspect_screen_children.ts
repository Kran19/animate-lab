import { chromium } from 'playwright';

async function inspectScreenChildren() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://dzinrstudio.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const tags = await page.evaluate(`(() => {
    const container = document.querySelector('div[class*="w-screen space-y"]');
    if (!container) return 'NO_CONTAINER';
    
    return Array.from(container.children).map((c, i) => {
      const rect = c.getBoundingClientRect();
      return {
        index: i,
        tag: c.tagName,
        cls: (c.className || '').toString(),
        y: Math.round(rect.y + window.scrollY),
        h: Math.round(rect.height),
        w: Math.round(rect.width),
        text: (c.textContent || '').trim().slice(0, 80),
        innerHTMLPreview: c.innerHTML.slice(0, 120),
      };
    });
  })()`);

  console.log(JSON.stringify(tags, null, 2));
  await browser.close();
}

inspectScreenChildren();
