# Mood Forecaster (Noskaņojuma Prognozētājs)

**Mood Forecaster** ir tīmekļa lietotne, kas izstrādāta, lai analizētu lietotāja dienasgrāmatas ierakstus, noteiktu emocionālo noskaņojumu un sniegtu personalizētus ieteikumus mūzikai, filmām un grāmatām. Projekts ir veidots, izmantojot modernas tehnoloģijas, tostarp **Next.js** priekšgalā (frontend) un **Node.js** aizmugursistēmā (backend), ar **OpenAI integrāciju** teksta analīzei.  

---

## Funkcionalitāte

### Pilna CRUD funkcionalitāte

Lietotne nodrošina visas pamata datu pārvaldības operācijas:

- **CREATE (Izveidot)**  
  Lietotāji var izveidot jaunus dienasgrāmatas ierakstus ar AI analīzi un ieteikumiem.

- **READ (Lasīt)**  
  Lietotāji var apskatīt visu savu ierakstu vēsturi un detalizētu informāciju par katru ierakstu.

- **UPDATE (Atjaunināt)**  
  Lietotāji var rediģēt esošos ierakstus. Sistēma automātiski veic atkārtotu AI analīzi un atjauno noskaņojumu un ieteikumus.

- **DELETE (Dzēst)**  
  Lietotāji var dzēst individuālus ierakstus vai pilnībā notīrīt visu savu vēsturi.

### Detalizēta funkcionalitāte

- **Lietotāju autentifikācija**  
  Droša reģistrācija un pieslēgšanās sistēmai. Paroles tiek glabātas šifrētā veidā, izmantojot **bcrypt**.

- **Noskaņojuma analīze ar AI**  
  Lietotāji var ievadīt tekstu par savu dienu. Sistēma, izmantojot **OpenAI (GPT-3.5-turbo) modeli**, analizē tekstu un nosaka, vai noskaņojums ir **pozitīvs, negatīvs vai neitrāls**.

- **Personalizēti ieteikumi**  
  Balstoties uz noteikto noskaņojumu, lietotājs saņem individuālus ieteikumus **mūzikai, filmai un grāmatai** latviešu valodā.

- **Ierakstu vēsture**  
  Visi veiktie ieraksti tiek saglabāti MySQL datubāzē, un lietotājs var tos apskatīt vēstures sadaļā, sakārtotus **hronoloģiskā secībā**.

- **Ierakstu rediģēšana**  
  Noklikšķinot uz ieraksta, lietotājs var to rediģēt. Sistēma automātiski veic atkārtotu AI analīzi un atjauno noskaņojumu un visus ieteikumus.

- **Ierakstu dzēšana**  
  Katru ierakstu var dzēst individuāli ar apstiprinājuma dialogu. Pieejama arī opcija dzēst visu vēsturi vienā reizē.

- **Detalizēta informācija**  
  Noklikšķinot uz jebkura ieraksta vēsturē, ir iespējams apskatīt **pilno tekstu un visus saņemtos ieteikumus** interaktīvā modālajā logā.

- **Administratora panelis**  
  Lietotājiem ar administratora tiesībām ir pieejams īpašs panelis ar detalizētu statistiku par sistēmas lietošanu:  
  - Kopējais lietotāju un ierakstu skaits  
  - Noskaņojumu sadalījums procentuāli  
  - Aktivitāte pēdējo 7 dienu laikā  
  - Aktīvākie lietotāji un populārākie vārdi ierakstos  
  - Jaunākie ieraksti sistēmā  

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
- **API ietvars:** Next.js API Routes (RESTful API)  
- **Datubāze:** MySQL ar mysql2/promise  
- **Mākslīgais intelekts:** OpenAI API (GPT-3.5-turbo) teksta analīzei  
- **Drošība:** Paroļu šifrēšana ar bcryptjs, token-based autentifikācija  

### API Endpoints
- **POST /api/register** - Lietotāja reģistrācija  
- **POST /api/login** - Lietotāja pieslēgšanās  
- **POST /api/analyze** - Jauna ieraksta izveidošana ar AI analīzi  
- **GET /api/history** - Visu lietotāja ierakstu saraksta iegūšana  
- **GET /api/entry/[id]** - Konkrēta ieraksta detaļu iegūšana  
- **PUT /api/entry/[id]** - Ieraksta rediģēšana ar atkārtotu AI analīzi  
- **DELETE /api/entry/[id]** - Konkrēta ieraksta dzēšana  
- **DELETE /api/history** - Visas lietotāja vēstures dzēšana  
- **GET /api/admin/stats** - Administratora statistika (tikai admin)  

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

Izveidojiet jaunu MySQL datubāzi ar nosaukumu `moodforecaster`:

```sql
CREATE DATABASE moodforecaster;
USE moodforecaster;
```

Izveidojiet nepieciešamās tabulas:

```sql
CREATE TABLE users_mood_forecaster (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diary_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  entry_text TEXT NOT NULL,
  mood ENUM('positive', 'negative', 'neutral') NOT NULL,
  music_recommendation TEXT,
  movie_recommendation TEXT,
  book_recommendation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users_mood_forecaster(id) ON DELETE CASCADE
);
```

Failā `frontend/lib/db.ts` nomainiet datubāzes pieslēguma datus (host, lietotājvārdu, paroli) uz savējiem, ja tie atšķiras no noklusējuma.

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
