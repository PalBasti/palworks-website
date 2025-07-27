# PalWorks Website - Deployment Anleitung

## 🚀 Schritt-für-Schritt Setup

### 1. GitHub Repository erstellen

1. **Gehe zu GitHub.com** und logge dich mit deinem Account ein (PalBasti)
2. **Klicke auf "New Repository"** (grüner Button oben rechts)
3. **Repository-Name:** `palworks-website`
4. **Beschreibung:** `PalWorks - smarte Verträge & Pals Website`
5. **Visibility:** Private (du kannst es später public machen)
6. **Haken setzen bei:** "Add a README file"
7. **Klicke "Create repository"**

### 2. Code hochladen

#### Option A: GitHub Web Interface (einfacher)
1. **Klicke auf "uploading an existing file"** im neuen Repository
2. **Erstelle folgende Ordnerstruktur:**
   ```
   palworks-website/
   ├── package.json
   ├── next.config.js
   ├── tailwind.config.js
   ├── pages/
   │   ├── _app.js
   │   ├── index.js
   │   └── garage-vertrag.js
   ├── components/
   │   ├── ContractForm.js
   │   ├── ContractPreview.js
   │   └── PaymentModal.js
   └── styles/
       └── globals.css
   ```

3. **Lade alle Files aus den Artifacts hoch:**
   - Kopiere den Code aus jedem Artifact
   - Erstelle neue Files mit den entsprechenden Namen
   - Paste den Code ein

#### Option B: Git CLI (für Fortgeschrittene)
```bash
git clone https://github.com/PalBasti/palworks-website.git
cd palworks-website
# Füge alle Files hinzu
git add .
git commit -m "Initial PalWorks website"
git push origin main
```

### 3. Vercel Deployment

1. **Gehe zu vercel.com** und logge dich mit deinem GitHub-Account ein
2. **Klicke "Import Project"**
3. **Wähle dein GitHub Repository** `palworks-website`
4. **Framework Preset:** Next.js (wird automatisch erkannt)
5. **Root Directory:** `.` (Standard)
6. **Build Settings:** (Standard lassen)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
7. **Klicke "Deploy"**

### 4. Domain konfigurieren

1. **Nach erfolgreichem Deployment** klicke auf "Domains" im Vercel Dashboard
2. **Klicke "Add"** und gib deine Domain ein: `palworks.de`
3. **DNS bei deinem Domain-Provider (Google) konfigurieren:**
   
   **A Record:**
   - Name: `@` (oder leer)
   - Value: `76.76.19.61`
   
   **CNAME Record:**
   - Name: `www`
   - Value: `cname.vercel-dns.com`

4. **Warte 1-24 Stunden** bis DNS propagiert ist

### 5. Supabase Setup (für später)

1. **Gehe zu supabase.com** und logge dich mit GitHub ein
2. **Klicke "New Project"**
3. **Organization:** Personal
4. **Name:** `palworks-contracts`
5. **Database Password:** (sicheres Passwort notieren!)
6. **Region:** Europe West (Ireland)
7. **Klicke "Create new project"**

### 6. Environment Variables (später)

In Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=deine_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_supabase_key
STRIPE_SECRET_KEY=dein_stripe_key
STRIPE_PUBLISHABLE_KEY=dein_stripe_public_key
```

## ✅ Checkliste nach Deployment

- [ ] Website lädt auf palworks.de
- [ ] Homepage zeigt alle Inhalte
- [ ] Garage-Vertrag Formular funktioniert
- [ ] Vorschau wird generiert
- [ ] Demo-Payment Modal öffnet sich
- [ ] Responsive Design funktioniert auf Handy
- [ ] SSL-Zertifikat ist aktiv (grünes Schloss)

## 🐛 Häufige Probleme

### Build Fehler
- **Lösung:** Überprüfe, ob alle Files korrekt hochgeladen wurden
- **Tipp:** Schaue in Vercel unter "Functions" → "Build Logs"

### Domain funktioniert nicht
- **Lösung:** Warte bis zu 24h auf DNS-Propagation
- **Test:** Nutze `nslookup palworks.de` im Terminal

### Formular funktioniert nicht
- **Lösung:** Öffne Browser-Konsole (F12) und schaue nach JavaScript-Fehlern

## 📧 Support

Bei Problemen:
1. **Screenshots** vom Fehler machen
2. **Browser-Konsole** checken (F12 → Console)
3. **Vercel Build Logs** anschauen
4. **Mir schreiben** mit Details

## 🔄 Updates später

**Neuen Code deployen:**
1. Ändere Files im GitHub Repository
2. Vercel deployed automatisch
3. Neue Version ist live

Das war's! 🎉 Nach diesen Schritten hast du eine professionelle Website online!
