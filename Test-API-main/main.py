# Импорт необходимых модулей и классов из FastAPI и стандартной библиотеки Python
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
# Middleware для обработки CORS (Cross-Origin Resource Sharing)
from fastapi.middleware.cors import CORSMiddleware
# Модуль для базовой HTTP аутентификации
from fastapi.security import HTTPBasic, HTTPBasicCredentials
# Модуль для обслуживания статических файлов
from fastapi.staticfiles import StaticFiles
# Базовый класс для создания моделей данных с валидацией
from pydantic import BaseModel
# Импорт типов для аннотаций
from typing import List, Optional
# Модуль для генерации уникальных идентификаторов
import uuid
# Модуль для работы с датой и временем
from datetime import datetime
# Модуль для создания перечислений
from enum import Enum
# Модуль для работы с путями файловой системы
from pathlib import Path
# Модуль для высокоуровневых файловых операций
import shutil

# Создание экземпляра FastAPI приложения с метаданными
app = FastAPI(
    title="Учебный API для постов и пользователей",  # Название API
    description="API для изучения работы с REST запросами, Basic Auth и загрузкой изображений",  # Описание API
    version="1.2.0",  # Версия API
)

# --- CORS (Cross-Origin Resource Sharing) ---
# Добавление middleware для обработки CORS
app.add_middleware(
    CORSMiddleware,  # Класс middleware для CORS
    allow_origins=["*"],  # Разрешить запросы со всех источников
    allow_credentials=True,  # Разрешить отправку учетных данных
    allow_methods=["*"],  # Разрешить все HTTP методы
    allow_headers=["*"],  # Разрешить все заголовки
)

# --- Обслуживание статических файлов (загрузки) ---
UPLOAD_DIR = Path("uploads")  # Создание объекта Path для директории загрузок
UPLOAD_DIR.mkdir(exist_ok=True)  # Создание директории, если она не существует
# Монтирование директории со статическими файлами
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# --- Аутентификация (Basic Auth) ---
security = HTTPBasic()  # Создание экземпляра HTTPBasic аутентификации
# Словарь с пользователями и паролями (в реальном приложении хранить в базе данных)
USERS = {"admin": "123"}

# Функция для аутентификации пользователя
def authenticate_user(credentials: HTTPBasicCredentials = Depends(security)):
    username = credentials.username  # Получение имени пользователя из credentials
    password = credentials.password  # Получение пароля из credentials
    # Проверка существования пользователя и корректности пароля
    if username not in USERS or password != USERS[username]:
        # Вызов исключения при неудачной аутентификации
        raise HTTPException(
            status_code=401,  # Код статуса HTTP 401 Unauthorized
            detail="Неверное имя пользователя или пароль",  # Сообщение об ошибке
            headers={"WWW-Authenticate": "Basic"},  # Заголовок аутентификации
        )
    return username  # Возврат имени пользователя при успешной аутентификации

# =========================================
#                 ПОСТЫ
# =========================================
# Модель Pydantic для создания поста
class PostCreate(BaseModel):
    title: str  # Заголовок поста (обязательное поле)
    content: str  # Содержание поста (обязательное поле)
    author: str  # Автор поста (обязательное поле)
    image_url: Optional[str] = None  # Ссылка на внешнее изображение (необязательное поле)

# Модель Pydantic для обновления поста
class PostUpdate(BaseModel):
    title: Optional[str] = None  # Опциональное обновление заголовка
    content: Optional[str] = None  # Опциональное обновление содержания
    author: Optional[str] = None  # Опциональное обновление автора
    image_url: Optional[str] = None  # Опциональное обновление ссылки на изображение

# Модель Pydantic для ответа с данными поста
class Post(BaseModel):
    id: str  # Уникальный идентификатор поста
    title: str  # Заголовок поста
    content: str  # Содержание поста
    author: str  # Автор поста
    image_url: Optional[str] = None   # URL внешнего изображения
    image_file: Optional[str] = None  # Имя локального файла изображения в /uploads
    created_at: datetime  # Дата и время создания
    updated_at: datetime  # Дата и время последнего обновления

