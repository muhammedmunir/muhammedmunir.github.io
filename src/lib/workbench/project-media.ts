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
