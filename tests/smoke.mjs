import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const filePath = normalize(join(root, pathname));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mime[extname(filePath)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];

page.on('pageerror', error => errors.push(error.stack || error.message));
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

await page.route('https://open.er-api.com/**', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ rates: { BDT: 118 } })
  });
});

await page.addInitScript(() => {
  localStorage.setItem('lamim_cache_cleared_v36', 'true');
  localStorage.setItem('lamim_user', JSON.stringify({
    id: 'smoke_user',
    name: 'Smoke Tester',
    email: 'smoke@lamim.local',
    role: 'user',
    gender: 'male',
    dob: '1995-01-01',
    bio: '',
    avatar: null,
    createdAt: new Date().toISOString()
  }));
  localStorage.setItem('lamim_settings', JSON.stringify({
    theme: 'dark',
    notifications: false,
    jumuahMode: true,
    language: 'en',
    currency: 'USD',
    lat: 23.8103,
    lng: 90.4125,
    calcMethod: 'mwl'
  }));
});

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#page-dashboard.active', { timeout: 8000 });
  await page.waitForSelector('.home-hero-card', { timeout: 5000 });

  const homeLayout = await page.evaluate(() => {
    const hero = document.querySelector('.home-hero-card');
    const stat = document.querySelector('.home-stat-chip');
    const orb = document.querySelector('.waqt-orb-premium');
    const heroStyle = hero ? getComputedStyle(hero) : null;
    const statStyle = stat ? getComputedStyle(stat) : null;
    const orbStyle = orb ? getComputedStyle(orb) : null;

    return {
      hasHero: Boolean(hero),
      heroDisplay: heroStyle?.display || '',
      heroRadius: parseFloat(heroStyle?.borderRadius || '0'),
      statDisplay: statStyle?.display || '',
      orbRadius: parseFloat(orbStyle?.borderRadius || '0')
    };
  });

  if (!homeLayout.hasHero || homeLayout.heroDisplay !== 'flex' || homeLayout.heroRadius < 8 || homeLayout.statDisplay !== 'flex' || homeLayout.orbRadius < 8) {
    throw new Error(`Home layout CSS did not apply correctly: ${JSON.stringify(homeLayout)}`);
  }

  const sections = ['home', 'salah', 'dhikr', 'nafl', 'mujahid', 'finance', 'analysis', 'profile'];
  for (const section of sections) {
    await page.evaluate(sec => App.navigateTo(sec), section);
    await page.waitForSelector(`#section-${section}.active`, { timeout: 5000 });
    await page.waitForTimeout(250);
  }

  if (errors.length) {
    throw new Error(`Browser errors:\n${errors.join('\n')}`);
  }

  console.log(`Smoke passed at ${baseUrl}`);
} finally {
  await browser.close();
  server.close();
}
