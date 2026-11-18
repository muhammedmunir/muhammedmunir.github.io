# Plan 001: Kerja Workbench yang belum di-commit disimpan dalam git, tanpa fail peribadi

> **Arahan pelaksana**: Ikut pelan ini langkah demi langkah. Jalankan setiap
> arahan Verify dan sahkan hasil yang dijangka sebelum ke langkah seterusnya.
> Jika mana-mana syarat STOP berlaku, berhenti dan lapor; jangan
> berimprovisasi. Apabila selesai, kemas kini baris status pelan ini dalam
> `plans/README.md`.
>
> **Laksanakan TERUS dalam sesi utama.** Jangan lantik subagent dan jangan guna
> worktree: worktree hanya mengandungi commit `5acfc36` dan tidak nampak fail
> yang hendak diselamatkan oleh pelan ini. Semakan pertama:
> `git rev-parse --show-toplevel` → mesti `C:/Project/portfolio` (bukan laluan
> yang mengandungi `.claude/worktrees`). Jika lain, STOP.
>
> **Semakan drift (jalankan dahulu)**: `git rev-parse --short HEAD`
> Hasil yang dijangka: `5acfc36`. Jika berbeza, bandingkan bahagian "Keadaan
> semasa" dengan repo sebenar; jika tidak sepadan, anggap sebagai syarat STOP.

## Status

- **Keutamaan**: P1
- **Usaha**: S
- **Risiko**: MED (repo ini AWAM; salah stage = data peribadi diterbitkan)
- **Bergantung pada**: tiada
- **Kategori**: dx
- **Dirancang pada**: commit `5acfc36`, 2026-11-18

## Kenapa ini penting

Halaman utama portfolio (`src/lib/workbench/`, 9,622 baris) dan halaman `/cv`
tidak pernah di-commit ke git. Jika folder itu terpadam atau ditimpa, tiada
cara untuk memulihkannya. Pada masa yang sama, root repo mengandungi 105
tangkapan skrin audit dan folder `applications/` yang berisi 12 surat
permohonan kerja dan resume yang menamakan majikan sasaran. Repo ini AWAM di
GitHub, jadi fail-fail itu TIDAK boleh di-commit. Selepas pelan ini, semua
kerja sebenar selamat dalam satu commit, dan fail peribadi dilindungi oleh
`.gitignore`.

## Keadaan semasa

- Cawangan semasa: `fix/workbench-focused-stations`.
- `git status --short | wc -l` → `142`. Pecahan:
  - 105 fail `*.png` di root (tangkapan skrin audit, contoh: `audit-live-desktop.png`, `focused-mobile.png`, `prototype-studio-console-emesys.png`).
  - `applications/` → 12 PDF peribadi (`Cover_Letter_Muhammed_Munir_*.pdf`, `Resume_Muhammed_Munir_*.pdf`). JANGAN COMMIT.
  - `.a11y-focused.json` di root (artifak audit; jangan commit).
  - Dua fail sandaran dalam `src/lib/workbench/`: `Workbench.svelte.bak-cleanup`, `WorkbenchWorld.ts.bak-cleanup` (jangan commit).
  - Kerja sebenar yang MESTI di-commit:
    ```
     M .gitignore
     M DESIGN.md
     M src/app.html
     M src/lib/spine/spine-data.ts
     M src/routes/+layout.svelte
     M src/routes/+page.svelte
     M src/routes/layout.css
     M src/routes/spatial/+page.svelte
     M static/site.webmanifest
     M static/sitemap.xml
     M vite.config.ts
    ?? CLAUDE.md
    ?? plans/                    (pelan ini sendiri; MESTI di-commit)
    ?? scripts/item2-a11y-runner.mjs
    ?? scripts/item2-a11y-states.mjs
    ?? scripts/item3-a11y-runner.mjs
    ?? scripts/item3-a11y-states.mjs
    ?? scripts/workbench-a11y-states.mjs
    ?? scripts/workbench-camera-fit.test.mjs
    ?? scripts/workbench.test.mjs
    ?? src/lib/workbench/        (kecuali *.bak-cleanup)
    ?? src/routes/cv/
    ?? static/images/            (13 imej projek baharu, contoh: emesys-logo.png, iwa001_dashboard_ui.jpeg)
    ```
- `.gitignore` semasa sudah mengabaikan `claude-*.bat`, `.claude/`, `.crew/`, `.local-review/`, `.playwright-mcp`. Gaya fail: satu corak setiap baris, kumpulan dengan komen `# ...`.

