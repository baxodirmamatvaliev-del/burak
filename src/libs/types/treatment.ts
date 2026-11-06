import { ObjectId } from "mongoose";
import { TreatmentStatus } from "../enums/treatment.enum";

export interface Treatment {
    _id: ObjectId;
    treatmentStatus: TreatmentStatus;
    treatmentName: string; // Korean treatment name
    treatmentDesc: string;
    treatmentImages: string[];
    treatmentDuration: number; // Duration in minutes
    createdAt: Date;
    updatedAt: Date;
}

export interface TreatmentInput {
    treatmentStatus?: TreatmentStatus;
    treatmentName: string;
    treatmentDesc: string;
    treatmentImages?: string[];
    treatmentDuration: number;
}

export interface TreatmentInquiry {
    page: number;
    limit: number;
}

export interface TreatmentUpdateInput {
    treatmentStatus?: TreatmentStatus;
    treatmentName?: string;
    treatmentDesc?: string;
    treatmentImages?: string[];
    treatmentDuration?: number;
}
