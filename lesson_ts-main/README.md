===== FILE: README.md =====
# React + Redux Toolkit (TS) + FastAPI (Docker) — учебный проект (две ДЗ)

Полноценный README.md для репозитория с двумя частями:
— API (FastAPI): учебный сервер с Basic Auth, CRUD по пользователям/постам, загрузкой файлов и журналом студентов.
— Client (Vite + React 19 + TypeScript + Redux Toolkit + React Router): SPA со страницами Home / About / Users / UserDetail / Posts / Students.

Логин/пароль для API: admin / 123  
База URL API: http://localhost:8000

----------------------------------------------------------------

СОДЕРЖАНИЕ

1. Стек  
2. Структура репозитория  
3. Быстрый старт  
   3.1 Поднять API (Docker)  
   3.2 Поднять API локально (Python)  
   3.3 Поднять фронтенд  
   3.4 Поднять всё через Docker Compose (API + Frontend)  
4. Соответствие ДЗ (ТЗ)  
5. API: справочник  
   5.1 Общее  
   5.2 Users  
   5.3 Posts  
   5.4 Students  
   5.5 cURL шпаргалка  
6. Клиент (React + RTK)  
   6.1 Страницы  
   6.2 RTK слайсы / thunk’и  
   6.3 Скрипты npm  
   6.4 Где менять адрес API  
7. Postman Collection (импортом)  
8. Траблшутинг  
9. Лицензия  
10. Готовые файлы для копипаста (куда и как вставлять)

----------------------------------------------------------------

1) СТЕК

Backend:
- Python 3.11, FastAPI 0.104.1, Uvicorn 0.24.0, Pydantic 2.5.0
- Basic Auth (admin/123), CORS *, загрузка файлов (multipart), статика /uploads
- Dockerfile для сборки образа

Frontend:
- Vite 7, React 19, TypeScript 5, React Router 7
- Redux Toolkit 2, React-Redux 9, Axios
- SCSS, ESLint

----------------------------------------------------------------

2) СТРУКТУРА РЕПОЗИТОРИЯ

```
.
├─ Test-API-main/                 ← Бэкенд (FastAPI)
│  ├─ main.py                     ← Приложение (память вместо БД)
│  ├─ requirements.txt
│  ├─ Dockerfile
│  └─ uploads/                    ← Папка для загруженных изображений (создаётся автоматически)
│
└─ lesson_ts-main/                ← Фронтенд (Vite + React + TS)
   ├─ src/
   │  ├─ api/                     ← usersApi, postsApi, studentsApi (axios)
   │  ├─ store/                   ← store + slices (users, posts, students)
   │  ├─ pages/                   ← Home, About, Users, UserDetail, Posts, Students, NotFound
   │  ├─ layouts/                 ← MainLayoute (шапка/футер/контент)
   │  ├─ styles/                  ← SCSS (reset, variables, компоненты)
   │  └─ shared/                  ← типы (User, Post, Student)
   ├─ index.html
   ├─ vite.config.ts
   ├─ tsconfig*.json
   └─ package.json
```

----------------------------------------------------------------

3) БЫСТРЫЙ СТАРТ

3.1) Поднять API (Docker)

```
cd Test-API-main
docker build -t student-api .
docker run --rm -p 8000:8000 -v "%cd%/uploads:/app/uploads" student-api    ← Windows CMD
# либо (Linux/Mac):
# docker run --rm -p 8000:8000 -v "$(pwd)/uploads:/app/uploads" student-api
```

Проверка:
- Swagger UI:  http://localhost:8000/docs  
- Корень JSON: http://localhost:8000/  
- Basic Auth:  admin / 123

3.2) Поднять API локально (Python)

