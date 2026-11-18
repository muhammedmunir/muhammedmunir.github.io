// Setiap keadaan bermula daripada halaman baharu yang disediakan oleh a11y-loop.
async function section(page, name) {
  await page.getByRole('button', { name, exact: true }).click();
}
export const states = {
  profile: async page => { await section(page, 'Profil'); },
  journey: async page => { await section(page, 'Perjalanan'); },
  skills: async page => { await section(page, 'Kemahiran'); },
  'desk-controls': async page => { await section(page, 'Kawalan alternatif'); },
  'owner-projection': async page => {
    await section(page, 'Kawalan alternatif');
    await section(page, 'Sambung kabel Homelab');
    await section(page, 'Kad pemilik (NFC)');
    await page.getByRole('button', { name: /MAINT-.*EMESYS/ }).click();
    await section(page, 'Tutup kawalan');
  },
  'project-reader': async page => {
    await section(page, 'Projek');
    await page.getByRole('button', { name: 'Baca projek' }).click();
    await page.locator('#project-reader').waitFor();
  },
  'camera-menu': async page => {
    await page.getByRole('button', { name: 'Kamera' }).click();
  }
};
