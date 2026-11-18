// Setiap keadaan bermula pada halaman baharu; menu mudah alih diuji apabila tersedia.
export const states = {
  'navigation-expanded': async page => {
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    if (await menu.isVisible()) await menu.click({ timeout: 90_000 });
  },
  'english-navigation': async page => {
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    if (await menu.isVisible()) await menu.click({ timeout: 90_000 });
    await page.getByRole('button', { name: 'English', exact: true }).click({ timeout: 90_000 });
  },
  'camera-expanded': async page => {
    await page.locator('.camera-menu > summary').click({ timeout: 90_000 });
  },
  'journey-details-expanded': async page => {
    await page.getByRole('button', { name: 'Perjalanan', exact: true }).click({ timeout: 90_000 });
    const details = page.locator('.dossier-links details');
    if (!(await details.evaluate(element => element.open))) {
      await details.locator('summary').click({ timeout: 90_000 });
    }
  },
  'project-console': async page => {
    await page.getByRole('button', { name: 'Uji Konsol Projek', exact: true }).click({ timeout: 90_000 });
  }
};
