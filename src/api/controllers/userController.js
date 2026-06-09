import { pool } from "../../database/db.js";

// Для работы с БД (получение данных)
export async function getAllUsers(req, res) {
    try {
        const { rows } = await pool.query("SELECT * FROM users");
        res.json(rows);
    } catch (error) {
        console.error("Ошибка БД: ", error.message);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
}

export async function getUserById(req, res) {
    try {
        const { id } = req.params;
        const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
            id,
        ]);

        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({
                error: `Пользователь с id=${id} не найден`,
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
}

export async function getAssignmentsByUserId(req, res) {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            "SELECT * FROM assignments WHERE user_id = $1",
            [id]
        );

        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({
                error: `У пользователя с id=${id} не найдено ни одной заявки`,
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
}

// Для авторизации и регистрации пользователей
export async function register(req, res) {
    try {
        const {
            login,
            password,
            first_name,
            last_name,
            middle_name,
            date_of_birth,
            phone,
            email,
        } = req.body;

        const credentialsResult = await pool.query(
            `INSERT INTO credentials(login, password)
            VALUES ($1, $2)
            RETURNING id`,
            [login, password]
        );

        const credentialsId = credentialsResult.rows[0].id;

        const userResult = await pool.query(
            `INSERT INTO users(
                credentials_id,
                last_name,
                first_name,
                middle_name,
                role_id,
                date_of_birth,
                phone,
                email
            )
            VALUES ($1, $2, $3, $4, 2, $5, $6, $7)
            RETURNING *`,
            [
                credentialsId,
                last_name,
                first_name,
                middle_name,
                date_of_birth,
                phone,
                email,
            ]
        );

        const user = userResult.rows[0];

        req.session.user = {
            id: user.id,
            login,
        };

        res.redirect("/");
    } catch (error) {
        console.error(error);

        res.status(500).send(error.message);
    }
}

export async function login(req, res) {
    try {
        const { login, password } = req.body;

        const result = await pool.query(
            `SELECT
                users.id as user_id,
                credentials.login,
                credentials.password
            FROM users
            JOIN credentials
                ON users.credentials_id = credentials.id
            WHERE credentials.login = $1`,
            [login]
        );

        if (result.rows.length === 0) {
            return res.status(401).send("Пользователь не найден");
        }

        const user = result.rows[0];

        if (user.password !== password) {
            return res.status(401).send("Неверный пароль");
        }

        req.session.user = {
            id: user.user_id,
            login: user.login,
        };

        res.redirect("/");
    } catch (error) {
        console.error(error);

        res.status(500).send(error.message);
    }
}

export function logout(req, res) {
    req.session.destroy(() => {
        res.redirect("/login");
    });
}
