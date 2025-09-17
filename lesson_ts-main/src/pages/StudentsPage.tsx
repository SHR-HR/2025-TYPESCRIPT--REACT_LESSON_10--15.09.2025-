// Импорт необходимых модулей и компонентов React
import React, { useEffect } from "react";
// Импорт главного layout компонента для структуры страницы
import MainLayoute from "../layouts/MainLayoute";
// Импорт хуков Redux для работы с состоянием
import { useDispatch, useSelector } from "react-redux";
// Импорт действий и селекторов для работы со студентами
import {
    fetchStudents,            // действие для загрузки студентов
    updateStudentAttend,      // действие для обновления статуса присутствия
    updateStudentGrade,       // действие для обновления оценки
    updateStudentOnline,      // действие для обновления онлайн статуса
    selectAllStudents,        // селектор для получения всех студентов
    selectStudentsLoading,    // селектор для получения статуса загрузки
    selectStudentsError,      // селектор для получения ошибок
    clearStudentsError,       // действие для очистки ошибок студентов
} from "../store/slices/studentsSlice";
// Импорт типа AppDispatch для типизации dispatch
import type { AppDispatch } from "../store/store";
// Импорт типов Student и AttendStatus для типизации
import type { Student, AttendStatus } from "../shared/types/Student";

// Импорт SCSS стилей для компонента студентов
import "../styles/components/students.scss";

/** 
 * Функция для генерации инициалов из полного имени
 * @param fullName - полное имя студента
 * @returns строку с инициалами (первые буквы имени и фамилии)
 */
const initials = (fullName: string) => {
    // Разделение полного имени на части по пробелам
    const parts = fullName.trim().split(/\s+/);
    // Извлечение первых букв имени и фамилии
    const [a, b] = [parts[0]?.[0], parts[1]?.[0]];
    // Возврат инициалов в верхнем регистре или пустой строки
    return (a || "").toUpperCase() + (b || "");
};

