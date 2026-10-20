import os
from playwright.sync_api import sync_playwright
import pypdf

HTML_RESUME = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Muhammed Munir - ATS Resume</title>
<style>
  @page {
    size: A4;
    margin: 8mm 13mm 8mm 13mm;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #0f172a;
    line-height: 1.34;
    font-size: 8.9pt;
    background: #ffffff;
  }
  a {
    color: #1d4ed8;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }

  /* Header */
  .header {
    text-align: center;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 5px;
    margin-bottom: 7px;
  }
  .name {
    font-size: 18.5pt;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: #0f172a;
    text-transform: uppercase;
  }
  .headline {
    font-size: 9.8pt;
    font-weight: 600;
    color: #1d4ed8;
    margin-top: 1px;
    margin-bottom: 3px;
  }
  .contact-bar {
    font-size: 8.4pt;
    color: #334155;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 3px 10px;
  }
  .contact-item {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  .separator {
    color: #94a3b8;
  }

  /* Section Styling */
  .section {
    margin-bottom: 7.5px;
  }
  .section-title {
    font-size: 9.6pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #0f172a;
    border-bottom: 1.5px solid #cbd5e1;
    padding-bottom: 1.5px;
    margin-bottom: 4.5px;
  }

  /* Summary */
  .summary-text {
    font-size: 8.7pt;
    color: #334155;
    text-align: justify;
    line-height: 1.36;
  }

  /* Entries */
  .entry {
    margin-bottom: 5px;
    page-break-inside: avoid;
  }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1px;
  }
  .entry-title {
    font-size: 9.1pt;
    font-weight: 700;
    color: #0f172a;
  }
  .entry-company {
    font-size: 8.9pt;
    font-weight: 600;
    color: #1d4ed8;
  }
  .entry-dates {
    font-size: 8.4pt;
    font-weight: 600;
    color: #475569;
    white-space: nowrap;
  }
  .entry-location {
    font-size: 8.1pt;
    color: #64748b;
    font-style: italic;
  }

  ul.bullets {
    margin-left: 14px;
    margin-top: 1.5px;
    margin-bottom: 1.5px;
  }
  ul.bullets li {
    font-size: 8.5pt;
    color: #334155;
    margin-bottom: 1.5px;
    line-height: 1.32;
  }
  ul.bullets li strong {
    color: #0f172a;
  }

  /* Page Break Control */
  .page-two {
    page-break-before: always;
  }

  /* Projects */
  .project-entry {
    margin-bottom: 4.5px;
    page-break-inside: avoid;
  }
  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .project-title {
    font-size: 8.9pt;
    font-weight: 700;
    color: #0f172a;
  }
  .project-tech {
    font-size: 8.1pt;
    color: #475569;
    font-weight: 500;
  }
  .project-link {
    font-size: 8.1pt;
    font-weight: 600;
    white-space: nowrap;
  }

  /* Skills Table */
  .skills-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
  }
  .skills-table td {
    padding: 1.6px 0;
    vertical-align: top;
  }
  .skill-label {
    width: 22%;
    font-weight: 700;
    color: #0f172a;
    font-size: 8.4pt;
  }
  .skill-list {
    width: 78%;
    color: #334155;
    font-size: 8.4pt;
  }

  /* Education */
  .edu-entry {
    margin-bottom: 4px;
    page-break-inside: avoid;
  }

  .cert-list {
    font-size: 8.4pt;
    color: #334155;
    margin-top: 2.5px;
    line-height: 1.33;
  }
