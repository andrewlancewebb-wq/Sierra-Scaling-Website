/**
 * Usage (run from puppeteer install dir):
 *   cd C:/Users/User/AppData/Local/Temp/puppeteer-test
 *   node C:/Users/User/Documents/WebsiteBuild/screenshot.mjs [url] [label]
 *
 * Saves to WebsiteBuild/temporary screenshots/screenshot-N[-label].png
 */
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const chromePaths = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Users/User/.cache/puppeteer/chrome/win64-147.0.7727.57/chrome-win64/chrome.exe',
  'C:/Users/User/.cache/puppeteer/chrome/win64-131.0.6778.108/chrome-win64/chrome.exe',
  'C:/Users/nateh/.cache/puppeteer/chrome/win64-131.0.6778.108/chrome-win64/chrome.exe',
];
const executablePath = chromePaths.find(p => fs.existsSync(p));

const screenshotDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

const existing = fs.readdirSync(screenshotDir).filter(f => /^screenshot-\d+/.test(f));
const nextN = existing.length
  ? Math.max(...existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)[1]))) + 1
  : 1;
const filename   = label ? `screenshot-${nextN}-${label}.png` : `screenshot-${nextN}.png`;
const outputPath = path.join(screenshotDir, filename);

const browser = await puppeteer.launch({
  ...(executablePath ? { executablePath } : {}),
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
await new Promise(r => setTimeout(r, 1000));
// Force scroll-reveal elements visible so full-page screenshots are accurate
await page.evaluate(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')));
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();
console.log(`Screenshot saved: ${filename}`);
