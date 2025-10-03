# План разработки backend для «Продажник из тиндера»

## Цели
- Реализовать backend на JavaScript с базой данных SQLite через Prisma.
- Добавить аутентификацию по Telegram ID для WebApp внутри Telegram.
- Обеспечить CRUD для тем (topics) и уроков (lessons), с ролями (admin/user).
- Заменить хранение данных админ‑панели из `localStorage` на API + БД.

## Технологии и проектирование
- Runtime: Node.js (LTS).
- Фреймворк: Next.js Route Handlers (папка `app/api`) на JavaScript.
  - Альтернатива: отдельный сервер на Express. Рекомендуем начать с `app/api` для меньшей сложности.
- ORM: Prisma.
- База: SQLite (`file:./dev.db`).
- Аутентификация: Telegram WebApp `initData` с HMAC‑проверкой подписи.
- Сессии: JWT (HttpOnly cookie) либо серверная сессия (например, signed cookies). Для простоты — JWT в HttpOnly cookie.

## Структура backend (внутри текущего проекта)
- `frontend/app/api/auth/telegram/route.js` — верификация Telegram WebApp `initData`, создание/поиск пользователя, выдача JWT.
- `frontend/app/api/me/route.js` — профиль текущего пользователя.
- `frontend/app/api/topics/route.js` — список/создание тем (GET/POST).
- `frontend/app/api/topics/[id]/route.js` — чтение/обновление/удаление темы (GET/PATCH/DELETE).
- `frontend/app/api/lessons/route.js` — список/создание уроков (GET/POST).
- `frontend/app/api/lessons/[id]/route.js` — чтение/обновление/удаление урока (GET/PATCH/DELETE).
- `prisma/schema.prisma` — модели БД (в корне репо).
- `.env` — переменные окружения: `DATABASE_URL`, `BOT_TOKEN` (токен Telegram‑бота для HMAC).

## Модели БД (Prisma)
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           Int      @id @default(autoincrement())
  telegramId   String   @unique
  username     String?  // Telegram username (если есть)
  firstName    String?
  lastName     String?
  role         Role     @default(USER)
  createdAt    DateTime @default(now())
  lessons      Lesson[]
}

model Topic {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  icon        String?
  lessons     Lesson[]
  createdAt   DateTime @default(now())
}

model Lesson {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  icon        String?
  topicId     Int?
  topic       Topic?   @relation(fields: [topicId], references: [id])
  authorId    Int?
  author      User?    @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
}

enum Role {
  USER
  ADMIN
}
```

## Аутентификация по Telegram ID
Telegram WebApp предоставляет `window.Telegram.WebApp.initData`, содержащий данные пользователя и хэш.
Бэкенд должен верифицировать подпись по алгоритму HMAC‑SHA256 с секретом `BOT_TOKEN` (токен вашего бота).

План обработки `/api/auth/telegram`:
- Клиент отправляет `initDataRaw` (строка `Telegram.WebApp.initData`) на backend.
- Backend валидирует подпись, извлекает `user.id` (telegramId) и профиль.
- Если пользователь не существует — создаёт запись `User` с ролью USER.
- Возвращает JWT (HttpOnly cookie) и профиль.

Псевдокод валидации (JavaScript, упрощённо):
```js
import crypto from "crypto";

