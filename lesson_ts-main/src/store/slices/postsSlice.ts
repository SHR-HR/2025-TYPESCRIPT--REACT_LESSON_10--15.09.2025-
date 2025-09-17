// Импорт функций createAsyncThunk и createSlice из Redux Toolkit для создания асинхронных действий и среза состояния
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// Импорт типа RootState для типизированных селекторов состояния всего хранилища
import type { RootState } from "../store";
// Импорт TypeScript типа Post для типизации данных поста
import type { Post } from "../../shared/types/Post";
// Импорт API функций для работы с данными постов
import { postsApi } from "../../api/postsApi";

// Интерфейс состояния постов (PostsState)
interface PostsState {
    list: Post[];                 // Массив постов
    loading: boolean;             // Флаг загрузки (true во время выполнения запросов)
    error: string | null;         // Сообщение об ошибке или null если ошибок нет
    editingId: string | null;     // ID редактируемого поста или null если нет активного редактирования
}

// Начальное состояние среза постов
const initialState: PostsState = {
    list: [],                     // Пустой массив постов
    loading: false,               // Загрузка не активна
    error: null,                  // Ошибок нет
    editingId: null               // Нет активного редактирования
};

// Тип для входных данных нового поста
export type NewPostInput = {
    title: string;                // Заголовок поста
    content: string;              // Содержание поста
    author: string;               // Автор поста
    imageUrl?: string;            // URL изображения (опционально)
    imageFile?: File | null;      // Файл изображения (опционально)
};

// Тип для входных данных обновления поста
export type UpdatePostInput = {
    id: string;                   // ID поста для обновления
    patch?: {                    // Объект с обновляемыми полями (опционально)
        title?: string;          // Новый заголовок
        content?: string;        // Новое содержание
        author?: string;         // Новый автор
        image_url?: string | null; // Новый URL изображения
    };
    imageFile?: File | null;      // Новый файл изображения (опционально)
};

// Асинхронное действие для загрузки всех постов
export const fetchPosts = createAsyncThunk(
    "posts/fetchAll",             // Префикс действия: "posts/fetchAll"
    async (_, { rejectWithValue }) => {  // Функция-исполнитель, _ - нет параметров
        try {
            // Вызов API для получения списка всех постов
            return await postsApi.getAll();
        } catch (e: any) {
            // В случае ошибки возвращаем сообщение об ошибке через rejectWithValue
            return rejectWithValue(e?.response?.data?.detail || "Ошибка загрузки постов");
        }
    }
);

// Асинхронное действие для добавления нового поста
export const addPost = createAsyncThunk(
    "posts/add",                  // Префикс действия: "posts/add"
    async (input: NewPostInput, { rejectWithValue }) => {  // Параметры: данные нового поста
        try {
            // Проверяем, есть ли файл изображения для загрузки
            if (input.imageFile) {
                // Вызов API для создания поста с файлом
                return await postsApi.createWithFile({
                    title: input.title,
                    content: input.content,
                    author: input.author,
                    file: input.imageFile
                });
            }
            // Вызов API для создания поста без файла (только JSON данные)
            return await postsApi.createJson({
                title: input.title,
                content: input.content,
                author: input.author,
                image_url: input.imageUrl
            });
        } catch (e: any) {
            // Обработка ошибки создания поста
            return rejectWithValue(e?.response?.data?.detail || "Ошибка создания поста");
        }
    }
);

// Асинхронное действие для обновления существующего поста
export const updatePost = createAsyncThunk(
    "posts/update",               // Префикс действия: "posts/update"
    async (input: UpdatePostInput, { rejectWithValue }) => {  // Параметры: данные для обновления поста
        try {
            // Проверяем, есть ли новый файл изображения для загрузки
            if (input.imageFile) {
                // Вызов API для обновления только файла изображения
                return await postsApi.updateFile(input.id, input.imageFile);
            }
            // Вызов API для обновления JSON данных поста
            return await postsApi.updateJson(input.id, input.patch || {});
        } catch (e: any) {
            // Обработка ошибки обновления поста
            return rejectWithValue(e?.response?.data?.detail || "Ошибка обновления поста");
        }
    }
);

// Асинхронное действие для удаления поста
export const deletePost = createAsyncThunk(
    "posts/delete",               // Префикс действия: "posts/delete"
    async (id: string, { rejectWithValue }) => {  // Параметры: ID поста для удаления
        try {
            // Вызов API для удаления поста
            await postsApi.delete(id);
            // Возвращаем ID удаленного поста для обновления состояния
            return id;
        } catch (e: any) {
            // Обработка ошибки удаления поста
            return rejectWithValue(e?.response?.data?.detail || "Ошибка удаления поста");
        }
    }
);

