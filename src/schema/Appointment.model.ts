import mongoose, { Schema } from "mongoose";
import { AppointmentStatus } from "../libs/enums/appointment.enum";
import { Appointment } from "../libs/types/appointment";

// Qabul ishtirokchilari, UTC vaqtlari va holatini saqlash
const appointmentSchema = new Schema(
    {
        patientId: {
            type: Schema.Types.ObjectId,
            ref: "Member",
            required: true,
        },

        dentistId: {
            type: Schema.Types.ObjectId,
            ref: "Dentist",
            required: true,
        },

        treatmentId: {
            type: Schema.Types.ObjectId,
            ref: "Treatment",
            required: true,
        },

        appointmentStart: {
            type: Date,
            required: true,
        },

        appointmentEnd: {
            type: Date,
            required: true,
            validate: {
                validator: function (this: Appointment, value: Date) {
                    if (!(this.appointmentStart instanceof Date) || !(value instanceof Date)) {
                        return false;
                    }
                    return value.getTime() > this.appointmentStart.getTime();
                },
                message: "Appointment end must be after start.",
            },
        },

        appointmentStatus: {
            type: String,
            enum: AppointmentStatus,
            default: AppointmentStatus.PENDING,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
