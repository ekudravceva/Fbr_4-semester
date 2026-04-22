# Практика 21. Кэширование с использованием Redis
# Тестирование
## Предварительные требования

- Запущен Redis: `docker start redis-cache`
- Запущен backend: `node server.js`
Дальнейшее тестирование проводилось через Thunder Client

## Тестирование в Thunder Client

### 1. Получить токен доступа

Создайте новый запрос:

Method: `POST`
URL: `http://localhost:3000/api/auth/login` 

**Body:**
```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```
**Send** и скопировать `accessToken` из ответа.

### 2. Тест кэширования GET /api/users

**Первый запрос (данные из сервера):**

Method: `GET`
URL: `http://localhost:3000/api/users` |
Headers: `Authorization: Bearer <ваш_токен>` |

**Send**

**Ожидаемый ответ:** `"source": "server"`

**Второй запрос (данные из кэша):**

**Ожидаемый ответ:** `"source": "cache"`

### Шаг 3. Тест кэширования GET /api/products, GET /api/users/{id}, GET /api/products/{id}

Также протестировать маршруты GET /api/products, GET /api/users/{id}, GET /api/products/{id}

### Шаг 4. Тест очистки кэша при изменении данных

1. Выполните **GET /api/users** — убедитесь, что ответ содержит `"source": "cache"`

2. Обновите пользователя:

Method:`PUT` 
URL: `http://localhost:3000/api/users/<id_пользователя>` 
Headers: `Authorization: Bearer <ваш_токен>` 

**Body:**
```json
{
  "first_name": "TestName"
}
```

3. Снова выполните **GET /api/users**

**Ожидаемый ответ:** `"source": "server"` (кэш очищен)

## Примечания

- Время кэширования пользователей: **1 минута**
- Время кэширования товаров: **10 минут**
- После изменения данных через PUT/DELETE кэш автоматически очищается