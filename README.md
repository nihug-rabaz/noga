# noga (נוגה)

מערכת ניהול מסדי נתונים פנימית, בהשראת Neon, שרצה ברשת סגורה ומספקת:

- יצירה וניהול **Projects** (DB לוגיים) ו‑**Branches** לכל פרויקט.
- עבודה על בסיס **SQLite + sql.js** (ללא native addons, מתאים לסביבה סגורה).
- **ENV-based switching** – הפקת בלוק ENV לחיבור מאפליקציות אחרות ברשת.
- ממשק ווב מודרני (React + Vite + Tailwind + Framer Motion) + API ב‑Node.js/Express.

## Stack

- **Backend**: Node.js + TypeScript + Express + sql.js + JWT + bcryptjs.
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion.
- **Meta DB**: SQLite (דרך sql.js) לקונפיגורציה, משתמשים, Branches ו‑Audit.

## התקנה והרצה (Development)

1. התקנת תלויות:

```bash
cd d:\noga
npm install
cd web
npm install
cd ..
```

2. הרצה (שרת + UI יחד):

```bash
npm run dev:all
```

- ה‑backend מאזין כברירת מחדל על פורט `4001` (ניתן לשינוי עם `NOGA_PORT`).
- ה‑frontend (Vite) ירוץ על `http://localhost:5173` או פורט קרוב (מוצג בקונסולה).

## Build והרצה מאוחדת (Production style)

```bash
cd d:\noga
npm run build:all
npm start
```

- Express מגיש את ה‑React מתוך `web/dist` וגם את ה‑API תחת `/api/...`.

## API עיקרי

- `POST /api/auth/register` – יצירת משתמש חדש (הראשון הופך ל‑admin).
- `POST /api/auth/login` – התחברות, מחזיר JWT.
- `GET /api/databases` – רשימת Projects.
- `POST /api/databases` – יצירת Project חדש + Branch `main`.
- `GET /api/databases/:dbId/branches` – רשימת Branches ל‑Project.
- `POST /api/databases/:dbId/branches` – Duplicate Branch וכו׳.
- `POST /api/sql/query` – הרצת SELECT על DB+Branch.
- `POST /api/sql/execute` – הרצת פקודות שינוי (INSERT/UPDATE/DDL).
- `GET /api/databases/:dbId/env?branch=main` – בלוק ENV לחיבור מאפליקציות אחרות.

כל הקריאות הרגישות משתמשות ב‑JWT דרך Header:

```http
Authorization: Bearer <token>
```

## מבנה פרויקט

- `src/` – שרת Node (Express, auth, branches, sql, env).
- `web/` – אפליקציית React (Home, Auth, Console, Projects, Branch/SQL view).
- `logo/` – קובץ `logo.png` שמוגש כ‑`/logo/logo.png` ומשמש בדף הבית וב‑console.
- `data/` – קבצי SQLite (meta + databases), נוצר אוטומטית בזמן ריצה.

## TODO

- שזה יראה את השם המעודןכן שלי ותעצב גם את העמוד בית שיראה באותו סטייל של כל האתר שלנו עם העיצבו הזה ותעישה שINTEGRIAION SEETTINGS יעבדו גם 
- ללטש את עיצוב דף הבית וה‑console (טיפוגרפיה, spacing, dark/light לפי צורך).
- לממש בפועל מסך **Integrations** ו‑**Settings** (ניהול ENV templates, tokens, ועוד).
- להרחיב Audit UI (חיפוש לפי פעולה/משתמש/DB/Branch).
- להוסיף בדיקות אוטומטיות (unit / integration) ל‑backend וה‑frontend.
