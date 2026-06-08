import { pool } from "../db.js";

export async function getAllUsers(req, res) {
    try {
        const { rows } = await pool.query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        console.error('Ошибка БД: ', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' })
    }
}