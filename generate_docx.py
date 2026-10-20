import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_margins(cell, top=40, bottom=40, left=40, right=40):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_bottom_border(paragraph):
    pPr = paragraph._element.get_or_add_pPr()
    pBdr = parse_xml(r'<w:pBdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
                     r'<w:bottom w:val="single" w:sz="12" w:space="4" w:color="CBD5E1"/>'
                     r'</w:pBdr>')
    pPr.append(pBdr)

def create_resume_docx(output_path):
    doc = docx.Document()
    
    # Page setup - Margins 0.42 in
    for section in doc.sections:
        section.top_margin = Inches(0.42)
        section.bottom_margin = Inches(0.42)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)
        section.page_width = Inches(8.27)  # A4
        section.page_height = Inches(11.69)
    
    COLOR_PRIMARY = RGBColor(15, 23, 42)    # #0f172a
    COLOR_BLUE = RGBColor(29, 78, 216)      # #1d4ed8
    COLOR_MUTED = RGBColor(71, 85, 105)     # #475569
    COLOR_BODY = RGBColor(51, 65, 85)       # #334155
    
    def add_section_header(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(5)
        p.paragraph_format.space_after = Pt(2.5)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(title.upper())
        run.bold = True
        run.font.name = 'Calibri'
        run.font.size = Pt(10.5)
        run.font.color.rgb = COLOR_PRIMARY
        add_bottom_border(p)
        return p

    def add_bullet(p, bold_prefix, text):
        p.paragraph_format.left_indent = Inches(0.18)
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(1.5)
        p.paragraph_format.line_spacing = 1.15
        
        b_run = p.add_run("•  ")
        b_run.font.name = 'Calibri'
        b_run.font.size = Pt(8.5)
        b_run.font.color.rgb = COLOR_MUTED
        
        if bold_prefix:
            bp_run = p.add_run(bold_prefix)
            bp_run.bold = True
            bp_run.font.name = 'Calibri'
            bp_run.font.size = Pt(9)
            bp_run.font.color.rgb = COLOR_PRIMARY
            
        t_run = p.add_run(text)
        t_run.font.name = 'Calibri'
        t_run.font.size = Pt(9)
        t_run.font.color.rgb = COLOR_BODY

    def add_entry_header(title, company, dates, location=None):
        table = doc.add_table(rows=1, cols=2)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        table.columns[0].width = Inches(5.4)
        table.columns[1].width = Inches(1.87)
        
        row = table.rows[0]
        set_cell_margins(row.cells[0], top=15, bottom=8, left=0, right=0)
        set_cell_margins(row.cells[1], top=15, bottom=8, left=0, right=0)
        
        p_left = row.cells[0].paragraphs[0]
        p_left.paragraph_format.space_before = Pt(1.5)
        p_left.paragraph_format.space_after = Pt(0)
        p_left.paragraph_format.line_spacing = 1.15
        
        r1 = p_left.add_run(title)
        r1.bold = True
        r1.font.name = 'Calibri'
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = COLOR_PRIMARY
        
        if company:
            r2 = p_left.add_run(f" — {company}")
            r2.bold = True
            r2.font.name = 'Calibri'
            r2.font.size = Pt(9.5)
            r2.font.color.rgb = COLOR_BLUE
            
        p_right = row.cells[1].paragraphs[0]
        p_right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_right.paragraph_format.space_before = Pt(1.5)
        p_right.paragraph_format.space_after = Pt(0)
        p_right.paragraph_format.line_spacing = 1.15
        
        r3 = p_right.add_run(dates)
        r3.bold = True
        r3.font.name = 'Calibri'
        r3.font.size = Pt(8.5)
        r3.font.color.rgb = COLOR_MUTED
        
        if location:
            p_sub = doc.add_paragraph()
            p_sub.paragraph_format.space_before = Pt(0)
            p_sub.paragraph_format.space_after = Pt(1.5)
            p_sub.paragraph_format.line_spacing = 1.1
            r_loc = p_sub.add_run(location)
            r_loc.italic = True
            r_loc.font.name = 'Calibri'
            r_loc.font.size = Pt(8.5)
            r_loc.font.color.rgb = COLOR_MUTED

    # ================= HEADER WITH PHOTO =================
    header_table = doc.add_table(rows=1, cols=2)
    header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    header_table.autofit = False
    header_table.columns[0].width = Inches(1.15)
    header_table.columns[1].width = Inches(6.12)
    
    h_row = header_table.rows[0]
    set_cell_margins(h_row.cells[0], top=0, bottom=20, left=0, right=100)
    set_cell_margins(h_row.cells[1], top=0, bottom=20, left=50, right=0)
    
    # Left cell: Profile Photo
    p_photo = h_row.cells[0].paragraphs[0]
    p_photo.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_photo.paragraph_format.space_before = Pt(0)
    p_photo.paragraph_format.space_after = Pt(0)
    if os.path.exists("static/profile_photo.jpg"):
        p_photo.add_run().add_picture("static/profile_photo.jpg", width=Inches(0.95), height=Inches(1.22))
    
    # Right cell: Name & Info
    p_info = h_row.cells[1].paragraphs[0]
    p_info.paragraph_format.space_before = Pt(0)
    p_info.paragraph_format.space_after = Pt(1)
    r_name = p_info.add_run("MUHAMMED MUNIR BIN MOHD AZMI\n")
    r_name.bold = True
    r_name.font.name = 'Calibri'
    r_name.font.size = Pt(17)
    r_name.font.color.rgb = COLOR_PRIMARY
    
    r_head = p_info.add_run("Full-Stack Systems Engineer & IT Professional • Network Security (UTM)\n")
    r_head.bold = True
    r_head.font.name = 'Calibri'
    r_head.font.size = Pt(9.5)
    r_head.font.color.rgb = COLOR_BLUE
    
    r_c = p_info.add_run(
        "📍 Puchong, Selangor   |   📞 +60 13-563 6124   |   ✉️ muhammed.munir97.mm@gmail.com\n"
        "🌐 Portfolio: https://muhammedmunir.github.io/   |   🔗 LinkedIn: linkedin.com/in/muhammed-munir-bin-mohd-azmi-9b233b271   |   💻 GitHub: github.com/muhammedmunir"
    )
    r_c.font.name = 'Calibri'
    r_c.font.size = Pt(8.2)
    r_c.font.color.rgb = COLOR_BODY
    
    p_sep = doc.add_paragraph()
    p_sep.paragraph_format.space_before = Pt(2)
    p_sep.paragraph_format.space_after = Pt(2)
    add_bottom_border(p_sep)

    # ================= SUMMARY =================
    add_section_header("Professional Summary")
    p_sum = doc.add_paragraph()
    p_sum.paragraph_format.space_before = Pt(2)
    p_sum.paragraph_format.space_after = Pt(3)
    p_sum.paragraph_format.line_spacing = 1.15
    r_sum = p_sum.add_run(
        "Versatile, security-conscious Full-Stack Systems Engineer with proven experience developing and maintaining "
        "high-reliability enterprise platforms, public sector asset management systems, and AI-driven automation applications. "
        "Highly skilled in Vue.js 3, Laravel 11/12 (Filament), SvelteKit, Flutter, Docker Swarm, and Python Computer Vision, "
        "backed by an academic background in Computer Science (Network Security) from UTM, industry Cisco networking certifications, "
        "and hands-on Security Operations Center (SOC) threat defense experience at Tenaga Nasional Berhad (TNB)."
    )
    r_sum.font.name = 'Calibri'
    r_sum.font.size = Pt(8.8)
    r_sum.font.color.rgb = COLOR_BODY

    # ================= WORK EXPERIENCE =================
    add_section_header("Work Experience")

    # 1. YHCM
    add_entry_header("Programmer / Full-Stack Enterprise Developer", "YHCM Sdn Bhd", "Apr 2026 – Present", "Shah Alam, Selangor")
    for b in [
        ("Maintain & Upgrade Mission-Critical Systems: ", "Support enterprise web applications for the public/government sector (including eMesys, Sutera, and ADIMS), complying with strict data security, role-based access control (RBAC), and audit standards."),
        ("Modern Frontend & Admin Portals: ", "Architect modular user interfaces utilizing Vue.js 3 and streamline operations using Laravel Filament admin panels."),
        ("Database Architecture & Tuning: ", "Optimize relational schemas, indexes, and complex queries across MySQL, MariaDB, and PostgreSQL 17."),
        ("Containerization & Orchestration: ", "Deploy, manage, and scale microservices and container workloads using Docker and Docker Swarm."),
        ("Hybrid Infrastructure Administration: ", "Administer, harden, and troubleshoot hybrid production servers across Linux (Ubuntu) and Windows Server environments."),
        ("Tier-2/3 Technical Operations: ", "Resolve operational IT incidents, configure secure enterprise API integrations, and support day-to-day organizational IT workflows.")
    ]:
        p = doc.add_paragraph()
        add_bullet(p, b[0], b[1])

    # 2. Nova Bitara
    add_entry_header("IT Support & Web Developer", "Nova Bitara Development Sdn Bhd", "Dec 2025 – Mar 2026", "Sunway, Selangor")
    for b in [
        ("Collateralized Loan Platform (IWA001): ", "Engineered and deployed a production loan management system using SvelteKit and Supabase PostgreSQL with strict Row Level Security (RLS) policies and JWT auth, hosted on Vercel."),
        ("Trilingual Corporate Portal: ", "Built corporate web portal (Infinity World) using SvelteKit, Redis caching, and Resend transactional email API."),
        ("Commercial E-Commerce Platform: ", "Developed e-commerce platform using Laravel and MySQL, deployed on DirectAdmin with Cloudflare WAF/CDN."),
        ("Enterprise IT Operations: ", "Delivered comprehensive internal IT support, troubleshooting corporate hardware, operating systems, network connectivity, and DNS infrastructure.")
    ]:
        p = doc.add_paragraph()
        add_bullet(p, b[0], b[1])

    # 3. TNB Protege
    add_entry_header("Enterprise Mobility Solutions (Protégé)", "Tenaga Nasional Berhad (TNB)", "Apr 2025 – Dec 2025", "UOA Business Park, Shah Alam")
    for b in [
        ("Full-Stack Mobile Development: ", "Spearheaded full-stack development of Onboardx, an enterprise onboarding application utilizing Flutter (Dart) and JavaScript."),
        ("Multi-Database Integration: ", "Engineered multi-database architecture supporting Firebase Realtime DB, MongoDB, Supabase, and MySQL."),
        ("Azure Cloud Administration: ", "Configured and maintained Ubuntu cloud servers on Microsoft Azure, managing Network Security Groups (NSGs) and system resource monitoring."),
        ("DevOps & CI/CD Pipelines: ", "Automated build and delivery pipelines with Jenkins CI/CD and gained hands-on container orchestration experience with Kubernetes."),
        ("UI/UX Design & Support: ", "Designed user journeys in Figma; resolved technical user support tickets within strict SLA turnarounds.")
    ]:
        p = doc.add_paragraph()
        add_bullet(p, b[0], b[1])

    # 4. TNB Bangsar
    add_entry_header("Cyber Security Threat Defense (Internship)", "Tenaga Nasional Berhad (TNB)", "Sept 2023 – Feb 2024", "Platinum Bangsar, Kuala Lumpur")
    for b in [
        ("SOC Real-Time Threat Monitoring: ", "Monitored enterprise network traffic and web access logs via Splunk SIEM dashboards in an active Security Operations Center."),
        ("Red Team Vulnerability Analysis: ", "Collaborated with the Red Team using Vulhub Docker environments to reproduce and evaluate known CVE exploits."),
        ("Blue Team Defense Hardening: ", "Assisted in security patch verification, log audits, system configuration hardening, and compliance alignment with ISO 27001 and NIST frameworks.")
    ]:
        p = doc.add_paragraph()
        add_bullet(p, b[0], b[1])

    # 5. TNB Kota Bharu
    add_entry_header("Information & Communication Technology (Internship)", "Tenaga Nasional Berhad (TNB)", "Dec 2019 – Feb 2020", "Kota Bharu, Kelantan")
    for b in [
        ("Fiber Optic Topography & Costing: ", "Mapped regional fiber optic routes via Google Earth; calculated precision transmission distances and costing models in Excel."),
        ("Network Infrastructure Audits: ", "Assisted network engineers with signal attenuation testing, physical equipment audits, and preventive maintenance.")
    ]:
        p = doc.add_paragraph()
        add_bullet(p, b[0], b[1])

    # ================= FEATURED PROJECTS =================
    add_section_header("Featured Systems & Engineering Projects")

    projects = [
        ("TINDAK — AI-Powered Mobile Action Engine", "Flutter, Dart, Supabase RLS, Gemini AI",
         "Android rapid-action utility intercepting Share Intents to parse URLs, contact details, and payments locally via a regex/rule engine with Gemini AI fallback and Supabase RLS backend."),
        ("9Router Office — Autonomous AI Agent 3D Workspace", "Node.js 22+, Three.js, Model Context Protocol (MCP)",
         "Interactive 3D virtual office in Three.js where autonomous AI agents collaborate in real time using MCP SDK tools, voice synthesis, memory persistence, and Playwright MCP E2E automation."),
        ("Computer Vision & Win32 Desktop Automation Suite", "Python, OpenCV, CustomTkinter, Win32 API",
         "Advanced desktop automation framework utilizing multi-scale SIFT pyramid matching, CIELAB color segmentation, closed-loop visual servoing, dynamic OCR, and multithreaded GUI."),
        ("Baby Kicking Suite — Mobile Maternal Health Tracker", "Flutter, Dart, Firebase Firestore & Functions",
         "Cross-platform Flutter maternal wellness app enabling expectant mothers to track fetal movements with real-time Firebase sync, irregularity trend alerts, and structured clinical PDF export."),
        ("Lumina Glass Studio & Smart Mirror Visualizer", "SvelteKit, Tailwind CSS, Laravel 11 RESTful API",
         "Interactive LED smart mirror configurator featuring Kelvin color temperature (3000K–6500K) controls, backed by Laravel 11 RESTful API with 100% PHPUnit feature test coverage.")
    ]

    for proj in projects:
        add_entry_header(proj[0], proj[1], "Portfolio Showcase")
        p = doc.add_paragraph()
        add_bullet(p, "", proj[2])

    # ================= TECHNICAL SKILLS =================
    add_section_header("Technical Skills")
    
    skills_data = [
        ("Frontend & Mobile:", "Vue.js 3, SvelteKit, Flutter (Dart), React.js, Tailwind CSS, HTML5, CSS3, JavaScript (ES6+), TypeScript, Three.js"),
        ("Backend & APIs:", "Laravel 11/12 (PHP 8.2+), Laravel Filament, Node.js, Python, RESTful APIs, C#, C++, Java"),
        ("Databases & Cloud:", "PostgreSQL (RLS), MySQL, MariaDB, Supabase, Firebase (Firestore & Realtime DB), MongoDB, Redis, Microsoft Azure, Vercel"),
        ("DevOps & Security:", "Docker, Docker Swarm, Jenkins, Kubernetes (Basic), Git / GitHub, Cloudflare WAF/CDN, DirectAdmin, Splunk SIEM, Wireshark, Vulhub, Firewall & VPN, ISO 27001, NIST"),
        ("AI, Systems & Tools:", "Model Context Protocol (MCP), OpenCV, Gemini AI, Playwright, Linux (Ubuntu, Kali), Windows Server, Figma, Microsoft Power BI")
    ]

    t_skills = doc.add_table(rows=len(skills_data), cols=2)
    t_skills.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_skills.autofit = False
    t_skills.columns[0].width = Inches(1.7)
    t_skills.columns[1].width = Inches(5.57)

    for i, (cat, val) in enumerate(skills_data):
        row = t_skills.rows[i]
        set_cell_margins(row.cells[0], top=12, bottom=12, left=0, right=0)
        set_cell_margins(row.cells[1], top=12, bottom=12, left=0, right=0)
        
        p0 = row.cells[0].paragraphs[0]
        p0.paragraph_format.space_before = Pt(1)
        p0.paragraph_format.space_after = Pt(1)
        r0 = p0.add_run(cat)
        r0.bold = True
        r0.font.name = 'Calibri'
        r0.font.size = Pt(8.5)
        r0.font.color.rgb = COLOR_PRIMARY
        
        p1 = row.cells[1].paragraphs[0]
        p1.paragraph_format.space_before = Pt(1)
        p1.paragraph_format.space_after = Pt(1)
        r1 = p1.add_run(val)
        r1.font.name = 'Calibri'
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = COLOR_BODY

    # ================= EDUCATION & CERTIFICATIONS =================
    add_section_header("Education & Certifications")

    add_entry_header("Bachelor of Computer Science (Network Security)", "Universiti Teknologi Malaysia (UTM)", "2021 – 2024  |  CGPA: 3.17", "Johor Bahru, Johor")
    p_b1 = doc.add_paragraph()
    add_bullet(p_b1, "Final Year Project: ", "Geospatial Reporting Management System for UTM (SvelteKit, Tailwind CSS, Google Maps API, Supabase).")
    p_b2 = doc.add_paragraph()
    add_bullet(p_b2, "Key Coursework: ", "Ethical Hacking & Penetration Testing, Cybersecurity Governance & Compliance, Network Security.")

    add_entry_header("Diploma in Computer Science", "Universiti Teknologi Malaysia (UTM)", "2017 – 2020  |  CGPA: 2.72", "Kuala Lumpur")
    p_d1 = doc.add_paragraph()
    add_bullet(p_d1, "Final Year Project: ", "E-Commerce Web Platform with user authentication, catalog management, and payment flows (PHP, MySQL, Azure).")
    p_d2 = doc.add_paragraph()
    add_bullet(p_d2, "Key Coursework: ", "Object-Oriented Programming (C#), Structured Programming (C++), Java Programming.")

    p_cert1 = doc.add_paragraph()
    add_bullet(p_cert1, "Cisco Certifications: ", "CCNAv7: Introduction to Networks • CCNAv7: Switching, Routing & Wireless Essentials • Cisco DevNet Associate • Cisco Network Security • IoT Fundamentals: Connecting Things")
    p_cert2 = doc.add_paragraph()
    add_bullet(p_cert2, "Specialized Analytics: ", "Microsoft Power BI Data Analysis (Jan 2025) • Python for Data Analysis (Dec 2024)")

    # ================= LANGUAGES =================
    add_section_header("Languages")
    p_lang = doc.add_paragraph()
    p_lang.paragraph_format.space_before = Pt(1)
    p_lang.paragraph_format.space_after = Pt(2)
    r_l1 = p_lang.add_run("Malay: ")
    r_l1.bold = True
    r_l1.font.name = 'Calibri'
    r_l1.font.size = Pt(8.5)
    r_l2 = p_lang.add_run("Native / Bilingual Proficiency     |     ")
    r_l2.font.name = 'Calibri'
    r_l2.font.size = Pt(8.5)
    r_l3 = p_lang.add_run("English: ")
    r_l3.bold = True
    r_l3.font.name = 'Calibri'
    r_l3.font.size = Pt(8.5)
    r_l4 = p_lang.add_run("Professional Working Proficiency")
    r_l4.font.name = 'Calibri'
    r_l4.font.size = Pt(8.5)

    doc.save(output_path)
    print(f"Saved DOCX to: {output_path}")

if __name__ == "__main__":
    create_resume_docx("Resume ATS Muhammed Munir final.docx")
    dl_path = r"C:\Users\KELUARGA AZMI\Downloads\Resume ATS Muhammed Munir final.docx"
    try:
        create_resume_docx(dl_path)
    except Exception as e:
        print("Note on DL path:", e)