# Словарь для хранения постов в памяти (временная замена базы данных)
posts_db: dict[str, Post] = {}

# Функция для сохранения загруженного файла
def _save_upload(file: UploadFile) -> str:
    # Получение расширения файла в нижнем регистре
    ext = Path(file.filename or "").suffix.lower()
    # Проверка допустимых расширений файлов
    if ext not in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}:
        # Вызов исключения при недопустимом формате файла
        raise HTTPException(status_code=400, detail="Допустимы изображения: jpg, png, gif, webp, bmp")
    # Генерация уникального имени файла
    fname = f"{uuid.uuid4().hex}{ext}"
    # Создание полного пути к файлу
    dst = UPLOAD_DIR / fname
    # Сохранение файла на диск
    with open(dst, "wb") as f:
        shutil.copyfileobj(file.file, f)  # Копирование содержимого файла
    return fname  # Возврат имени сохраненного файла

# Функция проверки использования файла другими постами
def _file_in_use(filename: Optional[str], exclude_id: Optional[str] = None) -> bool:
    if not filename:  # Если имя файла не указано
        return False
    # Проверка всех постов кроме исключенного
    for pid, p in posts_db.items():
        if pid != exclude_id and p.image_file == filename:
            return True  # Файл используется другим постом
    return False  # Файл не используется

# Функция удаления загруженного файла
def _delete_upload(filename: Optional[str]):
    if filename:  # Если имя файла указано
        try:
            # Попытка удаления файла (игнорирование если файл не существует)
            (UPLOAD_DIR / filename).unlink(missing_ok=True)
        except Exception:
            pass  # Игнорирование любых ошибок при удалении

# Функция удаления файла если он не используется
def _delete_upload_if_unused(filename: Optional[str], exclude_id: Optional[str] = None):
    """Удаляем файл из /uploads, но только если он больше никому не нужен."""
    if not filename:  # Если имя файла не указано
        return
    # Проверка использования файла другими постами
    if _file_in_use(filename, exclude_id=exclude_id):
        return  # Выход если файл используется
    try:
        # Попытка удаления файла
        (UPLOAD_DIR / filename).unlink(missing_ok=True)
    except Exception:
        pass  # Игнорирование ошибок

# Маршрут для корневого URL
@app.get("/")
def read_root():
    return {
        "message": "Добро пожаловать в учебный API!",  # Приветственное сообщение
        "documentation": "/docs",  # Ссылка на документацию
        "posts_count": len(posts_db),  # Количество постов
        "auth_info": {"type": "Basic Auth", "login": "admin", "password": "123"},  # Информация об аутентификации
    }

# Маршрут для получения информации о текущем пользователе
@app.get("/api/me")
def get_current_user(current_user: str = Depends(authenticate_user)):
    return {"username": current_user, "message": f"Привет, {current_user}! Авторизация успешна."}

# ------ CRUD операции для постов (JSON) ------
# Маршрут для получения списка постов
@app.get("/api/posts", response_model=List[Post])
def get_posts(_limit: Optional[int] = None, _start: Optional[int] = None, current_user: str = Depends(authenticate_user)):
    posts = list(posts_db.values())  # Получение всех постов
    posts.sort(key=lambda x: x.created_at)  # Сортировка по дате создания (по возрастанию)
    if _start is not None and _start > 0:  # Если указан параметр начала
        posts = posts[_start:]  # Применение пагинации (начальная позиция)
    if _limit is not None and _limit > 0:  # Если указан лимит
        posts = posts[:_limit]  # Применение пагинации (количество записей)
    return posts  # Возврат списка постов

