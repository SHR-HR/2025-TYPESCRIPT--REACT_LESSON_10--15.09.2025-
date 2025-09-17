// Импорт функций createSlice и createAsyncThunk из Redux Toolkit для создания среза и асинхронных действий
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Импорт API функций для работы с пользователями
import { usersApi } from "../../api/usersApi";
// Импорт TypeScript типа User для типизации
import type { User } from "../../shared/types/User";
// Импорт типа RootState для типизированных селекторов
import type { RootState } from "../store";

// Интерфейс состояния пользователей (UsersState)
interface UsersState {
  users: User[];               // Массив пользователей
  loading: boolean;            // Флаг загрузки (true во время выполнения запросов)
  error: string | null;        // Сообщение об ошибке или null если ошибок нет
}

// Начальное состояние среза пользователей
const initialState: UsersState = {
  users: [],                   // Пустой массив пользователей
  loading: false,              // Загрузка не активна
  error: null,                 // Ошибок нет
};

// Асинхронное действие для загрузки пользователей
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",          // Префикс действия: "users/fetchUsers"
  async (_, { rejectWithValue }) => {  // Функция-исполнитель, _ - нет параметров
    try {
      // Вызов API для получения списка пользователей
      return await usersApi.getUsers();
    } catch (e: any) {
      // В случае ошибки возвращаем сообщение об ошибке через rejectWithValue
      return rejectWithValue(e?.response?.data?.detail || "Ошибка загрузки пользователей");
    }
  }
);

// Асинхронное действие для добавления нового пользователя
export const addUser = createAsyncThunk(
  "users/addUser",             // Префикс действия: "users/addUser"
  async (userData: Omit<User, "id">, { rejectWithValue }) => {  // userData без id
    try {
      // Вызов API для создания нового пользователя
      return await usersApi.addUser(userData);
    } catch (e: any) {
      // Обработка ошибки создания пользователя
      return rejectWithValue(e?.response?.data?.detail || "Ошибка создания пользователя");
    }
  }
);

// Асинхронное действие для обновления существующего пользователя
export const updateUser = createAsyncThunk(
  "users/updateUser",          // Префикс действия: "users/updateUser"
  async (user: User, { rejectWithValue }) => {  // Полный объект пользователя с id
    try {
      // Вызов API для обновления пользователя
      return await usersApi.updateUser(user);
    } catch (e: any) {
      // Обработка ошибки обновления пользователя
      return rejectWithValue(e?.response?.data?.detail || "Ошибка обновления пользователя");
    }
  }
);

// Асинхронное действие для удаления пользователя
export const deleteUser = createAsyncThunk(
  "users/deleteUser",          // Префикс действия: "users/deleteUser"
  async (userId: number, { rejectWithValue }) => {  // ID пользователя для удаления
    try {
      // Вызов API для удаления пользователя
      await usersApi.deleteUser(userId);
      // Возвращаем ID удаленного пользователя для обновления состояния
      return userId;
    } catch (e: any) {
      // Обработка ошибки удаления пользователя
      return rejectWithValue(e?.response?.data?.detail || "Ошибка удаления пользователя");
    }
  }
);

// Создание среза пользователей с помощью createSlice
export const usersSlice = createSlice({
  name: "users",               // Имя среза: "users"
  initialState,                // Начальное состояние
  reducers: {
    // Редюсер для очистки ошибки
    clearError: (state) => { state.error = null; },
  },
  // Обработчики для асинхронных действий (extraReducers)
  extraReducers: (builder) => {
    builder
      // Обработчики для fetchUsers
      .addCase(fetchUsers.pending, (s) => { s.loading = true; s.error = null; })          // Начало загрузки
      .addCase(fetchUsers.fulfilled, (s, a) => { s.loading = false; s.users = a.payload; }) // Успешная загрузка
      .addCase(fetchUsers.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; }) // Ошибка загрузки

      // Обработчики для addUser
      .addCase(addUser.pending, (s) => { s.loading = true; s.error = null; })             // Начало добавления
      .addCase(addUser.fulfilled, (s, a) => { s.loading = false; s.users.push(a.payload); }) // Успешное добавление
      .addCase(addUser.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; }) // Ошибка добавления

      // Обработчики для updateUser
      .addCase(updateUser.pending, (s) => { s.loading = true; s.error = null; })          // Начало обновления
      .addCase(updateUser.fulfilled, (s, a) => {
        s.loading = false;
        // Поиск индекса пользователя по ID
        const idx = s.users.findIndex(u => u.id === a.payload.id);
        // Если пользователь найден, заменяем его данные
        if (idx !== -1) s.users[idx] = a.payload;
      })
      .addCase(updateUser.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; }) // Ошибка обновления

      // Обработчики для deleteUser
      .addCase(deleteUser.pending, (s) => { s.loading = true; s.error = null; })          // Начало удаления
      .addCase(deleteUser.fulfilled, (s, a) => {
        s.loading = false;
        // Фильтрация массива - удаляем пользователя по ID
        s.users = s.users.filter(u => u.id !== a.payload);
      })
      .addCase(deleteUser.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; }); // Ошибка удаления
  },
});

