<script>
    import { onMount } from 'svelte';
    
    let lang = $state('en'); // 'en' or 'ms'

    function toggleLang(l) {
        lang = l;
    }
    
    // SvelteKit layouts might set a global dark background on the body tag.
    // We override it here when this page mounts to ensure the entire screen uses our app theme.
    onMount(() => {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#FFF0F5';

        // Override the favicon dynamically
        // Remove all existing favicons to ensure browsers don't hold onto the first one they see
        const oldLinks = Array.from(document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'));
        oldLinks.forEach(link => {
            if (link.parentNode) link.parentNode.removeChild(link);
        });

        // Add the new favicon
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.type = 'image/png';
        newFavicon.href = '/Logo_BiK.png?v=app'; // cache buster to force browser update
        newFavicon.id = 'app-favicon';
        document.head.appendChild(newFavicon);
        
        return () => {
            document.body.style.backgroundColor = originalBg;
            // Restore original favicon
            const addedFavicon = document.getElementById('app-favicon');
            if (addedFavicon) addedFavicon.remove();
            
            oldLinks.forEach(link => document.head.appendChild(link));
        };
    });
</script>

<svelte:head>
    <title>Baby Kick Tracker - Privacy Policy</title>
    <meta name="robots" content="noindex" />
</svelte:head>

<div id="hero" class="privacy-container">
    <div class="privacy-wrapper">
        <div class="privacy-card">
            <!-- Header Section -->
            <div class="privacy-header">
                <div class="logo-wrapper">
                    <img src="/Logo_BiK.png" alt="Baby Kick Tracker Logo" class="app-logo" />
                </div>
                <h1 class="app-title">Baby Kick Tracker</h1>
                <p class="app-subtitle">{lang === 'en' ? 'Privacy Policy' : 'Dasar Privasi'}</p>
                
                <div class="lang-toggle">
                    <button class:active={lang === 'en'} onclick={() => toggleLang('en')}>English</button>
                    <button class:active={lang === 'ms'} onclick={() => toggleLang('ms')}>Bahasa Melayu</button>
                </div>
            </div>
            
            <!-- Content Section -->
            <div class="privacy-content">
                <p class="last-updated">
                    {lang === 'en' ? 'Last updated:' : 'Tarikh kemas kini:'} 13/08/2026
                </p>

                {#if lang === 'en'}
                    <!-- ENGLISH CONTENT -->
                    <p>Baby Kick Tracker ("the App") is developed and maintained by <strong>Syanir</strong> ("we", "us", or "our"). This Privacy Policy explains how information is collected, used, stored, shared, and deleted when you use the App.</p>
                    <p>By using Baby Kick Tracker, you agree to the practices described in this Privacy Policy.</p>

                    <h2>1. Information We Collect</h2>
                    <p>When you use the App, we may process account information such as your name, display name, email address, profile photo if provided by your sign-in provider, authentication identifier, and account sign-in information. The App may use Firebase Authentication and Google Sign-In.</p>
                    <p>You may enter pregnancy and baby-kicking information such as baby-kicking session records, session date and time, session duration, kick count, pregnancy profile information, estimated due date, hydration records, weight records, appointment records, contraction timer records, and personal notes. This information is used to provide your personal tracking history, statistics, reminders, and related features.</p>
                    <p>If you use partner linking, we may process invitation codes, partner account identifiers, partner display names, link status, and partner-safe tracking information intentionally shared through the feature.</p>
                    <p>The App may process device platform, operating system, app version, notification permission status, notification scheduling information, and time zone information needed to schedule local reminders correctly.</p>

                    <h2>2. How We Use Information</h2>
                    <p>We use information to create and maintain your account, provide tracking and statistics, display history and reports, support partner linking, schedule local reminders, provide support, maintain security, detect abuse, improve reliability, provide advertising where enabled and permitted, manage premium access where enabled, and comply with legal obligations.</p>
                    
                    <div class="alert-box">
                        <p>Baby Kick Tracker is not a medical diagnosis or emergency service and does not replace advice from a qualified healthcare professional. If you have concerns about your pregnancy or your baby’s movement, contact your healthcare provider or local emergency service.</p>
                    </div>

                    <h2>3. Advertising</h2>
                    <p>If advertising is enabled, the App may use Google Mobile Ads. Google Mobile Ads may process advertising identifiers, device information, approximate location inferred from IP address, ad interaction information, diagnostics, and performance information. Advertising may be personalised or non-personalised depending on consent choices, device settings, region, and applicable law.</p>
                    <ul class="policy-links">
                        <li><span>Google Privacy Policy: </span><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></li>
                        <li><span>Firebase Privacy and Security: </span><a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">https://firebase.google.com/support/privacy</a></li>
                    </ul>

                    <h2>4. Subscriptions</h2>
                    <p>If premium subscription features are enabled, the App may use RevenueCat to manage subscription status. RevenueCat may process an anonymous app user identifier, purchase and subscription status, product information, entitlement information, and transaction-related information received from the applicable app store. Payments are processed by Google Play or the applicable app store. We do not receive or store your full payment card number.</p>
                    <ul class="policy-links">
                        <li><span>RevenueCat Privacy Policy: </span><a href="https://www.revenuecat.com/privacy/" target="_blank" rel="noopener noreferrer">https://www.revenuecat.com/privacy/</a></li>
                    </ul>

                    <h2>5. Data Storage and Sharing</h2>
                    <p>Account and application data may be stored using Firebase Authentication and Cloud Firestore. We do not sell your personal information. Information may be shared with infrastructure providers, advertising providers where enabled, subscription providers where enabled, a linked partner through intentionally enabled features, or authorities where required by law.</p>

                    <h2>6. Data Retention and Deletion</h2>
                    <p>We retain information only as long as necessary to provide the App, maintain security, comply with law, resolve disputes, and enforce agreements. Deleting the App does not automatically delete server-side data.</p>
                    
                    <div class="contact-card">
                        <h3>To request account and associated personal data deletion, contact:</h3>
                        <p><strong>Email:</strong> <a href="mailto:muhammed.munir97.mm@gmail.com">muhammed.munir97.mm@gmail.com</a></p>
                        <p><strong>Subject:</strong> Baby Kick Tracker Account Deletion Request</p>
                    </div>
                    
                    <p>Include your account email address, display name if applicable, and information needed to verify account ownership. We may request reasonable verification. After verification, we will delete or anonymise eligible personal data within a reasonable period, except where retention is required by law, security, or dispute resolution. Subscription cancellation must be managed through Google Play or the applicable app store.</p>

                    <h2>7. Children’s Privacy</h2>
                    <p>The App is intended for adults and is not directed to children. We do not knowingly collect personal information from children.</p>

                    <h2>8. Your Choices and Rights</h2>
                    <p>Depending on your location, you may request access, correction, deletion, withdrawal of consent, or restriction of applicable processing. You may also disable notifications or reset and limit your advertising identifier through device settings. Contact <a href="mailto:muhammed.munir97.mm@gmail.com">muhammed.munir97.mm@gmail.com</a> to exercise applicable rights.</p>

                    <h2>9. Changes and Contact</h2>
                    <p>We may update this Privacy Policy and will update the Last updated date. For questions or privacy requests, contact:</p>

                {:else}
                    <!-- MALAY CONTENT -->
                    <p>Baby Kick Tracker ("Aplikasi") dibangunkan dan diselenggara oleh <strong>Syanir</strong> ("kami", "kita"). Dasar Privasi ini menerangkan bagaimana maklumat dikumpul, digunakan, disimpan, dikongsi, dan dipadam apabila anda menggunakan Aplikasi ini.</p>
                    <p>Dengan menggunakan Baby Kick Tracker, anda bersetuju dengan amalan yang diterangkan dalam Dasar Privasi ini.</p>

                    <h2>1. Maklumat yang Kami Kumpul</h2>
                    <p>Apabila anda menggunakan Aplikasi ini, kami mungkin memproses maklumat akaun seperti nama anda, nama paparan, alamat e-mel, foto profil jika disediakan oleh penyedia log masuk anda, pengecam pengesahan, dan maklumat log masuk akaun. Aplikasi ini mungkin menggunakan Firebase Authentication dan Google Sign-In.</p>
                    <p>Anda boleh memasukkan maklumat kehamilan dan tendangan bayi seperti rekod sesi tendangan bayi, tarikh dan masa sesi, tempoh sesi, jumlah tendangan, maklumat profil kehamilan, anggaran tarikh bersalin, rekod hidrasi, rekod berat badan, rekod janji temu, rekod pemasa kontraksi, dan nota peribadi. Maklumat ini digunakan untuk menyediakan sejarah penjejakan peribadi, statistik, peringatan, dan ciri-ciri berkaitan anda.</p>
                    <p>Jika anda menggunakan pautan pasangan (partner linking), kami mungkin memproses kod jemputan, pengecam akaun pasangan, nama paparan pasangan, status pautan, dan maklumat penjejakan selamat pasangan yang dikongsi secara sengaja melalui ciri ini.</p>
                    <p>Aplikasi mungkin memproses platform peranti, sistem operasi, versi aplikasi, status kebenaran pemberitahuan, maklumat penjadualan pemberitahuan, dan maklumat zon masa yang diperlukan untuk menjadualkan peringatan tempatan dengan betul.</p>

                    <h2>2. Cara Kami Menggunakan Maklumat</h2>
                    <p>Kami menggunakan maklumat untuk mencipta dan menyelenggara akaun anda, menyediakan penjejakan dan statistik, memaparkan sejarah dan laporan, menyokong pautan pasangan, menjadualkan peringatan tempatan, menyediakan sokongan, mengekalkan keselamatan, mengesan penyalahgunaan, meningkatkan kebolehpercayaan, memaparkan iklan di mana didayakan dan dibenarkan, mengurus akses premium di mana didayakan, dan mematuhi kewajipan undang-undang.</p>
                    
                    <div class="alert-box">
                        <p>Baby Kick Tracker bukanlah satu perkhidmatan diagnosis perubatan atau kecemasan dan tidak menggantikan nasihat daripada profesional penjagaan kesihatan bertauliah. Jika anda mempunyai kebimbangan mengenai kehamilan anda atau pergerakan bayi anda, hubungi penyedia penjagaan kesihatan anda atau perkhidmatan kecemasan tempatan.</p>
                    </div>

                    <h2>3. Pengiklanan</h2>
                    <p>Jika pengiklanan didayakan, Aplikasi mungkin menggunakan Google Mobile Ads. Google Mobile Ads mungkin memproses pengecam pengiklanan, maklumat peranti, anggaran lokasi yang disimpulkan dari alamat IP, maklumat interaksi iklan, diagnostik, dan maklumat prestasi. Pengiklanan mungkin diperibadikan atau tidak diperibadikan bergantung pada pilihan persetujuan, tetapan peranti, wilayah, dan undang-undang yang terpakai.</p>
                    <ul class="policy-links">
                        <li><span>Dasar Privasi Google: </span><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></li>
                        <li><span>Privasi dan Keselamatan Firebase: </span><a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">https://firebase.google.com/support/privacy</a></li>
                    </ul>

                    <h2>4. Langganan</h2>
                    <p>Jika ciri langganan premium didayakan, Aplikasi mungkin menggunakan RevenueCat untuk mengurus status langganan. RevenueCat mungkin memproses pengecam pengguna aplikasi tanpa nama, status pembelian dan langganan, maklumat produk, maklumat kelayakan, dan maklumat berkaitan transaksi yang diterima dari gedung aplikasi yang berkenaan. Pembayaran diproses oleh Google Play atau gedung aplikasi yang berkenaan. Kami tidak menerima atau menyimpan nombor kad pembayaran penuh anda.</p>
                    <ul class="policy-links">
                        <li><span>Dasar Privasi RevenueCat: </span><a href="https://www.revenuecat.com/privacy/" target="_blank" rel="noopener noreferrer">https://www.revenuecat.com/privacy/</a></li>
                    </ul>

                    <h2>5. Penyimpanan dan Perkongsian Data</h2>
                    <p>Data akaun dan aplikasi mungkin disimpan menggunakan Firebase Authentication dan Cloud Firestore. Kami tidak menjual maklumat peribadi anda. Maklumat mungkin dikongsi dengan penyedia infrastruktur, penyedia pengiklanan di mana didayakan, penyedia langganan di mana didayakan, pasangan berpaut (linked partner) melalui ciri yang didayakan secara sengaja, atau pihak berkuasa jika dikehendaki oleh undang-undang.</p>

                    <h2>6. Pengekalan dan Pemadaman Data</h2>
                    <p>Kami menyimpan maklumat hanya selagi perlu untuk menyediakan Aplikasi, mengekalkan keselamatan, mematuhi undang-undang, menyelesaikan pertikaian, dan menguatkuasakan perjanjian. Memadam Aplikasi tidak akan memadamkan data bahagian pelayan (server) secara automatik.</p>
                    
                    <div class="contact-card">
                        <h3>Untuk meminta pemadaman akaun dan data peribadi yang berkaitan, hubungi:</h3>
                        <p><strong>E-mel:</strong> <a href="mailto:muhammed.munir97.mm@gmail.com">muhammed.munir97.mm@gmail.com</a></p>
                        <p><strong>Subjek:</strong> Baby Kick Tracker Account Deletion Request</p>
                    </div>
                    
                    <p>Sertakan alamat e-mel akaun anda, nama paparan jika terpakai, dan maklumat yang diperlukan untuk mengesahkan pemilikan akaun. Kami mungkin meminta pengesahan yang munasabah. Selepas pengesahan, kami akan memadam atau menyembunyikan (anonymise) data peribadi yang layak dalam tempoh yang munasabah, kecuali jika pengekalan diperlukan oleh undang-undang, keselamatan, atau penyelesaian pertikaian. Pembatalan langganan mesti diuruskan melalui Google Play atau gedung aplikasi yang berkenaan.</p>

                    <h2>7. Privasi Kanak-Kanak</h2>
                    <p>Aplikasi ini bertujuan untuk orang dewasa dan tidak ditujukan kepada kanak-kanak. Kami tidak mengumpul maklumat peribadi daripada kanak-kanak secara sedar.</p>

                    <h2>8. Pilihan dan Hak Anda</h2>
                    <p>Bergantung pada lokasi anda, anda mungkin meminta akses, pembetulan, pemadaman, penarikan balik persetujuan, atau sekatan pemprosesan yang terpakai. Anda juga boleh melumpuhkan pemberitahuan atau menetapkan semula dan mengehadkan pengecam pengiklanan anda melalui tetapan peranti. Hubungi <a href="mailto:muhammed.munir97.mm@gmail.com">muhammed.munir97.mm@gmail.com</a> untuk melaksanakan hak yang berkenaan.</p>

                    <h2>9. Perubahan dan Hubungan</h2>
                    <p>Kami mungkin mengemas kini Dasar Privasi ini dan akan mengemas kini tarikh "Tarikh kemas kini". Untuk soalan atau permintaan privasi, hubungi:</p>
                {/if}
                
                <div class="contact-card">
                    <ul class="developer-info">
                        <li><strong>Developer:</strong> Syanir</li>
                        <li><strong>Email:</strong> <a href="mailto:muhammed.munir97.mm@gmail.com">muhammed.munir97.mm@gmail.com</a></li>
                        <li><strong>Country:</strong> Malaysia</li>
                    </ul>
                </div>
            </div>
            
            <div class="privacy-footer">
                &copy; 2026 Syanir. All rights reserved.
            </div>
        </div>
        <div class="return-link-wrapper">
            <a href="/" class="return-link">&larr; {lang === 'en' ? 'Return to Portfolio' : 'Kembali ke Portfolio'}</a>
        </div>
    </div>
</div>

<style>
    /* 
     * We use !important rules heavily here to completely shield this page 
     * from the global 'layout.css' which applies dark themes and serif fonts 
     * to body, h1, h2, p, and a tags.
     */
     
    .privacy-container {
        font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
        background-color: #FFF0F5 !important;
        color: #334155 !important;
        min-height: 100vh;
        width: 100%;
        padding: 3rem 1rem;
        box-sizing: border-box;
    }

    .privacy-container * {
        box-sizing: border-box;
    }

    .privacy-wrapper {
        max-width: 850px;
        margin: 0 auto;
    }

    .privacy-card {
        background-color: #ffffff !important;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(225, 29, 72, 0.08);
        border: 1px solid #ffe4e6;
    }

    .privacy-header {
        background: linear-gradient(135deg, #fb7185, #fda4af);
        padding: 3rem 2rem;
        text-align: center;
        position: relative;
    }

    .lang-toggle {
        margin-top: 1.5rem;
        display: inline-flex;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 99px;
        padding: 0.25rem;
    }

    .lang-toggle button {
        background: transparent;
        border: none;
        color: #ffffff;
        padding: 0.5rem 1rem;
        border-radius: 99px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Inter', system-ui, sans-serif !important;
    }

    .lang-toggle button:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .lang-toggle button.active {
        background: #ffffff;
        color: #e11d48;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .logo-wrapper {
        display: inline-block;
        background: #ffffff;
        border-radius: 50%;
        padding: 15px;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .app-logo {
        width: 85px !important;
        height: 85px !important;
        object-fit: contain;
        display: block;
    }

    .privacy-container h1.app-title {
        color: #ffffff !important;
        font-size: 2.5rem !important;
        font-weight: 800 !important;
        margin: 0 0 0.5rem 0 !important;
        font-family: 'Inter', system-ui, sans-serif !important;
        letter-spacing: -0.02em;
    }

    .privacy-container p.app-subtitle {
        color: #fff1f2 !important;
        font-size: 1.2rem !important;
        font-weight: 500 !important;
        margin: 0 !important;
    }

    .privacy-content {
        padding: 3rem;
        font-size: 1.05rem;
        line-height: 1.8;
    }

    .privacy-content p {
        color: #475569 !important;
        margin-bottom: 1.2rem !important;
    }

    .privacy-container h2 {
        color: #e11d48 !important;
        font-size: 1.6rem !important;
        font-weight: 700 !important;
        margin-top: 2.5rem !important;
        margin-bottom: 1.2rem !important;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #ffe4e6;
        font-family: 'Inter', system-ui, sans-serif !important;
    }

    .last-updated {
        font-size: 0.95rem !important;
        color: #94a3b8 !important;
        font-style: italic;
        margin-bottom: 2.5rem !important;
    }

    .alert-box {
        background-color: #fff1f2;
        border-left: 4px solid #fb7185;
        padding: 1.2rem 1.5rem;
        border-radius: 0 8px 8px 0;
        margin: 1.5rem 0;
    }

    .alert-box p {
        color: #be123c !important;
        margin: 0 !important;
        font-size: 0.95rem !important;
    }

    .privacy-container a {
        color: #e11d48 !important;
        text-decoration: none !important;
        font-weight: 500;
        transition: color 0.2s;
        /* Fix mobile overflow issue for long URLs */
        word-wrap: break-word !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        display: inline-block;
        max-width: 100%;
    }

    .privacy-container a:hover {
        color: #be123c !important;
        text-decoration: underline !important;
    }

    .policy-links {
        list-style-type: disc;
        padding-left: 1.5rem;
        margin-bottom: 1.5rem;
        color: #fb7185;
    }

    .policy-links li {
        margin-bottom: 0.5rem;
    }

    .policy-links span {
        color: #475569;
    }

    .contact-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 1.5rem;
        border-radius: 12px;
        margin: 1.5rem 0;
    }

    .contact-card h3 {
        color: #334155 !important;
        font-size: 1.1rem !important;
        font-weight: 600 !important;
        margin: 0 0 1rem 0 !important;
        font-family: 'Inter', system-ui, sans-serif !important;
    }

    .contact-card p {
        margin-bottom: 0.5rem !important;
        color: #475569 !important;
    }

    .contact-card strong {
        color: #334155;
    }

    .developer-info {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .developer-info li {
        margin-bottom: 0.75rem;
        color: #475569;
        display: flex;
        flex-wrap: wrap;
    }

    .developer-info strong {
        width: 100px;
        color: #334155;
    }

    .privacy-footer {
        background-color: #f8fafc;
        border-top: 1px solid #f1f5f9;
        padding: 1.5rem;
        text-align: center;
        color: #94a3b8;
        font-size: 0.95rem;
    }

    .return-link-wrapper {
        text-align: center;
        margin-top: 2rem;
    }

    .return-link {
        display: inline-block;
        background: #ffffff;
        color: #e11d48 !important;
        padding: 0.85rem 2rem;
        border-radius: 99px;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(225, 29, 72, 0.1);
        border: 1px solid #ffe4e6;
        transition: all 0.2s;
    }

    .return-link:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(225, 29, 72, 0.15);
    }

    @media (max-width: 640px) {
        .privacy-container {
            padding: 1.5rem 0.5rem;
        }
        .privacy-content {
            padding: 1.5rem 1rem;
        }
        .privacy-header {
            padding: 2rem 1rem;
        }
        .privacy-container h1.app-title {
            font-size: 1.8rem !important;
        }
        .developer-info strong {
            width: 100%;
            margin-bottom: 0.25rem;
        }
    }
</style>