# Маршрут для получения конкретного поста по ID
@app.get("/api/posts/{post_id}", response_model=Post)
def get_post(post_id: str, current_user: str = Depends(authenticate_user)):
    if post_id not in posts_db:  # Проверка существования поста
        raise HTTPException(status_code=404, detail="Пост не найден")  # Ошибка если пост не найден
    return posts_db[post_id]  # Возврат найденного поста

# Маршрут для создания нового поста
@app.post("/api/posts", response_model=Post)
def create_post(post: PostCreate, current_user: str = Depends(authenticate_user)):
    post_id = str(uuid.uuid4())  # Генерация уникального ID для поста
    now = datetime.now()  # Текущее время
    # Создание нового объекта поста
    new_post = Post(
        id=post_id,
        title=post.title,
        content=post.content,
        author=post.author,
        image_url=post.image_url,
        image_file=None,
        created_at=now,
        updated_at=now,
    )
    posts_db[post_id] = new_post  # Сохранение поста в "базе данных"
    return new_post  # Возврат созданного поста

# Маршрут для обновления существующего поста
@app.put("/api/posts/{post_id}", response_model=Post)
def update_post(post_id: str, post_update: PostUpdate, current_user: str = Depends(authenticate_user)):
    if post_id not in posts_db:  # Проверка существования поста
        raise HTTPException(status_code=404, detail="Пост не найден")  # Ошибка если пост не найден
    p = posts_db[post_id]  # Получение поста из базы данных
    # Преобразование модели обновления в словарь (исключая незаданные поля)
    upd = post_update.dict(exclude_unset=True)

    # Нормализация пустой строки в None для image_url
    if "image_url" in upd and isinstance(upd["image_url"], str) and upd["image_url"].strip() == "":
        upd["image_url"] = None

    # Если установлен новый внешний URL и ранее был локальный файл - удаляем файл
    if "image_url" in upd and upd["image_url"] is not None and p.image_file:
        _delete_upload_if_unused(p.image_file, exclude_id=post_id)  # Удаление если не используется
        p.image_file = None  # Очистка поля локального файла

    # Если явно установлен image_url = None и был файл - удаляем файл
    if "image_url" in upd and upd["image_url"] is None and p.image_file:
        _delete_upload_if_unused(p.image_file, exclude_id=post_id)  # Удаление если не используется
        p.image_file = None  # Очистка поля локального файла

    # Обновление полей поста
    for f, v in upd.items():
        setattr(p, f, v)  # Установка новых значений

    p.updated_at = datetime.now()  # Обновление времени изменения
    return p  # Возврат обновленного поста

# Маршрут для удаления поста
@app.delete("/api/posts/{post_id}")
def delete_post(post_id: str, current_user: str = Depends(authenticate_user)):
    if post_id not in posts_db:  # Проверка существования поста
        raise HTTPException(status_code=404, detail="Пост не найден")  # Ошибка если пост не найден
    p = posts_db.pop(post_id)  # Удаление поста из базы данных
    _delete_upload_if_unused(p.image_file, exclude_id=post_id)  # Удаление связанного файла если не используется
    return {"message": f"Пост '{p.title}' успешно удалён пользователем {current_user}"}  # Сообщение об успехе

# ------ Посты (загрузка файлов) ------
# Маршрут для создания поста с загрузкой файла
@app.post("/api/posts/upload", response_model=Post)
def create_post_upload(
    title: str = Form(...),  # Обязательное поле заголовка из формы
    content: str = Form(...),  # Обязательное поле содержания из формы
    author: str = Form(...),  # Обязательное поле автора из формы
    image_file: UploadFile | None = File(None),  # Опциональный файл изображения
    current_user: str = Depends(authenticate_user),  # Аутентификация пользователя
):
    post_id = str(uuid.uuid4())  # Генерация уникального ID
    now = datetime.now()  # Текущее время
    # Сохранение файла если он был передан
    saved_name = _save_upload(image_file) if image_file else None
    # Создание нового поста
    new_post = Post(
        id=post_id,
        title=title,
        content=content,
        author=author,
        image_url=None,  # Внешний URL не используется
        image_file=saved_name,  # Имя сохраненного файла
        created_at=now,
        updated_at=now,
    )
    posts_db[post_id] = new_post  # Сохранение поста
    return new_post  # Возврат созданного поста

