import express, { response } from "express";
import { engine } from "express-handlebars";

import userRoutes from "./src/api/routes/userRouter.js";

export const app = express();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", import.meta.dirname + "/views");

app.use(express.json());

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/api", (req, res) => {
    res.json({
        status: "OK",
    });
});

app.listen(3000, () => {
    console.log(`App listening: http://localhost:3000/`);
    console.log(`API listening: http://localhost:3000/api/`);
});
