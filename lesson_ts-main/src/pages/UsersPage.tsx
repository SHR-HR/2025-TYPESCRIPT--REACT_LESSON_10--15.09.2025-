// Импорт необходимых модулей и компонентов React
import React, { useEffect, useState } from "react";
// Импорт компонента Link для навигации между страницами
import { Link } from "react-router-dom";
// Импорт главного layout компонента для структуры страницы
import MainLayoute from "../layouts/MainLayoute";
// Импорт хуков Redux для работы с состоянием
import { useDispatch, useSelector } from "react-redux";
// Импорт действий и селекторов для работы с пользователями
import {
    fetchUsers,        // действие для загрузки пользователей
    addUser,           // действие для добавления пользователя
    deleteUser,        // действие для удаления пользователя
    selectAllUsers,    // селектор для получения всех пользователей
    selectUsersLoading,// селектор для получения статуса загрузки
    selectUsersError,  // селектор для получения ошибок
    clearError,        // действие для очистки ошибок
} from "../store/slices/usersSlice";
// Импорт типа AppDispatch для типизации dispatch
import type { AppDispatch } from "../store/store";

// Определение функционального компонента UsersPage с типизацией React.FC
const UsersPage: React.FC = () => {
    // Инициализация dispatch с типом AppDispatch для работы с Redux
    const dispatch = useDispatch<AppDispatch>();
    // Получение списка пользователей через селектор
    const users = useSelector(selectAllUsers);
    // Получение статуса загрузки через селектор
    const loading = useSelector(selectUsersLoading);
    // Получение ошибки через селектор
    const error = useSelector(selectUsersError);

    // Состояние для хранения имени нового пользователя
    const [newUserName, setNewUserName] = useState("");
    // Состояние для хранения email нового пользователя
    const [newUserEmail, setNewUserEmail] = useState("");
    // Состояние для отображения/скрытия формы добавления
    const [showForm, setShowForm] = useState(false);

    // Эффект для загрузки пользователей при монтировании компонента
    useEffect(() => {
        // Диспатч действия загрузки пользователей
        dispatch(fetchUsers());
    }, [dispatch]); // Зависимость от dispatch

    // Обработчик добавления нового пользователя
    const handleAddUser = async () => {
        // Проверка что поля не пустые
        if (newUserName.trim() && newUserEmail.trim()) {
            try {
                // Диспатч действия добавления пользователя с обработкой через unwrap()
                await dispatch(addUser({
                    name: newUserName.trim(),
                    email: newUserEmail.trim()
                })).unwrap();
                // Очистка полей формы после успешного добавления
                setNewUserName("");
                setNewUserEmail("");
                // Скрытие формы
                setShowForm(false);
            } catch {
                // Обработка ошибки (пустой блок, ошибка обрабатывается в состоянии error)
            }
        }
    };

    // Обработчик удаления пользователя
    const handleDeleteUser = async (userId: number) => {
        // Подтверждение удаления через диалоговое окно
        if (window.confirm("Уверены что хотите удалить пользователя?")) {
            try {
                // Диспатч действия удаления пользователя
                await dispatch(deleteUser(userId)).unwrap();
            } catch {
                // Обработка ошибки
            }
        }
    };

    // Возвращаем JSX разметку компонента
    return (
        <MainLayoute>
            <div className="container">
                <h1 className="page-title">Пользователи</h1>

                {/* Блок отображения ошибки */}
                {error && (
                    <p className="error">
                        Ошибка: {error}{" "}
                        {/* Кнопка очистки ошибки */}
                        <button className="btn btn--ghost" onClick={() => dispatch(clearError())}>
                            очистить
                        </button>
                    </p>
                )}

                {/* Кнопка переключения отображения формы */}
                <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Отменить" : "Добавить пользователя"}
                </button>

                {/* Условное отображение формы добавления пользователя */}
                {showForm && (
                    <div style={{ marginTop: 16, display: "grid", gap: 8, maxWidth: 420 }}>
                        <h2>Новый пользователь</h2>
                        {/* Поле ввода имени */}
                        <input className="input" type="text" placeholder="Имя"
                            value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                        {/* Поле ввода email */}
                        <input className="input" type="email" placeholder="Email"
                            value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                        <div>
                            {/* Кнопка добавления пользователя */}
                            <button className="btn btn--primary" onClick={handleAddUser} disabled={loading}>
                                {loading ? "Добавление..." : "Добавить"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Список пользователей */}
                <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
                    <h2>Список пользователей</h2>
                    {/* Индикатор загрузки */}
                    {loading && !showForm && <p>Загрузка...</p>}

                    {/* Отображение списка пользователей */}
                    {users.map((u) => (
                        <div key={u.id} style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "10px",
                            padding: "12px 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}>
                            <div>
                                {/* Имя пользователя */}
                                <strong>{u.name}</strong>
                                {/* Email пользователя */}
                                <div style={{ color: "var(--muted)", fontSize: 13 }}>{u.email}</div>
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                                {/* Ссылка на страницу пользователя */}
                                <Link className="btn" to={`/users/${u.id}`}>
                                    Подробнее
                                </Link>
                                {/* Кнопка удаления пользователя */}
                                <button className="btn" onClick={() => handleDeleteUser(u.id)} disabled={loading}>
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayoute>
    );
};

// Экспорт компонента по умолчанию
export default UsersPage;

/*
===========================================
ПОЯСНЕНИЯ К КОММЕНТАРИЯМ В ДАННОМ ФАЙЛЕ:
===========================================

1. Файл UsersPage.tsx - React компонент страницы управления пользователями

2. Комментарий "Импорт необходимых модулей и компонентов React" - описывает
   базовые импорты React и его хуков

3. Комментарий "Импорт компонента Link для навигации между страницами" - объясняет
   назначение компонента Link из react-router-dom

4. Комментарий "Импорт главного layout компонента..." - поясняет
   использование компонента макета страницы

5. Комментарий "Импорт хуков Redux для работы с состоянием" - описывает
   использование useDispatch и useSelector для управления состоянием

6. Комментарий "Импорт действий и селекторов для работы с пользователями" - перечисляет
   все импортируемые действия и селекторы из usersSlice

7. Комментарий "Импорт типа AppDispatch для типизации dispatch" - объясняет
   необходимость типизации dispatch для TypeScript

8. Комментарий "Определение функционального компонента UsersPage..." - описывает
   создание компонента с типизацией React.FC

9. Комментарий "Инициализация dispatch с типом AppDispatch..." - поясняет
   типизированное использование useDispatch хука

10. Комментарий "Получение списка пользователей через селектор" - описывает
    использование useSelector для получения данных из store

11. Комментарий "Состояние для хранения имени нового пользователя" - объясняет
    использование useState для управления состоянием формы

12. Комментарий "Эффект для загрузки пользователей при монтировании..." - описывает
    использование useEffect для side-effect загрузки данных

13. Комментарий "Обработчик добавления нового пользователя" - поясняет
    логику функции handleAddUser

14. Комментарий "Обработчик удаления пользователя" - описывает
    логику функции handleDeleteUser

15. Комментарий "Возвращаем JSX разметку компонента" - маркирует
    начало возвращаемой JSX структуры

16. Комментарий "Блок отображения ошибки" - объясняет
    условный рендеринг блока с ошибкой

17. Комментарий "Кнопка переключения отображения формы" - описывает
    кнопку показа/скрытия формы добавления

18. Комментарий "Условное отображение формы добавления пользователя" - поясняет
    рендеринг формы только при showForm = true

19. Комментарий "Список пользователей" - маркирует
    секцию отображения списка пользователей

20. Комментарий "Отображение списка пользователей" - описывает
    маппинг массива пользователей в JSX элементы

ОСОБЕННОСТИ РЕАЛИЗАЦИИ:

- Используется Redux Toolkit для управления состоянием
- Обработка асинхронных действий через createAsyncThunk
- Локальное состояние для управления формой
- Подтверждение удаления через window.confirm
- Обработка ошибок через try-catch с unwrap()
- Условный рендеринг для формы и состояния загрузки

СТРУКТУРА КОМПОНЕНТА:

- Header с заголовком страницы
- Блок отображения ошибок
- Кнопка переключения формы добавления
- Форма добавления нового пользователя
- Список существующих пользователей
- Кнопки действий для каждого пользователя

ИСПОЛЬЗОВАНИЕ:
- Страница управления пользователями в административной панели
- Просмотр, добавление и удаление пользователей
- Интеграция с Redux store для состояния пользователей
- Навигация на страницы детальной информации о пользователях
*/