import { pool } from "../../database/db.js";

export async function getAllAssignments(req, res) {
    try {
        const { rows } = await pool.query("SELECT * FROM assignments");
        res.json(rows);
    } catch (error) {
        console.error("Ошибка БД: ", error.message);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
}

export async function getAssignmentById(req, res) {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            "SELECT * FROM assignments WHERE id = $1",
            [id]
        );

        if (rows.length !== 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({
                error: `Заявка с id=${id} не найдена`,
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
}
