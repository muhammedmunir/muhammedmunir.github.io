# Plan 017: Halaman utama yang padat — buang pertindihan dengan /cv, meja 3D penuh, hologram kad identiti

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan dengan alat **Edit** (satu Edit bagi setiap langkah) atau **Write** jika dinyatakan. Salin teks lama dan baharu TEPAT seperti dalam blok kod (termasuk ruang di awal baris). Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor.
>
> **Semakan drift (jalankan dahulu)**:
> ```bash
> git rev-parse HEAD:src/lib/workbench/Workbench.svelte HEAD:src/lib/workbench/WorkbenchWorld.ts HEAD:src/lib/workbench/project-media.ts
> git status --short
> ```
> → `a61552a305043384b88947e6ddb9505a831c72b5`, kemudian dua hash lain (catat sahaja), dan `git status --short` kosong. Jika hash pertama berbeza atau ada perubahan belum di-commit, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: M · **Risiko**: MEDIUM (markup, CSS, kamera panoramik dan lukisan hologram; tiada perubahan data kandungan)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-20 dalam salinan terasing daripada `main` (`81b127d`): `check` 730 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build exit 0, kontras 314/314, `SMOKE OK`, `HOME OK`, `ORBIT OK`. Halaman utama 1440px turun daripada 5,249px kepada 2,893px. Lakaran diluluskan pemilik ("nampak macam okay").

## Kenapa

Pemilik: halaman utama "makin serabut" dan sama dengan `/cv`. Fakta sebelum pelan ini:

- Profil, Perjalanan kerjaya, Kemahiran dan Sijil dipaparkan di halaman utama DAN di `/cv`.
- Projek muncul 4 kali di halaman utama (kaset 3D, menu Projek, bahagian Sistem, panel kawalan).
- Meja 3D hanya mengisi kira-kira separuh bingkai kerana bingkai panoramik turut memuatkan stesen dossier.
- Hologram memaparkan tangkapan skrin log masuk walaupun pemilik memilih logo sahaja; kad spesifikasi bertulisan kecil tidak boleh dibaca dari pandangan meja.

Selepas pelan ini halaman utama hanya: Hero → Meja projek (3D) → Sistem → jalur "Rekod penuh ada dalam resume." Butiran kerjaya hanya di `/cv`.

## Skop

**Dalam skop**: `src/lib/workbench/Workbench.svelte`, `src/lib/workbench/WorkbenchWorld.ts`, `src/lib/workbench/project-media.ts` (tulis semula), `src/lib/workbench/ResumeBand.svelte` (baharu), `src/lib/workbench/EditorialSummary.svelte` (dibuang), `scripts/home-visual.mjs`, `scripts/workbench-smoke.mjs` (pengawal localhost sahaja, Langkah 31a), `DESIGN.md`, `plans/README.md`.
**Luar skop**: `/cv`, `SystemsSection.svelte`, `HeroIdentity.svelte`, data kandungan, imej dalam `static/`. Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `feat(utama): halaman padat, meja 3D penuh dan hologram kad identiti`
- Stage eksplisit (Langkah akhir). Jangan `git add -A` / `git add .`. Jangan push.

## Langkah

### Langkah 1: Import jalur resume menggantikan editorial

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
  import EditorialSummary from './EditorialSummary.svelte';
````

dengan:

````
  import ResumeBand from './ResumeBand.svelte';
````

### Langkah 2: Telefon dibuka dengan pandangan meja penuh, bukan konsol

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
    initPreferences();
    if (matchMedia('(max-width: 639px)').matches) focus = 'console';
````

dengan:

````
    initPreferences();
````

### Langkah 3: Label menu header

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
t('Resume & Profil Penuh', 'Resume & Full Profile')
````

dengan:

````
t('Resume', 'Resume')
````