# Маршрут для обновления изображения поста
@app.put("/api/posts/{post_id}/upload", response_model=Post)
def update_post_upload(
    post_id: str,
    image_file: UploadFile | None = File(None),  # Новый файл изображения
    current_user: str = Depends(authenticate_user),  # Аутентификация
):
    if post_id not in posts_db:  # Проверка существования поста
        raise HTTPException(status_code=404, detail="Пост не найден")  # Ошибка
    p = posts_db[post_id]  # Получение поста
    if image_file is None:  # Проверка что файл передан
        raise HTTPException(status_code=400, detail="Файл не передан")  # Ошибка

    # Удаление старого файла если он не используется другими постами
    _delete_upload_if_unused(p.image_file, exclude_id=post_id)
    p.image_file = _save_upload(image_file)  # Сохранение нового файла
    p.image_url = None  # Очистка внешнего URL при использовании файла
    p.updated_at = datetime.now()  # Обновление времени изменения
    return p  # Возврат обновленного поста

# =========================================
#                 ПОЛЬЗОВАТЕЛИ
# =========================================
# Модель для создания пользователя
class UserCreate(BaseModel):
    name: str  # Имя пользователя
    email: str  # Email пользователя

# Модель для обновления пользователя
class UserUpdate(BaseModel):
    name: Optional[str] = None  # Опциональное обновление имени
    email: Optional[str] = None  # Опциональное обновление email

# Модель для ответа с данными пользователя
class User(BaseModel):
    id: int  # ID пользователя
    name: str  # Имя пользователя
    email: str  # Email пользователя

# Словарь для хранения пользователей в памяти
users_db: dict[int, User] = {}
# Счетчик для генерации ID пользователей
user_counter = 0

# Маршрут для получения списка пользователей
@app.get("/api/users", response_model=List[User])
def get_users(current_user: str = Depends(authenticate_user)):
    return list(users_db.values())  # Возврат всех пользователей

# Маршрут для получения конкретного пользователя по ID
@app.get("/api/users/{user_id}", response_model=User)
def get_user(user_id: int, current_user: str = Depends(authenticate_user)):
    if user_id not in users_db:  # Проверка существования пользователя
        raise HTTPException(status_code=404, detail="Пользователь не найден")  # Ошибка
    return users_db[user_id]  # Возврат найденного пользователя

# Маршрут для создания нового пользователя
@app.post("/api/users", response_model=User)
def create_user(user_data: UserCreate, current_user: str = Depends(authenticate_user)):
    global user_counter  # Использование глобальной переменной счетчика
    # Проверка уникальности email
    for existing_user in users_db.values():
        if existing_user.email == user_data.email:
            raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")  # Ошибка
    user_counter += 1  # Инкремент счетчика
    # Создание нового пользователя
    new_user = User(id=user_counter, name=user_data.name, email=user_data.email)
    users_db[user_counter] = new_user  # Сохранение пользователя
    return new_user  # Возврат созданного пользователя

# Маршрут для обновления пользователя
@app.put("/api/users/{user_id}", response_model=User)
def update_user(user_id: int, user_data: UserUpdate, current_user: str = Depends(authenticate_user)):
    if user_id not in users_db:  # Проверка существования пользователя
        raise HTTPException(status_code=404, detail="Пользователь не найден")  # Ошибка
    user = users_db[user_id]  # Получение пользователя
    # Преобразование модели обновления в словарь
    update_data = user_data.dict(exclude_unset=True)
    # Проверка уникальности email при обновлении
    if "email" in update_data:
        for existing_id, existing_user in users_db.items():
            if existing_id != user_id and existing_user.email == update_data["email"]:
                raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")  # Ошибка
    # Обновление полей пользователя
    for field, value in update_data.items():
        setattr(user, field, value)  # Установка новых значений
    return user  # Возврат обновленного пользователя

