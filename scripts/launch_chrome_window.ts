import { exec } from 'child_process';
import path from 'path';

const heroPath = path.resolve(process.cwd(), 'artifacts/emperorsmartsolutions/sections/02-hero/index.html');
const servicesPath = path.resolve(process.cwd(), 'artifacts/emperorsmartsolutions/sections/06-services/index.html');
const reportPath = path.resolve(process.cwd(), 'artifacts/emperorsmartsolutions/MASTER_EXTRACTION_REPORT.md');

const urls = [
  'http://localhost:5173/',
  'http://emperorsmartsolutions.com/',
  `file:///${heroPath.replace(/\\/g, '/')}`,
  `file:///${servicesPath.replace(/\\/g, '/')}`
];

console.log('Launching browser windows for URLs:', urls);

// 1. Launch with start
urls.forEach(url => {
  exec(`start "" "${url}"`, (err) => {
    if (err) console.error('Error opening URL:', url, err);
  });
});