```
cd Test-API-main
python -m venv .venv
.venv\Scripts\activate           ← Windows
# source .venv/bin/activate      ← Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3.3) Поднять фронтенд

```
cd lesson_ts-main
npm i
npm run dev
# откройте http://localhost:5173 (порт Vite может отличаться – смотрите вывод)
```

3.4) Поднять всё через Docker Compose (API + Frontend)

> Выполнять из **корня** репозитория. Файл `docker-compose.yml` — см. раздел 10.

```
docker compose up -d --build
```

- API: http://localhost:8000  
- Frontend (Vite dev): http://localhost:5173  
- Папка загрузок примонтирована: `Test-API-main/uploads ⇄ /app/uploads`

----------------------------------------------------------------

4) СООТВЕТСТВИЕ ДЗ (ТЗ)

ДЗ-1 (API / FastAPI):
- Разделы Users, Posts (JSON + загрузка файла), Students.
- Авторизация Basic на всех /api/* маршрутах.
- Пагинация /api/posts через _start и _limit.
- Автоочистка неиспользуемых файлов при обновлении/удалении постов.
- Раздача статики /uploads, Swagger /docs.

ДЗ-2 (Client / React + RTK):
- Маршрутизация (Home, About, Users, UserDetail, Posts, Students, NotFound).
- Redux Toolkit slices с createAsyncThunk: загрузка/создание/обновление/удаление.
- Формы и валидации на стороне клиента; предпросмотр картинки (URL или файл).
- Таблица студентов с переключателями присутствия/оценки/онлайн.

----------------------------------------------------------------

5) API — СПРАВОЧНИК

5.1) Общее  
База: http://localhost:8000  
Swagger: /docs  
Авторизация: Basic (admin / 123) – обязательна для всех /api/*  
Статика: /uploads/<filename>  
Коды ошибок: 400 (валидация), 401 (auth), 404 (не найдено)

5.2) Users

Тип User:
```
{ id: number; name: string; email: string }
```

Маршруты:
```
GET    /api/users                 → User[]
GET    /api/users/{id}            → User
POST   /api/users                 body { name, email } → User (email уникален)
PUT    /api/users/{id}            body { name?, email? } → User (проверка уникальности)
DELETE /api/users/{id}            → { message }
POST   /api/demo-users            → { message, users[] } (добавит, если нет дубликатов)
```

5.3) Posts

Тип Post:
```
{
  id: string; title: string; content: string; author: string;
  image_url?: string | null;      // внешний URL
  image_file?: string | null;     // имя файла в /uploads
  created_at: string; updated_at: string;
}
```

Маршруты:
```
GET    /api/posts                 (query: _start?, _limit?) → Post[] (сортировка по created_at)
GET    /api/posts/{id}            → Post
POST   /api/posts                 JSON { title, content, author, image_url? } → Post
PUT    /api/posts/{id}            JSON { title?, content?, author?, image_url? | null } → Post
DELETE /api/posts/{id}            → { message }
POST   /api/posts/upload          multipart: title, content, author, image_file → Post
PUT    /api/posts/{id}/upload     multipart: image_file → Post
```

Поведение:
- При установке `image_url` (строкой) у поста стирается локальный файл (если был).
- При `image_url = null` локальная картинка отвязывается и файл удаляется (если не используется другим постом).
- Валидация загрузок: jpg, jpeg, png, gif, webp, bmp.

5.4) Students

Тип Student:
```
{ id: number; name: string; attend: "none"|"late"|"present"; grade: number; online: boolean }
```

Маршруты:
```
GET  /api/students                          → Student[]
PUT  /api/students/{id}/attend              body { attend } (none|late|present) → Student
PUT  /api/students/{id}/grade               body { grade (0..12) }              → Student
PUT  /api/students/{id}/online              body { online: boolean }            → Student
```

5.5) cURL шпаргалка (везде нужна Basic: `-u admin:123`)

Корень и Swagger:
```
curl http://localhost:8000/
curl http://localhost:8000/docs
```

Текущий пользователь:
```
curl -u admin:123 http://localhost:8000/api/me
```

Users:
```
curl -u admin:123 http://localhost:8000/api/users
curl -u admin:123 -H "Content-Type: application/json" -d "{\"name\":\"Иван\",\"email\":\"ivan@example.com\"}" http://localhost:8000/api/users
curl -u admin:123 -X PUT -H "Content-Type: application/json" -d "{\"name\":\"Иван Обновлённый\"}" http://localhost:8000/api/users/1
curl -u admin:123 -X DELETE http://localhost:8000/api/users/1
curl -u admin:123 -X POST http://localhost:8000/api/demo-users
```

Posts (JSON):
```
curl -u admin:123 -H "Content-Type: application/json" -d "{\"title\":\"Заголовок\",\"content\":\"Текст\",\"author\":\"Автор\",\"image_url\":\"https://picsum.photos/600/400\"}" http://localhost:8000/api/posts
```

Posts (upload):
```
curl -u admin:123 -F "title=Фото-пост" -F "content=Описание" -F "author=Автор" -F "image_file=@./pic.jpg" http://localhost:8000/api/posts/upload
```

Students:
```
curl -u admin:123 http://localhost:8000/api/students
curl -u admin:123 -X PUT -H "Content-Type: application/json" -d "{\"attend\":\"present\"}" http://localhost:8000/api/students/1/attend
curl -u admin:123 -X PUT -H "Content-Type: application/json" -d "{\"grade\":12}" http://localhost:8000/api/students/1/grade
curl -u admin:123 -X PUT -H "Content-Type: application/json" -d "{\"online\":true}" http://localhost:8000/api/students/1/online
```

----------------------------------------------------------------

6) КЛИЕНТ (REACT + RTK)

6.1) Страницы  
`/` → Home  
`/about` → About (пример `useNavigate`)  
`/users` → список + создание + удаление  
`/users/:id` → детальная + редактирование  
`/posts` → список + создание/редактирование/удаление; предпросмотр URL/файла  
`/students` → таблица (присутствие/оценка/онлайн)

6.2) RTK слайсы / thunk’и

`src/store/slices/usersSlice.ts`
- `fetchUsers`, `addUser`, `updateUser`, `deleteUser`, селекторы `selectAllUsers` и т.д.

`src/store/slices/postsSlice.ts`
- `fetchPosts`, `addPost` (JSON или multipart), `updatePost` (JSON или файл), `deletePost`.  
- `resolvePostImage` в `src/api/postsApi.ts` собирает корректный `src` (image_url или `/uploads/<file>`).

`src/store/slices/studentsSlice.ts`
- `fetchStudents`, `updateStudentAttend`, `updateStudentGrade`, `updateStudentOnline`.

Глобальный стор: `src/store/store.ts` (users, posts, students).

6.3) Скрипты npm  
`npm run dev` — dev-сервер Vite  
`npm run build` — проверка типов + сборка  
`npm run preview` — предпросмотр сборки  
`npm run lint` — ESLint

6.4) Где менять адрес API  
`src/api/usersApi.ts`       → `const API_URL = "http://localhost:8000/api/users"`  
`src/api/studentsApi.ts`    → `const API_URL = "http://localhost:8000/api/students"`  
`src/api/postsApi.ts`       → `const API_URL = "http://localhost:8000/api/posts"`  
& `const UPLOADS_URL = "http://localhost:8000/uploads"`

Для production можно вынести в `.env` и читать через `import.meta.env`.

----------------------------------------------------------------

7) POSTMAN COLLECTION (импортом)

Готовый файл `student-api.postman_collection.json` лежит в разделе **10** — просто сохраните рядом с `README.md` и импортируйте в Postman.

----------------------------------------------------------------

8) ТРАБЛШУТИНГ

- **401 Unauthorized** → передайте Basic Auth (admin/123). В коллекции Postman авторизация стоит на уровне коллекции.  
- **CORS ошибки** → в API включён `allow_origins=["*"]`; если меняли – добавьте `http://localhost:5173`.  
- **Файлы пропадают** → при Docker запуске монтируйте uploads: `-v ./uploads:/app/uploads`.  
- **Картинка поста не видна** → проверьте либо доступность внешнего `image_url`, либо `http://localhost:8000/uploads/<имя>`.  
- **Порт занят** → смените порт uvicorn (`--port 8001`) и обновите URL в `src/api/*`.

