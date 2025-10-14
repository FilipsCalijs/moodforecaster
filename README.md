# Mood Forecaster (Noskaņojuma Prognozētājs)

**Mood Forecaster** ir tīmekļa lietotne, kas izstrādāta, lai analizētu lietotāja dienasgrāmatas ierakstus, noteiktu emocionālo noskaņojumu un sniegtu personalizētus ieteikumus mūzikai, filmām un grāmatām. Projekts ir veidots, izmantojot modernas tehnoloģijas, tostarp **Next.js** priekšgalā (frontend) un **Node.js** aizmugursistēmā (backend), ar **OpenAI integrāciju** teksta analīzei.  

---

## Funkcionalitāte

- **Lietotāju autentifikācija**  
  Droša reģistrācija un pieslēgšanās sistēmai. Paroles tiek glabātas šifrētā veidā, izmantojot **bcrypt**.

- **Noskaņojuma analīze**  
  Lietotāji var ievadīt tekstu par savu dienu. Sistēma, izmantojot **OpenAI (GPT) modeli**, analizē tekstu un nosaka, vai noskaņojums ir **pozitīvs, negatīvs vai neitrāls**.

- **Personalizēti ieteikumi**  
  Balstoties uz noteikto noskaņojumu, lietotājs saņem individuālus ieteikumus **mūzikai, filmai un grāmatai**.

- **Ierakstu vēsture**  
  Visi veiktie ieraksti tiek saglabāti, un lietotājs var tos apskatīt vēstures sadaļā, sakārtotus **hronoloģiskā secībā**.

- **Detalizēta informācija**  
  Noklikšķinot uz jebkura ieraksta vēsturē, ir iespējams apskatīt **pilno tekstu un sākotnēji saņemtos ieteikumus**.

- **Administratora panelis**  
  Lietotājiem ar administratora tiesībām ir pieejams īpašs panelis ar detalizētu statistiku par sistēmas lietošanu:  
  - Kopējais lietotāju un ierakstu skaits  
  - Noskaņojumu sadalījums procentuāli  
  - Aktivitāte pēdējo 7 dienu laikā  
  - Aktīvākie lietotāji un populārākie vārdi ierakstos  

---

## Tehnoloģijas

### Priekšgals (Frontend)
- **Ietvars:** Next.js (React)  
- **Valoda:** TypeScript  
- **Stilizācija:** Tailwind CSS  
- **Datu savienojums:** fetch API izsaukumi uz pašu definētiem API maršrutiem  
- **Drošība:** Aizsargātie maršruti (ProtectedRoute) pārbauda lietotāja autentifikāciju, izmantojot localStorage saglabātu token  

### Aizmugursistēma (Backend)
- **Vide:** Node.js  
- **API ietvars:** Next.js API Routes  
- **Datubāze:** MySQL  
- **Mākslīgais intelekts:** OpenAI API (GPT-3.5-turbo) teksta analīzei  
- **Drošība:** Paroļu šifrēšana ar bcryptjs  

---

## Projekta palaišana

### Priekšnosacījumi
- Node.js (ieteicams v18.18.0 vai jaunāka versija)  
- MySQL datubāze  
- OpenAI API atslēga  

### 1. Lejupielādējiet repozitoriju
```bash
git clone https://github.com/FilipsCalijs/moodforecaster.git
cd moodforecaster
```

---

### 2. Konfigurējiet datubāzi

Izveidojiet jaunu MySQL datubāzi ar nosaukumu `moodforecaster`.

Failā `frontend/lib/db.ts` nomainiet datubāzes pieslēguma datus (lietotājvārdu, paroli) uz savējiem, ja tie atšķiras no noklusējuma (`root/root`).

Importējiet nepieciešamās datubāzes tabulas (SQL shēma nav iekļauta repozitorijā, tāpēc tā jāizveido manuāli, balstoties uz API vaicājumiem).

---

### 3. Konfigurējiet vides mainīgos (environment variables)

Frontend mapē izveidojiet `.env.local` failu un pievienojiet savu OpenAI API atslēgu:
```env
OPENAI_API_KEY="jūsu_openai_atslēga"
```

---

### 4. Instalējiet atkarības
Atveriet termināli `frontend` mapē un izpildiet komandu:
```bash
npm install
```

---

### 5. Palaišana
Atrodoties `frontend` mapē, palaidiet izstrādes serveri:
```bash
npm run dev
```

Atveriet pārlūkprogrammu un dodieties uz [http://localhost:3000](http://localhost:3000)

---
