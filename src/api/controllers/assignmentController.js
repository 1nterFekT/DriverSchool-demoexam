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

export async function renderHome(req, res) {
    try {
        const transportResult = await pool.query(
            "SELECT * FROM transport ORDER BY id"
        );

        const now = new Date();

        const currentDate = now.toISOString().slice(0, 16);

        const success = req.session.success;
        const error = req.session.error;

        req.session.success = null;
        req.session.error = null;

        res.render("home", {
            userId: req.session.user.id,
            transports: transportResult.rows,
            currentDate,
            success,
            error,
        });
    } catch (error) {
        console.error(error);

        res.status(500).send(error.message);
    }
}

export async function createAssignment(req, res) {
    try {
        const user_id = req.session.user.id;

        const { transport_id, start_date, payment_type } = req.body;

        const selectedDate = new Date(start_date);
        const now = new Date();

        if (selectedDate <= now) {
            return res.status(400).send("Дата должна быть в будущем");
        }

        await pool.query(
            `INSERT INTO assignments(
                user_id,
                transport_id,
                start_date,
                payment_type
            )
            VALUES ($1, $2, $3, $4)`,
            [user_id, transport_id, start_date, payment_type]
        );

        req.session.success = "Заявка успешно создана";
        res.redirect("/");
    } catch (error) {
        console.error(error);

        req.session.error = "Ошибка сервера";
        res.redirect("/");
    }
}
