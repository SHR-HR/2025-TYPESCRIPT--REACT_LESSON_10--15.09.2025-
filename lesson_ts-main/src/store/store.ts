// Импорт функции configureStore из Redux Toolkit для создания хранилища
import { configureStore } from "@reduxjs/toolkit";
// Импорт среза (slice) для работы с пользователями
import { usersSlice } from "./slices/usersSlice";
// Импорт среза (slice) для работы со студентами
import { studentsSlice } from "./slices/studentsSlice";
// Импорт среза (slice) для работы с постами
import { postsSlice } from "./slices/postsSlice";

// Создание и экспорт хранилища Redux с помощью configureStore
export const store = configureStore({
    // Объект reducer который объединяет все редюсеры приложения
    reducer: {
        // Редюсер для работы с пользователями - доступен по state.users
        users: usersSlice.reducer,
        // Редюсер для работы со студентами - доступен по state.students
        students: studentsSlice.reducer,
        // Редюсер для работы с постами - доступен по state.posts
        posts: postsSlice.reducer,
    },
});

// Экспорт типа RootState - тип всего состояния Redux
// ReturnType<typeof store.getState> - динамически определяет тип состояния
export type RootState = ReturnType<typeof store.getState>;

// Экспорт типа AppDispatch - тип функции dispatch хранилища
// typeof store.dispatch - получает тип dispatch функции
export type AppDispatch = typeof store.dispatch;

/*
===========================================
ПОЯСНЕНИЯ К КОММЕНТАРИЯМ В ДАННОМ ФАЙЛЕ:
===========================================

1. Файл store.ts - центральный файл конфигурации Redux хранилища

2. Комментарий "Импорт функции configureStore из Redux Toolkit..." - объясняет
   импорт основной функции для создания Redux хранилища

3. Комментарий "Импорт среза (slice) для работы с пользователями..." - описывает
   импорт модуля пользователей который содержит редюсер и actions

4. Комментарий "Создание и экспорт хранилища Redux..." - поясняет создание
   и экспорт настроенного хранилища для использования в приложении

5. Комментарий "Объект reducer который объединяет все редюсеры..." - описывает
   структуру где каждый редюсер привязан к определенному ключу состояния

6. Комментарий "Редюсер для работы с пользователями..." - указывает что редюсер
   usersSlice управляет частью состояния state.users

7. Комментарий "Экспорт типа RootState - тип всего состояния Redux..." - объясняет
   создание TypeScript типа для всего состояния хранилища

8. Комментарий "ReturnType<typeof store.getState>..." - описывает технику
   динамического определения типа состояния на основе функции getState

9. Комментарий "Экспорт типа AppDispatch - тип функции dispatch..." - поясняет
   создание типа для dispatch функции для TypeScript типизации

10. Комментарий "typeof store.dispatch - получает тип dispatch функции..." - 
    описывает получение типа dispatch из созданного хранилища

ТЕХНИЧЕСКИЕ ДЕТАЛИ КОНФИГУРАЦИИ:

configureStore от Redux Toolkit автоматически:
- Подключает redux-thunk middleware для асинхронных actions
- Включает Redux DevTools Extension для отладки
- Добавляет middleware для обнаружения распространенных ошибок
- Включает возможность использования Immer для иммутабельных обновлений

СТРУКТУРА СОСТОЯНИЯ:
{
  users: { ... },      // Состояние пользователей (массив пользователей, loading, error)
  students: { ... },   // Состояние студентов (массив студентов, статусы, оценки)
  posts: { ... }       // Состояние постов (массив постов, фильтры, пагинация)
}

ТИПЫ TypeScript:
- RootState: автоматически выводимый тип всего состояния
- AppDispatch: тип dispatch функции с учетом middleware

ПРЕИМУЩЕСТВА REDUX TOOLKIT:
- Упрощенная настройка store
- Автоматическая поддержка DevTools
- Встроенный Immer для mutable-like синтаксиса
- Оптимизированная производительность
- TypeScript поддержка из коробки

ИСПОЛЬЗОВАНИЕ В ПРИЛОЖЕНИИ:
- Store передается в Provider в main.tsx
- Типы RootState и AppDispatch используются в хуках useDispatch и useSelector
- Состояние доступно через state.users, state.students, state.posts
*/