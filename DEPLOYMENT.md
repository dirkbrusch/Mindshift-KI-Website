# Deployment-Anleitung — Mindshift KI Website

## Architektur

- **Hauptdomain:** `mindshift-ki.de` → GitHub Pages (statische Seite aus diesem Repo)
- **Formular-Subdomain:** `api.mindshift-ki.de` → IONOS-Webhosting (PHP-Handler `api/contact.php`)

Grund für die Trennung: GitHub Pages unterstützt kein PHP. Das Kontaktformular wird daher auf einer separaten IONOS-Subdomain mit PHP-Support gehostet. Das Formular in `index.html` postet an `https://api.mindshift-ki.de/contact.php`.

---

## 1. GitHub Pages (Hauptseite)

Repository: `dirkbrusch/Mindshift-KI-Website`

- Branch: `main`
- Pages-Quelle: Branch `main`, Verzeichnis `/`
- `CNAME` → `mindshift-ki.de`
- HTTPS erzwingen: aktivieren

### IONOS-DNS für die Hauptdomain

Im IONOS-Kundencenter unter **Domains & SSL → mindshift-ki.de → DNS** folgende Einträge setzen:

| Typ   | Hostname | Wert                                       | TTL  |
|-------|----------|--------------------------------------------|------|
| A     | @        | 185.199.108.153                            | 3600 |
| A     | @        | 185.199.109.153                            | 3600 |
| A     | @        | 185.199.110.153                            | 3600 |
| A     | @        | 185.199.111.153                            | 3600 |
| CNAME | www      | dirkbrusch.github.io                       | 3600 |

Anschließend in GitHub unter Settings → Pages die Custom-Domain `mindshift-ki.de` eintragen und „Enforce HTTPS" aktivieren.

---

## 2. Subdomain `api.mindshift-ki.de` (Kontaktformular)

### Schritt A — Subdomain in IONOS anlegen

1. IONOS-Kundencenter → **Domains & SSL → mindshift-ki.de → Subdomains**
2. „Subdomain erstellen" → `api`
3. Ziel: IONOS-Webhosting-Paket (PHP-fähig)
4. Document-Root: eigener Ordner, z. B. `/api.mindshift-ki.de/`
5. SSL-Zertifikat (Let's Encrypt) für `api.mindshift-ki.de` ausstellen

### Schritt B — PHP-Handler hochladen

Per SFTP/FTP die Datei `api/contact.php` aus diesem Repo in das Document-Root der Subdomain ablegen — so dass sie unter `https://api.mindshift-ki.de/contact.php` erreichbar ist.

### Schritt C — E-Mail-Postfächer einrichten

In IONOS unter **E-Mail → Postfächer** folgende Adressen einrichten bzw. umziehen:

- `dirk.brusch@mindshift-ki.de` (Haupt-Empfang, bestehende Adresse umziehen)
- `noreply@mindshift-ki.de` (Absender des Formulars)

### Schritt D — DNS für E-Mail (MX, SPF, DKIM)

IONOS setzt MX-Records automatisch, wenn ein IONOS-Postfach angelegt wird. Zusätzlich prüfen:

- **MX:** `mx00.ionos.de`, `mx01.ionos.de` (Priorität 10)
- **SPF (TXT auf @):** `v=spf1 include:_spf-de.ionos.com -all`
- **DKIM:** Im IONOS-Mail-Menü aktivieren, generierten TXT-Record als Subdomain hinzufügen
- **DMARC (TXT auf `_dmarc`):** `v=DMARC1; p=quarantine; rua=mailto:dirk.brusch@mindshift-ki.de`

---

## 3. Alte Domain `mindshift-ai-consultants.de`

Empfehlung: **301-Weiterleitung** auf `https://mindshift-ki.de/`, um SEO-Equity zu erhalten.

- IONOS → Domains → `mindshift-ai-consultants.de` → „Weiterleitung einrichten" → Ziel `https://mindshift-ki.de`, Typ HTTP 301, inkl. Pfadweitergabe.
- E-Mail-Adresse `dirk.brusch@mindshift-ai-consultants.de` für mindestens 6 Monate als Weiterleitung auf `dirk.brusch@mindshift-ki.de` aktiv lassen.

---

## 4. SEO-Migration

- `sitemap.xml` bei Google Search Console für neue Property `mindshift-ki.de` einreichen
- Search Console „Adressänderung" vom alten Property auf das neue initiieren
- Bing Webmaster Tools analog
- LinkedIn-Profil, E-Mail-Signaturen, Visitenkarten auf neue Domain aktualisieren

---

## 5. Dateien in diesem Repo

| Datei                        | Zweck                                              |
|------------------------------|----------------------------------------------------|
| `index.html`                 | Landing Page                                       |
| `impressum.html`             | Impressum (DSGVO/TMG)                              |
| `datenschutz.html`           | Datenschutzerklärung                               |
| `style.css` / `legal.css`    | Styles                                             |
| `script.js`                  | Scroll-Reveal, Counter, Navigation                 |
| `api/contact.php`            | Formular-Handler (nur auf IONOS, nicht GH Pages)   |
| `robots.txt`                 | Crawl-Direktiven inkl. KI-Crawler                  |
| `sitemap.xml`                | XML-Sitemap                                        |
| `llms.txt`                   | LLM/KI-Suche Kontext-Datei                         |
| `CNAME`                      | GitHub-Pages Custom-Domain                         |
| `mindshift-ki-logo.svg`      | Logo dunkel (für helle Hintergründe)               |
| `mindshift-ki-logo-light.svg`| Logo hell (für dunkle Hintergründe)                |
