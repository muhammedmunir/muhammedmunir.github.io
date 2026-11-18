export const states = {
  'hero-english': async page => {
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    if (await menu.isVisible()) await menu.click();
    await page.getByRole('button', { name: 'English', exact: true }).click();
  },
  'hero-console': async page => {
    await page.getByRole('button', { name: 'Uji Konsol Projek', exact: true }).click();
    await page.getByRole('heading', { name: 'Konsol & Arkib Projek', exact: true }).waitFor();
  }
};
