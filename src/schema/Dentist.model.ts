import mongoose, { Schema } from "mongoose";
import { DentistStatus } from "../libs/enums/dentist.enum";

// Stomatolog profili va unga bog'langan davolash xizmatlarini saqlash
const dentistSchema = new Schema(
    {
        dentistStatus: {
            type: String,
            enum: DentistStatus,
            default: DentistStatus.ACTIVE,
        },

        dentistName: {
            type: String,
            required: true,
        },

        dentistSpecialty: {
            type: String,
            required: true,
        },

        dentistIntro: {
            type: String,
            required: true,
        },

        dentistImage: {
            type: String,
        },

        treatmentIds: {
            type: [{ type: Schema.Types.ObjectId, ref: "Treatment" }],
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.model("Dentist", dentistSchema);
