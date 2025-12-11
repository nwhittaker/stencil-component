import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

const defaultNetworkConditions = {
  offline: false,
  downloadThroughput: -1,
  uploadThroughput: -1,
  latency: 0,
  connectionType: 'other' as const,
}

const slowNetworkConditions = {
  offline: false,
  latency: 100,
  downloadThroughput: (750 * 1024) / 8,
  uploadThroughput: (250 * 1024) / 8,
  connectionType: 'cellular3g' as const,
}

test.describe('my-label', () => {
  Object.entries({
    default: defaultNetworkConditions,
    slow: slowNetworkConditions
  }).forEach(([label, networkCondition]) => {

    test(`label with nested component over ${label} network`, async ({ page }) => {
      const client = await page.context().newCDPSession(page);

      await client.send('Network.emulateNetworkConditions', networkCondition);

      await page.goto(`iframe.html?id=mylabel--nested-component`);
      await page.waitForChanges();

      await page.locator('my-label').click();
      await expect(page.getByRole('textbox')).toBeFocused();
    });

  });
});
