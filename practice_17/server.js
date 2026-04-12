const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const vapidKeys = {
    publicKey: 'BHS0kzEtrdWtZj77rjlSpts8ZCWEyjB5JdYciLAUCEmF79_QL5PwsKas_8F1OZUZi94rJ2r5icqbnN9kjGAlnWc',
    privateKey: 'ceaQ_btn0pFUf_h0n0RRMsXigfEnHLcx2YQi92PxdoY'
};

webpush.setVapidDetails(
    'mailto:ekudravceva052@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const app = express();

app.use(cors({
    origin: ['https://localhost:3000', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(bodyParser.json());

let subscriptions = [];
const reminders = new Map();

const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log('Клиент подключён:', socket.id);

    socket.on('newTask', (task) => {
        io.emit('taskAdded', task);
        const payload = JSON.stringify({ title: 'Новая задача', body: task.text });
        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => console.error('Push error:', err));
        });
    });

    socket.on('newReminder', (reminder) => {
        const { id, text, reminderTime } = reminder;
        const delay = reminderTime - Date.now();
        if (delay <= 0) return;

        console.log(`Запланировано напоминание ${id} через ${Math.round(delay / 1000)} сек`);

        const timeoutId = setTimeout(async () => {

            const payload = JSON.stringify({
                title: 'Напоминание',
                body: text,
                reminderId: id
            });

            const validSubs = [];
            for (const sub of subscriptions) {
                try {
                    await webpush.sendNotification(sub, payload);
                    validSubs.push(sub);
                } catch (err) {
                    if (err.statusCode !== 410 && err.statusCode !== 404) {
                        console.error('Push error:', err);
                        validSubs.push(sub);
                    }
                }
            }
            subscriptions = validSubs;

            const reminderData = reminders.get(id);
            if (reminderData) {
                reminderData.triggered = true;
                reminderData.timeoutId = null;
                reminders.set(id, reminderData);
            }

        }, delay);

        reminders.set(id, {
            timeoutId,
            text,
            reminderTime,
            triggered: false
        });
    });
    socket.on('disconnect', () => {
        console.log('Клиент отключён:', socket.id);
    });
});

app.post('/subscribe', (req, res) => {
    subscriptions.push(req.body);
    res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    res.status(200).json({ message: 'Подписка удалена' });
});

app.post('/snooze', (req, res) => {
    
    const reminderId = parseInt(req.query.reminderId, 10);

    if (!reminderId || !reminders.has(reminderId)) {
        console.error('Reminder not found!');
        return res.status(400).json({ 
            error: 'Напоминание не найдено',
            activeReminders: Array.from(reminders.keys())
        });
    }

    const reminder = reminders.get(reminderId);
    console.log('Found reminder:', reminder);
    
    if (reminder.timeoutId) {
        clearTimeout(reminder.timeoutId);
        console.log('Cleared existing timeout');
    }

    const newDelay = 5 * 60 * 1000; // 5 минут
    console.log(`Setting new snooze timeout: ${newDelay}ms`);
    
    const newTimeoutId = setTimeout(async () => {
        console.log('=== SNOOZE TIMEOUT TRIGGERED ===');
        console.log('Reminder ID:', reminderId);
        
        const payload = JSON.stringify({
            title: 'Напоминание (отложено)',
            body: reminder.text,
            reminderId: reminderId
        });

        const validSubs = [];
        for (const sub of subscriptions) {
            try {
                await webpush.sendNotification(sub, payload);
                validSubs.push(sub);
            } catch (err) {
                if (err.statusCode !== 410 && err.statusCode !== 404) {
                    validSubs.push(sub);
                }
            }
        }
        subscriptions = validSubs;
        
        const reminderData = reminders.get(reminderId);
        if (reminderData) {
            reminderData.triggered = true;
            reminderData.timeoutId = null;
            reminders.set(reminderId, reminderData);
        }
    }, newDelay);

    // Обновляю данные напоминания
    reminders.set(reminderId, {
        timeoutId: newTimeoutId,
        text: reminder.text,
        reminderTime: Date.now() + newDelay,
        triggered: false
    });
    
    res.status(200).json({ 
        message: 'Напоминание отложено на 5 минут',
        reminderId: reminderId,
        willTriggerAt: new Date(Date.now() + newDelay).toISOString()
    });
});

app.use(express.static(path.join(__dirname)));

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Сервер на http://localhost:${PORT}`);
});