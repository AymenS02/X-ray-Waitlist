import express from "express";

import {

    getQueue,

    addPatient,

    removePatient,

    clearQueue,

    movePatientUp,

    movePatientDown,

    getStatus
    
} from "../controllers/queueController.js";

const router = express.Router();

router.get("/", getQueue);

router.post("/", addPatient);

router.delete("/:id", removePatient);

router.delete("/", clearQueue);

router.patch("/:id/up", movePatientUp);

router.patch("/:id/down", movePatientDown);

router.get("/status/:phone", getStatus);

export default router;