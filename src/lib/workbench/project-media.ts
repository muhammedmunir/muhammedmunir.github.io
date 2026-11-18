export interface ProjectMedia {
  logo?: string;
  logoSource?: string;
  slides: { src: string; label: string; labelEn?: string; source: string; sourceEn?: string }[];
  unavailable?: string;
  unavailableEn?: string;
}

// Hanya aset yang telah diperiksa dimasukkan; tiada borang log masuk atau metrik rekaan.
export const PROJECT_MEDIA: Record<string, ProjectMedia> = {
  emesys: {
    logo: '/images/emesys-logo.png',
    logoSource: 'Aset frontend EMESYS',
    slides: [
      {
        src: '/images/emesys-login-ui.png',
        label: 'Log masuk',
        labelEn: 'Login Interface',
        source: 'Manual latihan EMESYS',
        sourceEn: 'EMESYS Training Manual'
      }
    ]
  },
  sutera: {
    logo: '/images/sutera-logo.png',
    logoSource: 'Lambang RAJD yang digunakan dalam SUTERA',
    slides: [
      {
        src: '/images/sutera-login-ui.jpg',
        label: 'Log masuk SSO',
        labelEn: 'SSO Login Portal',
        source: 'Manual pengguna SUTERA',
        sourceEn: 'SUTERA User Manual'
      }
    ]
  },
  adims: {
    logo: '/images/adims-logo.png',
    logoSource: 'Lambang organisasi daripada aset ADiMS, bukan logo produk berasingan',
    slides: [],
    unavailable: 'Sampel UI ADiMS belum tersedia untuk paparan.',
    unavailableEn: 'ADiMS UI sample is restricted from public display.'
  },
  onboardx: {
    logo: '/images/onboardx-original.png',
    logoSource: 'onboardx_tnb_app/assets/icon/icon.png, dirujuk oleh flutter_launcher_icons.yaml',
    slides: [],
    unavailable: 'Sampel UI ONBOARDX belum ditemui.',
    unavailableEn: 'ONBOARDX internal UI sample is restricted.'
  },
  iwa001: {
    logo: '/images/iwa001-wordmark-source.png',
    logoSource: 'Potongan wordmark Infinity World daripada skrin log masuk kajian kes IWA001',
    slides: [
      {
        src: '/images/iwa001_login_ui.png',
        label: 'Log masuk',
        labelEn: 'Login Portal',
        source: 'Kajian kes IWA001, halaman 2',
        sourceEn: 'IWA001 Case Study, page 2'
      },
      {
        src: '/images/iwa001_dashboard_ui.jpeg',
        label: 'Paparan pengguna contoh',
        labelEn: 'Sample Borrower Dashboard',
        source: 'Kajian kes IWA001, halaman 3',
        sourceEn: 'IWA001 Case Study, page 3'
      }
    ]
  },
  infinity: {
    logo: '/images/infinity-logo-source.png',
    logoSource: 'Potongan logo daripada halaman utama dalam kajian kes Infinity; resolusi sumber terhad',
    slides: [
      {
        src: '/images/infinity_home_ui.jpeg',
        label: 'Halaman utama',
        labelEn: 'Corporate Home Page',
        source: 'Kajian kes Infinity, halaman 2',
        sourceEn: 'Infinity Case Study, page 2'
      },
      {
        src: '/images/infinity_booking_ui.jpeg',
        label: 'Perkhidmatan',
        labelEn: 'Services & Booking',
        source: 'Kajian kes Infinity, halaman 3',
        sourceEn: 'Infinity Case Study, page 3'
      }
    ]
  },
  '9router': {
    slides: [
      {
        src: '/images/9router_office_3d.png',
        label: 'Pejabat 3D',
        labelEn: '3D AI Workspace',
        source: 'Aset projek portfolio',
        sourceEn: 'Portfolio project asset'
      }
    ]
  },
  babykick: {
    logo: '/images/baby_kicking_logo.png',
    logoSource: 'Aset Baby Kick Tracker',
    slides: [
      {
        src: '/images/baby_kick_tracker_ui.png',
        label: 'Panduan profil, akaun ujian',
        labelEn: 'Profile onboarding, test account',
        source: 'Tangkapan ujian aplikasi, September 2026',
        sourceEn: 'Application test capture, September 2026'
      }
    ]
  }
};
