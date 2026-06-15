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

export async function getProfile(req, res) {
    try {
        const user_id = req.session.user.id;

        const result = await pool.query(
            `SELECT
                a.id AS assignment_id,
                a.start_date,
                a.status,
                t.title AS transport_title,
                r.description AS review_description,
                r.id AS review_id
            FROM assignments a
            JOIN transport t ON t.id = a.transport_id
            LEFT JOIN reviews r ON r.assignment_id = a.id
            WHERE a.user_id = $1
            ORDER BY a.id DESC`,
            [user_id]
        );

        res.render("profile", {
            user: req.session.user,
            assignments: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
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

        if (login.length < 6) {
            return res.render("register", {
                error: "Логин не может быть короче 6 символов",
            });
        }

        if (login.length > 50) {
            return res.render("register", {
                error: "Логин не может быть больше 50 символов",
            });
        }

        const loginRegex = /[A-Za-z0-9]+/;
        if (!loginRegex.test(login)) {
            return res.render("register", {
                error: "Логин может содержать только латинские буквы и цифры",
            });
        }

        if (password.length < 8) {
            return res.render("register", {
                error: "Пароль не может быть короче 8 символов",
            });
        }

        if (password.length > 50) {
            return res.render("register", {
                error: "Пароль не может быть больше 50 символов",
            });
        }

        const phoneRegex = /^8\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}$/;

        if (!phoneRegex.test(phone)) {
            return res.render("register", {
                error: "Телефон должен быть формата 8(XXX)XXX-XX-XX",
            });
        }

        const existingUser = await pool.query(
            `SELECT * FROM credentials WHERE login = $1`,
            [login]
        );

        if (existingUser.rows.length > 0) {
            return res.render("register", {
                error: "Логин уже занят",
            });
        }

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

        res.status(500).render("register", {
            error: error.message,
        });
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
            return res.status(401).render("login", {
                error: "Пользователь не найден",
            });
        }

        const user = result.rows[0];

        if (user.password !== password) {
            return res.status(401).render("login", {
                error: "Неверный пароль",
            });
        }

        req.session.user = {
            id: user.user_id,
            login: user.login,
        };

        res.redirect("/");
    } catch (error) {
        console.error(error);

        res.status(500).render("login", {
            error: error.message,
        });
    }
}

export function logout(req, res) {
    req.session.destroy(() => {
        res.redirect("/login");
    });
}

// Работа с отзывами
export async function createReview(req, res) {
    try {
        const { assignment_id, description } = req.body;

        const user_id = req.session.user.id;

        const check = await pool.query(
            `SELECT * FROM assignments WHERE id = $1 AND user_id = $2`,
            [assignment_id, user_id]
        );

        if (check.rows.length === 0) {
            return res.status(403).send("Нет доступа");
        }

        const assignment = check.rows[0];

        if (assignment.status !== "Обучение завершено") {
            return res
                .status(400)
                .send("Отзыв можно оставить только после завершения обучения");
        }

        const existing = await pool.query(
            `SELECT * FROM reviews WHERE assignment_id = $1`,
            [assignment_id]
        );

        if (existing.rows.length > 0) {
            return res.redirect("/profile");
        }

        await pool.query(
            `INSERT INTO reviews(assignment_id, description)
            VALUES ($1, $2)`,
            [assignment_id, description]
        );

        res.redirect("/profile");
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
}
