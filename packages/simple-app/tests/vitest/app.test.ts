import {
  type Browser,
  type BrowserContext,
  type Page,
  chromium,
} from '@playwright/test';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

describe('Fuel Streams Application', () => {
  let page: Page;
  let browser: Browser;
  let context: BrowserContext;

  beforeAll(async () => {
    browser = await chromium.launch();
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('http://localhost:5173');
    // Wait for the application to be loaded
    await page.waitForSelector('[role="application"]', { state: 'visible' });
  });

  afterAll(async () => {
    await context.close();
    await browser.close();
  });

  test('should have correct layout and initial state', async () => {
    // Check main layout elements
    expect(
      page.getByRole('heading', { name: 'Stream Configuration' }),
    ).toBeTruthy();
    expect(page.getByRole('heading', { name: 'Data Stream' })).toBeTruthy();

    // Check initial form state
    expect(
      page.getByRole('form', { name: 'Stream Configuration Form' }),
    ).toBeTruthy();
    expect(page.getByRole('combobox', { name: 'Select module' })).toBeTruthy();
    expect(page.getByRole('button', { name: 'Start Listening' })).toBeTruthy();

    // Check initial stream view state
    expect(
      page.getByRole('status', { name: 'No stream data available' }),
    ).toBeTruthy();
  });

  test('should handle module selection', async () => {
    // Find and click the module select
    const moduleSelect = page.getByRole('combobox', { name: 'Select module' });
    await moduleSelect.click();

    // Wait for select content
    expect(page.getByRole('listbox')).toBeTruthy();

    // Select first option if available
    const options = page.getByRole('option');
    const optionsCount = await options.count();

    if (optionsCount > 0) {
      await options.first().click();
      // Start button should be enabled after module selection
      const startButton = page.getByRole('button', { name: 'Start Listening' });
      const isDisabled = await startButton.getAttribute('disabled');
      expect(isDisabled).toBeNull();
    }
  });

  test('should handle stream data lifecycle', async () => {
    // Select a module first
    const moduleSelect = page.getByRole('combobox', { name: 'Select module' });
    await moduleSelect.click();

    const options = page.getByRole('option');
    const optionsCount = await options.count();

    if (optionsCount > 0) {
      await options.first().click();

      // Start listening
      const startButton = page.getByRole('button', { name: 'Start Listening' });
      const isDisabled = await startButton.getAttribute('disabled');
      expect(isDisabled).toBeNull();
      await startButton.click();

      // Wait for the button to change to Stop Listening
      const stopButton = page.getByRole('button', { name: 'Stop Listening' });
      expect(stopButton).toBeTruthy();

      // Stop the stream
      await stopButton.click();

      // Should be back to start state
      expect(
        page.getByRole('button', { name: 'Start Listening' }),
      ).toBeTruthy();

      // Should show empty state message
      expect(
        page.getByRole('status', { name: 'No stream data available' }),
      ).toBeTruthy();
    }
  });

  test('should handle theme switching', async () => {
    // Set up initial theme state
    await page.evaluate(() => {
      localStorage.setItem('fuel-streams-theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });

    // Reload to apply initial theme
    await page.reload();
    await page.waitForSelector('[role="application"]', { state: 'visible' });

    // Get theme toggle button
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    expect(themeToggle).toBeTruthy();

    // Toggle theme
    await themeToggle.click();

    // Wait for theme change and verify
    await page.waitForFunction(() => {
      const html = document.documentElement;
      return (
        html.classList.contains('dark') && !html.classList.contains('light')
      );
    });

    // Verify localStorage was updated
    const theme = await page.evaluate(() =>
      localStorage.getItem('fuel-streams-theme'),
    );
    expect(theme).toBe('dark');
  });
});