----------------------------------------------------------------

9) ЛИЦЕНЗИЯ

Учебный материал. Свободно используйте для обучения и практики.
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
10) ГОТОВЫЕ ФАЙЛЫ ДЛЯ КОПИПАСТА (КУДА И КАК ВСТАВЛЯТЬ)

> **Все пути относительно корня репозитория.**  
> Если папок не существует — создайте.

**10.1 `docker-compose.yml` (корень)**
```yaml
version: "3.9"

services:
  api:
    build:
      context: ./Test-API-main
    container_name: student-api
    ports:
      - "8000:8000"
    volumes:
      - ./Test-API-main/uploads:/app/uploads
    restart: unless-stopped

  web:
    image: node:20-alpine
    container_name: student-web
    working_dir: /app
    environment:
      - VITE_API_BASE=http://api:8000
      - VITE_PORT=5173
    ports:
      - "5173:5173"
    volumes:
      - ./lesson_ts-main:/app
    command: sh -c "npm i && npm run dev -- --host 0.0.0.0 --port $$VITE_PORT"
    depends_on:
      - api
```

**10.2 `.env.example` (корень)**
```env
# Frontend (Vite)
VITE_API_BASE=http://localhost:8000
VITE_PORT=5173
```

**10.3 `lesson_ts-main/vite.config.ts` (опциональная замена для удобного dev-proxy)**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = process.env.VITE_API_BASE || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: Number(process.env.VITE_PORT) || 5173,
    proxy: {
      '/api': { target: BACKEND_URL, changeOrigin: true },
      '/uploads': { target: BACKEND_URL, changeOrigin: true },
    },
  },
})
```

**10.4 `api.http` (корень, для VS Code REST Client)**
```http
@baseUrl = http://localhost:8000
@auth = Basic YWRtaW46MTIz

### Root
GET {{baseUrl}}/

### Swagger
GET {{baseUrl}}/docs

### Me (Basic)
GET {{baseUrl}}/api/me
Authorization: {{auth}}

### ---------------- Users ----------------

### All users
GET {{baseUrl}}/api/users
Authorization: {{auth}}

### Create user
POST {{baseUrl}}/api/users
Authorization: {{auth}}
Content-Type: application/json

{
  "name": "Иван Иванов",
  "email": "ivan@example.com"
}

### Get user by id
GET {{baseUrl}}/api/users/1
Authorization: {{auth}}

### Update user
PUT {{baseUrl}}/api/users/1
Authorization: {{auth}}
Content-Type: application/json

{
  "name": "Иван Обновлённый"
}

### Delete user
DELETE {{baseUrl}}/api/users/1
Authorization: {{auth}}

### Demo users
POST {{baseUrl}}/api/demo-users
Authorization: {{auth}}

### ---------------- Posts ----------------

### List (with pagination)
GET {{baseUrl}}/api/posts?_start=0&_limit=5
Authorization: {{auth}}

### Create (JSON)
POST {{baseUrl}}/api/posts
Authorization: {{auth}}
Content-Type: application/json

{
  "title": "Пост с внешней картинкой",
  "content": "Текст поста",
  "author": "Автор",
  "image_url": "https://picsum.photos/600/400"
}

### Create (multipart upload)
POST {{baseUrl}}/api/posts/upload
Authorization: {{auth}}
Content-Type: multipart/form-data; boundary=WebAppBoundary

--WebAppBoundary
Content-Disposition: form-data; name="title"

Фото-пост
--WebAppBoundary
Content-Disposition: form-data; name="content"

Описание
--WebAppBoundary
Content-Disposition: form-data; name="author"

Автор
--WebAppBoundary
Content-Disposition: form-data; name="image_file"; filename="pic.jpg"
Content-Type: image/jpeg

< ./pic.jpg
--WebAppBoundary--

### Get by id
GET {{baseUrl}}/api/posts/{{postId}}
Authorization: {{auth}}

### Update (JSON patch)
PUT {{baseUrl}}/api/posts/{{postId}}
Authorization: {{auth}}
Content-Type: application/json

{
  "title": "Обновлённый заголовок",
  "image_url": null
}

### Update image (multipart)
PUT {{baseUrl}}/api/posts/{{postId}}/upload
Authorization: {{auth}}
Content-Type: multipart/form-data; boundary=WebAppBoundary

--WebAppBoundary
Content-Disposition: form-data; name="image_file"; filename="pic.jpg"
Content-Type: image/jpeg

< ./pic.jpg
--WebAppBoundary--

### Delete
DELETE {{baseUrl}}/api/posts/{{postId}}
Authorization: {{auth}}

### ---------------- Students ----------------

### List
GET {{baseUrl}}/api/students
Authorization: {{auth}}

### Attend
PUT {{baseUrl}}/api/students/1/attend
Authorization: {{auth}}
Content-Type: application/json

{
  "attend": "present"
}

### Grade
PUT {{baseUrl}}/api/students/1/grade
Authorization: {{auth}}
Content-Type: application/json

{
  "grade": 11
}

### Online
PUT {{baseUrl}}/api/students/1/online
Authorization: {{auth}}
Content-Type: application/json

