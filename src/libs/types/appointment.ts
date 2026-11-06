import { ObjectId } from "mongoose";
import { AppointmentStatus } from "../enums/appointment.enum";

export interface Appointment {
    _id: ObjectId;
    patientId: ObjectId;
    dentistId: ObjectId;
    treatmentId: ObjectId;
    appointmentStart: Date;
    appointmentEnd: Date;
    appointmentStatus: AppointmentStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface AppointmentInput {
    patientId: ObjectId;
    dentistId: ObjectId;
    treatmentId: ObjectId;
    appointmentStart: Date;
    appointmentEnd: Date;
    appointmentStatus?: AppointmentStatus;
}

export interface AppointmentUpdateInput {
    patientId?: ObjectId;
    dentistId?: ObjectId;
    treatmentId?: ObjectId;
    appointmentStart?: Date;
    appointmentEnd?: Date;
    appointmentStatus?: AppointmentStatus;
}
