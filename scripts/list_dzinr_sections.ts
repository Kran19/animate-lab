import { chromium } from 'playwright';

async function listDzinrSections() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://dzinrstudio.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const sections = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return [];
    
    // Find all sections or primary container elements
    const elements = Array.from(main.querySelectorAll(':scope > div > section, :scope > div > div > section, :scope > section, :scope > div > div[class*="hero"], :scope > div > div[class*="marquee"], :scope > div > div[class*="grid"]'));
    return elements.map((el, i) => {
      const rect = el.getBoundingClientRect();
      return {
        i,
        tag: el.tagName,
        cls: el.className,
        y: Math.round(rect.y + window.scrollY),
        h: Math.round(rect.height),
        w: Math.round(rect.width),
        text: el.textContent?.trim().slice(0, 100)
      };
    });
  });

  console.log(JSON.stringify(sections, null, 2));
  await browser.close();
}

listDzinrSections();
