# MovieMatch

Полноценный мини-сервис подбора фильмов с системой рекомендаций: Vue 3 frontend + Node.js backend + MongoDB для основных данных + Neo4j для графа рекомендаций. Пользователь может зарегистрироваться, лайкать фильмы и получать гибридные рекомендации: content-based + collaborative.

## Состав

- `frontend/` - Vue 3 + Vite + Tailwind UI.
- `backend/` - Express API, MongoDB + Neo4j, JWT-авторизация.
- `backend/tests/load/` - нагрузочный тест Locust.

## Требования

- Node.js 20+ (см. `frontend/package.json` engines)
- MongoDB 6+
- Neo4j 5+
- Locust, если нужно запускать нагрузочные тесты

## Быстрый Старт

### Backend

Создайте файл окружения из примера:

```bash
cd backend
cp .env.example .env
```

Заполните значения в `backend/.env`:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/moviesdb
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
JWT_SECRET=your_secret
TMDB_ACCESS_TOKEN=your_tmdb_token
```

Запуск:

```bash
npm install
npm run dev
```

### Frontend

Создайте файл окружения из примера:

```bash
cd frontend
cp .env.example .env
```

Значение по умолчанию:

```env
VITE_API_URL=http://localhost:4000
```

Запуск:

```bash
npm install
npm run dev
```

Откройте `http://localhost:5173`.

## Основные Возможности

- Регистрация и логин пользователей
- Список фильмов
- Лайки и профиль пользователя
- Гибридные рекомендации: content-based + collaborative
- Поиск по названию
- Фильтрация по жанрам

## API

Базовый URL: `http://localhost:4000`

### Auth

- `POST /api/users/register`
  - body: `{ username, email, password }`
- `POST /api/users/login`
  - body: `{ email, password }`
  - ответ: `{ token, user }`

### Пользователь

- `GET /api/users/me` - текущий пользователь
- `GET /api/users/profile` - профиль с лайкнутыми фильмами
- `POST /api/users/like/:movieId` - лайк
- `DELETE /api/users/unlike/:movieId` - убрать лайк
- `DELETE /api/users/:userId` - удаление пользователя, только admin

Защищенные эндпоинты требуют заголовок:

```http
Authorization: Bearer <token>
```

### Фильмы

- `GET /api/movies` - список фильмов
- `POST /api/movies` - создать фильм, только admin
- `PUT /api/movies/:id` - обновить фильм, только admin
- `DELETE /api/movies/:id` - удалить фильм, только admin

### Рекомендации

- `GET /api/recommend` - гибридные рекомендации, требует авторизацию

## Как Работают Рекомендации

- При лайке создаются связи в Neo4j: `(User)-[:LIKED]->(Movie)` и `(Movie)-[:HAS_TAG]->(Tag)`.
- Content-based: фильмы с похожими тегами, которые пользователь еще не лайкал.
- Collaborative: фильмы, которые лайкали похожие пользователи.
- Итоговый скор = `0.6 * content + 0.4 * collab`.

## Постеры Фильмов

Backend получает постеры из TMDB по названию фильма, если задан `TMDB_ACCESS_TOKEN`.

## Нагрузочное Тестирование

Locust-сценарий находится в `backend/tests/load/locustfile.py`.

Запуск:

```bash
cd backend/tests/load
locust -f locustfile.py --host=http://localhost:4000
```

## Примечания

- MongoDB хранит основную модель: users, movies, interactions.
- Neo4j хранит граф лайков и тегов для рекомендаций.
- Для admin-операций выставьте `role: 'admin'` у пользователя в MongoDB.