{
  "online": true
}
```

**10.5 `student-api.postman_collection.json` (корень)**
```json
{
  "info": {
    "name": "Student API + Client — HW",
    "_postman_id": "8fd9d8b6-0a9f-4b5d-9d55-aaaaaaaaaaaa",
    "description": "Учебный FastAPI сервер (Users/Posts/Students) с Basic Auth + примеры запросов.",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "basic",
    "basic": [
      { "key": "username", "type": "string", "value": "admin" },
      { "key": "password", "type": "string", "value": "123" }
    ]
  },
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:8000", "type": "string" }
  ],
  "item": [
    {
      "name": "Root & Docs",
      "item": [
        { "name": "GET /", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/", "host": ["{{baseUrl}}"], "path": [""] } } },
        { "name": "Swagger UI", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/docs", "host": ["{{baseUrl}}"], "path": ["docs"] } } },
        { "name": "GET /api/me", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/api/me", "host": ["{{baseUrl}}"], "path": ["api","me"] } } }
      ]
    },
    {
      "name": "Users",
      "item": [
        { "name": "GET /api/users", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/api/users", "host": ["{{baseUrl}}"], "path": ["api","users"] } } },
        { "name": "POST /api/users",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"name\": \"Иван Иванов\",\n  \"email\": \"ivan@example.com\"\n}" },
            "url": { "raw": "{{baseUrl}}/api/users", "host": ["{{baseUrl}}"], "path": ["api","users"] }
        }},
        { "name": "GET /api/users/{id}",
          "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/api/users/1", "host": ["{{baseUrl}}"], "path": ["api","users","1"] } }
        },
        { "name": "PUT /api/users/{id}",
          "request": {
            "method": "PUT",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"name\": \"Иван Обновлённый\"\n}" },
            "url": { "raw": "{{baseUrl}}/api/users/1", "host": ["{{baseUrl}}"], "path": ["api","users","1"] }
        }},
        { "name": "DELETE /api/users/{id}",
          "request": { "method": "DELETE", "url": { "raw": "{{baseUrl}}/api/users/1", "host": ["{{baseUrl}}"], "path": ["api","users","1"] } }
        },
        { "name": "POST /api/demo-users",
          "request": { "method": "POST", "url": { "raw": "{{baseUrl}}/api/demo-users", "host": ["{{baseUrl}}"], "path": ["api","demo-users"] } }
        }
      ]
    },
    {
      "name": "Posts",
      "item": [
        { "name": "GET /api/posts", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/api/posts", "host": ["{{baseUrl}}"], "path": ["api","posts"] } } },
        { "name": "GET /api/posts?paginated",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/api/posts?_start=0&_limit=5",
              "host": ["{{baseUrl}}"], "path": ["api","posts"],
              "query": [{ "key": "_start", "value": "0" }, { "key": "_limit", "value": "5" }]
        }}},
        { "name": "POST /api/posts (JSON)",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"title\": \"Пост с внешней картинкой\",\n  \"content\": \"Текст поста\",\n  \"author\": \"Автор\",\n  \"image_url\": \"https://picsum.photos/600/400\"\n}" },
            "url": { "raw": "{{baseUrl}}/api/posts", "host": ["{{baseUrl}}"], "path": ["api","posts"] }
        }},
        { "name": "POST /api/posts/upload (multipart)",
          "request": {
            "method": "POST",
            "body": {
              "mode": "formdata",
              "formdata": [
                { "key": "title", "value": "Пост с файлом", "type": "text" },
                { "key": "content", "value": "Описание", "type": "text" },
                { "key": "author", "value": "Автор", "type": "text" },
                { "key": "image_file", "type": "file", "src": "" }
              ]
            },
            "url": { "raw": "{{baseUrl}}/api/posts/upload", "host": ["{{baseUrl}}"], "path": ["api","posts","upload"] }
        }},
        { "name": "GET /api/posts/{id}",
          "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/api/posts/{{postId}}", "host": ["{{baseUrl}}"], "path": ["api","posts","{{postId}}"] } }
        },
        { "name": "PUT /api/posts/{id} (JSON patch)",
          "request": {
            "method": "PUT",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"title\": \"Обновлённый заголовок\",\n  \"image_url\": null\n}" },
            "url": { "raw": "{{baseUrl}}/api/posts/{{postId}}", "host": ["{{baseUrl}}"], "path": ["api","posts","{{postId}}"] }
        }},
        { "name": "PUT /api/posts/{id}/upload (multipart)",
          "request": {
            "method": "PUT",
            "body": { "mode": "formdata", "formdata": [{ "key": "image_file", "type": "file", "src": "" }] },
            "url": { "raw": "{{baseUrl}}/api/posts/{{postId}}/upload", "host": ["{{baseUrl}}"], "path": ["api","posts","{{postId}}","upload"] }
        }},
        { "name": "DELETE /api/posts/{id}",
          "request": { "method": "DELETE", "url": { "raw": "{{baseUrl}}/api/posts/{{postId}}", "host": ["{{baseUrl}}"], "path": ["api","posts","{{postId}}"] } }
        }
      ]
    },
    {
      "name": "Students",
      "item": [
        { "name": "GET /api/students", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/api/students", "host": ["{{baseUrl}}"], "path": ["api","students"] } } },
        { "name": "PUT /api/students/{id}/attend",
          "request": {
            "method": "PUT",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"attend\": \"present\"\n}" },
            "url": { "raw": "{{baseUrl}}/api/students/1/attend", "host": ["{{baseUrl}}"], "path": ["api","students","1","attend"] }
        }},
        { "name": "PUT /api/students/{id}/grade",
          "request": {
            "method": "PUT",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"grade\": 11\n}" },
            "url": { "raw": "{{baseUrl}}/api/students/1/grade", "host": ["{{baseUrl}}"], "path": ["api","students","1","grade"] }
        }},
        { "name": "PUT /api/students/{id}/online",
          "request": {
            "method": "PUT",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"online\": true\n}" },
            "url": { "raw": "{{baseUrl}}/api/students/1/online", "host": ["{{baseUrl}}"], "path": ["api","students","1","online"] }
        }}
      ]
    }
  ]
}
```

**10.6 `.github/workflows/ci.yml` (минимальный CI)**
```yaml
name: CI

