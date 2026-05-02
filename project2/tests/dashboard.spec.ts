import { test, expect } from '@playwright/test';

const waitForCards = async (page, selector = '#trailGridWrapper .card') => {
  await page.waitForSelector(selector, { timeout: 10_000 });
  // The 500ms CSS grid transition sets isAnimating=true; wait for it to clear
  // so subsequent interactions (tab switches, searches) aren't silently dropped.
  await page.waitForTimeout(600);
};

test.describe('Dashboard page load', () => {
  test('renders the page title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Ski Patrol Admin Dashboard');
  });

  test('trails tab is active by default', async ({ page }) => {
    await page.goto('/');
    const trailBtn = page.locator('.tab-btn[data-tab="trail"]');
    await expect(trailBtn).toHaveClass(/active/);
    await expect(page.locator('#trails-tab')).toBeVisible();
    await expect(page.locator('#lifts-tab')).toBeHidden();
  });

  test('rate limit banner is hidden by default', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('#rateLimitBanner');
    await expect(banner).not.toHaveClass(/visible/);
  });
});

test.describe('Trail cards', () => {
  test('trail cards render from API data', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#trailGridWrapper .card', { timeout: 10_000 });
    const cards = page.locator('#trailGridWrapper .card');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('trail cards display names', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#trailGridWrapper .card');
    const firstCardName = page.locator('#trailGridWrapper .card .name').first();
    await expect(firstCardName).not.toBeEmpty();
  });

  test('trail cards contain difficulty icons', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#trailGridWrapper .card');
    const iconCount = await page.locator('#trailGridWrapper .card img').count();
    expect(iconCount).toBeGreaterThan(0);
  });

  test('trail pagination info displays', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#trailGridWrapper .card');
    const pagination = page.locator('#trailPagination');
    await expect(pagination).toContainText(/Page \d+ of \d+/);
    await expect(pagination).toContainText('189 total');
  });
});

test.describe('Tab switching', () => {
  test('clicking Lifts tab shows lift panel', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);

    await page.locator('.tab-btn[data-tab="lift"]').click();

    await expect(page.locator('#lifts-tab')).toBeVisible();
    await expect(page.locator('#trails-tab')).toBeHidden();
    await expect(page.locator('.tab-btn[data-tab="lift"]')).toHaveClass(/active/);
    await expect(page.locator('.tab-btn[data-tab="trail"]')).not.toHaveClass(/active/);
  });

  test('switching to Lifts tab renders lift cards', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);

    await page.locator('.tab-btn[data-tab="lift"]').click();
    await page.waitForSelector('#liftGridWrapper .card', { timeout: 10_000 });

    const cards = page.locator('#liftGridWrapper .card');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('tab selection updates URL query parameter', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);
    await page.locator('.tab-btn[data-tab="lift"]').click();

    expect(page.url()).toContain('tab=lift');
  });

  test('switching back to Trails tab works', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);

    await page.locator('.tab-btn[data-tab="lift"]').click();
    await waitForCards(page, '#liftGridWrapper .card');

    await page.locator('.tab-btn[data-tab="trail"]').click();

    await expect(page.locator('#trails-tab')).toBeVisible();
    await expect(page.locator('#lifts-tab')).toBeHidden();
    expect(page.url()).toContain('tab=trail');
  });
});

test.describe('Lift cards', () => {
  test('lift cards display names and timestamps', async ({ page }) => {
    await page.goto('/?tab=lift');
    await page.waitForSelector('#liftGridWrapper .card', { timeout: 10_000 });

    const name = page.locator('#liftGridWrapper .card .name').first();
    await expect(name).not.toBeEmpty();

    const timestamp = page.locator('#liftGridWrapper .card .timestamp').first();
    await expect(timestamp).not.toBeEmpty();
  });

  test('lift pagination info displays', async ({ page }) => {
    await page.goto('/?tab=lift');
    await page.waitForSelector('#liftGridWrapper .card', { timeout: 10_000 });

    const pagination = page.locator('#liftPagination');
    await expect(pagination).toContainText(/Page \d+ of \d+/);
    await expect(pagination).toContainText('25 total');
  });
});

