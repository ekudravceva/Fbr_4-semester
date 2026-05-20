import express from 'express';
import amqplib from 'amqplib';

const app = express();
app.use(express.json());

let channel;
let connection;

async function connectRabbitMQ() {
  try {
    connection = await amqplib.connect('amqp://localhost');
    channel = await connection.createChannel();
    
    // НЕ создаём очередь, только проверяем что она существует
    // Используем checkQueue вместо assertQueue
    try {
      await channel.checkQueue('tasks_queue');
      console.log('[Producer] Очередь tasks_queue найдена');
    } catch (error) {
      console.error('[Producer] Очередь tasks_queue не существует!');
      console.log('[Producer] Запустите npm run setup для создания очередей');
      process.exit(1);
    }
    
    console.log('[Producer] Подключен к RabbitMQ');
  } catch (error) {
    console.error('[Producer] Ошибка подключения к RabbitMQ:', error.message);
    setTimeout(connectRabbitMQ, 5000);
  }
}

app.post('/tasks', async (req, res) => {
  const task = req.body;

  if (!task.type || !task.payload) {
    return res.status(400).json({ error: 'Необходимы поля type и payload' });
  }

  if (!channel) {
    return res.status(503).json({ error: 'RabbitMQ не подключен' });
  }

  const message = JSON.stringify({
    id: Date.now(),
    ...task,
    createdAt: new Date().toISOString(),
  });

  try {
    channel.sendToQueue('tasks_queue', Buffer.from(message), {
      persistent: true,
    });
    console.log(`[Producer] 📤 Задача отправлена: ${message}`);
    res.status(202).json({ status: 'accepted', taskId: Date.now() });
  } catch (error) {
    console.error('[Producer] Ошибка отправки:', error.message);
    res.status(500).json({ error: 'Ошибка отправки задачи' });
  }
});

const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`[Producer] API запущен на http://localhost:${PORT}`);
  await connectRabbitMQ();
});

process.on('SIGINT', async () => {
  await channel?.close();
  await connection?.close();
  process.exit(0);
});