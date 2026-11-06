import mongoose, { Schema } from "mongoose";
import { DentistWorkingInterval } from "../libs/types/dentist-schedule";

const localTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

// Hafta kunidagi ish oralig'ini Seul mahalliy vaqtida saqlash
const workingIntervalSchema = new Schema(
    {
        dayOfWeek: {
            type: Number,
            required: true,
            min: 0,
            max: 6,
            validate: { validator: Number.isInteger, message: "Weekday must be an integer from 0 to 6." },
        },
        startTime: {
            type: String,
            required: true,
            match: localTimePattern,
        },
        endTime: {
            type: String,
            required: true,
            match: localTimePattern,
            validate: {
                validator: function (this: DentistWorkingInterval, value: string) {
                    return value > this.startTime;
                },
                message: "Interval end must be after start on the same day.",
            },
        },
    },
    { _id: false }
);

// Stomatologning haftalik ish oraliqlari va yopiq sanalarini saqlash
const dentistScheduleSchema = new Schema(
    {
        dentistId: {
            type: Schema.Types.ObjectId,
            ref: "Dentist",
            required: true,
        },
        timezone: {
            type: String,
            enum: ["Asia/Seoul"],
            default: "Asia/Seoul",
            required: true,
        },
        weeklyIntervals: {
            type: [workingIntervalSchema],
            default: [],
            validate: {
                validator: function (intervals: DentistWorkingInterval[]) {
                    if (!Array.isArray(intervals)) {
                        return false;
                    }
                    for (let i = 0; i < intervals.length; i++) {
                        const current = intervals[i];
                        if (!current) {
                            return false;
                        }
                        for (let j = i + 1; j < intervals.length; j++) {
                            const other = intervals[j];
                            if (!other) {
                                return false;
                            }
                            if (current.dayOfWeek !== other.dayOfWeek) {
                                continue;
                            }
                            if (current.startTime < other.endTime && other.startTime < current.endTime) {
                                return false;
                            }
                        }
                    }
                    return true;
                },
                message: "Working intervals on the same weekday must not overlap.",
            },
        },
        closedDates: {
            type: [String],
            default: [],
            validate: {
                validator: function (dates: string[]) {
                    if (!Array.isArray(dates)) {
                        return false;
                    }
                    for (const date of dates) {
                        if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                            return false;
                        }
                        const parsed = new Date(date + "T00:00:00Z");
                        if (Number.isNaN(parsed.getTime())) {
                            return false;
                        }
                        if (parsed.toISOString().slice(0, 10) !== date) {
                            return false;
                        }
                    }
                    return true;
                },
                message: "Closed dates must be valid local dates in YYYY-MM-DD format.",
            },
        },
    },
    { timestamps: true }
);

export default mongoose.model("DentistSchedule", dentistScheduleSchema);