function validateTelegramInitData(initDataRaw, botToken) {
  const params = new URLSearchParams(initDataRaw);
  const hash = params.get("hash");
  params.delete("hash");
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const hmac = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  return hmac === hash;
}
```

## Эндпоинты и права доступа
- `POST /api/auth/telegram` — верификация `initDataRaw`, выдача cookie с JWT.
  - Публичный (без токена), но с HMAC‑проверкой.
- `GET /api/me` — профиль текущего пользователя (требует JWT). 
- `GET /api/topics` — список тем (публичный или авторизованный — по требованию).
- `POST /api/topics` — создать тему (только ADMIN).
- `GET /api/topics/:id` — получить тему.
- `PATCH /api/topics/:id` — обновить тему (ADMIN).
- `DELETE /api/topics/:id` — удалить тему (ADMIN).
- `GET /api/lessons` — список уроков (с фильтром по `topicId`).
- `POST /api/lessons` — создать урок (ADMIN или авторизованный пользователь по политики проекта).
- `GET /api/lessons/:id` — получить урок.
- `PATCH /api/lessons/:id` — обновить урок (ADMIN/автор).
- `DELETE /api/lessons/:id` — удалить урок (ADMIN/автор).

Мидлвары:
- Проверка JWT и извлечение `req.user`.
- Проверка роли ADMIN для mutating‑операций.

## Интеграция с текущим frontend
- Главная (`/`) ссылка на `/admin` уже есть.
- Админ‑панель сейчас хранит данные в `localStorage` (ключи `sf_admin_topics`, `sf_admin_lessons`).
  - Перевести на загрузку из API: `GET /api/topics`, `GET /api/lessons`.
  - Операции добавления/удаления — вызывать `POST/DELETE` к API.
  - Иконки остаются из `/public/*.svg`, поле `icon` хранится как имя файла.
- Страницы уроков (`/lessons/*`) могут читать данные из API (в будущем) — сейчас статический контент.

## Шаги внедрения
1) Инициализация Prisma:
   - `npm i prisma @prisma/client`
   - `npx prisma init` (создаст `prisma/schema.prisma` и `.env`)
   - В `.env`: `DATABASE_URL="file:./dev.db"` и `BOT_TOKEN="<токен_бота>"`.

2) Описание моделей (как выше) и миграция:
   - `npx prisma migrate dev --name init`
   - `npx prisma generate`

3) Бэкенд‑слои:
   - Утилита для подключения Prisma Client (singleton) в `frontend/lib/db.js`.
   - Верификатор Telegram `initDataRaw` в `frontend/lib/telegram.js`.
   - JWT хелперы: `frontend/lib/jwt.js`.

4) Эндпоинты в `app/api` (JS):
   - `/api/auth/telegram/route.js` (POST)
   - `/api/me/route.js` (GET)
   - `/api/topics/route.js` (GET, POST)
   - `/api/topics/[id]/route.js` (GET, PATCH, DELETE)
   - `/api/lessons/route.js` (GET, POST)
   - `/api/lessons/[id]/route.js` (GET, PATCH, DELETE)

5) Интеграция админ‑панели:
   - Заменить `localStorage` операции на запросы к API.
   - Защитить `/admin`: при отсутствии JWT перенаправлять на экран авторизации WebApp (в Telegram) или показывать кнопку «Войти через Telegram» (для отладки — можно позволить USER).

6) Авторизация и роли:
   - По умолчанию все новые пользователи — `USER`.
   - Роль `ADMIN` назначается вручную (скриптом/миграцией/промо).
   - Проверки в обработчиках: только ADMIN может менять темы/уроки.

7) Безопасность:
   - HMAC‑валидация `initDataRaw` обязательна.
   - JWT хранить в HttpOnly cookie, выставлять `SameSite=Lax`.
   - Логи ошибок и отказов авторизации.

## Набросок реализации API (JS, Next.js Route Handlers)
Пример `/app/api/auth/telegram/route.js` (схема):
```js
import { NextResponse } from "next/server";
import { validateTelegramInitData } from "@/lib/telegram";
import { prisma } from "@/lib/db";
import { setAuthCookie } from "@/lib/jwt";

export async function POST(request) {
  const { initDataRaw } = await request.json();
  if (!initDataRaw) return NextResponse.json({ error: "Missing initDataRaw" }, { status: 400 });

  const ok = validateTelegramInitData(initDataRaw, process.env.BOT_TOKEN);
  if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const params = new URLSearchParams(initDataRaw);
  const userData = JSON.parse(params.get("user"));
  const telegramId = String(userData.id);

  let user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    user = await prisma.user.create({ data: {
      telegramId,
      username: userData.username || null,
      firstName: userData.first_name || null,
      lastName: userData.last_name || null,
    }});
  }

  const res = NextResponse.json({ user });
  setAuthCookie(res, { id: user.id, role: user.role });
  return res;
}
```

## Проверка и отладка
- Поднять dev‑сервер: `npm run dev` (уже используется порт `3001`).
- Создать пользователя через Telegram WebApp (в бою) или временно добавить endpoint для тестовой аутентификации.
- Прогнать CRUD админ‑панели через API.

## Дальнейшие улучшения
- Версионность контента уроков (включая «архив» в UI).
- Роли/права на уровне тем/уроков (authors, editors).
- Ограничение частоты запросов и аудит‑лог.
- Механизм импорта/экспорта (JSON) для миграции локального контента.