// Экспорт действия clearError
export const { clearError } = usersSlice.actions;

// Селекторы для доступа к состоянию пользователей (строго типизированы)
export const selectAllUsers = (state: RootState) => state.users.users;                     // Все пользователи
export const selectUsersLoading = (state: RootState) => state.users.loading;               // Флаг загрузки
export const selectUsersError = (state: RootState) => state.users.error;                   // Ошибка
export const selectUserById = (state: RootState, id: number) =>                            // Пользователь по ID
  state.users.users.find(u => u.id === id);

/*
===========================================
ПОЯСНЕНИЯ К КОММЕНТАРИЯМ В ДАННОМ ФАЙЛЕ:
===========================================

1. Файл usersSlice.ts - Redux Toolkit срез для управления состоянием пользователей

2. Комментарий "Импорт функций createSlice и createAsyncThunk..." - объясняет
   импорт основных функций Redux Toolkit для создания среза и асинхронных действий

3. Комментарий "Импорт API функций для работы с пользователями..." - описывает
   импорт модуля с API вызовами для работы с бэкендом

4. Комментарий "Импорт TypeScript типа User для типизации..." - поясняет
   импорт типа данных пользователя для TypeScript валидации

5. Комментарий "Импорт типа RootState для типизированных селекторов..." - описывает
   импорт типа всего состояния хранилища для типизации селекторов

6. Комментарий "Интерфейс состояния пользователей (UsersState)..." - определяет
   структуру состояния среза пользователей

7. Комментарий "Начальное состояние среза пользователей..." - описывает
   первоначальные значения состояния до каких-либо действий

8. Комментарий "Асинхронное действие для загрузки пользователей..." - объясняет
   создание асинхронного thunk действия для получения пользователей с сервера

9. Комментарий "Асинхронное действие для добавления нового пользователя..." - 
   описывает создание thunk действия для создания пользователя

10. Комментарий "Асинхронное действие для обновления существующего пользователя..." - 
    поясняет thunk действие для обновления данных пользователя

11. Комментарий "Асинхронное действие для удаления пользователя..." - описывает
    thunk действие для удаления пользователя по ID

12. Комментарий "Создание среза пользователей с помощью createSlice..." - объясняет
    настройку среза с именем, начальным состоянием и редюсерами

13. Комментарий "Редюсер для очистки ошибки..." - описывает синхронное действие
    для сброса ошибки в состоянии

14. Комментарий "Обработчики для асинхронных действий (extraReducers)..." - детализирует
    обработку всех состояний (pending, fulfilled, rejected) для каждого асинхронного действия

15. Комментарий "Экспорт действия clearError..." - поясняет экспорт синхронного действия

16. Комментарий "Селекторы для доступа к состоянию пользователей..." - описывает
    создание типизированных функций для извлечения данных из состояния

ОСОБЕННОСТИ РЕАЛИЗАЦИИ:

- Использование createAsyncThunk для асинхронных операций CRUD
- Обработка всех состояний запросов (loading, success, error)
- Типизированные селекторы для безопасного доступа к состоянию
- Локальная обработка ошибок с извлечением сообщений из response
- Иммутабельные обновления состояния с помощью Immer (встроен в RTK)

СТРУКТУРА СОСТОЯНИЯ:
{
  users: User[],      // Список всех пользователей
  loading: boolean,   // Индикатор выполнения запроса
  error: string | null // Сообщение об ошибке или null
}

АСИНХРОННЫЕ ДЕЙСТВИЯ:
- fetchUsers: получение списка пользователей
- addUser: создание нового пользователя  
- updateUser: обновление существующего пользователя
- deleteUser: удаление пользователя по ID

СЕЛЕКТОРЫ:
- selectAllUsers: весь список пользователей
- selectUsersLoading: состояние загрузки
- selectUsersError: сообщение об ошибке
- selectUserById: поиск пользователя по ID
*/