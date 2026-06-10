import "dotenv/config";

import express from "express";
import session from "express-session";
import { engine } from "express-handlebars";

import userRoutes from "./src/api/routes/userRouter.js";
import assignmentRoutes from "./src/api/routes/assignmentRouter.js";
import adminRoutes from "./src/api/routes/adminRouter.js";

export const app = express();

app.engine(
    "handlebars",
    engine({
        partialsDir: "src/views/partials",
        helpers: {
            formatDate(date) {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                const hours = String(d.getHours()).padStart(2, "0");
                const minutes = String(d.getMinutes()).padStart(2, "0")
                
                return `${day}.${month}.${year} ${hours}:${minutes}`
            }
        }
    })
);
app.set("view engine", "handlebars");
app.set("views", "src/views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET || "",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
);

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.admin = req.session.admin || null;
    next();
});

app.use(userRoutes);
app.use(assignmentRoutes);
app.use("/admin", adminRoutes);

app.get("/api", (req, res) => {
    res.json({
        status: "OK",
    });
});

app.listen(3000, () => {
    console.log(`App listening: http://localhost:3000/`);
    console.log(`API listening: http://localhost:3000/api/`);
});
