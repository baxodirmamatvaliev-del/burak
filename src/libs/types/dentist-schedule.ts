import { ObjectId } from "mongoose";

export interface DentistWorkingInterval {
    dayOfWeek: number; // 0 — yakshanba, 6 — shanba
    startTime: string;
    endTime: string;
}

export interface DentistSchedule {
    _id: ObjectId;
    dentistId: ObjectId;
    timezone: "Asia/Seoul";
    weeklyIntervals: DentistWorkingInterval[];
    closedDates: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface DentistScheduleInput {
    dentistId: ObjectId;
    timezone?: "Asia/Seoul";
    weeklyIntervals?: DentistWorkingInterval[];
    closedDates?: string[];
}

export interface DentistScheduleUpdateInput {
    dentistId?: ObjectId;
    timezone?: "Asia/Seoul";
    weeklyIntervals?: DentistWorkingInterval[];
    closedDates?: string[];
}
