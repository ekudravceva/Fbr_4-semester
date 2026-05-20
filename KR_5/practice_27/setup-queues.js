import amqplib from 'amqplib';

async function setupQueues() {
  try {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // Dead Letter Exchange
    await channel.assertExchange('dlx_exchange', 'direct', { durable: true });

    // Dead Letter Queue
    await channel.assertQueue('dead_letter_queue', { durable: true });

    // Bind DLQ to DLX
    await channel.bindQueue('dead_letter_queue', 'dlx_exchange', 'dead');

    // Main queue with DLX configuration
    await channel.assertQueue('tasks_queue', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'dlx_exchange',
        'x-dead-letter-routing-key': 'dead',
      },
    });

    console.log('Очереди настроены: tasks_queue → [DLX] → dead_letter_queue');
    await connection.close();
  } catch (error) {
    console.error('Ошибка настройки очередей:', error.message);
    process.exit(1);
  }
}

setupQueues();