### Langkah 4: Buang butang stesen Profil/Perjalanan/Kemahiran (kandungan itu kini di /cv)

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
  <nav class="view-nav" aria-label={t('Bahagian dunia 3D', '3D world sections')}>
    {#each [{ id: 'desk', ms: 'Meja Projek', en: 'Project Desk' }, { id: 'profile', ms: 'Profil', en: 'Profile' }, { id: 'journey', ms: 'Perjalanan', en: 'Journey' }, { id: 'skills', ms: 'Kemahiran', en: 'Skills' }] as item}
      <button type="button" aria-pressed={view === item.id} onclick={() => selectView(item.id as typeof view)}>{item[locale]}</button>
    {/each}
  </nav>
  <main id="workbench-main"
````

dengan:

````
  <main id="workbench-main"
````

### Langkah 5: Pengenalan satu ayat; kawalan kamera dipindah ke bawah pentas

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
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
      <summary>{t('Kamera & sudut pandang', 'Camera & viewpoints')}</summary>
    <div class="scene-toolbar">
      {#if view === 'desk'}
        <div class="focus-controls" role="group" aria-label={t('Fokus meja', 'Desk focus')}>
          <button type="button" bind:this={panoramicButton} disabled={!ready} aria-pressed={focus === 'panoramic'} onclick={() => selectDeskFocus('panoramic')}>{t('Seluruh meja', 'Full desk')}</button>
          <button type="button" disabled={!ready} aria-pressed={focus === 'console'} onclick={() => selectDeskFocus('console')}>{t('Konsol', 'Console')}</button>
          <button type="button" disabled={!ready} aria-pressed={focus === 'rack'} onclick={() => selectDeskFocus('rack')}>{t('Rak projek', 'Project rack')}</button>
          <button type="button" disabled={!ready} aria-pressed={focus === 'router'} onclick={() => selectDeskFocus('router')}>Homelab</button>
        </div>
      {/if}
      <div class="camera-controls" role="group" aria-label={t('Kawalan kamera', 'Camera controls')}>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Zum dekat', 'Zoom in')} title={t('Zum dekat', 'Zoom in')} onclick={() => world?.zoomBy(-0.12)}><span aria-hidden="true">+</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Zum jauh', 'Zoom out')} title={t('Zum jauh', 'Zoom out')} onclick={() => world?.zoomBy(0.12)}><span aria-hidden="true">−</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Putar ke kiri', 'Rotate left')} title={t('Putar ke kiri', 'Rotate left')} onclick={() => world?.orbitBy(-0.15)}><span aria-hidden="true">←</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Putar ke kanan', 'Rotate right')} title={t('Putar ke kanan', 'Rotate right')} onclick={() => world?.orbitBy(0.15)}><span aria-hidden="true">→</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Condong ke atas', 'Tilt up')} title={t('Condong ke atas', 'Tilt up')} onclick={() => world?.orbitBy(0, 0.1)}><span aria-hidden="true">↑</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Condong ke bawah', 'Tilt down')} title={t('Condong ke bawah', 'Tilt down')} onclick={() => world?.orbitBy(0, -0.1)}><span aria-hidden="true">↓</span></button>
        <button type="button" disabled={!ready} onclick={resetCamera}>{t('Set semula kamera', 'Reset camera')}</button>
      </div>
    </div>
    </details>
    <div class="scene-area">
````

dengan:

