import { isObjectIdOrHexString } from "mongoose";
import { shapeIntMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Appointment, AppointmentInquiry } from "../libs/types/appointment";
import { Member } from "../libs/types/member";
import AppointmentModel from "../schema/Appointment.model";

class AppointmentService {
    private readonly appointmentModel;

    // Qabul modeli bilan ishlashni sozlash
    constructor() {
        this.appointmentModel = AppointmentModel;
    }

    // Faqat autentifikatsiyadan o'tgan a'zoning qabullarini sahifalab olish
    public async getMyAppointments(member: Member, inquiry: AppointmentInquiry): Promise<Appointment[]> {
        if (!isObjectIdOrHexString(member?._id)) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
        }
        if (!Number.isSafeInteger(inquiry.page) || inquiry.page < 1 || inquiry.page > 1000000) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_APPOINTMENT_QUERY);
        }
        if (!Number.isSafeInteger(inquiry.limit) || inquiry.limit < 1 || inquiry.limit > 100) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_APPOINTMENT_QUERY);
        }

        const patientId = shapeIntMongooseObjectId(member._id);
        const result = await this.appointmentModel
            .find({ patientId })
            .sort({ createdAt: -1, _id: 1 })
            .skip((inquiry.page - 1) * inquiry.limit)
            .limit(inquiry.limit)
            .exec();

        return result;
    }
}

export default AppointmentService;
