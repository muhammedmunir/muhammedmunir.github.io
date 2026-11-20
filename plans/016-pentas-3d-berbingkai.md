# Plan 016: Pentas 3D berbingkai dengan pengenalan dan petunjuk interaksi

> **Arahan pelaksana**: Ikut langkah demi langkah dengan alat Edit. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor.
>
> **Semakan drift (jalankan dahulu)**:
> ```bash
> grep -c "height: min(72svh, 720px)" src/lib/workbench/Workbench.svelte
> grep -c "scene-intro" src/lib/workbench/Workbench.svelte
> grep -c "min(72svh, 720px)" DESIGN.md
> ```
> → `1`, `0`, `1`. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S · **Risiko**: LOW (markup dan CSS sahaja; tiada perubahan pada WorkbenchWorld)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-20 dalam salinan terasing daripada `main` (`5944764`): `check` 0 ralat, `npm test` 50/50, build exit 0, kontras 314/314, `SMOKE OK`, `HOME OK`, `ORBIT OK`, tiada limpahan. Pentas desktop 576px (sebelum ini sehingga 720px); petunjuk sentuhan dipaparkan pada peranti sentuh (`pointer: coarse`), petunjuk tetikus pada desktop.

## Kenapa

Dunia 3D memenuhi lebar skrin tanpa bingkai dan setinggi sehingga 720px, tanpa penerangan. Pelawat tidak tahu apa yang dilihat atau cara menggunakannya, dan pentas itu memisahkan hero daripada bahagian Sistem dengan ruang gelap yang besar.

Perubahan:
- Satu ayat pengenalan: setiap kaset ialah projek, dan konsol memaparkannya sebagai hologram.
- Petunjuk interaksi yang sepadan dengan peranti: tetikus (seret, roda, klik) atau sentuhan (seret, cubit, ketik). Semua interaksi ini sudah wujud dalam `WorkbenchWorld.ts`.
- Pentas dalam bingkai 1px `--work-line` berjejari 8px dengan jarak tepi `--gutter`, ketinggian desktop `min(64svh, 620px)`. Mudah alih kekal `56svh`.
- `DESIGN.md` dikemas kini supaya sepadan.

## Skop

**Dalam skop**: `src/lib/workbench/Workbench.svelte` (3 suntingan), `DESIGN.md` (1 suntingan).
**Luar skop**: `WorkbenchWorld.ts`, kamera, ujian, data.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `feat(pentas): bingkai 3D dengan pengenalan dan petunjuk interaksi`
- Stage eksplisit: `git add src/lib/workbench/Workbench.svelte DESIGN.md plans/README.md`. Jangan push.

## Langkah

### Langkah 1: Pengenalan dan petunjuk interaksi (markup)

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

```
      {/if}
    </div>
    <details class="camera-disclosure">
```

dengan:

```
      {/if}
    </div>
    {#if view === 'desk'}
      <div class="scene-intro">
        <p>{t('Setiap kaset di rak ialah satu projek. Pilih projek, atau tekan kaset, dan konsol memaparkannya sebagai hologram.', 'Each cartridge on the rack is a project. Pick a project, or select a cartridge, and the console projects it as a hologram.')}</p>
        <p class="scene-hints">
          <span class="hint-pointer">{t('Seret untuk memutar · Roda tetikus untuk zum · Klik objek untuk menggunakannya', 'Drag to rotate · Scroll to zoom · Click an object to use it')}</span>
          <span class="hint-touch">{t('Seret untuk memutar · Cubit untuk zum · Ketik objek untuk menggunakannya', 'Drag to rotate · Pinch to zoom · Tap an object to use it')}</span>
        </p>
      </div>
    {/if}
    <details class="camera-disclosure">
```

### Langkah 2: Bingkai dan ketinggian pentas (CSS)

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

```
  .scene-area { flex: 0 0 auto; height: min(72svh, 720px); min-height: 22rem; position: relative; }
```

dengan:

