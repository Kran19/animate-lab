import { ExternalSiteExtractor } from '../engine/workbench/externalSiteExtractor';

async function main() {
  const targetUrl = process.argv[2] || 'https://www.dzinr.in/';
  console.log(`[Pilot 001] Initiating production extraction for: ${targetUrl}`);

  try {
    const result = await ExternalSiteExtractor.extractExternalSite({
      requestedUrl: targetUrl,
      siteId: 'dzinr',
      timeoutMs: 30000,
    });

    console.log(`\n======================================================`);
    console.log(`[Pilot 001: DZ!NR] Extraction Complete`);
    console.log(`Requested URL: ${result.requestedUrl}`);
    console.log(`Final URL:     ${result.finalUrl}`);
    console.log(`Redirects:     ${result.navRecord.redirectCount} hops`);
    console.log(`Sections:      ${result.totalSections}`);
    console.log(`Verdict:       ${result.generalizationVerdict}`);
    console.log(`Reports:       ${result.reportsGenerated.join(', ')}`);
    console.log(`======================================================\n`);
  } catch (err: any) {
    console.error(`[Pilot 001: DZ!NR] Extraction encountered error:`, err.message);
  }
}

main();