on:
  push:
    branches: ["**"]
  pull_request:
    branches: ["**"]

jobs:
  frontend:
    name: Frontend (Vite/React/TS)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: lesson_ts-main
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: lesson_ts-main/package-lock.json
      - run: npm ci
      - run: npm run build
      - run: npm run lint

  api:
    name: API (FastAPI sanity)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: Test-API-main
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          cache-dependency-path: Test-API-main/requirements.txt
      - run: pip install -r requirements.txt
      - run: python -m py_compile main.py
```

===== FILE: docker-compose.yml =====
version: "3.9"

services:
  api:
    build:
      context: ./Test-API-main
    container_name: student-api
    ports:
      - "8000:8000"
    volumes:
      - ./Test-API-main/uploads:/app/uploads
    restart: unless-stopped

  web:
    image: node:20-alpine
    container_name: student-web
    working_dir: /app
    environment:
      - VITE_API_BASE=http://api:8000
      - VITE_PORT=5173
    ports:
      - "5173:5173"
    volumes:
      - ./lesson_ts-main:/app
    command: sh -c "npm i && npm run dev -- --host 0.0.0.0 --port $$VITE_PORT"
    depends_on:
      - api

===== FILE: .env.example =====
# Frontend (Vite)
VITE_API_BASE=http://localhost:8000
VITE_PORT=5173

===== FILE: lesson_ts-main/vite.config.ts =====
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = process.env.VITE_API_BASE || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: Number(process.env.VITE_PORT) || 5173,
    proxy: {
      '/api': { target: BACKEND_URL, changeOrigin: true },
      '/uploads': { target: BACKEND_URL, changeOrigin: true },
    },
  },
})

===== FILE: api.http =====
@baseUrl = http://localhost:8000
@auth = Basic YWRtaW46MTIz

### Root
GET {{baseUrl}}/

### Swagger
GET {{baseUrl}}/docs

### Me (Basic)
GET {{baseUrl}}/api/me
Authorization: {{auth}}

### ---------------- Users ----------------

### All users
GET {{baseUrl}}/api/users
Authorization: {{auth}}

### Create user
POST {{baseUrl}}/api/users
Authorization: {{auth}}
Content-Type: application/json

{
  "name": "Иван Иванов",
  "email": "ivan@example.com"
}

### Get user by id
GET {{baseUrl}}/api/users/1
Authorization: {{auth}}

### Update user
PUT {{baseUrl}}/api/users/1
Authorization: {{auth}}
Content-Type: application/json

{
  "name": "Иван Обновлённый"
}

### Delete user
DELETE {{baseUrl}}/api/users/1
Authorization: {{auth}}

### Demo users
POST {{baseUrl}}/api/demo-users
Authorization: {{auth}}

### ---------------- Posts ----------------

### List (with pagination)
GET {{baseUrl}}/api/posts?_start=0&_limit=5
Authorization: {{auth}}

### Create (JSON)
POST {{baseUrl}}/api/posts
Authorization: {{auth}}
Content-Type: application/json

{
  "title": "Пост с внешней картинкой",
  "content": "Текст поста",
  "author": "Автор",
  "image_url": "https://picsum.photos/600/400"
}

### Create (multipart upload)
POST {{baseUrl}}/api/posts/upload
Authorization: {{auth}}
Content-Type: multipart/form-data; boundary=WebAppBoundary

--WebAppBoundary
Content-Disposition: form-data; name="title"

Фото-пост
--WebAppBoundary
Content-Disposition: form-data; name="content"

Описание
--WebAppBoundary
Content-Disposition: form-data; name="author"

Автор
--WebAppBoundary
Content-Disposition: form-data; name="image_file"; filename="pic.jpg"
Content-Type: image/jpeg

< ./pic.jpg
--WebAppBoundary--

### Get by id
GET {{baseUrl}}/api/posts/{{postId}}
Authorization: {{auth}}

### Update (JSON patch)
PUT {{baseUrl}}/api/posts/{{postId}}
Authorization: {{auth}}
Content-Type: application/json

{
  "title": "Обновлённый заголовок",
  "image_url": null
}

### Update image (multipart)
PUT {{baseUrl}}/api/posts/{{postId}}/upload
Authorization: {{auth}}
Content-Type: multipart/form-data; boundary=WebAppBoundary

--WebAppBoundary
Content-Disposition: form-data; name="image_file"; filename="pic.jpg"
Content-Type: image/jpeg

< ./pic.jpg
--WebAppBoundary--

### Delete
DELETE {{baseUrl}}/api/posts/{{postId}}
Authorization: {{auth}}

### ---------------- Students ----------------

### List
GET {{baseUrl}}/api/students
Authorization: {{auth}}

### Attend
PUT {{baseUrl}}/api/students/1/attend
Authorization: {{auth}}
Content-Type: application/json

{
  "attend": "present"
}

### Grade
PUT {{baseUrl}}/api/students/1/grade
Authorization: {{auth}}
Content-Type: application/json

{
  "grade": 11
}

### Online
PUT {{baseUrl}}/api/students/1/online
Authorization: {{auth}}
Content-Type: application/json

{
  "online": true
}

===== FILE: student-api.postman_collection.json =====
{
  "info": {
    "name": "Student API + Client — HW",
    "_postman_id": "8fd9d8b6-0a9f-4b5d-9d55-aaaaaaaaaaaa",
    "description": "Учебный FastAPI сервер (Users/Posts/Students) с Basic Auth + примеры запросов.",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "basic",
    "basic": [
      { "key": "username", "type": "string", "value": "admin" },
      { "key": "password", "type": "string", "value": "123" }
    ]
  },
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:8000", "type": "string" }
  ],
  "item": [
    {
      "name": "Root & Docs",
      "item": [
        { "name": "GET /", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/", "host": ["{{baseUrl}}"], "path": [""] } } },
        { "name": "Swagger UI", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/docs", "host": ["{{baseUrl}}"], "path": ["docs"] } } },
        { "name": "GET /api/me", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/api/me", "host": ["{{baseUrl}}"], "path": ["api","me"] } } }
      ]
    },
    {
      "name": "Users",
      "item": [
        { "name": "GET /api/users", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/api/users", "host": ["{{baseUrl}}"], "path": ["api","users"] } } },
        { "name": "POST /api/users",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"name\": \"Иван Иванов\",\n  \"email\": \"ivan@example.com\"\n}" },
            "url": { "raw": "{{baseUrl}}/api/users", "host": ["{{baseUrl}}"], "path": ["api","users"] }
        }},
        { "name": "GET /api/users/{id}",
          "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/api/users/1", "host": ["{{baseUrl}}"], "path": ["api","users","1"] } }
        },
        { "name": "PUT /api/users/{id}",
          "request": {
            "method": "PUT",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"name\": \"Иван Обновлённый\"\n}" },
            "url": { "raw": "{{baseUrl}}/api/users/1", "host": ["{{baseUrl}}"], "path": ["api","users","1"] }
        }},
        { "name": "DELETE /api/users/{id}",
          "request": { "method": "DELETE", "url": { "raw": "{{baseUrl}}/api/users/1", "host": ["{{baseUrl}}"], "path": ["api","users","1"] } }
        },
        { "name": "POST /api/demo-users",
          "request": { "method": "POST", "url": { "raw": "{{baseUrl}}/api/demo-users", "host": ["{{baseUrl}}"], "path": ["api","demo-users"] } }
        }
      ]
    },
    {
      "name": "Posts",
      "item": [
        { "name": "GET /api/posts", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/api/posts", "host": ["{{baseUrl}}"], "path": ["api","posts"] } } },
        { "name": "GET /api/posts?paginated",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/api/posts?_start=0&_limit=5",
              "host": ["{{baseUrl}}"], "path": ["api","posts"],
              "query": [{ "key": "_start", "value": "0" }, { "key": "_limit", "value": "5" }]
        }}},
        { "name": "POST /api/posts (JSON)",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"title\": \"Пост с внешней картинкой\",\n  \"content\": \"Текст поста\",\n  \"author\": \"Автор\",\n  \"image_url\": \"https://picsum.photos/600/400\"\n}" },
            "url": { "raw": "{{baseUrl}}/api/posts", "host": ["{{baseUrl}}"], "path": ["api","posts"] }
        }},
        { "name": "POST /api/posts/upload (multipart)",
          "request": {
            "method": "POST",
            "body": {
              "mode": "formdata",
              "formdata": [
                { "key": "title", "value": "Пост с файлом", "type": "text" },
                { "key": "content", "value": "Описание", "type": "text" },
                { "key": "author", "value": "Автор", "type": "text" },
                { "key": "image_file", "type": "file", "src": "" }
              ]
            },
            "url": { "raw": "{{baseUrl}}/api/posts/upload", "host": ["{{baseUrl}}"], "path": ["api","posts","upload"] }
        }},
        { "name": "GET /api/posts/{id}",
          "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/api/posts/{{postId}}", "host": ["{{baseUrl}}"], "path": ["api","posts","{{postId}}"] } }
        },
        { "name": "PUT /api/posts/{id} (JSON patch)",
          "request": {
            "method": "PUT",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"title\": \"Обновлённый заголовок\",\n  \"image_url\": null\n}" },
            "url": { "raw": "{{baseUrl}}/api/posts/{{postId}}", "host": ["{{baseUrl}}"], "path": ["api","posts","{{postId}}"] }
        }},
        { "name": "PUT /api/posts/{id}/upload (multipart)",
          "request": {
            "method": "PUT",
            "body": { "mode": "formdata", "formdata": [{ "key": "image_file", "type": "file", "src": "" }] },
            "url": { "raw": "{{baseUrl}}/api/posts/{{postId}}/upload", "host": ["{{baseUrl}}"], "path": ["api","posts","{{postId}}","upload"] }
        }},
        { "name": "DELETE /api/posts/{id}",
          "request": { "method": "DELETE", "url": { "raw": "{{baseUrl}}/api/posts/{{postId}}", "host": ["{{baseUrl}}"], "path": ["api","posts","{{postId}}"] } }
        }
      ]
    },
    {
      "name": "Students",
      "item": [
        { "name": "GET /api/students", "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/api/students", "host": ["{{baseUrl}}"], "path": ["api","students"] } } },
        { "name": "PUT /api/students/{id}/attend",
          "request": {
            "method": "PUT",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"attend\": \"present\"\n}" },
            "url": { "raw": "{{baseUrl}}/api/students/1/attend", "host": ["{{baseUrl}}"], "path": ["api","students","1","attend"] }
        }},
        { "name": "PUT /api/students/{id}/grade",
          "request": {
            "method": "PUT",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"grade\": 11\n}" },
            "url": { "raw": "{{baseUrl}}/api/students/1/grade", "host": ["{{baseUrl}}"], "path": ["api","students","1","grade"] }
        }},
        { "name": "PUT /api/students/{id}/online",
          "request": {
            "method": "PUT",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"online\": true\n}" },
            "url": { "raw": "{{baseUrl}}/api/students/1/online", "host": ["{{baseUrl}}"], "path": ["api","students","1","online"] }
        }}
      ]
    }
  ]
}

===== FILE: .github/workflows/ci.yml =====
name: CI

on:
  push:
    branches: ["**"]
  pull_request:
    branches: ["**"]

jobs:
  frontend:
    name: Frontend (Vite/React/TS)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: lesson_ts-main
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: lesson_ts-main/package-lock.json
      - run: npm ci
      - run: npm run build
      - run: npm run lint

  api:
    name: API (FastAPI sanity)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: Test-API-main
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          cache-dependency-path: Test-API-main/requirements.txt
      - run: pip install -r requirements.txt
      - run: python -m py_compile main.py
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
### prod-вариант фронта (Vite build + Nginx) ###

===== FILE: docker-compose.prod.yml =====
version: "3.9"

services:
  api:
    build:
      context: ./Test-API-main
    container_name: student-api
    ports:
      - "8000:8000"
    volumes:
      - ./Test-API-main/uploads:/app/uploads
    restart: unless-stopped

  web:
    build:
      context: ./lesson_ts-main
      dockerfile: Dockerfile
      args:
        # Если хочешь чтоб фронт ходил прямо на опубликованный порт API,
        # оставь localhost (когда всё на одном хосте).
        # Если будешь проксировать через nginx (вариант B в README.prod.md),
        # поставь здесь "/api" и поправь код на import.meta.env.VITE_API_BASE.
        VITE_API_BASE: http://localhost:8000
    container_name: student-web
    ports:
      - "8080:80"
    depends_on:
      - api
    restart: unless-stopped

===== FILE: lesson_ts-main/Dockerfile =====
# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Значение попадёт в Vite на этапе сборки
ARG VITE_API_BASE=http://localhost:8000
ENV VITE_API_BASE=${VITE_API_BASE}

# Если используешь в коде другие переменные — добавь их сверху аналогично:
# ARG VITE_UPLOADS_BASE=/uploads
# ENV VITE_UPLOADS_BASE=${VITE_UPLOADS_BASE}

RUN npm run build

# --- Runtime stage (Nginx) ---
FROM nginx:1.27-alpine
# SPA-конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Статика фронта
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

===== FILE: lesson_ts-main/nginx.conf =====
# Минимальный конфиг Nginx для SPA
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  # Отдаём статические бандлы с кэшем
  location ~* \.(js|css|svg|png|jpg|jpeg|gif|ico|webp|woff2?)$ {
    try_files $uri =404;
    access_log off;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # SPA fallback
  location / {
    try_files $uri /index.html;
  }

  # Вариант B: если хочешь проксировать API через этот же домен — раскомментируй:
  # location /api/ {
  #   proxy_pass http://api:8000/api/;
  #   proxy_http_version 1.1;
  #   proxy_set_header Host $host;
  #   proxy_set_header X-Real-IP $remote_addr;
  #   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  #   proxy_set_header X-Forwarded-Proto $scheme;
  # }
  #
  # И статику загрузок тоже можно проксировать:
  # location /uploads/ {
  #   proxy_pass http://api:8000/uploads/;
  #   proxy_http_version 1.1;
  #   proxy_set_header Host $host;
  # }
}

===== FILE: README.prod.md =====
# Prod запуск (Vite build + Nginx)

Есть 2 пути:

## Вариант A — проще (без прокси)
Фронт собирается с `VITE_API_BASE=http://localhost:8000` и ходит напрямую к опубликованному API-порту.
- Ничего в `nginx.conf` трогать не нужно.
- CORS должен позволять запросы с http://localhost:8080 (в нашем API уже стоит `allow_origins=["*"]`).

