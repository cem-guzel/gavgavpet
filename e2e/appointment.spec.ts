import { test, expect } from '@playwright/test';

test('kullanıcı randevu formunu doldurup gönderebilir', async ({ page }) => {
    await page.goto('/appointment');

  await page.locator('input[name="ownerName"]').fill('Ahmet Yılmaz');
  await page.locator('input[name="phone"]').fill('+905368994374');
  await page.locator('input[name="petName"]').fill('Karabaş');
  await page.locator('input[name="petBreed"]').fill('Golden Retriever');

  await page.getByText('Tarih Seçin').click();
  await page.getByRole('button', { name: '20', exact: true }).click();

  await page.locator('textarea[name="notes"]').fill('Test randevusu');
  await page.getByRole('button', { name: 'Randevu Oluştur' }).click();

  await expect(page.getByText('Randevu Talebiniz Alındı')).toBeVisible();
});