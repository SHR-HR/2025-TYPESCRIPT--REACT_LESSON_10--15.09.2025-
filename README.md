# 🧪 Учебный проект: React + TypeScript + Redux Toolkit + FastAPI

Полнофункциональное учебное приложение для управления **пользователями**, **постами** и **студентами**.

- **Frontend:** React 19 + TypeScript + Redux Toolkit + React Router + Axios + SCSS (Vite)
- **Backend:** FastAPI + Uvicorn + Pydantic v2 (+ статика `/uploads`)
- **Auth:** HTTP Basic (`admin` / `123`)
- **Загрузка файлов:** `multipart/form-data` (изображения сохраняются в `/uploads`)
- **Назначение:** демонстрация Redux Toolkit (slices) и `createAsyncThunk` (ДЗ 1–2)

> ⚠️ Проект учебный. Для production нужны: БД, нормальная авторизация, миграции/хранилище для файлов, логирование, конфиг через env и т. п.

---

## Содержание
- [Стек](#стек)
- [Структура репозитория](#структура-репозитория)
- [Быстрый старт](#быстрый-старт)
  - [API (Docker)](#api-docker)
  - [API (локально)](#api-локально)
  - [Frontend](#frontend)
- [Аутентификация](#аутентификация)
- [Функциональность](#функциональность)
- [API: эндпоинты](#api-эндпоинты)
- [Примеры cURL](#примеры-curl)
- [Frontend: маршруты, Redux и API-модули](#frontend-маршруты-redux-и-api-модули)
- [Настройки разработки](#настройки-разработки)
- [Домашние задания (сдано)](#домашние-задания-сдано)
- [Отладка и поддержка](#отладка-и-поддержка)
- [Лицензия](#лицензия)

---

## Стек

**Frontend**
- React 19, TypeScript 5, React Router 7
- Redux Toolkit (slices + `createAsyncThunk`), `react-redux`
- Axios
- Vite 7 (dev/build/preview)
- SCSS (кастомные стили)

**Backend**
- FastAPI 0.104
- Uvicorn 0.24
- Pydantic v2
- `python-multipart` для загрузки файлов
- CORS открыт для всех источников (учебно)

---

## Структура репозитория

```
project/
├─ Test-API-main/                  # Backend (FastAPI)
│  ├─ main.py                      # API, модели, маршруты, статика /uploads
│  ├─ requirements.txt             # Зависимости Python
│  ├─ Dockerfile                   # Образ API (uvicorn)
│  └─ uploads/                     # Загруженные картинки (создаётся автоматически)
└─ lesson_ts-main/                 # Frontend (React + TS)
   ├─ src/
   │  ├─ api/                      # axios-модули: usersApi, postsApi, studentsApi
   │  ├─ layouts/                  # MainLayoute (+ простая навигация)
   │  ├─ pages/                    # Home, About, Users(+Detail), Posts, Students, NotFound
   │  ├─ shared/                   # типы (User/Post/Student) + mockData
   │  ├─ store/                    # store.ts + slices (users, posts, students)
   │  └─ styles/                   # SCSS (base/abstracts/components)
   ├─ index.html
   ├─ package.json                 # npm-скрипты (dev/build/preview/lint)
   ├─ vite.config.ts
   └─ tsconfig*.json
```

---

## Быстрый старт

### API (Docker)
```bash
cd Test-API-main
docker build -t student-api .
docker run -p 8000:8000 student-api
```

**Доступно:** http://localhost:8000  
**Документация:** http://localhost:8000/docs  
**Статика:** http://localhost:8000/uploads/<имя_файла>

### API (локально)
```bash
cd Test-API-main
python -m venv .venv && . .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd lesson_ts-main
npm install
npm run dev
```

**Фронтенд:** http://localhost:5173

> ⚠️ По умолчанию `src/api/*.ts` используют `http://localhost:8000` и авторизацию `admin/123`. Для смены адреса отредактируйте константы в API-модулях или используйте env-переменные.

---

## Аутентификация

Все защищённые маршруты API требуют HTTP Basic Auth:
- **Логин:** `admin`
- **Пароль:** `123`

В Swagger UI нажмите **Authorize** и введите эти данные.

---

## Функциональность

### Пользователи
- ✅ Просмотр списка
- ✅ Добавление нового пользователя (валидация уникальности email)
- ✅ Редактирование пользователя
- ✅ Удаление пользователя
- ✅ Детальная страница пользователя

### Посты
- ✅ Создание поста (заголовок, автор, текст)
- ✅ Картинка: либо внешняя `image_url`, либо загрузка файла (`multipart/form-data`)
- ✅ Просмотр карточек постов (grid)
- ✅ Редактирование поста (включая замену картинки и очистку неиспользуемых файлов)
- ✅ Удаление поста

### Студенты
- ✅ Список студентов (демо-данные)
- ✅ Отметка присутствия: `present` / `late` / `none`
- ✅ Оценка (0–12)
- ✅ Переключение online-статуса

---

## API: эндпоинты

**Базовый URL:** `http://localhost:8000`

### Служебные
- `GET /` — приветствие и мета-информация
- `GET /api/me` — данные текущего пользователя (Basic Auth)

### Пользователи
- `GET /api/users` — список пользователей
- `GET /api/users/{id}` — получить пользователя
- `POST /api/users` — создать пользователя `{ name, email }`
- `PUT /api/users/{id}` — обновить `{ name?, email? }` (валидация уникальности email)
- `DELETE /api/users/{id}` — удалить
- `POST /api/demo-users` — создать демо-пользователей (если их ещё нет)

### Посты
- `GET /api/posts` — список постов (`_limit?`, `_start?` — простая пагинация)
- `GET /api/posts/{id}` — получить пост
- `POST /api/posts` — создать пост (JSON): `{ title, content, author, image_url? }`
- `POST /api/posts/upload` — создать пост с файлом (`image_file`)
- `PUT /api/posts/{id}` — частичное обновление (JSON)
- `PUT /api/posts/{id}/upload` — заменить изображение файлами (`image_file`)
- `DELETE /api/posts/{id}` — удалить пост (неиспользуемый файл очищается автоматически)

**Статика загрузок:** `GET /uploads/<filename>`

### Студенты
- `GET /api/students` — список студентов
- `PUT /api/students/{id}/attend` — `{ attend: "present" | "late" | "none" }`
- `PUT /api/students/{id}/grade` — `{ grade: number }` (0–12)
- `PUT /api/students/{id}/online` — `{ online: boolean }`

---

## Примеры cURL

```bash
# Все пользователи
curl -u admin:123 http://localhost:8000/api/users

# Создать пользователя
curl -u admin:123 -H "Content-Type: application/json" \
  -d '{"name":"Иван","email":"ivan@example.com"}' \
  http://localhost:8000/api/users

# Все посты (с пагинацией)
curl -u admin:123 "http://localhost:8000/api/posts?_start=0&_limit=10"

# Создать пост (JSON)
curl -u admin:123 -H "Content-Type: application/json" \
  -d '{"title":"Заголовок","content":"Текст","author":"Автор","image_url":"https://picsum.photos/600"}' \
  http://localhost:8000/api/posts

# Создать пост с картинкой
curl -u admin:123 -F "title=Hello" -F "content=World" -F "author=Admin" \
  -F "image_file=@/путь/к/фото.jpg" \
  http://localhost:8000/api/posts/upload

# Отметить присутствие студента
curl -u admin:123 -H "Content-Type: application/json" \
  -d '{"attend":"present"}' \
  http://localhost:8000/api/students/1/attend
```

---

## Frontend: маршруты, Redux и API-модули

### Маршруты
- `/` — HomePage
- `/about` — AboutPage
- `/users` — UsersPage
- `/users/:id` — UserDetailPage
- `/posts` — PostsPage
- `/students` — StudentsPage
- `*` — NotFoundPage

### Redux store / slices
- `usersSlice` — список пользователей и CRUD (`fetchUsers`, `addUser`, `updateUser`, `deleteUser`)
- `postsSlice` — посты и CRUD c поддержкой загрузки файлов (`fetchPosts`, `addPost`, `updatePost`, `deletePost`)
- `studentsSlice` — студенты и обновления (`fetchStudents`, `updateStudentAttend`, `updateStudentGrade`, `updateStudentOnline`)

Общий стор: `src/store/store.ts`  
Селекторы строго типизированы (`RootState`). Обработка ошибок централизована в слайсах.

### API-модули (Axios)
- `src/api/usersApi.ts` — GET/POST/PUT/DELETE `/api/users`
- `src/api/postsApi.ts` — JSON-и file-запросы, вспомогательная `resolvePostImage`
- `src/api/studentsApi.ts` — обновление посещения/оценки/онлайна

---

## Настройки разработки

### Переменные окружения (опционально)

Создайте файл `lesson_ts-main/.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_API_USERNAME=admin
VITE_API_PASSWORD=123
```

⚠️ Сейчас URL/креды зашиты в `src/api/*.ts`. Чтобы использовать `.env`, замените константы на `import.meta.env.VITE_*`.

### npm-скрипты (frontend)
- `npm run dev` — режим разработки (Vite)
- `npm run build` — сборка production
- `npm run preview` — предпросмотр сборки
- `npm run lint` — ESLint (строгие правила, TS-strict)

---

## Домашние задания (сдано)

### ДЗ #1 — Redux Toolkit
- Настроен `configureStore` с типами `RootState` и `AppDispatch`
- Созданы слайсы: `users`, `posts`, `students` со строгой типизацией
- Селекторы и экшены типобезопасны; ошибки хранятся в слайсах, есть `clear*Error`

### ДЗ #2 — Async Thunk + интеграция с API
- Для каждой сущности реализованы `createAsyncThunk`:
  - `fetch*`, `add*`, `update*`, `delete*` (где применимо)
  - Обработка `pending/fulfilled/rejected`, отображение `loading` и ошибок в UI
  - Поддержана загрузка файлов для постов (`multipart/form-data`)

**На стороне API:**
- Basic Auth, CORS
- Валидации (форматы файлов, диапазоны оценок, уникальность email)
- Аккуратная очистка неиспользуемых загруженных файлов

---

## Отладка и поддержка

### Чек-лист

1. **Сервисы запущены?**
   ```bash
   # API
   curl http://localhost:8000
   
   # Frontend
   curl http://localhost:5173
   ```

2. **Логи**
   ```bash
   # API (Docker)
   docker logs <container_id>
   
   # Frontend
   npm run dev 2>&1 | tee log.txt
   ```

### Документация
- **Swagger UI:** http://localhost:8000/docs

### Создайте issue с описанием
- Шаги воспроизведения
- Ожидаемое поведение
- Фактическое поведение
- Скриншоты/логи

### Частые проблемы
- **401 Unauthorized** — проверьте Basic Auth (`admin/123`) и кнопку Authorize в Swagger.
- **CORS/Network** — откройте DevTools (F12) → Network; убедитесь, что API реально на `http://localhost:8000`.
- **Картинки не видны** — файл должен быть доступен по `http://localhost:8000/uploads/<имя>`. При замене картинки старый файл может быть удалён, если больше не используется.
- **Порты заняты** — измените порт или остановите конфликтующие процессы.

---

## Лицензия

Учебный проект. Используйте свободно для обучения и демонстраций.
