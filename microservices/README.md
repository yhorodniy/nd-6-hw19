# Мікросервіси

Цей проект було розділено на мікросервіси для кращої масштабованості та розподілу відповідальності.

## Архітектура

### User Service (порт 3001)
- Створення нових користувачів
- Отримання інформації про користувачів
- Зберігання даних у Redis
- Публікація подій про створення користувачів

### Logging Service (порт 3002)
- Логування подій у файли
- Підписка на події створення користувачів
- HTTP API для прямого логування

### Redis
- Зберігання даних користувачів
- Pub/Sub для комунікації між сервісами

## Швидкий старт

### 1. Встановіть Docker Desktop
Завантажте та встановіть Docker Desktop з https://www.docker.com/products/docker-desktop/

### 2. Запустіть інфраструктуру
```bash
# Windows
start-infrastructure.bat

# Або вручну
npm run setup:redis
```

### 3. Встановіть залежності та запустіть сервіси
```bash
# Встановлення залежностей
npm run deps:user-service
npm run deps:logging-service

# Запуск мікросервісів
npm run start:microservices
```

### 4. Тестування
```bash
# PowerShell
.\test-microservices.ps1

# Або вручну перевірте endpoints:
# http://localhost:3001/health
# http://localhost:3002/health
```

## Детальні інструкції

### Встановлення залежностей
```bash
# Для User Service
npm run deps:user-service

# Для Logging Service
npm run deps:logging-service
```

### Запуск Redis
```bash
# Використовуючи Docker
docker run -d -p 6379:6379 redis:7-alpine

# Або встановити локально
# Windows: скачати з https://redis.io/download
# Linux: sudo apt-get install redis-server
# macOS: brew install redis
```

### Запуск мікросервісів

#### Розробка (development)
```bash
# Запуск User Service
npm run start:users

# Запуск Logging Service (в іншому терміналі)
npm run start:logger

# Або обидва одночасно
npm run start:microservices
```

#### Продакшн (production)
```bash
# Збірка та запуск
npm run prod:microservices

# Або використовуючи Docker Compose
docker-compose -f docker-compose.microservices.yml up -d
```

## API Endpoints

### User Service (http://localhost:3001)

#### POST /users/create
Створення нового користувача
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### GET /users/:id
Отримання користувача за ID

#### GET /health
Перевірка здоров'я сервісу

### Logging Service (http://localhost:3002)

#### POST /logs
Створення лог запису
```json
{
  "message": "Log message",
  "level": "info",
  "metadata": {}
}
```

#### GET /health
Перевірка здоров'я сервісу

## Зміни у фронтенді

Фронтенд тепер використовує User Service для створення користувачів:
- Реєстрація: `http://localhost:3001/users/create`
- Отримання користувача: `http://localhost:3001/users/:id`

## Логування

Logging Service автоматично логує:
- Створення нових користувачів (через Redis Pub/Sub)
- Всі HTTP запити до сервісу
- Помилки та винятки

Логи зберігаються в:
- `microservices/logging-service/logs/application-YYYY-MM-DD.log`
- `microservices/logging-service/logs/error-YYYY-MM-DD.log`

## Конфігурація

### Environment Variables

#### User Service (.env)
```
PORT=3001
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

#### Logging Service (.env)
```
PORT=3002
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

## Моніторинг

Кожен сервіс має endpoint `/health` для перевірки стану:
- User Service: http://localhost:3001/health
- Logging Service: http://localhost:3002/health

## Майбутні покращення

1. Додати аутентифікацію до User Service
2. Додати валідацію та обробку помилок
3. Додати метрики та моніторинг
4. Розширити логування
5. Додати тести
6. Додати API Gateway
7. Додати service discovery
