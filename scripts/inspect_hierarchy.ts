import { chromium } from 'playwright';

async function inspectMainHtml() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://dzinrstudio.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const tags = await page.evaluate(`(() => {
    const main = document.querySelector('main');
    if (!main) return 'NO_MAIN';
    
    function summarize(node, depth) {
      if (depth > 3) return null;
      return {
        tag: node.tagName,
        cls: (node.className || '').toString().slice(0, 50),
        children: Array.from(node.children).map(c => summarize(c, depth + 1)).filter(Boolean)
      };
    }
    return summarize(main, 0);
  })()`);

  console.log(JSON.stringify(tags, null, 2));
  await browser.close();
}

inspectMainHtml();
