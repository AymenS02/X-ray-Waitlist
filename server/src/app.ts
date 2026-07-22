import express from "express";
import cors from "cors";

import queueRoutes from "./routes/queueRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("X-Ray Waitlist API");
});

app.use("/api/queue", queueRoutes);

export default app;