</style>
</head>
<body>

  <!-- ==================== PAGE 1 ==================== -->
  <!-- HEADER -->
  <div class="header">
    <div class="name">Muhammed Munir Bin Mohd Azmi</div>
    <div class="headline">Full-Stack Systems Engineer &amp; IT Professional &bull; Network Security (UTM)</div>
    <div class="contact-bar">
      <span class="contact-item">📍 Bandar Puteri, Puchong, Selangor</span>
      <span class="separator">&bull;</span>
      <span class="contact-item">📞 +60 13-563 6124</span>
      <span class="separator">&bull;</span>
      <span class="contact-item">✉️ <a href="mailto:muhammed.munir97.mm@gmail.com">muhammed.munir97.mm@gmail.com</a></span>
      <span class="separator">&bull;</span>
      <span class="contact-item">🌐 <a href="https://muhammedmunir.github.io/">muhammedmunir.github.io</a></span>
      <span class="separator">&bull;</span>
      <span class="contact-item">🔗 <a href="https://www.linkedin.com/in/muhammed-munir-bin-mohd-azmi-9b233b271">LinkedIn</a></span>
      <span class="separator">&bull;</span>
      <span class="contact-item">💻 <a href="https://github.com/muhammedmunir">GitHub</a></span>
    </div>
  </div>

  <!-- SUMMARY -->
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="summary-text">
      Versatile, security-conscious <strong>Full-Stack Systems Engineer</strong> with proven experience developing and maintaining high-reliability enterprise platforms, public sector asset management systems, and AI-driven automation applications. Highly skilled in <strong>Vue.js 3, Laravel 11/12 (Filament), SvelteKit, Flutter, Docker Swarm</strong>, and <strong>Python Computer Vision</strong>, backed by an academic background in <strong>Computer Science (Network Security) from UTM</strong>, industry Cisco networking certifications, and hands-on Security Operations Center (SOC) threat defense experience at Tenaga Nasional Berhad (TNB).
    </div>
  </div>

  <!-- WORK EXPERIENCE -->
  <div class="section" style="margin-bottom: 0;">
    <div class="section-title">Work Experience</div>

    <!-- YHCM -->
    <div class="entry">
      <div class="entry-header">
        <div>
          <span class="entry-title">Programmer / Full-Stack Enterprise Developer</span>
          &mdash; <span class="entry-company">YHCM Sdn Bhd</span>
        </div>
        <div class="entry-dates">Apr 2026 &ndash; Present</div>
      </div>
      <div class="entry-location">Shah Alam, Selangor</div>
      <ul class="bullets">
        <li>Maintain and upgrade mission-critical enterprise web systems for the public/government sector (including <strong>eMesys</strong>, <strong>Sutera</strong>, and <strong>ADIMS</strong>), complying with stringent data security, role-based access control (RBAC), and audit standards.</li>
        <li>Architect and build modular frontend interfaces using <strong>Vue.js 3</strong> and streamline administration workflows with <strong>Laravel Filament</strong>.</li>
        <li>Manage and optimize relational databases across <strong>MySQL, MariaDB</strong>, and <strong>PostgreSQL 17</strong> with indexing and schema enhancements.</li>
        <li>Deploy, monitor, and scale containerized services and image workflows using <strong>Docker</strong> and <strong>Docker Swarm</strong> across production nodes.</li>
        <li>Administer and harden hybrid server infrastructure across <strong>Linux (Ubuntu)</strong> and <strong>Windows Server</strong> environments, ensuring high availability.</li>
        <li>Resolve operational IT incidents, provide tier-2/3 technical support, and configure secure API integrations for organizational operations.</li>
      </ul>
    </div>

    <!-- NOVA BITARA -->
    <div class="entry">
      <div class="entry-header">
        <div>
          <span class="entry-title">IT Support &amp; Web Developer</span>
          &mdash; <span class="entry-company">Nova Bitara Development Sdn Bhd</span>
        </div>
        <div class="entry-dates">Dec 2025 &ndash; Mar 2026</div>
      </div>
      <div class="entry-location">Sunway, Selangor</div>
      <ul class="bullets">
        <li>Engineered and deployed a production <strong>Collateralized Loan Application System (IWA001)</strong> using <strong>SvelteKit</strong> and <strong>Supabase</strong> with Row Level Security (RLS) policies and JWT authentication, hosted on Vercel with GoDaddy DNS.</li>
        <li>Built a high-performance multilingual corporate portal (Infinity World) using <strong>SvelteKit</strong>, <strong>Redis</strong> caching, and Resend transactional email API.</li>
        <li>Developed and maintained a commercial e-commerce platform using <strong>Laravel</strong> and <strong>MySQL</strong>, hosted on DirectAdmin with IPserverone and Cloudflare WAF/CDN.</li>
        <li>Delivered comprehensive internal IT support, troubleshooting corporate hardware, operating systems, network connectivity, and DNS infrastructure.</li>
      </ul>
    </div>

    <!-- TNB PROTEGE -->
    <div class="entry">
      <div class="entry-header">
        <div>
          <span class="entry-title">Enterprise Mobility Solutions (Prot&eacute;g&eacute;)</span>
          &mdash; <span class="entry-company">Tenaga Nasional Berhad (TNB)</span>
        </div>
        <div class="entry-dates">Apr 2025 &ndash; Dec 2025</div>
      </div>
      <div class="entry-location">UOA Business Park, Shah Alam</div>
      <ul class="bullets">
        <li>Spearheaded full-stack development of <strong>Onboardx</strong>, an enterprise cross-platform onboarding application utilizing <strong>Flutter (Dart)</strong> and JavaScript.</li>
        <li>Engineered multi-database architecture supporting <strong>Firebase Realtime DB, MongoDB, Supabase</strong>, and <strong>MySQL</strong>.</li>
        <li>Configured and maintained Ubuntu cloud servers on <strong>Microsoft Azure</strong>, managing Network Security Groups (NSGs) and system resource monitoring.</li>
        <li>Automated build and delivery pipelines with <strong>Jenkins CI/CD</strong> and gained practical experience in container orchestration with <strong>Kubernetes</strong>.</li>
        <li>Designed intuitive user experiences and interface wireframes in <strong>Figma</strong>; resolved technical support tickets within strict SLA targets.</li>
      </ul>
    </div>

    <!-- TNB BANGSAR -->
    <div class="entry">
      <div class="entry-header">
        <div>
          <span class="entry-title">Cyber Security Threat Defense (Internship)</span>
          &mdash; <span class="entry-company">Tenaga Nasional Berhad (TNB)</span>
        </div>
        <div class="entry-dates">Sept 2023 &ndash; Feb 2024</div>
      </div>
      <div class="entry-location">Platinum Bangsar, Kuala Lumpur</div>
      <ul class="bullets">
        <li>Monitored enterprise network traffic and web access logs in real time using <strong>Splunk SIEM</strong> dashboards within an active SOC environment.</li>
        <li>Collaborated with the Red Team using <strong>Vulhub</strong> Docker laboratories to reproduce, test, and analyze known CVE vulnerabilities.</li>
        <li>Assisted the Blue Team in defense hardening, log audits, security patch verifications, and compliance alignment with ISO 27001 and NIST guidelines.</li>
      </ul>
    </div>

    <!-- TNB KOTA BHARU -->
    <div class="entry">
      <div class="entry-header">
        <div>
          <span class="entry-title">Information &amp; Communication Technology (Internship)</span>
          &mdash; <span class="entry-company">Tenaga Nasional Berhad (TNB)</span>
        </div>
        <div class="entry-dates">Dec 2019 &ndash; Feb 2020</div>
      </div>
      <div class="entry-location">Kota Bharu, Kelantan</div>
      <ul class="bullets">
        <li>Mapped regional fiber optic route topologies using <strong>Google Earth</strong>; computed precision route distances and deployment costing models in Excel.</li>
        <li>Assisted network engineers with signal attenuation testing, physical infrastructure audits, and preventative maintenance.</li>
      </ul>
    </div>
  </div>


  <!-- ==================== PAGE 2 ==================== -->
  <!-- KEY PROJECTS -->
  <div class="section page-two">
    <div class="section-title">Featured Systems &amp; Engineering Projects</div>

    <div class="project-entry">
      <div class="project-header">
        <div>
          <span class="project-title">TINDAK &mdash; AI-Powered Mobile Action Engine</span>
          <span class="project-tech">| Flutter, Dart, Supabase RLS, Gemini AI</span>
        </div>
        <div class="project-link"><a href="https://muhammedmunir.github.io/#projects">Live Demo &bull; Portfolio</a></div>
      </div>
      <ul class="bullets">
        <li>Engineered an Android rapid-action utility capturing mobile Share Intents to parse URLs, contact numbers, and payment details locally.</li>
        <li>Designed a local-first regex/rule parser with Gemini AI fallback, coupled with a Supabase backend validated with strict RLS security policies.</li>
      </ul>
    </div>

    <div class="project-entry">
      <div class="project-header">
        <div>
          <span class="project-title">9Router Office &mdash; Autonomous AI Agent 3D Workspace</span>
          <span class="project-tech">| Node.js 22+, Three.js, Model Context Protocol (MCP)</span>
        </div>
        <div class="project-link"><a href="https://muhammedmunir.github.io/#projects">Live Demo &bull; Portfolio</a></div>
      </div>
      <ul class="bullets">
        <li>Created an interactive 3D virtual workspace in Three.js where autonomous AI agents communicate in real time via Model Context Protocol (MCP).</li>
        <li>Integrated dynamic voice synthesis, agent state persistence, and end-to-end automated UI/API testing utilizing Playwright MCP.</li>
      </ul>
    </div>

    <div class="project-entry">
      <div class="project-header">
        <div>
          <span class="project-title">Computer Vision &amp; Win32 Desktop Automation Suite</span>
          <span class="project-tech">| Python, OpenCV, CustomTkinter, Win32 API</span>
        </div>
        <div class="project-link"><a href="https://muhammedmunir.github.io/#projects">Case Study &bull; Portfolio</a></div>
      </div>
      <ul class="bullets">
        <li>Built an advanced desktop automation suite utilizing multi-scale SIFT pyramid matching, CIELAB segmentation, and closed-loop visual servoing.</li>
        <li>Implemented dynamic OCR text extraction, native Win32 window safety boundaries, and a multithreaded CustomTkinter control GUI.</li>
      </ul>
    </div>

    <div class="project-entry">
      <div class="project-header">
        <div>
          <span class="project-title">Baby Kicking Suite &mdash; Mobile Maternal Health Tracker</span>
          <span class="project-tech">| Flutter, Dart, Firebase Firestore &amp; Functions</span>
        </div>
        <div class="project-link"><a href="https://muhammedmunir.github.io/#projects">Mobile App &bull; Portfolio</a></div>
      </div>
      <ul class="bullets">
        <li>Developed a cross-platform Flutter maternal wellness app enabling expectant mothers to record and track fetal movement patterns.</li>
        <li>Integrated Firebase Cloud Firestore real-time sync, movement irregularity alert analytics, and automated clinical PDF export for doctor visits.</li>
      </ul>
    </div>

    <div class="project-entry">
      <div class="project-header">
        <div>
          <span class="project-title">Lumina Glass Studio &amp; Smart Mirror Visualizer</span>
          <span class="project-tech">| SvelteKit, Tailwind CSS, Laravel 11 RESTful API</span>
        </div>
        <div class="project-link"><a href="https://muhammedmunir.github.io/#projects">Web App &bull; Portfolio</a></div>
      </div>
      <ul class="bullets">
        <li>Constructed an interactive LED smart mirror configurator featuring real-time Kelvin temperature (3000K–6500K) controls and texture shaders.</li>
        <li>Engineered a Laravel 11 RESTful backend with Eloquent models, Form Request validations, and 100% PHPUnit feature test coverage.</li>
      </ul>
    </div>
  </div>

  <!-- TECHNICAL SKILLS -->
  <div class="section">
    <div class="section-title">Technical Skills</div>
    <table class="skills-table">
      <tr>
        <td class="skill-label">Frontend &amp; Mobile:</td>
        <td class="skill-list">Vue.js 3, SvelteKit, Flutter (Dart), React.js, Tailwind CSS, HTML5, CSS3, JavaScript (ES6+), TypeScript, Three.js</td>
      </tr>
      <tr>
        <td class="skill-label">Backend &amp; APIs:</td>
        <td class="skill-list">Laravel 11/12 (PHP 8.2+), Laravel Filament, Node.js, Python, RESTful APIs, C#, C++, Java</td>
      </tr>
      <tr>
        <td class="skill-label">Databases &amp; Cloud:</td>
        <td class="skill-list">PostgreSQL (RLS), MySQL, MariaDB, Supabase, Firebase (Firestore &amp; Realtime DB), MongoDB, Redis, Microsoft Azure, Vercel</td>
      </tr>
      <tr>
        <td class="skill-label">DevOps &amp; Security:</td>
        <td class="skill-list">Docker, Docker Swarm, Jenkins, Kubernetes (Basic), Git / GitHub, Cloudflare WAF/CDN, DirectAdmin, Splunk SIEM, Wireshark, Vulhub, Firewall &amp; VPN, ISO 27001, NIST</td>
      </tr>
      <tr>
        <td class="skill-label">AI, Automation &amp; Tools:</td>
        <td class="skill-list">Model Context Protocol (MCP), OpenCV, Gemini AI, Playwright, Linux (Ubuntu, Kali), Windows Server, Figma, Microsoft Power BI</td>
      </tr>
    </table>
  </div>

  <!-- EDUCATION & CERTIFICATIONS -->
  <div class="section">
    <div class="section-title">Education &amp; Certifications</div>

    <div class="edu-entry">
      <div class="entry-header">
        <div>
          <span class="entry-title">Bachelor of Computer Science (Network Security)</span>
          &mdash; <span class="entry-company">Universiti Teknologi Malaysia (UTM)</span>
        </div>
        <div class="entry-dates">2021 &ndash; 2024 | CGPA: 3.17</div>
      </div>
      <div class="entry-location">Johor Bahru, Johor</div>
      <ul class="bullets">
        <li><strong>Final Year Project (FYP):</strong> Geospatial Reporting Management System for UTM (SvelteKit, Tailwind CSS, Google Maps API, Supabase).</li>
        <li><strong>Relevant Coursework:</strong> Ethical Hacking &amp; Penetration Testing, Cybersecurity Governance &amp; Compliance, Network Security.</li>
      </ul>
    </div>

    <div class="edu-entry">
      <div class="entry-header">
        <div>
          <span class="entry-title">Diploma in Computer Science</span>
          &mdash; <span class="entry-company">Universiti Teknologi Malaysia (UTM)</span>
        </div>
        <div class="entry-dates">2017 &ndash; 2020 | CGPA: 2.72</div>
      </div>
      <div class="entry-location">Kuala Lumpur</div>
      <ul class="bullets">
        <li><strong>Final Year Project:</strong> E-Commerce Web Platform with user authentication, catalog management, and payment flows (PHP, MySQL, Azure Ubuntu).</li>
        <li><strong>Relevant Coursework:</strong> Object-Oriented Programming (C#), Structured Programming (C++), Java Programming.</li>
      </ul>
    </div>

    <div class="cert-list">
      <div><strong>Cisco Certifications:</strong> CCNAv7: Introduction to Networks &bull; CCNAv7: Switching, Routing, and Wireless Essentials &bull; Cisco DevNet Associate &bull; Cisco Network Security &bull; IoT Fundamentals: Connecting Things</div>
      <div style="margin-top: 1.5px;"><strong>Specialized Analytics:</strong> Microsoft Power BI Data Analysis (Jan 2025) &bull; Python for Data Analysis (Dec 2024)</div>
    </div>
  </div>

  <!-- LANGUAGES -->
  <div class="section" style="margin-bottom: 0;">
    <div class="section-title">Languages</div>
    <div style="font-size: 8.5pt; color: #334155;">
      <strong>Malay:</strong> Native / Bilingual Proficiency &nbsp;&bull;&nbsp; <strong>English:</strong> Professional Working Proficiency
    </div>
  </div>

</body>
</html>
"""

def generate_pdf():
    html_path = os.path.abspath("resume_temp.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(HTML_RESUME)
    
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"file:///{html_path}")
        pdf_bytes = page.pdf(
            format="A4",
            print_background=True,
            margin={"top": "8mm", "bottom": "8mm", "left": "13mm", "right": "13mm"}
        )
        browser.close()
    
    targets = [
        "static/resume.pdf",
        "Resume ATS Muhammed Munir final.pdf",
        "build/resume.pdf"
    ]
    for target in targets:
        os.makedirs(os.path.dirname(os.path.abspath(target)), exist_ok=True)
        with open(target, "wb") as f:
            f.write(pdf_bytes)
        print(f"Saved PDF to: {target}")
    
    r = pypdf.PdfReader("static/resume.pdf")
    print(f"Generated PDF total pages: {len(r.pages)}")
    for i, page in enumerate(r.pages):
        print(f"--- PAGE {i+1} character count: {len(page.extract_text() or '')} ---")

if __name__ == "__main__":
    generate_pdf()
