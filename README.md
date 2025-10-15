# projektlabor_festeknyilvantarto

**Run App**
- `yarn install`
- `yarn add vite --dev`
- `npm install -D postcss postcss- preset-mantine`
-  `npm run dev`

**Run Error because Yarn Version**
- `corepack enable`
- `corepack prepare yarn@4.4.1 --activate`

**DB migration**
- `alembic revision --autogenerate -m "message"`
- `alembic upgrade head` 

**Run Backend**
- `python -m uvicorn app.main:app --reload` on Windows
- `uvicorn app.main:app --reload` on Mac