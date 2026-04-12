const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const app = express();
const port = 3000;

const JWT_SECRET = "access_secret_key";
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_SECRET = "refresh_secret_key";
const REFRESH_EXPIRES_IN = "7d";

// Роли пользователей
const ROLES = {
    USER: 'user',
    SELLER: 'seller',
    ADMIN: 'admin'
};

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

const users = [];
const products = [];
const refreshTokens = new Set();

// Хеширование пароля
async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

// Проверка пароля
async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

// Поиск пользователя по email
function findUserByEmail(email) {
    return users.find(user => user.email === email);
}

// Поиск пользователя по ID
function findUserById(id) {
    return users.find(user => user.id === id);
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "Missing or invalid Authorization header"
        });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }
}

// Middleware для проверки ролей
function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied: insufficient permissions' });
        }

        next();
    };
}

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            username: user.email,
            role: user.role
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN
        }
    );
}

const swaggerOptions = {
    definition: {
        info: {
            title: 'API AUTH with RBAC',
            description: 'API для управления пользователями и товарами',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'Автоматически сгенерированный ID' },
                        email: { type: 'string', format: 'email', description: 'Email пользователя' },
                        first_name: { type: 'string', description: 'Имя пользователя' },
                        last_name: { type: 'string', description: 'Фамилия пользователя' },
                        role: { type: 'string', description: 'Роль пользователя', enum: ['user', 'seller', 'admin'] },
                        isActive: { type: 'boolean', description: 'Статус активности' }
                    }
                },
                Product: {
                    type: 'object',
                    required: ['title', 'category', 'description', 'price'],
                    properties: {
                        id: { type: 'string', description: 'Автоматически сгенерированный ID' },
                        title: { type: 'string', description: 'Название товара' },
                        category: { type: 'string', description: 'Категория товара' },
                        description: { type: 'string', description: 'Описание товара' },
                        price: { type: 'number', description: 'Цена товара' },
                        createdBy: { type: 'string', description: 'ID создателя' },
                        createdByRole: { type: 'string', description: 'Роль создателя' }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string', description: 'JWT токен для доступа к защищенным маршрутам' },
                        refreshToken: { type: 'string', description: 'JWT токен для обновления пары токенов' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        password: { type: 'string', example: 'qwerty123' }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'first_name', 'last_name', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        first_name: { type: 'string', example: 'Иван' },
                        last_name: { type: 'string', example: 'Иванов' },
                        password: { type: 'string', example: 'qwerty123' },
                        role: { type: 'string', enum: ['user', 'seller'], description: 'Только для админа' }
                    }
                },
                ProductCreateRequest: {
                    type: 'object',
                    required: ['title', 'category', 'description', 'price'],
                    properties: {
                        title: { type: 'string', example: 'Смартфон' },
                        category: { type: 'string', example: 'Электроника' },
                        description: { type: 'string', example: 'Новый смартфон с отличной камерой' },
                        price: { type: 'number', example: 29999.99 }
                    }
                },
                ProductUpdateRequest: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', example: 'Обновленный смартфон' },
                        category: { type: 'string', example: 'Электроника' },
                        description: { type: 'string', example: 'Обновленное описание' },
                        price: { type: 'number', example: 24999.99 }
                    }
                },
                UserUpdateRequest: {
                    type: 'object',
                    properties: {
                        first_name: { type: 'string', example: 'Иван' },
                        last_name: { type: 'string', example: 'Петров' },
                        role: { type: 'string', enum: ['user', 'seller', 'admin'], example: 'seller' }
                    }
                },
                RefreshRequest: {
                    type: 'object',
                    required: ['refreshToken'],
                    properties: {
                        refreshToken: { type: 'string', description: 'Refresh токен для получения новой пары' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Создание тестовых пользователей
async function createTestUsers() {
    const adminExists = users.find(u => u.email === 'admin@test.com');
    if (!adminExists) {
        users.push({
            id: nanoid(),
            email: 'admin@test.com',
            first_name: 'Admin',
            last_name: 'User',
            hashedPassword: await hashPassword('admin123'),
            role: ROLES.ADMIN,
            isActive: true
        });
        console.log('Admin user created: admin@test.com / admin123');
    }

    const sellerExists = users.find(u => u.email === 'seller@test.com');
    if (!sellerExists) {
        users.push({
            id: nanoid(),
            email: 'seller@test.com',
            first_name: 'Seller',
            last_name: 'Test',
            hashedPassword: await hashPassword('seller123'),
            role: ROLES.SELLER,
            isActive: true
        });
        console.log('Seller user created: seller@test.com / seller123');
    }

    const userExists = users.find(u => u.email === 'user@test.com');
    if (!userExists) {
        users.push({
            id: nanoid(),
            email: 'user@test.com',
            first_name: 'User',
            last_name: 'Test',
            hashedPassword: await hashPassword('user123'),
            role: ROLES.USER,
            isActive: true
        });
        console.log('Regular user created: user@test.com / user123');
    }
}

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Управление аутентификацией
 *   - name: Products
 *     description: Управление товарами
 *   - name: Admin
 *     description: Управление пользователями (только админ)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Отсутствуют обязательные поля или email уже существует
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password, role } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({
            error: 'email, first_name, last_name and password are required'
        });
    }

    if (findUserByEmail(email)) {
        return res.status(400).json({
            error: 'User with this email already exists'
        });
    }

    // Определяем роль
    let finalRole = ROLES.USER;
    if (req.user && req.user.role === ROLES.ADMIN && role && [ROLES.USER, ROLES.SELLER].includes(role)) {
        finalRole = role;
    }

    const newUser = {
        id: nanoid(),
        email,
        first_name,
        last_name,
        hashedPassword: await hashPassword(password),
        role: finalRole,
        isActive: true
    };

    users.push(newUser);

    const userResponse = {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
        isActive: newUser.isActive
    };

    res.status(201).json(userResponse);
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учетные данные
 *       403:
 *         description: Пользователь заблокирован
 */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }

    const user = findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
        return res.status(403).json({ error: 'Account is blocked. Contact administrator.' });
    }

    const isValid = await verifyPassword(password, user.hashedPassword);

    if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);

    res.json({
        accessToken,
        refreshToken
    });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновить пару токенов
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Успешное обновление токенов
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Отсутствует refreshToken
 *       401:
 *         description: Невалидный или истекший refresh токен
 */