````
    {#if view === 'desk'}
      <div class="scene-intro">
        <p>{t('Setiap kaset di rak ialah satu sistem yang saya bina atau senggara. Tekan kaset untuk memaparkannya.', 'Each cartridge on the rack is a system I built or maintain. Select one to project it.')}</p>
      </div>
    {/if}
    <div class="scene-area">
````

### Langkah 6: Petunjuk interaksi sebagai label di dalam pentas

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
      <p class="render-status" role="status" hidden={ready}>
````

dengan:

````
      <p class="scene-hints" aria-hidden="true">
        <span class="hint-pointer">{t('Seret untuk memutar · Roda tetikus untuk zum · Klik objek untuk menggunakannya', 'Drag to rotate · Scroll to zoom · Click an object to use it')}</span>
        <span class="hint-touch">{t('Seret untuk memutar · Cubit untuk zum · Ketik objek untuk menggunakannya', 'Drag to rotate · Pinch to zoom · Tap an object to use it')}</span>
      </p>
      <p class="render-status" role="status" hidden={ready}>
````

### Langkah 7: Kawalan kamera di bawah pentas

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
      {/if}
    </div>

    {#if view !== 'desk'}
````

dengan:

````
      {/if}
    </div>
    <details class="camera-disclosure">
      <summary>{t('Kamera & sudut pandang', 'Camera & viewpoints')}</summary>
    <div class="scene-toolbar">
      {#if view === 'desk'}
        <div class="focus-controls" role="group" aria-label={t('Fokus meja', 'Desk focus')}>
          <button type="button" bind:this={panoramicButton} disabled={!ready} aria-pressed={focus === 'panoramic'} onclick={() => selectDeskFocus('panoramic')}>{t('Seluruh meja', 'Full desk')}</button>
          <button type="button" disabled={!ready} aria-pressed={focus === 'console'} onclick={() => selectDeskFocus('console')}>{t('Konsol', 'Console')}</button>
          <button type="button" disabled={!ready} aria-pressed={focus === 'rack'} onclick={() => selectDeskFocus('rack')}>{t('Rak projek', 'Project rack')}</button>
          <button type="button" disabled={!ready} aria-pressed={focus === 'router'} onclick={() => selectDeskFocus('router')}>Homelab</button>
        </div>
      {/if}
      <div class="camera-controls" role="group" aria-label={t('Kawalan kamera', 'Camera controls')}>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Zum dekat', 'Zoom in')} title={t('Zum dekat', 'Zoom in')} onclick={() => world?.zoomBy(-0.12)}><span aria-hidden="true">+</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Zum jauh', 'Zoom out')} title={t('Zum jauh', 'Zoom out')} onclick={() => world?.zoomBy(0.12)}><span aria-hidden="true">−</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Putar ke kiri', 'Rotate left')} title={t('Putar ke kiri', 'Rotate left')} onclick={() => world?.orbitBy(-0.15)}><span aria-hidden="true">←</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Putar ke kanan', 'Rotate right')} title={t('Putar ke kanan', 'Rotate right')} onclick={() => world?.orbitBy(0.15)}><span aria-hidden="true">→</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Condong ke atas', 'Tilt up')} title={t('Condong ke atas', 'Tilt up')} onclick={() => world?.orbitBy(0, 0.1)}><span aria-hidden="true">↑</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Condong ke bawah', 'Tilt down')} title={t('Condong ke bawah', 'Tilt down')} onclick={() => world?.orbitBy(0, -0.1)}><span aria-hidden="true">↓</span></button>
        <button type="button" disabled={!ready} onclick={resetCamera}>{t('Set semula kamera', 'Reset camera')}</button>
      </div>
    </div>
    </details>

    {#if view !== 'desk'}
````

### Langkah 8: Bar hologram hanya semasa zum

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
    {:else if projecting || inspection === 'router'}
````

dengan:

````
    {:else if inspection}
````

### Langkah 9: Status zum: nama dan organisasi

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
          <p role="status"><strong>{module.name}</strong> · {locale === 'en' ? sample?.labelEn ?? media.unavailableEn : sample?.label ?? media.unavailable}</p>
````

dengan:

````
          <p role="status"><strong>{module.name}</strong> · {module.company}</p>
````

### Langkah 10: Jalur resume menggantikan editorial

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
  <EditorialSummary {locale} />
````

dengan:

````
  <ResumeBand {locale} oncontact={() => contact = true} />
````

### Langkah 11: Buang gaya .view-nav (elemen dibuang)

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
  .view-nav { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); padding: 6px var(--gutter); gap: 4px; border-bottom: 1px solid var(--work-line); }
  .view-nav button { min-width: 0; padding: 8px 4px; font-size: .75rem; font-weight: 600; }
  main { flex: 1;
````

dengan:

````
  main { flex: 1;
````

### Langkah 12: Pentas mengikut lebar supaya meja memenuhi bingkai

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
.scene-area { flex: 0 0 auto; height: min(64svh, 620px); min-height: 22rem;
````

dengan:

````
.scene-area { flex: 0 0 auto; height: min(46vw, 78svh, 760px); min-height: 22rem;
````

### Langkah 13: Buang gaya .view-nav (desktop)

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
    .view-nav { display: flex; flex-wrap: wrap; }
    .view-nav button { padding-inline: 20px; font-size: .8125rem; }
    .focus-controls { flex: 0 1 auto; }
````

dengan:

````
    .focus-controls { flex: 0 1 auto; }
````

### Langkah 14: Buang pemilih .view-nav

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
  .view-nav button[aria-pressed='true'], .focus-controls button[aria-pressed='true']
````

dengan:

````
  .focus-controls button[aria-pressed='true']
````

### Langkah 15: Gaya label petunjuk dalam pentas

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
  .scene-intro .scene-hints { margin-top: 4px; color: var(--work-muted); font-size: .875rem; }
````

dengan:

````
  .scene-hints { position: absolute; left: 12px; bottom: 12px; margin: 0; padding: 6px 10px; background: color-mix(in srgb, var(--work-paper) 82%, transparent); color: var(--work-muted); font-size: .8125rem; border-radius: 4px; pointer-events: none; }
````

### Langkah 16: Jarak kawalan kamera di bawah pentas

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
  .camera-disclosure { padding-inline: var(--gutter); }
````

dengan:

````
  .camera-disclosure { padding-inline: var(--gutter); margin-top: 4px; }
````

### Langkah 17: Ketinggian pentas telefon

Fail: `src/lib/workbench/Workbench.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
    .scene-area { height: 56svh; min-height: 18rem; }
````

dengan:

````
    .scene-area { height: min(110vw, 62svh); min-height: 18rem; }
````

### Langkah 18: Sempadan meja penuh untuk skrin sempit

Fail: `src/lib/workbench/WorkbenchWorld.ts`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
  private focus: FocusView = 'panoramic';
````

dengan:

````
  private focus: FocusView = 'panoramic';
  private panoramicFull = new THREE.Box3();
````

### Langkah 19: Bingkai panoramik

Fail: `src/lib/workbench/WorkbenchWorld.ts`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
    // Paparan panoramik membingkai seluruh meja: konsol, hologram dan stesen dossier.
    const deskBounds = new THREE.Box3().setFromObject(this.dossier.group);
    const panoramic = this.consoleBounds.clone().union(this.screenBounds);
    if (!deskBounds.isEmpty()) panoramic.union(deskBounds);
````

dengan:

````
    // Skrin lebar: bingkai konsol dan hologram sahaja supaya meja memenuhi pentas.
    // Skrin sempit: termasuk stesen dossier supaya rak dan router kekal kelihatan.
    const deskBounds = new THREE.Box3().setFromObject(this.dossier.group);
    const panoramic = this.consoleBounds.clone().union(this.screenBounds);
    this.panoramicFull.copy(panoramic);
    if (!deskBounds.isEmpty()) this.panoramicFull.union(deskBounds);
````

### Langkah 20: Guna meja penuh pada skrin sempit

Fail: `src/lib/workbench/WorkbenchWorld.ts`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
    let bounds = this.focusBounds.get(this.focus);
````

dengan:

````
    let bounds = this.focusBounds.get(this.focus);
    if (this.focus === 'panoramic' && this.camera.aspect < 1.2 && !this.panoramicFull.isEmpty()) bounds = this.panoramicFull;
````

### Langkah 21: Hologram: kad identiti besar menggantikan kad spesifikasi kecil

Fail: `src/lib/workbench/WorkbenchWorld.ts`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
      // Kad Spesifikasi Seni Bina Hologram (untuk sistem dalaman sulit seperti ADiMS / ONBOARDX)
      ctx.fillStyle = 'rgba(17, 24, 39, 0.92)';
      this.roundRect(ctx, 64, 140, c.width - 128, 740, 22);
      ctx.fill();
      ctx.strokeStyle = mod.accent;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      this.roundRect(ctx, 110, 210, 340, 340, 28);
      ctx.fill();
      this.drawProjectLogo(ctx, mod.id, 280, 380, 135, mod.accent);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.locale === 'en' ? mod.badgeEn : mod.badge, 280, 595);

      const rx = 500;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 20px monospace';
      ctx.fillText(this.t("SPESIFIKASI SENI BINA & SKOP KERJA SEBENAR", "ARCHITECTURE & ROLE"), rx, 225);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 38px sans-serif';
      ctx.fillText(`${mod.name} · ${mod.company}`, rx, 278);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 24px sans-serif';
      ctx.fillText(`${this.t('Jawatan & Skop', 'Role & Scope')}: ${this.locale === 'en' ? mod.roleEn : mod.role}`, rx, 332, 960);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 23px sans-serif';
      this.drawWrappedText(ctx, `${this.t('Seni Bina Data', 'Data Architecture')}: ${this.locale === 'en' ? mod.dataArchitectureEn : mod.dataArchitecture}`, rx, 395, 950, 34);
      this.drawWrappedText(ctx, `${this.t('Kawalan Keselamatan', 'Security Controls')}: ${this.locale === 'en' ? mod.securityAccessEn : mod.securityAccess}`, rx, 515, 950, 34);

      ctx.fillStyle = '#7dd3fc';
      ctx.font = '700 19px monospace';
      ctx.fillText(this.t("SUSUNAN TEKNOLOGI (TECH STACK):", "TECHNOLOGY STACK:"), rx, 645);

      let tx = rx;
      mod.stack.forEach(tech => {
        ctx.font = '700 21px monospace';
        const tw = ctx.measureText(tech).width + 36;
        ctx.fillStyle = '#1e293b';
        this.roundRect(ctx, tx, 675, tw, 48, 10);
        ctx.fill();
        ctx.strokeStyle = mod.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(tech, tx + 18, 700);
        tx += tw + 16;
      });

      ctx.fillStyle = '#64748b';
      ctx.font = '600 19px sans-serif';
      ctx.fillText(
        slide
          ? this.failedImages.has(slide.src)
            ? this.t("Gagal memuatkan imej sampel.", "Sample image could not load.")
            : this.t("Memuatkan imej sampel UI…", "Loading UI sample…")
          : (this.locale === 'en' ? media.unavailableEn : media.unavailable) ?? this.t('Sampel UI belum tersedia.', 'UI sample unavailable.'),
        rx,
        785
      );
    }
````

dengan:

````
      // Kad identiti besar: boleh dibaca dari pandangan meja; butiran penuh dalam bahagian Sistem.
      ctx.fillStyle = 'rgba(17, 24, 39, 0.92)';
      this.roundRect(ctx, 64, 140, c.width - 128, 740, 22);
      ctx.fill();
      ctx.strokeStyle = mod.accent;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      this.roundRect(ctx, 120, 230, 440, 440, 36);
      ctx.fill();
      this.drawProjectLogo(ctx, mod.id, 340, 450, 175, mod.accent);

      const rx = 640;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = mod.accent;
      ctx.font = '700 30px sans-serif';
      ctx.fillText(this.locale === 'en' ? mod.badgeEn : mod.badge, rx, 290, 860);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 112px sans-serif';
      ctx.fillText(mod.name, rx, 410, 860);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 38px sans-serif';
      ctx.fillText(mod.company, rx, 475, 860);

      let tx = rx;
      let ty = 560;
      mod.stack.slice(0, 4).forEach(tech => {
        ctx.font = '700 32px sans-serif';
        const tw = ctx.measureText(tech).width + 48;
        if (tx + tw > c.width - 110) { tx = rx; ty += 82; }
        ctx.fillStyle = '#1e293b';
        this.roundRect(ctx, tx, ty, tw, 64, 12);
        ctx.fill();
        ctx.strokeStyle = mod.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(tech, tx + 24, ty + 43);
        tx += tw + 18;
      });
    }
````

### Langkah 22: Bar bawah hologram: tiada pengulangan stack

Fail: `src/lib/workbench/WorkbenchWorld.ts`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
 : `Stack: ${mod.stack.join(' · ')}`,
````

dengan:

````
 : mod.company,
````

### Langkah 23: Ujian: editorial kini hanya di /cv

Fail: `scripts/home-visual.mjs`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
    for (const id of ['profil', 'perjalanan', 'kemahiran', 'sijil']) assert.equal(await page.locator(`section#${id}`).count(), 1);
````

dengan:

````
    for (const id of ['profil', 'perjalanan', 'kemahiran', 'sijil']) assert.equal(await page.locator(`section#${id}`).count(), 0, `#${id} sepatutnya hanya di /cv`);
    assert.equal(await page.locator('section#sistem').count(), 1);
    assert.equal(await page.locator('#band-h').count(), 1);
````

### Langkah 24: DESIGN.md: pentas dan hologram

Fail: `DESIGN.md`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
(desktop `min(64svh, 620px)` dalam bingkai 1px `--work-line` berjejari 8px, mudah alih `56svh`), dengan satu ayat pengenalan dan petunjuk interaksi (tetikus atau sentuhan) di atasnya.
````

dengan:

````
(desktop `min(46vw, 78svh, 760px)` dalam bingkai 1px `--work-line` berjejari 8px, mudah alih `min(110vw, 62svh)`), dengan satu ayat pengenalan di atasnya dan label petunjuk interaksi (tetikus atau sentuhan) di sudut kiri bawah pentas. Hologram memaparkan kad identiti (logo, kategori, nama, organisasi, stack), BUKAN tangkapan skrin UI.
````

### Langkah 25: DESIGN.md: jalur resume

Fail: `DESIGN.md`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
3. **Editorial.** Profil, Perjalanan kerjaya, Kemahiran dan Sijil dalam HTML penuh di bawah hero. Versi penuh di `/cv`.
````

dengan:

````
3. **Resume.** Halaman utama tamat dengan satu jalur "Rekod penuh ada dalam resume." (Baca resume, Muat turun PDF, Hubungi). Profil, Perjalanan kerjaya, Kemahiran dan Sijil HANYA di `/cv`; jangan ulang di halaman utama.
````

### Langkah 26: Tulis semula `project-media.ts` (logo sahaja, tiada slaid)

Fail: `src/lib/workbench/project-media.ts`. Guna alat **Write** dengan kandungan penuh ini:

````ts
export interface ProjectMedia {
  logo?: string;
  logoSource?: string;
  slides: { src: string; label: string; labelEn?: string; source: string; sourceEn?: string }[];
  unavailable?: string;
  unavailableEn?: string;
}

// Keputusan pemilik 2026-11-20: halaman utama memaparkan logo sahaja, tiada tangkapan
// skrin UI (termasuk hologram 3D). Senarai slaid sengaja kosong; imej asal kekal dalam
// static/images dan sejarah git.
export const PROJECT_MEDIA: Record<string, ProjectMedia> = {
  emesys: {
    logo: '/images/emesys-logo.png',
    logoSource: 'Aset frontend EMESYS',
    slides: []
  },
  sutera: {
    logo: '/images/sutera-logo.png',
    logoSource: 'Lambang RAJD yang digunakan dalam SUTERA',
    slides: []
  },
  adims: {
    logo: '/images/adims-logo.png',
    logoSource: 'Lambang organisasi daripada aset ADiMS, bukan logo produk berasingan',
    slides: []
  },
  onboardx: {
    logo: '/images/onboardx-original.png',
    logoSource: 'onboardx_tnb_app/assets/icon/icon.png, dirujuk oleh flutter_launcher_icons.yaml',
    slides: []
  },
  iwa001: {
    logo: '/images/iwa001-wordmark-source.png',
    logoSource: 'Potongan wordmark Infinity World daripada skrin log masuk kajian kes IWA001',
    slides: []
  },
  infinity: {
    logo: '/images/infinity-logo-source.png',
    logoSource: 'Potongan logo daripada halaman utama dalam kajian kes Infinity; resolusi sumber terhad',
    slides: []
  },
  '9router': {
    slides: []
  },
  babykick: {
    logo: '/images/baby_kicking_logo.png',
    logoSource: 'Aset Baby Kick Tracker',
    slides: []
  }
};
````

### Langkah 27: Cipta `ResumeBand.svelte`

Fail baharu: `src/lib/workbench/ResumeBand.svelte`. Guna alat **Write** dengan kandungan penuh ini:

````svelte
<script lang="ts">
  import { base } from '$app/paths';
  import { CAREER_TIMELINE, TECHNICAL_SKILLS, CERTIFICATIONS } from '$lib/content/portfolio-data';
  let { locale, oncontact }: { locale: 'ms' | 'en'; oncontact: () => void } = $props();
  const en = $derived(locale === 'en');
  const skills = TECHNICAL_SKILLS.reduce((n, g) => n + g.skills.length, 0);
</script>

<section class="band" aria-labelledby="band-h">
  <h2 id="band-h">{en ? 'The full record is in the resume.' : 'Rekod penuh ada dalam resume.'}</h2>
  <p>{en
    ? `${CAREER_TIMELINE.length} roles, ${skills} skills and ${CERTIFICATIONS.length} certifications, with dates and details.`
    : `${CAREER_TIMELINE.length} peranan, ${skills} kemahiran dan ${CERTIFICATIONS.length} sijil, lengkap dengan tarikh dan butiran.`}</p>
  <div class="actions">
    <a class="primary" href={`${base}/cv`}>{en ? 'Read the resume' : 'Baca resume'}</a>
    <a href={`${base}/resume.pdf`} download>{en ? 'Download PDF' : 'Muat turun PDF'}</a>
    <button type="button" aria-haspopup="dialog" onclick={oncontact}>{en ? 'Contact' : 'Hubungi'}</button>
  </div>
</section>

<style>
  .band { margin: 0 var(--gutter, 16px); padding: clamp(40px, 7vw, 88px) 0; border-top: 1px solid var(--work-line); display: grid; gap: 16px; }
  h2 { margin: 0; font-family: var(--font-heading); font-size: clamp(28px, 4vw, 52px); line-height: 1.05; letter-spacing: -.04em; max-width: 18ch; }
  p { margin: 0; color: var(--work-muted); font-size: 1rem; line-height: 1.6; max-width: 52ch; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  a, button { display: inline-flex; align-items: center; min-height: 44px; padding: 8px 16px; border: 1px solid var(--work-muted); border-radius: 4px; font: inherit; font-size: .9375rem; color: inherit; background: none; text-decoration: none; cursor: pointer; }
  .primary { background: var(--work-accent); border-color: var(--work-accent); color: var(--work-paper); font-weight: 700; }
  a:hover, button:hover { text-decoration: underline; }
  :is(a, button):focus-visible { outline: 3px solid var(--work-accent); outline-offset: 3px; }
</style>
````

### Langkah 28: Buang `EditorialSummary.svelte`

```bash
git rm src/lib/workbench/EditorialSummary.svelte
```
Jika auto mode menyekat, ikut peraturan 10 dalam `plans/README.md` (senaraikan arahan dengan awalan `!` dan tunggu `sambung`).

### Langkah 29: Sahkan fail sama tepat dengan versi yang diuji

```bash
git hash-object src/lib/workbench/Workbench.svelte src/lib/workbench/WorkbenchWorld.ts src/lib/workbench/project-media.ts src/lib/workbench/ResumeBand.svelte scripts/home-visual.mjs DESIGN.md
test -e src/lib/workbench/EditorialSummary.svelte && echo MASIH_ADA || echo DIBUANG
npm run check
```
**Verify** (mengikut turutan):
```
88e6e789122e485b8edf90414a7f0b0c4860f04e
7f8688e864d1369c4aede15a0037964faf21ff4f
7c2d7e94626bc069faebf2f8ee847557f206dd5a
04e33102bd12d4c93a7ec83ccc69fecf843e9bd3
851b0ca39099d6a74e78b5d1653bb9ee94190054
299af914f7d2ee34d90bf7597fb14f126161d096
DIBUANG
```
dan `0 ERRORS 0 WARNINGS`. Jika satu hash berbeza: `git diff <fail>` dan bandingkan dengan langkah yang berkaitan; betulkan HANYA kesilapan salinan anda sendiri. Jika masih berbeza selepas dua cubaan, STOP.

### Langkah 30: Ujian penuh

```bash
npm test
npm run build
npm run test:contrast
```
**Verify**: `ℹ fail 0` (pass 50); build exit 0; `314/314 pasangan token lulus`.

### Langkah 31: Ujian pelayar dan tangkapan skrin

> Kemas kini 2026-11-20: `scripts/workbench-smoke.mjs` melancarkan Chromium dengan `--enable-unsafe-swiftshader` tanpa menolak URL bukan tempatan (peraturan 12), jadi auto mode menyekatnya. Langkah 31a menambah pengawal yang sama seperti `scripts/workbench-orbit-a11y.mjs`. Diuji oleh perancang: URL `https://example.com/` → `SMOKE FAIL: hanya localhost dibenarkan…` exit 1 tanpa melancarkan pelayar; localhost → `SMOKE OK`; `npm test` pass 50 fail 0.

**31a.** Fail: `scripts/workbench-smoke.mjs`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
const url = process.env.WORKBENCH_URL || 'http://127.0.0.1:5173/';
````

dengan (dua baris di dalam blok `if` diinden dengan satu TAB, sama seperti fail itu):

````
const url = process.env.WORKBENCH_URL || 'http://127.0.0.1:5173/';
// WebGL perisian (swiftshader) hanya untuk pelayan dev tempatan; tolak URL lain sebelum pelayar dilancarkan.
if (!['localhost', '127.0.0.1'].includes(new URL(url).hostname)) {
	console.error(`SMOKE FAIL: hanya localhost dibenarkan, diterima ${url}`);
	process.exit(1);
}
````

**Verify 31a**:
```bash
git hash-object scripts/workbench-smoke.mjs
git hash-object src/lib/workbench/Workbench.svelte src/lib/workbench/WorkbenchWorld.ts src/lib/workbench/project-media.ts src/lib/workbench/ResumeBand.svelte scripts/home-visual.mjs DESIGN.md
```
→ `f3b913e00751651027325045a9face9b56033e5d`, kemudian 6 hash Langkah 29 tidak berubah. Jangan ulang suntingan Langkah 1–28 yang hashnya sudah sepadan.

**31b.** Ikut peraturan 11 dalam `plans/README.md` untuk pelayan dev (port 5199). Kemudian:

```bash
WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-smoke.mjs
HOME_URL=http://localhost:5199/ node scripts/home-visual.mjs
WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-orbit-a11y.mjs
ls -la .crew/artifacts/home/
```
**Verify**: `SMOKE OK`, `HOME OK`, `ORBIT OK`; `ls` menunjukkan `1440.png` dan `390.png`. Jika model semasa boleh membaca imej, sahkan: tiada bahagian Profil/Perjalanan/Kemahiran/Sijil; halaman tamat dengan "Rekod penuh ada dalam resume."; meja 3D memenuhi bingkai. Jika tidak boleh, tulis "semakan visual: belum diukur". Hentikan pelayan dev mengikut peraturan 11.

### Langkah 32: Commit

Tukar baris 017 dalam `plans/README.md` kepada `DONE`, kemudian:

```bash
git add src/lib/workbench/Workbench.svelte src/lib/workbench/WorkbenchWorld.ts src/lib/workbench/project-media.ts src/lib/workbench/ResumeBand.svelte scripts/home-visual.mjs scripts/workbench-smoke.mjs DESIGN.md plans/README.md plans/017-halaman-utama-padat.md
git status --short
git commit -m "feat(utama): halaman padat, meja 3D penuh dan hologram kad identiti"
```
**Verify**: sebelum commit, `git status --short` menunjukkan `D  src/lib/workbench/EditorialSummary.svelte`, `A  src/lib/workbench/ResumeBand.svelte` dan 8 fail `M` (termasuk `scripts/workbench-smoke.mjs` dan fail pelan ini, yang dipinda oleh perancang). Selepas commit: `git branch --show-current` → `main`; `git status --short` kosong. BERHENTI (peraturan 13).

## Kriteria siap

- [ ] 6 hash `git hash-object` sepadan, dan hash `scripts/workbench-smoke.mjs` = `f3b913e…`; `EditorialSummary.svelte` dibuang
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build exit 0; kontras 314/314
- [ ] `SMOKE OK`, `HOME OK`, `ORBIT OK` (output disertakan)
- [ ] Pada `main`; baris 017 = `DONE`; satu commit; tiada push

## Syarat STOP

- Semakan drift tidak sepadan, atau teks lama mana-mana langkah tidak ditemui tepat sekali.
- Hash masih berbeza selepas dua cubaan membetulkan salinan.
- Mana-mana ujian gagal. Jangan ubah fail ujian lain atau fail di luar skop untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- 9Router AI Office tiada logo; hologram memaparkan kotak "9RO" sedia ada.
- Bahagian Sistem dibuka pada IWA001 manakala 3D pada EMESYS.
- Pelan 018 (cadangan): hologram rajah seni bina hidup, selepas pemilik mengesahkan seni bina setiap sistem.