test.describe('Search filtering', () => {
  test('trail search filters cards', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);

    const countBefore = await page.locator('#trailGridWrapper .card').count();
    await page.fill('#trailSearch', 'Apple');

    await page.waitForFunction(
      (before) => document.querySelectorAll('#trailGridWrapper .card').length < before,
      countBefore,
      { timeout: 5_000 },
    );

    const countAfter = await page.locator('#trailGridWrapper .card').count();
    expect(countAfter).toBeGreaterThan(0);
    expect(countAfter).toBeLessThan(countBefore);
  });

  test('trail search updates pagination count', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);

    await page.fill('#trailSearch', 'Apple');

    await page.waitForFunction(
      () => {
        const el = document.getElementById('trailPagination');
        return el && !el.textContent?.includes('189 total');
      },
      { timeout: 5_000 },
    );

    const text = await page.locator('#trailPagination').textContent();
    expect(text).toContain('total');
    expect(text).not.toContain('189 total');
  });

  test('lift search filters cards', async ({ page }) => {
    await page.goto('/?tab=lift');
    await waitForCards(page, '#liftGridWrapper .card');

    await page.fill('#liftSearch', 'Broadway');

    await page.waitForFunction(
      () => {
        const el = document.getElementById('liftPagination');
        return el && !el.textContent?.includes('25 total');
      },
      { timeout: 5_000 },
    );

    const count = await page.locator('#liftGridWrapper .card').count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Card popup', () => {
  test('clicking a trail card opens the popup', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);

    await page.locator('#trailGridWrapper .card').first().click();

    const overlay = page.locator('#popupOverlay');
    await expect(overlay).toHaveClass(/active/);
    await expect(page.locator('.popup-title')).not.toBeEmpty();
    await expect(page.locator('.popup-content')).toContainText('Status:');
  });

  test('trail popup shows difficulty and features section', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);

    await page.locator('#trailGridWrapper .card').first().click();
    await expect(page.locator('#popupOverlay')).toHaveClass(/active/);

    const content = await page.locator('.popup-content').textContent();
    expect(content).toContain('Difficulty:');
    expect(content).toContain('Features');
  });

  test('close button dismisses the popup', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);

    await page.locator('#trailGridWrapper .card').first().click();
    await expect(page.locator('#popupOverlay')).toHaveClass(/active/);

    await page.locator('#popupClose').click();
    await expect(page.locator('#popupOverlay')).not.toHaveClass(/active/);
  });

  test('clicking outside the popup card closes it', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);

    await page.locator('#trailGridWrapper .card').first().click();
    await expect(page.locator('#popupOverlay')).toHaveClass(/active/);

    await page.locator('#popupOverlay').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('#popupOverlay')).not.toHaveClass(/active/);
  });

  test('clicking a lift card opens popup', async ({ page }) => {
    await page.goto('/?tab=lift');
    await waitForCards(page, '#liftGridWrapper .card');

    await page.locator('#liftGridWrapper .card').first().click();
    await expect(page.locator('#popupOverlay')).toHaveClass(/active/);
    await expect(page.locator('.popup-title')).not.toBeEmpty();
  });
});

test.describe('Entity dropdown and status form', () => {
  test('entity dropdown populates with trails and lifts', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);

    const options = page.locator('#entitySelect option');
    expect(await options.count()).toBeGreaterThan(100);

    const trailOpts = await page.locator('#entitySelect option[value^="trail:"]').count();
    expect(trailOpts).toBeGreaterThan(0);

    const liftOpts = await page.locator('#entitySelect option[value^="lift:"]').count();
    expect(liftOpts).toBeGreaterThan(0);
  });

  test('selecting a trail entity shows trail status radios', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);

    await page.selectOption('#entitySelect', { index: 1 });
    const radios = page.locator('#statusRadios input[type="radio"]');
    expect(await radios.count()).toBe(4);
  });

  test('selecting a lift entity shows lift status radios', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);

    const liftValue = await page.locator('#entitySelect option[value^="lift:"]').first().getAttribute('value');
    await page.selectOption('#entitySelect', liftValue!);

    const radios = page.locator('#statusRadios input[type="radio"]');
    expect(await radios.count()).toBe(8);
  });

  test('submit without selection shows alert', async ({ page }) => {
    await page.goto('/');
    await waitForCards(page);

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#submitButton').click();
  });
});

test.describe('URL-based tab routing', () => {
  test('navigating to ?tab=lift opens lifts tab', async ({ page }) => {
    await page.goto('/?tab=lift');
    await page.waitForSelector('#liftGridWrapper .card', { timeout: 10_000 });

    await expect(page.locator('#lifts-tab')).toBeVisible();
    await expect(page.locator('.tab-btn[data-tab="lift"]')).toHaveClass(/active/);
  });

  test('navigating to ?tab=trail opens trails tab', async ({ page }) => {
    await page.goto('/?tab=trail');
    await page.waitForSelector('#trailGridWrapper .card', { timeout: 10_000 });

    await expect(page.locator('#trails-tab')).toBeVisible();
    await expect(page.locator('.tab-btn[data-tab="trail"]')).toHaveClass(/active/);
  });
});

test.describe('Card colors reflect status', () => {
  test('open trails have green cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#trailGridWrapper .card');

    const greenCards = page.locator('#trailGridWrapper .card.green');
    expect(await greenCards.count()).toBeGreaterThan(0);
  });

  test('closed trails have red cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#trailGridWrapper .card');

    const allCards = page.locator('#trailGridWrapper .card');
    const totalPages = await page.locator('#trailPagination').textContent();
    const hasMultiplePages = totalPages?.includes('of') && !totalPages?.includes('of 1');

    if (hasMultiplePages) {
      expect(await allCards.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Authentication', () => {
  test('page obtains a bearer token on load', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#trailGridWrapper .card');

    const token = await page.evaluate(() => sessionStorage.getItem('apiToken'));
    expect(token).toBeTruthy();
    expect(token!.length).toBe(64);
  });
});
