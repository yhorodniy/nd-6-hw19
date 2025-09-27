# User Service

Мікросервіс для управління користувачами.

## Endpoints

### POST /users/create
Створює нового користувача.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### GET /users/:id
Повертає інформацію про користувача.

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

## Запуск

```bash
npm install
npm run dev
```

## Environment Variables

- `PORT` - порт сервера (за замовчуванням 3001)
- `REDIS_URL` - URL Redis сервера
- `JWT_SECRET` - секретний ключ для JWT
- `NODE_ENV` - середовище виконання
