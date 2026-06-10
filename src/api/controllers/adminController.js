import "dotenv/config";

import { pool } from "../../database/db.js";

export function loginAdmin(req, res) {
    const { login, password } = req.body;

    if (
        login === process.env.ADMIN_LOGIN &&
        password === process.env.ADMIN_PASSWORD
    ) {
        req.session.admin = true;
        return res.redirect("/admin/dashboard");
    }

    res.render("admin-login", {
        error: "Неверный логин или пароль",
    });
}

export async function getDashboard(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                a.id,
                a.start_date,
                a.status,
                u.first_name,
                u.last_name,
                t.title AS transport_title
            FROM assignments a
            JOIN users u ON u.id = a.user_id
            JOIN transport t ON t.id = a.transport_id
            ORDER BY a.id DESC`
        );

        res.render("admin-dashboard", {
            assignments: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
}

export async function updateStatus(req, res) {
    try {
        const { assignment_id, status } = req.body;
        const allowedStatuses = [
            "Новая",
            "Идет обучение",
            "Обучение завершено",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.redirect("/admin/dashboard");
        }

        await pool.query(
            `UPDATE assignments
            SET status = $1
            WHERE id = $2`,
            [status, assignment_id]
        );

        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
}