```
  .scene-area { flex: 0 0 auto; height: min(64svh, 620px); min-height: 22rem; position: relative; margin-inline: var(--gutter); border: 1px solid var(--work-line); border-radius: 8px; overflow: hidden; }
```

### Langkah 3: Gaya pengenalan dan petunjuk (CSS)

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

```
  .camera-disclosure { padding-inline: var(--gutter); }
```

dengan:

```
  .camera-disclosure { padding-inline: var(--gutter); }
  .scene-intro { padding: 0 var(--gutter) 10px; max-width: 72ch; }
  .scene-intro p { margin: 0; color: var(--work-ink); line-height: 1.55; }
  .scene-intro .scene-hints { margin-top: 4px; color: var(--work-muted); font-size: .875rem; }
  .hint-touch { display: none; }
  @media (pointer: coarse) { .hint-pointer { display: none; } .hint-touch { display: inline; } }
```

### Langkah 4: Kemas kini DESIGN.md

Fail: `DESIGN.md`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

```
(desktop `min(72svh, 720px)`, mudah alih `56svh`)
```

dengan:

```
(desktop `min(64svh, 620px)` dalam bingkai 1px `--work-line` berjejari 8px, mudah alih `56svh`), dengan satu ayat pengenalan dan petunjuk interaksi (tetikus atau sentuhan) di atasnya
```

**Verify selepas Langkah 1–4**:
```bash
grep -c "scene-intro" src/lib/workbench/Workbench.svelte
grep -c "hint-touch" src/lib/workbench/Workbench.svelte
grep -c "min(64svh, 620px)" src/lib/workbench/Workbench.svelte DESIGN.md
npm run check
```
→ `4` (markup + 3 peraturan CSS); `3`; kedua-dua fail `1`; `0 ERRORS 0 WARNINGS`.

### Langkah 5: Ujian penuh

```bash
npm test
npm run build
npm run test:contrast
```
**Verify**: `ℹ fail 0` (lulus 50); build exit 0; `314/314 pasangan token lulus`.

### Langkah 6: Ujian pelayar dan tangkapan skrin

Ikut peraturan 11 dalam `plans/README.md` untuk pelayan dev (port 5199). Kemudian:

```bash
WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-smoke.mjs
HOME_URL=http://localhost:5199/ node scripts/home-visual.mjs
WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-orbit-a11y.mjs
```
**Verify**: `SMOKE OK`, `HOME OK`, `ORBIT OK`.

Ambil tangkapan viewport selepas `document.querySelector('.scene-heading').scrollIntoView()` pada 1440px dan 390px ke `.crew/artifacts/016/`, kemudian `ls -la .crew/artifacts/016/`. Simpan skrip tangkapan (jika ada) dalam `.crew/artifacts/016/`, BUKAN dalam `scripts/`. Jika model semasa boleh membaca imej, sahkan: ayat pengenalan dan petunjuk kelihatan di atas pentas, pentas mempunyai bingkai. Jika tidak boleh membaca imej, tulis "semakan visual: belum diukur". Hentikan pelayan dev mengikut peraturan 11.

### Langkah 7: Commit

Tukar baris 016 dalam `plans/README.md` kepada `DONE`, kemudian commit seperti dalam "Aliran kerja git". BERHENTI selepas itu (peraturan 13).

**Verify**: `git branch --show-current` → `main`; `git status --short` kosong; `git log --oneline -1` menunjukkan mesej commit.

## Kriteria siap

- [ ] Empat grep di atas sepadan; `check` 0 ralat; `npm test` 0 gagal; build exit 0; kontras 314/314
- [ ] `SMOKE OK`, `HOME OK`, `ORBIT OK` (output disertakan)
- [ ] `ls -la .crew/artifacts/016/` menunjukkan dua imej
- [ ] Pada `main`; baris 016 = `DONE`; commit dibuat; tiada push

## Syarat STOP

- Semakan drift tidak sepadan, atau mana-mana teks lama dalam Langkah 1–4 tidak ditemui tepat sekali.
- Mana-mana ujian sedia ada gagal. Jangan ubah fail ujian atau `WorkbenchWorld.ts`.