## Arahan yang diperlukan

| Tujuan | Arahan | Dijangka |
|---|---|---|
| Semak status | `git status --short` | senarai fail |
| Semak jenis | `npm run check` | SEBELUM pelan 002: `1 ERRORS` (`deskBounds`). Ini dijangka; jangan baiki dalam pelan ini |
| Ujian | `npm test` | `ℹ pass 71`, `ℹ fail 0` |

## Skop

**Dalam skop** (hanya fail ini boleh diubah):
- `.gitignore`
- Operasi git: `git add <laluan eksplisit>` dan `git commit`

**Luar skop** (JANGAN sentuh):
- Sebarang fail di bawah `src/`, `scripts/`, `static/`: jangan edit, hanya stage.
- Jangan padam fail PNG, `applications/` atau `*.bak-cleanup` dari cakera. Pemilik mungkin memerlukannya. Hanya abaikan dalam git.
- Jangan baiki ralat `npm run check` (`deskBounds`); itu Pelan 002.
- Jangan `git push`.

## Aliran kerja git

- Kekal pada cawangan semasa `fix/workbench-focused-stations`.
- Gaya mesej commit repo: conventional commits dalam Bahasa Melayu, contoh daripada `git log`: `feat(spine): tambah loading page animasi 3D dan optimumkan prestasi WebGL`.
- JANGAN guna `git add -A`, `git add .` atau `git commit -a`.

## Langkah

### Langkah 1: Sahkan keadaan awal

Jalankan:
```bash
git branch --show-current
git status --short | wc -l
git status --short | grep -c '^?? applications/'
```
**Verify**: output `fix/workbench-focused-stations`, kemudian `142`, kemudian `1` (folder `applications/` dipapar sebagai satu baris).

### Langkah 2: Tambah corak abaikan ke `.gitignore`

Tambah blok ini di HUJUNG `.gitignore` (jangan ubah baris sedia ada):
```gitignore

# Fail peribadi: surat & resume permohonan kerja (repo ini AWAM)
/applications/

# Tangkapan skrin audit & artifak di root (bukan aset laman)
/*.png
/.a11y-focused.json

# Sandaran sementara
*.bak-cleanup
```
Nota: `/*.png` hanya memadankan PNG di ROOT repo. Imej laman dalam `static/images/` TIDAK terjejas.

**Verify**:
```bash
git check-ignore -q applications/Resume_Muhammed_Munir_WCT_Executive_IT.pdf && echo ABAI-OK
git check-ignore -q audit-live-desktop.png && echo ABAI-OK
git check-ignore -q src/lib/workbench/WorkbenchWorld.ts.bak-cleanup && echo ABAI-OK
git check-ignore -q static/images/emesys-logo.png || echo IMEJ-LAMAN-TIDAK-DIABAI-OK
git status --short | wc -l
```
→ `ABAI-OK` tiga kali, `IMEJ-LAMAN-TIDAK-DIABAI-OK`, dan bilangan baris `35` (bukan 142). Jika bukan 35, STOP dan lapor output `git status --short`.

### Langkah 3: Stage fail secara eksplisit

```bash
git add .gitignore DESIGN.md CLAUDE.md vite.config.ts plans
git add src/app.html src/routes/+layout.svelte src/routes/+page.svelte src/routes/layout.css src/routes/spatial/+page.svelte src/routes/cv
git add src/lib/spine/spine-data.ts src/lib/workbench
git add static/site.webmanifest static/sitemap.xml static/images
git add scripts/item2-a11y-runner.mjs scripts/item2-a11y-states.mjs scripts/item3-a11y-runner.mjs scripts/item3-a11y-states.mjs scripts/workbench-a11y-states.mjs scripts/workbench-camera-fit.test.mjs scripts/workbench.test.mjs
```
**Verify**:
```bash
git diff --cached --name-only | grep -cE '^applications/|\.bak-cleanup$|^[^/]+\.png$'
git diff --cached --name-only | grep -c '^src/lib/workbench/'
git status --short | grep -v '^[AM] ' | grep -v '^$'
```
→ Baris pertama `0` (tiada fail peribadi, sandaran atau tangkapan skrin root di-stage). Baris kedua sekurang-kurangnya `10`. Arahan ketiga tidak mengeluarkan apa-apa (semua perubahan sudah di-stage). Jika arahan ketiga menunjukkan fail lain, STOP dan lapor senarai itu.

