# Практика 27

Асинхронная система обработки задач с использованием RabbitMQ, реализующая паттерн Message Queue с поддержкой Retry Logic (экспоненциальная задержка) и Dead Letter Queue (DLQ).

## Описание проекта

Проект демонстрирует реализацию асинхронной обработки задач на основе брокера сообщений RabbitMQ. Система состоит из:

- **Producer** - REST API сервер на Express, принимающий задачи и помещающий их в очередь
- **Consumer (Worker)** - воркеры, обрабатывающие задачи из очереди
- **Dead Letter Queue (DLQ)** - очередь для сообщений, не прошедших обработку после всех попыток
- **Retry Logic** - механизм повторных попыток с экспоненциальной задержкой

## Установка и запуск

### Предварительные требования

- Docker и Docker Compose
- Node.js (версия 18+)
- npm

### Установка

```bash
# 1. Клонирование репозитория
git clone <repository-url>
cd practice_27

# 2. Установка зависимостей
npm install

# 3. Запуск RabbitMQ через Docker
docker compose up -d

# 4. Ожидание запуска RabbitMQ
sleep 5

# 5. Настройка очередей (создание DLX и DLQ)
npm run setup

# 6. Запуск Producer API
npm run producer

# 7. Запуск воркеров (в отдельных терминалах)
npm run worker                    # Worker 1
WORKER_ID=2 npm run worker        # Worker 2
WORKER_ID=3 npm run worker        # Worker 3
```

### Проверка работоспособности

```bash
# Проверка статуса RabbitMQ
docker ps | grep rabbitmq

# Открыть веб-интерфейс RabbitMQ
open http://localhost:15672  # Логин/пароль: guest/guest
```