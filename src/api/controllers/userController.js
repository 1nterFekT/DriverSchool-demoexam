import { pool } from "../../database/db.js";

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
