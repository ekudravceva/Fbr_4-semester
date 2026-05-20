import amqplib from 'amqplib';

const WORKER_ID = process.env.WORKER_ID || '1';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function processWithRetry(message, processor) {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      await processor(message);
      console.log(`[Worker ${WORKER_ID}] Успешно обработано за ${attempt + 1} попытку`);
      return true;
    } catch (err) {
      attempt++;
      console.error(`[Worker ${WORKER_ID}] Попытка ${attempt}/${MAX_RETRIES} провалилась: ${err.message}`);

      if (attempt >= MAX_RETRIES) {
        console.error(`[Worker ${WORKER_ID}] Исчерпаны все ${MAX_RETRIES} попытки`);
        return false;
      }

      const exponentialDelay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), 30000);
      const jitter = Math.random() * 1000;
      const delay = exponentialDelay + jitter;

      console.log(`[Worker ${WORKER_ID}] Повтор через ${Math.round(delay)}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

async function processTask(task) {
  console.log(`[Worker ${WORKER_ID}] Обработка задачи: ${task.id}, тип: ${task.type}`);

  // Имитация обработки с задержкой
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 40% успеха для демонстрации retry
  if (Math.random() < 0.6) {
    throw new Error('Временная ошибка обработки');
  }

  console.log(`[Worker ${WORKER_ID}] Отправка ${task.type}:`, task.payload);
  return true;
}

async function startWorker() {
  try {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    // НЕ создаём очередь, только проверяем её существование
    try {
      await channel.checkQueue('tasks_queue');
      console.log(`[Worker ${WORKER_ID}] Очередь tasks_queue найдена`);
    } catch (error) {
      console.error(`[Worker ${WORKER_ID}] Очередь tasks_queue не существует!`);
      console.log(`[Worker ${WORKER_ID}] Запустите npm run setup для создания очередей`);
      process.exit(1);
    }
    
    await channel.prefetch(1);

    console.log(`[Worker ${WORKER_ID}] Запущен, ожидание задач...`);

    channel.consume('tasks_queue', async (msg) => {
      if (!msg) return;

      const task = JSON.parse(msg.content.toString());
      console.log(`[Worker ${WORKER_ID}] Получена задача: ${task.id}`);

      const success = await processWithRetry(task, async () => {
        await processTask(task);
      });

      if (success) {
        channel.ack(msg);
        console.log(`[Worker ${WORKER_ID}] Задача ${task.id} выполнена и подтверждена`);
      } else {
        console.error(`[Worker ${WORKER_ID}] Задача ${task.id} отправлена в DLQ`);
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    console.error(`[Worker ${WORKER_ID}] Ошибка подключения:`, error.message);
    setTimeout(startWorker, 5000);
  }
}

startWorker();