// Определение функционального компонента StudentsPage с типизацией React.FC
const StudentsPage: React.FC = () => {
    // Инициализация dispatch с типом AppDispatch для работы с Redux
    const dispatch = useDispatch<AppDispatch>();
    // Получение списка студентов через селектор
    const students = useSelector(selectAllStudents);
    // Получение статуса загрузки через селектор
    const loading = useSelector(selectStudentsLoading);
    // Получение ошибки через селектор
    const error = useSelector(selectStudentsError);

    // Эффект для загрузки студентов при монтировании компонента
    useEffect(() => {
        dispatch(fetchStudents());
    }, [dispatch]); // Зависимость от dispatch

    /**
     * Обработчик изменения статуса присутствия студента
     * @param id - идентификатор студента
     * @param attend - новый статус присутствия
     */
    const onAttendChange = (id: number, attend: AttendStatus) => {
        dispatch(updateStudentAttend({ id, attend }));
    };

    /**
     * Обработчик изменения оценки студента
     * @param id - идентификатор студента
     * @param grade - новая оценка (число от 0 до 12)
     */
    const onGradeChange = (id: number, grade: number) => {
        // Проверка что значение является числом
        if (Number.isNaN(grade)) return;
        // Проверка что оценка в допустимом диапазоне
        if (grade < 0 || grade > 12) return;
        dispatch(updateStudentGrade({ id, grade }));
    };

    /**
     * Обработчик переключения онлайн статуса студента
     * @param id - идентификатор студента
     * @param value - новое значение онлайн статуса (true/false)
     */
    const onOnlineToggle = (id: number, value: boolean) => {
        dispatch(updateStudentOnline({ id, online: value }));
    };

    // Возвращаем JSX разметку компонента
    return (
        <MainLayoute>
            <div className="container">
                <h1 className="page-title">Студенты</h1>

                {/* Блок отображения ошибки */}
                {error && (
                    <p className="error">
                        Ошибка: {error}{" "}
                        {/* Кнопка очистки ошибки */}
                        <button className="btn btn--ghost" onClick={() => dispatch(clearStudentsError())}>
                            очистить
                        </button>
                    </p>
                )}

                {/* Таблица студентов */}
                <table className="students-table">
                    <thead>
                        <tr>
                            {/* Заголовок колонки с номером */}
                            <th className="col-index">№</th>
                            {/* Заголовок колонки с именем студента */}
                            <th>Студент</th>
                            {/* Заголовок колонки со статусом присутствия */}
                            <th>Присутствие</th>
                            {/* Заголовок колонки с онлайн статусом */}
                            <th className="online-col">Online</th>
                            {/* Заголовок колонки с оценкой */}
                            <th className="grade-col">Классная</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Отображение списка студентов */}
                        {students.map((s: Student, i) => (
                            <tr key={s.id} className={loading ? "row--disabled" : ""}>
                                {/* Ячейка с порядковым номером */}
                                <td className="col-index">{i + 1}</td>
                                {/* Ячейка с информацией о студенте */}
                                <td>
                                    <div className="student-cell">
                                        {/* Аватар с инициалами студента */}
                                        <div className="avatar" aria-hidden>
                                            {initials(s.name) || "•"}
                                        </div>
                                        {/* Имя студента (ссылка-заглушка) */}
                                        <a className="student-name" href="#!" onClick={(e) => e.preventDefault()}>
                                            {s.name}
                                        </a>
                                    </div>
                                </td>
                                {/* Ячейка с радиокнопками статуса присутствия */}
                                <td>
                                    <div className="presence">
                                        {/* Радиокнопка "Присутствует" */}
                                        <label title="Присутствует">
                                            <input
                                                type="radio"
                                                name={`attend-${s.id}`}
                                                checked={s.attend === "present"}
                                                onChange={() => onAttendChange(s.id, "present")}
                                                disabled={loading}
                                            />
                                            {/* Зеленая точка индикатора */}
                                            <span className="dot green" />
                                        </label>
                                        {/* Радиокнопка "Опоздал" */}
                                        <label title="Опоздал">
                                            <input
                                                type="radio"
                                                name={`attend-${s.id}`}
                                                checked={s.attend === "late"}
                                                onChange={() => onAttendChange(s.id, "late")}
                                                disabled={loading}
                                            />
                                            {/* Желтая точка индикатора */}
                                            <span className="dot yellow" />
                                        </label>
                                        {/* Радиокнопка "Отсутствует" */}
                                        <label title="Отсутствует">
                                            <input
                                                type="radio"
                                                name={`attend-${s.id}`}
                                                checked={s.attend === "none"}
                                                onChange={() => onAttendChange(s.id, "none")}
                                                disabled={loading}
                                            />
                                            {/* Красная точка индикатора */}
                                            <span className="dot red" />
                                        </label>
                                    </div>
                                </td>
                                {/* Ячейка с переключателем онлайн статуса */}
                                <td className="online-col">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            id={`online-${s.id}`}
                                            name={`online-${s.id}`}
                                            aria-label={`Онлайн: ${s.name}`}
                                            checked={!!s.online}
                                            onChange={(e) => onOnlineToggle(s.id, e.target.checked)}
                                            disabled={loading}
                                        />
                                        {/* Дорожка переключателя */}
                                        <span className="track" />
                                    </label>
                                </td>
                                {/* Ячейка с полем ввода оценки */}
                                <td className="grade-col">
                                    <input
                                        className="grade-input"
                                        type="number"
                                        id={`grade-${s.id}`}
                                        name={`grade-${s.id}`}
                                        min={0}
                                        max={12}
                                        value={s.grade}
                                        disabled={loading}
                                        onChange={(e) => onGradeChange(s.id, Number(e.target.value))}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </MainLayoute>
    );
};

// Экспорт компонента по умолчанию
export default StudentsPage;

/*
===========================================
ПОЯСНЕНИЯ К КОММЕНТАРИЯМ В ДАННОМ ФАЙЛЕ:
===========================================

1. Файл StudentsPage.tsx - React компонент страницы управления студентами

2. Комментарий "Импорт необходимых модулей и компонентов React" - описывает
   базовые импорты React и его хуков

3. Комментарий "Импорт главного layout компонента..." - поясняет
   использование компонента макета страницы

4. Комментарий "Импорт хуков Redux для работы с состоянием" - описывает
   использование useDispatch и useSelector для управления состоянием

5. Комментарий "Импорт действий и селекторов для работы со студентами" - перечисляет
   все импортируемые действия и селекторы из studentsSlice

6. Комментарий "Импорт типа AppDispatch для типизации dispatch" - объясняет
   необходимость типизации для TypeScript

7. Комментарий "Импорт типов Student и AttendStatus для типизации" - описывает
   импорт кастомных типов для строгой типизации

8. Комментарий "Импорт SCSS стилей для компонента студентов" - поясняет
   подключение стилей для таблицы студентов

9. Комментарий "Функция для генерации инициалов из полного имени" - описывает
   вспомогательную функцию для создания аватаров

10. Комментарий "Обработчик изменения статуса присутствия студента" - объясняет
    назначение функции onAttendChange

11. Комментарий "Обработчик изменения оценки студента" - описывает
    логику функции onGradeChange с валидацией

12. Комментарий "Обработчик переключения онлайн статуса студента" - поясняет
    назначение функции onOnlineToggle

13. Комментарий "Блок отображения ошибки" - описывает
    условный рендеринг блока с ошибкой

14. Комментарий "Таблица студентов" - маркирует
    начало таблицы со списком студентов

15. Комментарий "Заголовок колонки с номером" - поясняет
    назначение первой колонки таблицы

16. Комментарий "Аватар с инициалами студента" - описывает
    элемент отображения инициалов вместо фотографии

17. Комментарий "Радиокнопка 'Присутствует'" - объясняет
    элемент управления для статуса присутствия

18. Комментарий "Ячейка с переключателем онлайн статуса" - описывает
    элемент toggle switch для онлайн статуса

19. Комментарий "Ячейка с полем ввода оценки" - поясняет
    числовое поле ввода для оценки студента

ОСОБЕННОСТИ РЕАЛИЗАЦИИ:

- Использование таблицы для отображения списка студентов
- Генерация аватаров с инициалами из имени
- Группа радиокнопок для выбора статуса присутствия
- Toggle switch для онлайн статуса
- Числовое поле ввода с валидацией оценок (0-12)
- Обработка состояний загрузки и ошибок
- SCSS стили для кастомизации внешнего вида

СТРУКТУРА КОМПОНЕНТА:

- Заголовок страницы
- Блок отображения ошибок
- Таблица с студентами
- Колонки: номер, студент, присутствие, онлайн, оценка
- Интерактивные элементы управления для каждого студента

ИСПОЛЬЗОВАНИЕ:
- Страница управления студентами в образовательной системе
- Отслеживание посещаемости и успеваемости
- Управление онлайн статусом студентов
- Визуальное отображение информации с цветовыми индикаторами
- Интеграция с Redux store для состояния студентов
*/