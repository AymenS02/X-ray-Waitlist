import { Request, Response } from "express";
import { io } from "../config/socket.js";
import Queue from "../models/Queue.js";

export const getQueue = async (req: Request, res: Response) => {
    try {

        const patients = await Queue.find()
            .sort({order: 1});


        const queueWithWaitingTime = patients.map(patient => ({
            ...patient.toObject(),
            waitingTime: (patient.order - 1) * 7 + 3
        }));


        res.json(queueWithWaitingTime);

    } catch {
        res.status(500).json({
            message:"Server Error"
        });
    }
};

export const addPatient = async (req: Request, res: Response) => {
    
    try {
        if (!req.body.name?.trim()) {
            return res.status(400).json({
                message: "Patient name is required",
            });
        } else if (!req.body.phone?.trim()) {
            return res.status(400).json({
                message: "Patient phone number is required",
            });
        }


        const cleanPhone = req.body.phone.replace(/\D/g, "");
        
        const lastPatient = await Queue.findOne().sort({ order: -1 });

        const nextOrder = lastPatient ? lastPatient.order + 1 : 1;

        const patient = await Queue.create({
            name: req.body.name,
            phone: cleanPhone,
            order: nextOrder,
        });

        io.emit("queueUpdated");

        res.status(201).json(patient);
    } catch {
        res.status(500).json({
            message: "Server Error",
        });
    }
};

export const removePatient = async (req: Request, res: Response) => {
    try {

        const patient = await Queue.findById(req.params.id);


        if (!patient) {
            return res.status(404).json({
                message: "Patient not found",
            });
        }


        const deletedOrder = patient.order;


        // Delete patient
        await Queue.findByIdAndDelete(req.params.id);



        // Move everyone after them up
        await Queue.updateMany(
            {
                order: { $gt: deletedOrder }
            },
            {
                $inc: { order: -1 }
            }
        );

        io.emit("queueUpdated");

        const updatedQueue = await Queue
            .find()
            .sort({ order: 1 });



        res.json(updatedQueue);


    } catch {

        res.status(500).json({
            message: "Server Error",
        });

    }
};

export const clearQueue = async (req: Request, res: Response) => {

    try {

        await Queue.deleteMany();

        io.emit("queueUpdated");

        res.json({

            message: "Queue Cleared"

        });

    }

    catch {

        res.status(500).json({

            message: "Server Error"

        });

    }

};

export const movePatientUp = async (req: Request, res: Response) => {
    try {
        const patient = await Queue.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found",
            });
        }

        if (patient.order === 1) {
            return res.json(patient);
        }

        const patientAbove = await Queue.findOne({
            order: patient.order - 1,
        });

        if (!patientAbove) {
            return res.json(patient);
        }

        const temp = patient.order;

        patient.order = patientAbove.order;
        patientAbove.order = temp;

        await patient.save();
        await patientAbove.save();

        io.emit("queueUpdated");

        res.json(patient);

    } catch (error) {

    res.status(500).json({
        message: "Server Error",
    });

}
};

export const movePatientDown = async (req: Request, res: Response) => {
    try {
        const patient = await Queue.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found",
            });
        }

        const patientBelow = await Queue.findOne({
            order: patient.order + 1,
        });

        if (!patientBelow) {
            return res.json(patient);
        }

        const temp = patient.order;

        patient.order = patientBelow.order;
        patientBelow.order = temp;

        await patient.save();
        await patientBelow.save();

        io.emit("queueUpdated");

        res.json(patient);

    } catch {
        res.status(500).json({
            message: "Server Error",
        });
    }
};

export const getStatus = async (req: Request, res: Response) => {

  try {
    const { phone } = req.params;

    console.log("Searching for patient with phone:", phone);

    const patient = await Queue.findOne({ phone });

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.json({
      ...patient.toObject(),
      waitingTime: (patient.order - 1) * 7 + 3,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};