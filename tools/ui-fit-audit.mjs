// Optional real-Chrome UI checks; uses an existing Playwright installation.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';

const {chromium} = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'artifacts', 'ui-fit-audit');
await fs.mkdir(out, {recursive: true});
const browser = await chromium.launch({headless: true, ...(process.env.BROWSER_PATH ? {executablePath: process.env.BROWSER_PATH} : {})});
const page = await browser.newPage();
const errors = [], report = {desktop: [], smallWindow: null, errors};
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

// Compare actual content bounds, not title-card scrollHeight: its oversized
// decorative ::before is intentionally clipped and does not contain UI.
async function fit(selector, {scroll = true} = {}) {
  const metrics = await page.locator(selector).evaluate(el => {
    const r = el.getBoundingClientRect();
    const clipped = [];
    for (const child of el.querySelectorAll('button, input, select, h1, h2, p, li, .menu-controls span, .title-kicker, .mode-tag')) {
      if (!child.checkVisibility()) continue;
      const c = child.getBoundingClientRect();
      if (c.left < Math.max(0, r.left) - 1 || c.top < Math.max(0, r.top) - 1 || c.right > Math.min(innerWidth, r.right) + 1 || c.bottom > Math.min(innerHeight, r.bottom) + 1) clipped.push(child.id || child.textContent.trim());
    }
    return {x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom, viewportWidth: innerWidth, viewportHeight: innerHeight, clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, clientWidth: el.clientWidth, scrollWidth: el.scrollWidth, clipped};
  });
  assert(metrics.x >= -1 && metrics.y >= -1 && metrics.right <= metrics.viewportWidth + 1 && metrics.bottom <= metrics.viewportHeight + 1, `${selector} outside viewport: ${JSON.stringify(metrics)}`);
  assert.deepEqual(metrics.clipped, [], `${selector} has clipped controls`);
  if (scroll) {
    assert(metrics.scrollHeight <= metrics.clientHeight + 1, `${selector} requires vertical scrolling: ${JSON.stringify(metrics)}`);
    assert(metrics.scrollWidth <= metrics.clientWidth + 1, `${selector} requires horizontal scrolling`);
  }
  return metrics;
}

try {
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
  // Include full-screen, normal 1080p browser chrome, taskbar, and 125% scaling.
  for (const [width, height] of [[1920,1080], [1920,994], [1920,950], [1920,900], [1536,750], [1280,720], [1101,700]]) {
    await page.setViewportSize({width, height});
    const main = await fit('#mainMenu');
    const card = await fit('.title-card', {scroll: false});
    const actions = await fit('#actions');
    assert(card.y >= actions.bottom + 6, 'reserve room above menu for Settings/Sound/Fullscreen');
    const stages = await page.locator('.mode-card').evaluateAll(cards => cards.map(c => { const r = c.getBoundingClientRect(); return {x:r.x, y:r.y, bottom:r.bottom}; }));
    assert.equal(stages.length, 4);
    assert(stages.every((r, i) => Math.abs(r.x - stages[0].x) < 1 && (!i || r.y > stages[i-1].bottom)), 'keep stages in a vertical list');
    await page.mouse.wheel(0, 600);
    assert.equal(await page.locator('#mainMenu').evaluate(el => el.scrollTop), 0, 'wheel must not move the desktop main menu');
    if (width === 1920 && height === 950) await page.screenshot({path:path.join(out,'main-1080p-browser.png')});
    await page.click('#openSettings');
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#pauseMenu')).opacity === '1');
    const pause = await fit('#pauseMenu .pause-card');
    const content = await fit('.pause-content');
    await fit('#pauseMenu .pause-actions');
    assert(await page.locator('#reducedFlashing').isVisible());
    if (width === 1920 && height === 950) await page.screenshot({path:path.join(out,'settings-1080p-browser.png')});
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#pauseMenu')).visibility === 'hidden');
    report.desktop.push({width, height, main, pause, content});
  }
  // Accessible scrolling is still available in genuinely small windows.
  await page.setViewportSize({width:960, height:640});
  await page.click('#openSettings');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#pauseMenu')).opacity === '1');
  const small = await page.locator('.pause-content').evaluate(el => ({client:el.clientHeight, scroll:el.scrollHeight}));
  assert(small.scroll > small.client, 'small-window pause retains scrolling');
  await page.locator('#reducedFlashing').scrollIntoViewIfNeeded();
  await page.locator('#reducedFlashing').check();
  assert(await page.evaluate(() => document.querySelector('#reducedFlashing').getBoundingClientRect().bottom < document.querySelector('#pauseMenu .pause-actions').getBoundingClientRect().top));
  await page.click('#resumeGame');
  report.smallWindow = small;

  await page.setViewportSize({width:1920, height:950});
  await page.click('#trainingMode');
  await page.waitForFunction(() => game.started && !game.loading);
  await fit('#trainingHud .training-panel');
  await fit('#controls');
  await fit('#actions');
  await page.click('#openSettings');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#pauseMenu')).opacity === '1');
  await fit('.pause-content');
  await page.click('#resumeGame');
  for (const mode of ['classic', 'stage2', 'stage3']) {
    await page.evaluate(async mode => {
      game.returnToMainMenu();
      await game.requestStartMode(mode);
      game.victory = true; game.showResults();
    }, mode);
    await fit('#resultsMenu .pause-card');
  }
  assert.deepEqual(errors, []);
  report.passed = true;
  await fs.writeFile(path.join(out, 'ui-fit-audit.json'), JSON.stringify(report, null, 2));
  console.log('Desktop no-scroll UI checks: PASS (7 viewport sizes, settings, range, results, small-window fallback)');
} finally {
  await browser.close();
}
