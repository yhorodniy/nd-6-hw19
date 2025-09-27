# Redis Setup for Windows

## Варіант 1: WSL2 з Docker
Якщо у вас встановлений WSL2 та Docker Desktop:
```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

## Варіант 2: Windows Subsystem for Linux (WSL)
```bash
# В WSL терміналі
sudo apt update
sudo apt install redis-server
redis-server --daemonize yes
```

## Варіант 3: Memurai (Redis альтернатива для Windows)
1. Завантажте Memurai з https://www.memurai.com/
2. Встановіть та запустіть
3. За замовчуванням працює на порті 6379

## Варіант 4: Redis для Windows (не офіційний)
1. Завантажте з https://github.com/tporadowski/redis/releases
2. Розпакуйте архів
3. Запустіть redis-server.exe

## Перевірка підключення
```bash
# Перевірити чи працює Redis на порті 6379
telnet localhost 6379

# Або використовуючи curl
curl http://localhost:6379
```

## Запуск мікросервісів без Redis (для тестування)
Ви можете тимчасово коментувати Redis код у мікросервісах для тестування основної функціональності.

Або використати in-memory зберігання замість Redis для розробки.
