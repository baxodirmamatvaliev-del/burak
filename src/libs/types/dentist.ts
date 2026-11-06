import { ObjectId } from "mongoose";
import { DentistStatus } from "../enums/dentist.enum";

export interface Dentist {
    _id: ObjectId;
    dentistStatus: DentistStatus;
    dentistName: string;
    dentistSpecialty: string;
    dentistIntro: string;
    dentistImage?: string;
    treatmentIds: ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface DentistInput {
    dentistStatus?: DentistStatus;
    dentistName: string;
    dentistSpecialty: string;
    dentistIntro: string;
    dentistImage?: string;
    treatmentIds?: ObjectId[];
}

export interface DentistUpdateInput {
    dentistStatus?: DentistStatus;
    dentistName?: string;
    dentistSpecialty?: string;
    dentistIntro?: string;
    dentistImage?: string;
    treatmentIds?: ObjectId[];
}