### Langkah 4: Imbas rahsia dalam perubahan yang di-stage

```bash
git diff --cached | grep -IE '^\+' | grep -cIE 'sk-[A-Za-z0-9_-]{16,}|gsk_[A-Za-z0-9]{16,}|sk-or-v1-[a-f0-9]{20,}|ghp_[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'
```
**Verify**: `0`. Jika lebih daripada 0: STOP, `git reset`, dan lapor fail:baris tanpa menyalin nilai rahsia.

Nota: setiap corak memerlukan nilai sebenar selepas awalan (contoh 20+ aksara heks selepas `sk-or-v1-`), jadi teks corak dalam fail pelan ini sendiri TIDAK dipadankan. Corak ini disahkan pada 2026-11-18: 0 padanan dalam semua fail yang di-stage, dan 6/6 kunci contoh rekaan dikesan. Versi lama (`sk-or-v1-` dan `-----BEGIN` tanpa nilai) tersilap memadankan teksnya sendiri dalam pelan ini.

### Langkah 5: Commit

```bash
git commit -m "chore(workbench): simpan halaman utama Workbench, /cv dan ujian yang belum di-commit" -m "Fail peribadi (applications/), tangkapan skrin audit di root dan sandaran *.bak-cleanup kini diabaikan oleh .gitignore."
```
**Verify**: `git status --short | wc -l` → `0`; `git log --oneline -1` menunjukkan mesej di atas; `git ls-files src/lib/workbench | wc -l` → sekurang-kurangnya `10`.

### Langkah 6: Bersihkan worktree subagent lama

Tujuh worktree lama di `.claude/worktrees/agent-*` (dicipta 5–12 Nov oleh subagent C9) masih wujud. Semakan pada 2026-11-18 mendapati isinya hanya salinan LAMA `src/lib/workbench/` dan `src/routes/cv/`, tanpa fail unik berbanding projek utama. Sahkan semula sebelum membuang:
```bash
git worktree list | grep -c "worktree-agent-"
for w in .claude/worktrees/agent-*; do [ -d "$w/src/lib/workbench" ] && diff -rq src/lib/workbench "$w/src/lib/workbench" | grep -c "Only in $w"; done
```
**Verify**: baris pertama `7`; setiap nombor seterusnya `0`. Jika mana-mana nombor bukan `0`, STOP dan lapor nama worktree serta fail uniknya; JANGAN buang.

Jika semua `0`:
```bash
for w in .claude/worktrees/agent-*; do git worktree remove --force "$w"; done
git branch --list "worktree-agent-*" | xargs -r git branch -D
git worktree prune
```
**Verify**: `git worktree list | wc -l` → `1`; `git branch --list "worktree-agent-*" | wc -l` → `0`; `git status --short | wc -l` → `0`.

## Pelan ujian

Tiada ujian baharu. Sahkan tiada regresi:
- `npm test` → `ℹ pass 71`, `ℹ fail 0`.

## Kriteria siap

- [ ] `git status --short | wc -l` → `0`
- [ ] `git ls-files src/lib/workbench src/routes/cv | wc -l` → sekurang-kurangnya `11`
- [ ] `git ls-files | grep -cE '^applications/|^[^/]+\.png$|\.bak-cleanup$'` → `0`
- [ ] `ls applications | wc -l` → `12` (fail peribadi masih ada pada cakera, cuma tidak dijejak)
- [ ] `npm test` → 71 lulus, 0 gagal
- [ ] `git worktree list | wc -l` → `1` (worktree lama dibersihkan)
- [ ] Tiada `git push` dibuat
- [ ] Baris 001 dalam `plans/README.md` → `DONE`

## Syarat STOP

Berhenti dan lapor jika:
- `git rev-parse --show-toplevel` bukan `C:/Project/portfolio` (anda dalam worktree atau subagent).
- Cawangan bukan `fix/workbench-focused-stations`, atau bilangan awal bukan 142 (repo telah berubah).
- Langkah 3 Verify menunjukkan sebarang fail dari `applications/`, PNG root atau `*.bak-cleanup` di-stage.
- Langkah 4 menemui sebarang corak rahsia.
- `npm test` gagal selepas commit.

## Nota penyelenggaraan

- Selepas ini, setiap pelan mesti stage fail secara eksplisit. Jangan sekali-kali buang `/applications/` daripada `.gitignore`.
- Tangkapan skrin audit baharu patut disimpan di `.crew/artifacts/` (sudah diabaikan), bukan di root.
