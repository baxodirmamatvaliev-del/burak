import { Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { AppointmentInquiry } from "../libs/types/appointment";
import { ExtendedRequest } from "../libs/types/member";
import AppointmentService from "../models/Appointment.service";

const appointmentService = new AppointmentService();
const appointmentController: T = {};

// Sahifalashni tekshirib, tizimdagi a'zoning qabullarini JSON shaklida qaytarish
appointmentController.getMyAppointments = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log("getMyAppointments");
        const { page = "1", limit = "8" } = req.query;
        if (typeof page !== "string" || !/^\d+$/.test(page)) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_APPOINTMENT_QUERY);
        }
        if (typeof limit !== "string" || !/^\d+$/.test(limit)) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_APPOINTMENT_QUERY);
        }

        const inquiry: AppointmentInquiry = {
            page: Number(page),
            limit: Number(limit),
        };
        const result = await appointmentService.getMyAppointments(req.member, inquiry);

        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("ERROR, getMyAppointments:", err);
        if (err instanceof Errors) {
            res.status(err.code).json(err);
        } else {
            res.status(Errors.standart.code).json(Errors.standart);
        }
    }
};

export default appointmentController;