Запуск:
```bash
docker compose -f docker-compose.prod.yml up -d --build
# Frontend: http://localhost:8080
# API:      http://localhost:8000
```

Хочешь другой адрес API в сборке фронта?
```bash
docker compose -f docker-compose.prod.yml build \
  --build-arg VITE_API_BASE=http://my-host-or-domain:8000 web
docker compose -f docker-compose.prod.yml up -d
```

## Вариант B — единый домен (прокси через Nginx)
Фронт и API доступны с одного origin (без CORS):
1) В `lesson_ts-main/nginx.conf` **раскомментируй** блоки `location /api/` и `/uploads/`.
2) В коде фронта вместо захардкоженного `http://localhost:8000` используй `import.meta.env.VITE_API_BASE` и ставь его равным `"/api"`.
   - Пример: `const API = import.meta.env.VITE_API_BASE ?? "/api"`
3) В `docker-compose.prod.yml` для `web.build.args` поставь:
   ```yaml
   VITE_API_BASE: /api
   ```
4) Пересобери/перезапусти:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   # Теперь фронт ходит на http://localhost:8080/api -> nginx -> api:8000
   ```

## Проверка
- Фронт: http://localhost:8080
- Swagger: http://localhost:8000/docs
- Загрузки (если проксируешь): http://localhost:8080/uploads/<file>

Советы:
- Для прод-домена открой порты/настрой HTTPS (например, с Caddy/Traefik/Certbot поверх).
- Мигрируй API_BASE в `.env.production` и читай через `import.meta.env` — удобнее переключать окружения.

-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------

Ниже — единый блок с готовыми файлами/заменами для фронта, чтобы всё ходило через import.meta.env.VITE_API_BASE и работало как с прокси "/api", так и с прямым хостом (http://localhost:8000/api).

-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------

===== FILE: lesson_ts-main/src/shared/types.ts =====
/** Общие типы для клиента */

export interface User {
  id: number
  name: string
  email: string
}

export interface Post {
  id: string
  title: string
  content: string
  author: string
  image_url?: string | null
  image_file?: string | null
  created_at: string
  updated_at: string
}

export type Attend = "none" | "late" | "present"

export interface Student {
  id: number
  name: string
  attend: Attend
  grade: number
  online: boolean
}

===== FILE: lesson_ts-main/src/api/http.ts =====
import axios, { AxiosInstance } from "axios"

/**
 * БАЗОВЫЕ АДРЕСА:
 * - Вариант с прокси через Vite/nginx: VITE_API_BASE=/api, VITE_UPLOADS_BASE=/uploads
 * - Вариант без прокси (напрямую к API): VITE_API_BASE=http://localhost:8000/api, VITE_UPLOADS_BASE=http://localhost:8000/uploads
 */
export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api"

export const UPLOADS_BASE =
  (import.meta.env.VITE_UPLOADS_BASE as string | undefined) ?? "/uploads"

/** Basic Auth (для учебного проекта). Переопредели в .env при необходимости. */
const BASIC_USER =
  (import.meta.env.VITE_BASIC_USER as string | undefined) ?? "admin"
const BASIC_PASS =
  (import.meta.env.VITE_BASIC_PASS as string | undefined) ?? "123"

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  // withCredentials оставляем false — авторизация через Basic
})

http.interceptors.request.use((config) => {
  const token = btoa(`${BASIC_USER}:${BASIC_PASS}`)
  config.headers = config.headers ?? {}
  // для JSON-запросов можно ставить по месту, но базово не мешает
  if (!config.headers["Content-Type"] && config.method !== "get") {
    config.headers["Content-Type"] = "application/json"
  }
  config.headers["Authorization"] = `Basic ${token}`
  return config
})

===== FILE: lesson_ts-main/src/api/usersApi.ts =====
import { http } from "./http"
import type { User } from "../shared/types"

const USERS = "/users"

export async function fetchUsers(): Promise<User[]> {
  const { data } = await http.get<User[]>(USERS)
  return data
}

export async function fetchUserById(id: number): Promise<User> {
  const { data } = await http.get<User>(`${USERS}/${id}`)
  return data
}

export async function createUser(payload: Pick<User, "name" | "email">): Promise<User> {
  const { data } = await http.post<User>(USERS, payload)
  return data
}

export async function updateUser(id: number, payload: Partial<Pick<User, "name" | "email">>): Promise<User> {
  const { data } = await http.put<User>(`${USERS}/${id}`, payload)
  return data
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  const { data } = await http.delete<{ message: string }>(`${USERS}/${id}`)
  return data
}

export async function createDemoUsers(): Promise<{ message: string; users: User[] }> {
  const { data } = await http.post<{ message: string; users: User[] }>(`/demo-users`)
  return data
}

===== FILE: lesson_ts-main/src/api/postsApi.ts =====
import { http, UPLOADS_BASE } from "./http"
import type { Post } from "../shared/types"

const POSTS = "/posts"

export function resolvePostImage(post: Post): string | undefined {
  if (post.image_url) return post.image_url
  if (post.image_file) return `${UPLOADS_BASE}/${post.image_file}`
  return undefined
}

export async function fetchPosts(params?: { _start?: number; _limit?: number }): Promise<Post[]> {
  const { data } = await http.get<Post[]>(POSTS, { params })
  return data
}

export async function fetchPostById(id: string): Promise<Post> {
  const { data } = await http.get<Post>(`${POSTS}/${id}`)
  return data
}

export async function createPostJson(payload: {
  title: string
  content: string
  author: string
  image_url?: string
}): Promise<Post> {
  const { data } = await http.post<Post>(POSTS, payload)
  return data
}

export async function createPostUpload(payload: {
  title: string
  content: string
  author: string
  file: File
}): Promise<Post> {
  const fd = new FormData()
  fd.append("title", payload.title)
  fd.append("content", payload.content)
  fd.append("author", payload.author)
  fd.append("image_file", payload.file)
  const { data } = await http.post<Post>(`${POSTS}/upload`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function updatePostJson(id: string, patch: Partial<{
  title: string
  content: string
  author: string
  image_url: string | null
}>): Promise<Post> {
  const { data } = await http.put<Post>(`${POSTS}/${id}`, patch)
  return data
}

export async function updatePostUpload(id: string, file: File): Promise<Post> {
  const fd = new FormData()
  fd.append("image_file", file)
  const { data } = await http.put<Post>(`${POSTS}/${id}/upload`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function deletePost(id: string): Promise<{ message: string }> {
  const { data } = await http.delete<{ message: string }>(`${POSTS}/${id}`)
  return data
}

===== FILE: lesson_ts-main/src/api/studentsApi.ts =====
import { http } from "./http"
import type { Student, Attend } from "../shared/types"

const STUDENTS = "/students"

export async function fetchStudents(): Promise<Student[]> {
  const { data } = await http.get<Student[]>(STUDENTS)
  return data
}

export async function updateStudentAttend(id: number, attend: Attend): Promise<Student> {
  const { data } = await http.put<Student>(`${STUDENTS}/${id}/attend`, { attend })
  return data
}

export async function updateStudentGrade(id: number, grade: number): Promise<Student> {
  const { data } = await http.put<Student>(`${STUDENTS}/${id}/grade`, { grade })
  return data
}

export async function updateStudentOnline(id: number, online: boolean): Promise<Student> {
  const { data } = await http.put<Student>(`${STUDENTS}/${id}/online`, { online })
  return data
}

===== FILE: .env.example =====
# --- КЛИЕНТ (Vite) ---
# Вариант с прокси (dev через Vite или prod через nginx): оставь /api и /uploads
VITE_API_BASE=/api
VITE_UPLOADS_BASE=/uploads

# Для прямого обращения к API без прокси — укажи ПОЛНЫЕ URL:
# VITE_API_BASE=http://localhost:8000/api
# VITE_UPLOADS_BASE=http://localhost:8000/uploads

# Порт Vite dev-сервера (используется в vite.config.ts)
VITE_PORT=5173

# Basic Auth (учебный) — переопредели при необходимости
VITE_BASIC_USER=admin
VITE_BASIC_PASS=123

===== FILE: lesson_ts-main/vite.config.ts =====
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = process.env.VITE_API_BASE || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: Number(process.env.VITE_PORT) || 5173,
    proxy: {
      // проксируем только если BASE задан как /api и /uploads
      '/api': { target: BACKEND_URL, changeOrigin: true },
      '/uploads': { target: BACKEND_URL, changeOrigin: true },
    },
  },
})

-----------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------