// Создание среза постов с помощью createSlice
export const postsSlice = createSlice({
    name: "posts",                // Имя среза: "posts"
    initialState,                 // Начальное состояние
    reducers: {
        // Редюсер для очистки ошибки в состоянии постов
        clearPostsError: (s) => { s.error = null; },
        // Редюсер для установки ID редактируемого поста
        setEditingId: (s, a) => { s.editingId = a.payload as string | null; }
    },
    // Обработчики для асинхронных действий (extraReducers)
    extraReducers: (b) => {
        b
            // Обработчики для fetchPosts
            .addCase(fetchPosts.pending, (s) => { s.loading = true; s.error = null; })          // Начало загрузки постов
            .addCase(fetchPosts.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; }) // Успешная загрузка постов
            .addCase(fetchPosts.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; }) // Ошибка загрузки постов

            // Обработчики для addPost
            .addCase(addPost.pending, (s) => { s.loading = true; s.error = null; })             // Начало добавления поста
            .addCase(addPost.fulfilled, (s, a) => {
                s.loading = false;
                // Добавляем новый пост в начало массива
                s.list.unshift(a.payload);
            })
            .addCase(addPost.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; }) // Ошибка добавления поста

            // Обработчики для updatePost
            .addCase(updatePost.pending, (s) => { s.loading = true; s.error = null; })          // Начало обновления поста
            .addCase(updatePost.fulfilled, (s, a) => {
                s.loading = false;
                // Заменяем обновленный пост в массиве
                s.list = s.list.map(p => p.id === a.payload.id ? a.payload : p);
                // Сбрасываем ID редактирования
                s.editingId = null;
            })
            .addCase(updatePost.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; }) // Ошибка обновления поста

            // Обработчики для deletePost
            .addCase(deletePost.pending, (s) => { s.loading = true; s.error = null; })          // Начало удаления поста
            .addCase(deletePost.fulfilled, (s, a) => {
                s.loading = false;
                // Удаляем пост из массива по ID
                s.list = s.list.filter(p => p.id !== a.payload);
            })
            .addCase(deletePost.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; }); // Ошибка удаления поста
    }
});

// Экспорт действий clearPostsError и setEditingId
export const { clearPostsError, setEditingId } = postsSlice.actions;

// Селектор для получения всех постов из состояния
export const selectPosts = (st: RootState) => st.posts.list;
// Селектор для получения статуса загрузки постов
export const selectPostsLoading = (st: RootState) => st.posts.loading;
// Селектор для получения ошибки постов
export const selectPostsError = (st: RootState) => st.posts.error;
// Селектор для получения ID редактируемого поста
export const selectEditingId = (st: RootState) => st.posts.editingId;

/*
===========================================
ПОЯСНЕНИЯ К КОММЕНТАРИЯМ В ДАННОМ ФАЙЛЕ:
===========================================

1. Файл postsSlice.ts - Redux Toolkit срез для управления состоянием постов

2. Комментарий "Импорт функций createAsyncThunk и createSlice..." - объясняет
   импорт основных функций Redux Toolkit для создания асинхронных действий и среза состояния

3. Комментарий "Импорт типа RootState для типизированных селекторов..." - описывает
   импорт типа всего состояния хранилища для типизации селекторов

4. Комментарий "Импорт TypeScript типа Post для типизации данных поста..." - поясняет
   импорт типа данных для TypeScript валидации

5. Комментарий "Импорт API функций для работы с данными постов..." - описывает
   импорт модуля с API вызовами для работы с бэкендом по постам

6. Комментарий "Интерфейс состояния постов (PostsState)..." - определяет
   структуру состояния среза постов

7. Комментарий "Начальное состояние среза постов..." - описывает
   первоначальные значения состояния до каких-либо действий

8. Комментарий "Тип для входных данных нового поста..." - объясняет
   структуру данных необходимых для создания нового поста

9. Комментарий "Тип для входных данных обновления поста..." - описывает
   структуру данных необходимых для обновления существующего поста

10. Комментарий "Асинхронное действие для загрузки всех постов..." - объясняет
    создание асинхронного thunk действия для получения постов с сервера

11. Комментарий "Асинхронное действие для добавления нового поста..." - 
    описывает создание thunk действия для создания поста с поддержкой загрузки файлов

12. Комментарий "Асинхронное действие для обновления существующего поста..." - 
    поясняет thunk действие для обновления поста с поддержкой загрузки файлов

13. Комментарий "Асинхронное действие для удаления поста..." - описывает
    thunk действие для удаления поста по ID

14. Комментарий "Создание среза постов с помощью createSlice..." - объясняет
    настройку среза с именем, начальным состоянием и редюсерами

15. Комментарий "Редюсер для очистки ошибки в состоянии постов..." - описывает синхронное действие
    для сброса ошибки в состоянии

16. Комментарий "Редюсер для установки ID редактируемого поста..." - объясняет
    действие для управления состоянием редактирования

17. Комментарий "Обработчики для асинхронных действий (extraReducers)..." - детализирует
    обработку всех состояний (pending, fulfilled, rejected) для каждого асинхронного действия

18. Комментарий "Экспорт действий clearPostsError и setEditingId..." - поясняет экспорт синхронных действий

19. Комментарий "Селектор для получения всех постов из состояния..." - описывает
    создание типизированных функций для извлечения данных из состояния

ОСОБЕННОСТИ РЕАЛИЗАЦИИ:

- Поддержка загрузки файлов изображений при создании и обновлении постов
- Управление состоянием редактирования (editingId)
- Раздельная обработка JSON данных и файловых uploads
- Добавление новых постов в начало списка (unshift)
- Иммутабельные обновления массива постов
- Очистка editingId после успешного обновления

СТРУКТУРА СОСТОЯНИЯ:
{
  list: Post[],          // Список всех постов
  loading: boolean,      // Индикатор выполнения запроса
  error: string | null,  // Сообщение об ошибке или null
  editingId: string | null // ID редактируемого поста
}

АСИНХРОННЫЕ ДЕЙСТВИЯ:
- fetchPosts: получение списка всех постов
- addPost: создание нового поста (с поддержкой файлов)
- updatePost: обновление существующего поста (с поддержкой файлов)
- deletePost: удаление поста по ID

СИНХРОННЫЕ ДЕЙСТВИЯ:
- clearPostsError: очистка ошибки
- setEditingId: установка ID редактируемого поста

СЕЛЕКТОРЫ:
- selectPosts: весь список постов
- selectPostsLoading: состояние загрузки
- selectPostsError: сообщение об ошибке
- selectEditingId: ID редактируемого поста
*/