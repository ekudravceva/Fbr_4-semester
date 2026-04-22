# Практика №22. Балансировка нагрузки

## Описание

Реализована тестовая система балансировки нагрузки для веб-приложения:

- 3 backend-сервера на Node.js (порты 3000, 3001, 3002)
- Балансировщик Nginx (порт 8080)
- Балансировщик HAProxy (порт 9090)

## Запуск

### 1. Запуск backend-серверов

```bash
# Терминал 1
PORT=3000 node server.js

# Терминал 2
PORT=3001 node server.js

# Терминал 3
PORT=3002 node server.js
```

### 2. Запуск Nginx (Docker)

```bash
docker run -d -p 8080:80 --add-host=host.docker.internal:host-gateway -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf nginx
```

### 3. Запуск HAProxy (Docker)

```bash
docker run -d -p 9090:9090 --add-host=host.docker.internal:host-gateway -v $(pwd)/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg haproxy
```

## Тестирование

### Nginx

```bash
for i in {1..10}; do curl -s http://localhost:8080/; echo; done
```

### HAProxy

```bash
for i in {1..10}; do curl -s http://localhost:9090/; echo; done
```

### Ожидаемый вывод

```json
{"message":"Response from backend server","port":"3000"}
{"message":"Response from backend server","port":"3001"}
{"message":"Response from backend server","port":"3002"}
```
