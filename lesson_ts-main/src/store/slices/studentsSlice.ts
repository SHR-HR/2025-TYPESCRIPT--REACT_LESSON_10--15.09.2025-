// Импорт функции createAsyncThunk и createSlice из Redux Toolkit для создания асинхронных действий и среза состояния
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// Импорт TypeScript типов Student и AttendStatus для типизации данных студента и статуса посещаемости
import type { Student, AttendStatus } from "../../shared/types/Student";
// Импорт API функций для работы с данными студентов
import { studentsApi } from "../../api/studentsApi";
// Импорт типа RootState для типизированных селекторов состояния всего хранилища
import type { RootState } from "../store";

// Интерфейс состояния студентов (StudentsState)
interface StudentsState {
    students: Student[];           // Массив студентов
    loading: boolean;              // Флаг загрузки (true во время выполнения запросов)
    error: string | null;          // Сообщение об ошибке или null если ошибок нет
}

// Начальное состояние среза студентов
const initialState: StudentsState = {
    students: [],                  // Пустой массив студентов
    loading: false,                // Загрузка не активна
    error: null,                   // Ошибок нет
};

// Асинхронное действие для загрузки всех студентов
export const fetchStudents = createAsyncThunk(
    "students/fetchAll",           // Префикс действия: "students/fetchAll"
    async (_, { rejectWithValue }) => {  // Функция-исполнитель, _ - нет параметров
        try {
            // Вызов API для получения списка всех студентов
            return await studentsApi.getStudents();
        } catch (e: any) {
            // В случае ошибки возвращаем сообщение об ошибке через rejectWithValue
            return rejectWithValue(e?.response?.data?.detail || "Ошибка загрузки студентов");
        }
    }
);

// Асинхронное действие для обновления статуса посещаемости студента
export const updateStudentAttend = createAsyncThunk(
    "students/updateAttend",       // Префикс действия: "students/updateAttend"
    async ({ id, attend }: { id: number; attend: AttendStatus }, { rejectWithValue }) => {  // Параметры: ID студента и новый статус посещаемости
        try {
            // Вызов API для обновления статуса посещаемости студента
            return await studentsApi.updateAttend(id, attend);
        } catch (e: any) {
            // Обработка ошибки обновления посещаемости
            return rejectWithValue(e?.response?.data?.detail || "Ошибка обновления посещаемости");
        }
    }
);

// Асинхронное действие для обновления оценки студента
export const updateStudentGrade = createAsyncThunk(
    "students/updateGrade",        // Префикс действия: "students/updateGrade"
    async ({ id, grade }: { id: number; grade: number }, { rejectWithValue }) => {  // Параметры: ID студента и новая оценка
        try {
            // Вызов API для обновления оценки студента
            return await studentsApi.updateGrade(id, grade);
        } catch (e: any) {
            // Обработка ошибки обновления оценки
            return rejectWithValue(e?.response?.data?.detail || "Ошибка обновления оценки");
        }
    }
);

// Асинхронное действие для обновления онлайн-статуса студента
export const updateStudentOnline = createAsyncThunk(
    "students/updateOnline",       // Префикс действия: "students/updateOnline"
    async ({ id, online }: { id: number; online: boolean }, { rejectWithValue }) => {  // Параметры: ID студента и новый онлайн-статус
        try {
            // Вызов API для обновления онлайн-статуса студента
            return await studentsApi.updateOnline(id, online);
        } catch (e: any) {
            // Обработка ошибки обновления онлайн-статуса
            return rejectWithValue(e?.response?.data?.detail || "Ошибка обновления статуса online");
        }
    }
);

// Создание среза студентов с помощью createSlice
export const studentsSlice = createSlice({
    name: "students",              // Имя среза: "students"
    initialState,                  // Начальное состояние
    reducers: {
        // Редюсер для очистки ошибки в состоянии студентов
        clearStudentsError: (state) => { state.error = null; },
    },
    // Обработчики для асинхронных действий (extraReducers)
    extraReducers: (builder) => {
        // Вспомогательная функция для замены студента в массиве по ID
        const replace = (arr: Student[], updated: Student) =>
            arr.map((s) => (s.id === updated.id ? updated : s));

        builder
            // Обработчики для fetchStudents
            .addCase(fetchStudents.pending, (s) => { s.loading = true; s.error = null; })          // Начало загрузки студентов
            .addCase(fetchStudents.fulfilled, (s, a) => { s.loading = false; s.students = a.payload; }) // Успешная загрузка студентов
            .addCase(fetchStudents.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; }) // Ошибка загрузки студентов

            // Обработчики для updateStudentAttend
            .addCase(updateStudentAttend.pending, (s) => { s.loading = true; s.error = null; })    // Начало обновления посещаемости
            .addCase(updateStudentAttend.fulfilled, (s, a) => { s.loading = false; s.students = replace(s.students, a.payload); }) // Успешное обновление посещаемости
            .addCase(updateStudentAttend.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; }) // Ошибка обновления посещаемости

            // Обработчики для updateStudentGrade
            .addCase(updateStudentGrade.pending, (s) => { s.loading = true; s.error = null; })     // Начало обновления оценки
            .addCase(updateStudentGrade.fulfilled, (s, a) => { s.loading = false; s.students = replace(s.students, a.payload); }) // Успешное обновление оценки
            .addCase(updateStudentGrade.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; }) // Ошибка обновления оценки

            // Обработчики для updateStudentOnline
            .addCase(updateStudentOnline.pending, (s) => { s.loading = true; s.error = null; })    // Начало обновления онлайн-статуса
            .addCase(updateStudentOnline.fulfilled, (s, a) => { s.loading = false; s.students = replace(s.students, a.payload); }) // Успешное обновление онлайн-статуса
            .addCase(updateStudentOnline.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; }); // Ошибка обновления онлайн-статуса
    },
});