app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: "refreshToken is required" });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: "Invalid refresh token" });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = users.find((u) => u.id === payload.sub);

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: "Account is blocked" });
        }

        refreshTokens.delete(refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.add(newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Отсутствует или невалидный токен
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
    const userId = req.user.sub;
    const user = findUserById(userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isActive: user.isActive
    });
});

// ADMIN USERS ROUTES 

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей (только админ)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Доступ запрещен
 */
app.get('/api/users', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
    const usersList = users.map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isActive: user.isActive
    }));
    res.json(usersList);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID (только админ)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *         example: abc123
 *     responses:
 *       200:
 *         description: Пользователь найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 */
app.get('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isActive: user.isActive
    });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить информацию пользователя (только админ)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 */
app.put('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { first_name, last_name, role } = req.body;

    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (role && [ROLES.USER, ROLES.SELLER, ROLES.ADMIN].includes(role)) {
        user.role = role;
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isActive: user.isActive
    });
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя (только админ)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь заблокирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *       404:
 *         description: Пользователь не найден
 */
app.delete('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = false;

    res.json({
        message: 'User blocked successfully',
        user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            isActive: user.isActive
        }
    });
});

// PRODUCTS ROUTES

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар (продавец и админ)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreateRequest'
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */
app.post('/api/products', authMiddleware, roleMiddleware([ROLES.SELLER, ROLES.ADMIN]), (req, res) => {
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({
            error: 'title, category, description and price are required'
        });
    }

    const newProduct = {
        id: nanoid(),
        title,
        category,
        description,
        price: Number(price),
        createdBy: req.user.sub,
        createdByRole: req.user.role
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров (все авторизованные)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Не авторизован
 */
app.get('/api/products', authMiddleware, roleMiddleware([ROLES.USER, ROLES.SELLER, ROLES.ADMIN]), (req, res) => {
    res.status(200).json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID (все авторизованные)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', authMiddleware, roleMiddleware([ROLES.USER, ROLES.SELLER, ROLES.ADMIN]), (req, res) => {
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар по ID (продавец и админ)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdateRequest'
 *     responses:
 *       200:
 *         description: Товар обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.put('/api/products/:id', authMiddleware, roleMiddleware([ROLES.SELLER, ROLES.ADMIN]), (req, res) => {
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const { title, category, description, price } = req.body;

    if (title) product.title = title;
    if (category) product.category = category;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);

    res.status(200).json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар по ID (только админ)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const deletedProduct = products[index];
    products.splice(index, 1);

    res.status(200).json({
        message: 'Product deleted successfully',
        product: deletedProduct
    });
});

createTestUsers().then(() => {
    app.listen(port, () => {
        console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
        console.log(`\nТестовые пользователи:`);
        console.log(`   Админ:     admin@test.com / admin123`);
        console.log(`   Продавец:  seller@test.com / seller123`);
        console.log(`   Пользователь: user@test.com / user123`);
    });
});