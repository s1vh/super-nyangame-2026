import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function openPaused(page: Page): Promise<void> {
  await page.goto('?qa=1');
  await page.getByRole('button', { name: 'Pause simulation', exact: true }).click();
  await page.getByRole('button', { name: 'Start game', exact: true }).click({ force: true });
  await expect(page.locator('#game')).toHaveAttribute('data-scene', 'game');
}
const step = (page: Page) => page.getByRole('button', { name: 'Step 60 ticks', exact: true }).click();

test('logical stage fits wide, short and portrait viewports', async ({ page }) => {
  await page.goto('');
  await expect(page.getByRole('button', { name: 'Start game' })).toBeVisible();
  for (const size of [{ width: 1280, height: 720 }, { width: 640, height: 900 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(size);
    await expect.poll(async () => {
      const box = await page.locator('canvas').boundingBox();
      return box && Math.abs(box.width / box.height - 1.6) < 0.001 && box.x >= 0 && box.y >= 0 && box.x + box.width <= size.width + 1 && box.y + box.height <= size.height + 1;
    }).toBe(true);
    const button = await page.getByRole('button', { name: 'Start game' }).boundingBox();
    expect(button!.y + button!.height).toBeLessThanOrEqual(size.height);
  }
});

test('hover controls logical y; invalid edge targets retain the last valid target', async ({ page }) => {
  await openPaused(page); await step(page);
  await page.mouse.move(600, 700); await step(page);
  await expect(page.locator('#qa output')).toContainText('y=686.179');
  await page.mouse.move(600, 30); await step(page);
  await expect(page.locator('#qa output')).toContainText('y=699.363');
});

test('five full runs clear collision, score and visual entities', async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('?qa=1'); await page.getByRole('button', { name: 'Pause simulation', exact: true }).click();
  for (let run = 0; run < 5; run++) {
    await page.getByRole('button', { name: 'Start game', exact: true }).click({ force: true });
    await expect(page.locator('#game')).toHaveAttribute('data-scene', 'game');
    await expect(page.locator('#qa output')).toContainText('tick=0 phase=entry hp=100 score=0 speed=10.0000 turbo=false crashed=false y=402.000 objects=0');
    await step(page);
    await page.getByRole('button', { name: 'Star contact', exact: true }).click();
    await expect(page.locator('#qa output')).toContainText('score=1');
    await page.getByRole('button', { name: 'Hit', exact: true }).click();
    await expect(page.locator('#qa output')).toContainText('hp=80');
    await page.getByRole('button', { name: 'Finish run', exact: true }).click();
    await expect(page.locator('#game')).toHaveAttribute('data-scene', 'over');
    await expect(page.locator('#qa output')).toContainText('objects=0');
    await page.getByRole('button', { name: 'Score 1. Return to menu', exact: true }).click();
  }
  expect(errors).toEqual([]);
});

test('critical game asset failure can be retried from START', async ({ page }) => {
  await page.route('**/assets/game.json', (route) => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto(''); await page.getByRole('button', { name: 'Start game', exact: true }).click({ force: true });
  await expect(page.locator('#status')).toContainText('press START to retry');
  await page.unroute('**/assets/game.json');
  await page.getByRole('button', { name: 'Start game', exact: true }).click({ force: true });
  await expect(page.locator('#game')).toHaveAttribute('data-scene', 'game');
});

test('missing audio never blocks play', async ({ page }) => {
  await page.route('**/audio/*.mp3', (route) => route.fulfill({ status: 404 }));
  await openPaused(page); await step(page);
  await expect(page.locator('#qa output')).toContainText('phase=flying');
});

test('hidden-document transition suspends the clock and resumes without catching up', async ({ page }) => {
  await openPaused(page); await step(page);
  await page.getByRole('button', { name: 'Resume simulation', exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const snapshot = await page.locator('#qa output').innerText();
  // A real elapsed interval tests the lifecycle handler, without modifying game state.
  await page.waitForTimeout(500);
  await expect(page.locator('#qa output')).toHaveText(snapshot);
  const resumed = await page.evaluate(() => new Promise<{ text: string; elapsed: number }>((resolve) => {
    const output = document.querySelector('#qa output')!;
    const start = performance.now();
    const observer = new MutationObserver(() => {
      observer.disconnect(); resolve({ text: output.textContent!, elapsed: performance.now() - start });
    });
    observer.observe(output, { childList: true });
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  }));
  const tick = (value: string) => Number(/tick=(\d+)/.exec(value)![1]);
  // Measure the first resumed update, excluding automation click latency.
  expect(tick(resumed.text) - tick(snapshot)).toBeLessThanOrEqual(Math.ceil(resumed.elapsed / (1000 / 60)) + 1);
});

test('production build runs under the repository base path without QA controls', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) failures.push(response.url()); });
  await page.goto('http://127.0.0.1:4173/super-nyangame-2026/?qa=1');
  await expect(page.getByRole('button', { name: 'Start game', exact: true })).toBeVisible();
  await expect(page.locator('#qa')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start game', exact: true }).click({ force: true });
  await expect(page.locator('#game')).toHaveAttribute('data-scene', 'game');
  expect(failures).toEqual([]);
});