# Маршрут для удаления пользователя
@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, current_user: str = Depends(authenticate_user)):
    if user_id not in users_db:  # Проверка существования пользователя
        raise HTTPException(status_code=404, detail="Пользователь не найден")  # Ошибка
    deleted_user = users_db.pop(user_id)  # Удаление пользователя
    return {"message": f"Пользователь '{deleted_user.name}' успешно удален пользователем {current_user}"}  # Сообщение

# Маршрут для создания демо-пользователей
@app.post("/api/demo-users")
def create_demo_users(current_user: str = Depends(authenticate_user)):
    global user_counter  # Использование глобальной переменной счетчика
    # Список демо-пользователей
    demo_users = [
        {"name": "Иван Иванов", "email": "ivan@example.com"},
        {"name": "Мария Петрова", "email": "maria@example.com"},
        {"name": "Алексей Сидоров", "email": "alexey@example.com"},
    ]
    created = []  # Список созданных пользователей
    # Создание демо-пользователей
    for du in demo_users:
        # Проверка что пользователь с таким email еще не существует
        if not any(u.email == du["email"] for u in users_db.values()):
            user_counter += 1  # Инкремент счетчика
            # Создание нового пользователя
            u = User(id=user_counter, name=du["name"], email=du["email"])
            users_db[user_counter] = u  # Сохранение пользователя
            created.append(u)  # Добавление в список созданных
    return {"message": f"Создано {len(created)} демо пользователей", "users": created}  # Результат

# =========================================
#                СТУДЕНТЫ
# =========================================
# Перечисление статусов посещения
class AttendStatus(str, Enum):
    none = "none"  # Не отмечен
    late = "late"  # Опоздал
    present = "present"  # Присутствовал

# Модель для студента
class Student(BaseModel):
    id: int  # ID студента
    name: str  # Имя студента
    attend: AttendStatus = AttendStatus.none  # Статус посещения (по умолчанию none)
    grade: int = 0  # Оценка (по умолчанию 0)
    online: bool = False  # Онлайн статус (по умолчанию False)

# Модель для обновления статуса посещения
class UpdateAttend(BaseModel):
    attend: AttendStatus  # Новый статус посещения

# Модель для обновления оценки
class UpdateGrade(BaseModel):
    grade: int  # Новая оценка

# Модель для обновления онлайн статуса
class UpdateOnline(BaseModel):
    online: bool  # Новый онлайн статус

# База данных студентов в памяти
students_db = {
    1: Student(id=1, name="Дюсупов Аскербек Сабирович"),
    2: Student(id=2, name="Исаев Владислав"),
    3: Student(id=3, name="Лаас Михаил Юрьевич"),
    4: Student(id=4, name="Нурмолдин Нурбай Бекболатович"),
    5: Student(id=5, name="Шаунин Роман Владимирович"),
}

# Маршрут для получения списка студентов
@app.get("/api/students", response_model=List[Student])
def get_students(current_user: str = Depends(authenticate_user)):
    return list(students_db.values())  # Возврат всех студентов

# Маршрут для обновления статуса посещения студента
@app.put("/api/students/{student_id}/attend", response_model=Student)
def update_student_attend(student_id: int, data: UpdateAttend, current_user: str = Depends(authenticate_user)):
    if student_id not in students_db:  # Проверка существования студента
        raise HTTPException(status_code=404, detail="Студент не найден")  # Ошибка
    s = students_db[student_id]  # Получение студента
    s.attend = data.attend  # Обновление статуса посещения
    return s  # Возврат обновленного студента

