# Logging Service

Мікросервіс для логування даних.

## Endpoints

### POST /logs
Приймає дані для логування та записує їх у файл.

**Body:**
```json
{
  "message": "Log message",
  "level": "info",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Log entry recorded"
}
```

## Redis Subscriptions

Сервіс підписується на канал `user:created` для автоматичного логування створення користувачів.

## Запуск

```bash
npm install
npm run dev
```

## Environment Variables

- `PORT` - порт сервера (за замовчуванням 3002)
- `REDIS_URL` - URL Redis сервера
- `NODE_ENV` - середовище виконання

## Логи

Логи зберігаються в папці `logs/`:
- `application-YYYY-MM-DD.log` - загальні логи
- `error-YYYY-MM-DD.log` - логи помилок
