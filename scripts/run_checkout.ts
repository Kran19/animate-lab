import path from 'path';
import { FullCheckoutGenerator } from './generate_full_checkout_artifacts';

async function main() {
  const artifactsDir = path.join(process.cwd(), 'artifacts');
  console.log(`Generating full checkout artifacts in: ${artifactsDir}`);
  const res = await FullCheckoutGenerator.executeFullCheckout(artifactsDir);
  console.log('Checkout generation complete:', JSON.stringify(res, null, 2));
}

main().catch((err) => {
  console.error('Checkout failed:', err);
  process.exit(1);
});
