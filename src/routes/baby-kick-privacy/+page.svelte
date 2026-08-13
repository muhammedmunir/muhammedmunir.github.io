<script>
    import { onMount } from 'svelte';
    
    // SvelteKit layouts might set a global dark background on the body tag.
    // We override it here when this page mounts to ensure the entire screen uses our app theme.
    onMount(() => {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#FFF0F5';

        // Override the favicon dynamically
        let originalFaviconHref = '';
        const faviconLink = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
        if (faviconLink) {
            originalFaviconHref = faviconLink.href;
            faviconLink.href = '/Logo_BiK.png';
        } else {
            // If no favicon exists, create one
            const newFavicon = document.createElement('link');
            newFavicon.rel = 'icon';
            newFavicon.href = '/Logo_BiK.png';
            document.head.appendChild(newFavicon);
        }
        
        return () => {
            document.body.style.backgroundColor = originalBg;
            // Restore original favicon
            if (faviconLink && originalFaviconHref) {
                faviconLink.href = originalFaviconHref;
            } else if (!faviconLink) {
                const addedFavicon = document.querySelector('link[href="/Logo_BiK.png"]');
                if (addedFavicon) addedFavicon.remove();
            }
        };
    });
</script>

<svelte:head>
    <title>Baby Kick Tracker - Privacy Policy</title>
    <meta name="robots" content="noindex" />
    <link rel="icon" href="/Logo_BiK.png" />
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
                <p class="app-subtitle">Privacy Policy</p>
            </div>
            
            <!-- Content Section -->
            <div class="privacy-content">
                <p class="last-updated">Last updated: 13/08/2026</p>

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
            <a href="/" class="return-link">&larr; Return to Portfolio</a>
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