// Экспорт действия clearStudentsError
export const { clearStudentsError } = studentsSlice.actions;

// Селектор для получения всех студентов из состояния
export const selectAllStudents = (state: RootState) => state.students.students;
// Селектор для получения статуса загрузки студентов
export const selectStudentsLoading = (state: RootState) => state.students.loading;
// Селектор для получения ошибки студентов
export const selectStudentsError = (state: RootState) => state.students.error;

/*
===========================================
ПОЯСНЕНИЯ К КОММЕНТАРИЯМ В ДАННОМ ФАЙЛЕ:
===========================================

1. Файл studentsSlice.ts - Redux Toolkit срез для управления состоянием студентов

2. Комментарий "Импорт функции createAsyncThunk и createSlice..." - объясняет
   импорт основных функций Redux Toolkit для создания асинхронных действий и среза состояния

3. Комментарий "Импорт TypeScript типов Student и AttendStatus..." - описывает
   импорт типов данных для TypeScript валидации

4. Комментарий "Импорт API функций для работы с данными студентов..." - поясняет
   импорт модуля с API вызовами для работы с бэкендом по студентам

5. Комментарий "Импорт типа RootState для типизированных селекторов..." - описывает
   импорт типа всего состояния хранилища для типизации селекторов

6. Комментарий "Интерфейс состояния студентов (StudentsState)..." - определяет
   структуру состояния среза студентов

7. Комментарий "Начальное состояние среза студентов..." - описывает
   первоначальные значения состояния до каких-либо действий

8. Комментарий "Асинхронное действие для загрузки всех студентов..." - объясняет
   создание асинхронного thunk действия для получения студентов с сервера

9. Комментарий "Асинхронное действие для обновления статуса посещаемости студента..." - 
   описывает создание thunk действия для обновления посещаемости студента

10. Комментарий "Асинхронное действие для обновления оценки студента..." - 
    поясняет thunk действие для обновления оценки студента

11. Комментарий "Асинхронное действие для обновления онлайн-статуса студента..." - описывает
    thunk действие для обновления онлайн-статуса студента

12. Комментарий "Создание среза студентов с помощью createSlice..." - объясняет
    настройку среза с именем, начальным состоянием и редюсерами

13. Комментарий "Редюсер для очистки ошибки в состоянии студентов..." - описывает синхронное действие
    для сброса ошибки в состоянии

14. Комментарий "Обработчики для асинхронных действий (extraReducers)..." - детализирует
    обработку всех состояний (pending, fulfilled, rejected) для каждого асинхронного действия

15. Комментарий "Вспомогательная функция для замены студента в массиве по ID..." - объясняет
    утилитарную функцию для обновления массива студентов

16. Комментарий "Экспорт действия clearStudentsError..." - поясняет экспорт синхронного действия

17. Комментарий "Селектор для получения всех студентов из состояния..." - описывает
    создание типизированных функций для извлечения данных из состояния

ОСОБЕННОСТИ РЕАЛИЗАЦИИ:

- Использование createAsyncThunk для асинхронных операций с студентами
- Обработка всех состояний запросов (loading, success, error)
- Типизированные селекторы для безопасного доступа к состоянию
- Локальная обработка ошибок с извлечением сообщений из response
- Вспомогательная функция replace для иммутабельного обновления массива студентов
- Иммутабельные обновления состояния с помощью Immer (встроен в RTK)

СТРУКТУРА СОСТОЯНИЯ:
{
  students: Student[],    // Список всех студентов
  loading: boolean,       // Индикатор выполнения запроса
  error: string | null    // Сообщение об ошибке или null
}

АСИНХРОННЫЕ ДЕЙСТВИЯ:
- fetchStudents: получение списка всех студентов
- updateStudentAttend: обновление статуса посещаемости студента
- updateStudentGrade: обновление оценки студента
- updateStudentOnline: обновление онлайн-статуса студента

СЕЛЕКТОРЫ:
- selectAllStudents: весь список студентов
- selectStudentsLoading: состояние загрузки
- selectStudentsError: сообщение об ошибке

ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ:
- replace: заменяет студента в массиве по ID на обновленную версию
*/