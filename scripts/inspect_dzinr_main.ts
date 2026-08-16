import { chromium } from 'playwright';

async function inspectMainChildren() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://dzinrstudio.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const elements = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return [];
    
    // Find all direct children or immediate container children of main
    const container = main.children[0] || main;
    return Array.from(container.children).map((n, i) => {
      const rect = n.getBoundingClientRect();
      return {
        index: i,
        tagName: n.tagName,
        className: n.className.toString(),
        id: n.id,
        rect: { y: Math.round(rect.y + window.scrollY), height: Math.round(rect.height), width: Math.round(rect.width) },
        innerHTMLPreview: n.innerHTML.slice(0, 150),
        textPreview: (n.textContent || '').trim().slice(0, 100),
      };
    });
  });

  console.log(JSON.stringify(elements, null, 2));
  await browser.close();
}

inspectMainChildren();