# Маршрут для обновления оценки студента
@app.put("/api/students/{student_id}/grade", response_model=Student)
def update_student_grade(student_id: int, data: UpdateGrade, current_user: str = Depends(authenticate_user)):
    if student_id not in students_db:  # Проверка существования студента
        raise HTTPException(status_code=404, detail="Студент не найден")  # Ошибка
    if not (0 <= data.grade <= 12):  # Проверка допустимого диапазона оценок
        raise HTTPException(status_code=400, detail="Оценка должна быть от 0 до 12")  # Ошибка
    s = students_db[student_id]  # Получение студента
    s.grade = data.grade  # Обновление оценки
    return s  # Возврат обновленного студента

# Маршрут для обновления онлайн статуса студента
@app.put("/api/students/{student_id}/online", response_model=Student)
def update_student_online(student_id: int, data: UpdateOnline, current_user: str = Depends(authenticate_user)):
    if student_id not in students_db:  # Проверка существования студента
        raise HTTPException(status_code=404, detail="Студент не найден")  # Ошибка
    s = students_db[student_id]  # Получение студента
    s.online = data.online  # Обновление онлайн статуса
    return s  # Возврат обновленного студента

# Запуск приложения при непосредственном выполнении файла
if __name__ == "__main__":
    import uvicorn  # Импорт сервера uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)  # Запуск сервера на всех интерфейсах порта 8000

# /*
# ===========================================
# ПОЯСНЕНИЯ К КОММЕНТАРИЯМ В ДАННОМ ФАЙЛЕ:
# ===========================================

# 1. Файл main.py - основной файл FastAPI приложения с учебным API

# 2. Комментарии "Импорт необходимых модулей..." - объясняют назначение каждого импорта
#    и его роль в работе приложения

# 3. Комментарии "Создание экземпляра FastAPI..." - описывают метаданные API (название, 
#    описание, версия) которые отображаются в автоматической документации

# 4. Комментарии "Добавление middleware для обработки CORS..." - поясняют настройку
#    Cross-Origin Resource Sharing для разрешения запросов с разных доменов

# 5. Комментарии "Обслуживание статических файлов..." - описывают создание директории
#    для загрузок и ее монтирование для обслуживания статических файлов

# 6. Комментарии "Аутентификация (Basic Auth)..." - объясняют реализацию базовой
#    HTTP аутентификации с предопределенными пользователями

# 7. Комментарии "Модель Pydantic для..." - описывают структуры данных для валидации
#    и сериализации запросов и ответов API

# 8. Комментарии "Словарь для хранения..." - поясняют использование временного хранилища
#    в памяти вместо реальной базы данных (для учебных целей)

# 9. Комментарии "Функция для сохранения загруженного файла..." - описывают логику
#    работы с файлами: валидация, сохранение, проверка использования, удаление

# 10. Комментарии "Маршрут для..." - детально объясняют каждый эндпоинт API:
#     - Назначение и HTTP метод
#     - Параметры запроса и их валидация
#     - Логику обработки запроса
#     - Возвращаемые данные и коды статусов

# 11. Комментарии "Перечисление статусов посещения..." - описывают систему отметок
#     студентов с использованием Enum для ограничения допустимых значений

# 12. Комментарии "Запуск приложения..." - объясняют условие для непосредственного
#     запуска сервера при выполнении файла

# ОСОБЕННОСТИ РЕАЛИЗАЦИИ:
# - Использование Depends(authenticate_user) для защиты маршрутов аутентификацией
# - Поддержка двух типов изображений: внешние URL и локальные загрузки файлов
# - Автоматическая очистка неиспользуемых файлов при удалении/обновлении постов
# - Валидация данных на уровне моделей Pydantic
# - Подробная обработка ошибок с соответствующими HTTP статусами
# - Поддержка пагинации для запросов списка постов
# - Генерация автоматической документации через FastAPI и Swagger UI
# */

