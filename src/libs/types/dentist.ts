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

export interface DentistInquiry {
    page: number;
    limit: number;
}

export type DentistProfile = Pick<Dentist,
    "_id" | "dentistName" | 
    "dentistSpecialty" | 
    "dentistIntro" |
     "dentistImage" | 
     "treatmentIds"
>;

export interface DentistUpdateInput {
    dentistStatus?: DentistStatus;
    dentistName?: string;
    dentistSpecialty?: string;
    dentistIntro?: string;
    dentistImage?: string;
    treatmentIds?: ObjectId[];
}
