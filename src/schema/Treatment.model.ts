import mongoose, { Schema } from "mongoose";
import { TreatmentStatus } from "../libs/enums/treatment.enum";

const treatmentSchema = new Schema(
    {
        treatmentStatus: {
            type: String,
            enum: TreatmentStatus,
            default: TreatmentStatus.ACTIVE,
        },

        treatmentName: {
            type: String,
            required: true,
        },

        treatmentDesc: {
            type: String,
            required: true,
        },

        treatmentImages: {
            type: [String],
            default: [],
        },

        treatmentDuration: {
            type: Number,
            required: true,
            validate: {
                validator: (value: number) => Number.isInteger(value) && value > 0,
                message: "Treatment duration must be a positive integer in minutes.",
            },
        },
    },
    { timestamps: true }
);

export default mongoose.model("Treatment", treatmentSchema);
