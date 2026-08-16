import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

function findBrowserExe(): string {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];

  for (const p of possiblePaths) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }
  return 'chrome.exe';
}

async function main() {
  const browserExe = findBrowserExe();
  console.log(`Found browser at: ${browserExe}`);

  const heroPath = path.resolve(process.cwd(), 'artifacts/emperorsmartsolutions/sections/02-hero/index.html');
  const servicesPath = path.resolve(process.cwd(), 'artifacts/emperorsmartsolutions/sections/06-services/index.html');

  const tempProfileDir = path.resolve(os.tmpdir(), 'animate_lab_temp_browser_profile');
  if (!fs.existsSync(tempProfileDir)) {
    fs.mkdirSync(tempProfileDir, { recursive: true });
  }

  const isEdge = browserExe.toLowerCase().includes('msedge');
  const flag = isEdge ? '--inprivate' : '--incognito';

  const cmd = `"${browserExe}" --user-data-dir="${tempProfileDir}" --new-window ${flag} "http://localhost:5173/" "http://emperorsmartsolutions.com/" "file:///${heroPath.replace(/\\/g, '/')}" "file:///${servicesPath.replace(/\\/g, '/')}"`;

  console.log(`Executing: ${cmd}`);
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Launch error:', err);
    } else {
      console.log('Separate anonymous browser window launched successfully.');
    }
  });
}

main().catch(console.error);
