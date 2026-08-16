import { chromium } from 'playwright';
import path from 'path';

async function main() {
  console.log('Launching real interactive Chromium browser window on your desktop...');
  const browser = await chromium.launch({
    headless: false, // Opens visible browser on user's desktop!
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: null, // use full window size
  });

  const page = await context.newPage();

  console.log('1. Opening local AnimateLab Workbench at http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  console.log('2. Opening live Emperor Smart Solutions at http://emperorsmartsolutions.com/ ...');
  const emperorPage = await context.newPage();
  await emperorPage.goto('http://emperorsmartsolutions.com/', { waitUntil: 'domcontentloaded' });
  await emperorPage.waitForTimeout(5000);

  console.log('3. Opening extracted section 01 (Hero) in browser...');
  const heroHtmlPath = path.join(process.cwd(), 'artifacts', 'emperorsmartsolutions', 'sections', '02-hero', 'index.html');
  const heroPage = await context.newPage();
  await heroPage.goto(`file://${heroHtmlPath}`);
  await heroPage.waitForTimeout(3000);

  console.log('4. Opening extracted section 06 (Services) in browser...');
  const servicesHtmlPath = path.join(process.cwd(), 'artifacts', 'emperorsmartsolutions', 'sections', '06-services', 'index.html');
  const servicesPage = await context.newPage();
  await servicesPage.goto(`file://${servicesHtmlPath}`);
  await servicesPage.waitForTimeout(3000);

  console.log('5. Opening extracted section 08 (Projects Showcase) in browser...');
  const projHtmlPath = path.join(process.cwd(), 'artifacts', 'emperorsmartsolutions', 'sections', '08-projects_showcase', 'index.html');
  const projPage = await context.newPage();
  await projPage.goto(`file://${projHtmlPath}`);
  await projPage.waitForTimeout(3000);

  console.log('Interactive browser session is open on your desktop across all tabs.');
  console.log('Leaving browser open for user live inspection...');
}

main().catch((err) => {
  console.error('Interactive browser error:', err);
});
