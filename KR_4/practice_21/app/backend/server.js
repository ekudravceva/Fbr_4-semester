const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { createClient } = require("redis");

const app = express();
const port = 3000;

const JWT_SECRET = "access_secret_key";
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_SECRET = "refresh_secret_key";
const REFRESH_EXPIRES_IN = "7d";

// Время хранения кэша, сек
const USERS_CACHE_TTL = 60;      // 1 минута для пользователей
const PRODUCTS_CACHE_TTL = 600;  // 10 минут для товаров

// Роли пользователей
const ROLES = {
    USER: 'user',
    SELLER: 'seller',
    ADMIN: 'admin'
};

// Подключение к Redis
const redisClient = createClient({ url: 'redis://localhost:6379' });

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Connected'));

async function initRedis() {
    await redisClient.connect();
}

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

const users = [];
const products = [];
const refreshTokens = new Set();

// Middleware чтения из кэша
function cacheMiddleware(keyBuilder, ttl) {
    return async (req, res, next) => {
        try {
            const key = keyBuilder(req);
            const cachedData = await redisClient.get(key);
            if (cachedData) {
                return res.json({ source: "cache", data: JSON.parse(cachedData) });
            }
            req.cacheKey = key;
            req.cacheTTL = ttl;
            next();
        } catch (err) {
            console.error("Cache read error:", err);
            next();
        }
    };
}

// Сохранение ответа в кэш
async function saveToCache(key, data, ttl) {
    try {
        await redisClient.set(key, JSON.stringify(data), { EX: ttl });
    } catch (err) {
        console.error("Cache save error:", err);
    }
}

// Удаление кэша пользователей
async function invalidateUsersCache(userId = null) {
    try {
        await redisClient.del("users:all");
        if (userId) {
            await redisClient.del(`users:${userId}`);
        }
    } catch (err) {
        console.error("Users cache invalidate error:", err);
    }
}

// Удаление кэша товаров
async function invalidateProductsCache(productId = null) {
    try {
        await redisClient.del("products:all");
        if (productId) {
            await redisClient.del(`products:${productId}`);
        }
    } catch (err) {
        console.error("Products cache invalidate error:", err);
    }
}

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

app.get('/api/users', authMiddleware, roleMiddleware([ROLES.ADMIN]), cacheMiddleware(() => "users:all", USERS_CACHE_TTL), async (req, res) => {
    const usersList = users.map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isActive: user.isActive
    }));
    await saveToCache(req.cacheKey, usersList, req.cacheTTL);
    res.json({ source: "server", data: usersList });
});

app.get('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), cacheMiddleware((req) => `users:${req.params.id}`, USERS_CACHE_TTL), async (req, res) => {
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isActive: user.isActive
    };
    await saveToCache(req.cacheKey, userData, req.cacheTTL);
    res.json({ source: "server", data: userData });
});

app.put('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), async (req, res) => {
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

    await invalidateUsersCache(user.id);

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isActive: user.isActive
    });
});

app.delete('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), async (req, res) => {
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = false;

    await invalidateUsersCache(user.id);

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

app.post('/api/products', authMiddleware, roleMiddleware([ROLES.SELLER, ROLES.ADMIN]), async (req, res) => {
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
    await invalidateProductsCache();
    res.status(201).json(newProduct);
});

app.get('/api/products', authMiddleware, roleMiddleware([ROLES.USER, ROLES.SELLER, ROLES.ADMIN]), cacheMiddleware(() => "products:all", PRODUCTS_CACHE_TTL), async (req, res) => {
    await saveToCache(req.cacheKey, products, req.cacheTTL);
    res.status(200).json({ source: "server", data: products });
});

app.get('/api/products/:id', authMiddleware, roleMiddleware([ROLES.USER, ROLES.SELLER, ROLES.ADMIN]), cacheMiddleware((req) => `products:${req.params.id}`, PRODUCTS_CACHE_TTL), async (req, res) => {
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    await saveToCache(req.cacheKey, product, req.cacheTTL);
    res.status(200).json({ source: "server", data: product });
});

app.put('/api/products/:id', authMiddleware, roleMiddleware([ROLES.SELLER, ROLES.ADMIN]), async (req, res) => {
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const { title, category, description, price } = req.body;

    if (title) product.title = title;
    if (category) product.category = category;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);

    await invalidateProductsCache(product.id);

    res.status(200).json(product);
});

app.delete('/api/products/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), async (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const deletedProduct = products[index];
    products.splice(index, 1);

    await invalidateProductsCache(deletedProduct.id);

    res.status(200).json({
        message: 'Product deleted successfully',
        product: deletedProduct
    });
});

createTestUsers().then(async () => {
    await initRedis();
    app.listen(port);
});