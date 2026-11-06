import { shapeIntMongooseObjectId } from "../libs/config";
import { TreatmentStatus } from "../libs/enums/treatment.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Treatment, TreatmentInput, TreatmentInquiry, TreatmentUpdateInput } from "../libs/types/treatment";
import { T } from "../libs/types/common";
import TreatmentModel from "../schema/Treatment.model";

class TreatmentService {
    private readonly treatmentModel;

    // Davolash modeli bilan ishlashni sozlash
    constructor() {
        this.treatmentModel = TreatmentModel;
    }

    // Sahifalash chegaralarini tekshirib, faol xizmatlarni bazadan olish
    public async getTreatments(inquiry: TreatmentInquiry): Promise<Treatment[]> {
        if (
            !Number.isSafeInteger(inquiry.page) || inquiry.page < 1 || inquiry.page > 1000000 ||
            !Number.isSafeInteger(inquiry.limit) || inquiry.limit < 1 || inquiry.limit > 100
        ) throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_QUERY);

        const result = await this.treatmentModel
            .find({ treatmentStatus: TreatmentStatus.ACTIVE })
            .sort({ createdAt: -1, _id: 1 })
            .skip((inquiry.page - 1) * inquiry.limit)
            .limit(inquiry.limit)
            .exec();

        return result;
    }

    // Ommaviy so'rovga faol xizmatni, admin uchun esa istalgan holatdagi xizmatni olish
    public async getTreatment(id: string, includeInactive = false): Promise<Treatment> {
        const treatmentId = this.getTreatmentId(id);
        const query: T = { _id: treatmentId };
        if (!includeInactive) {
            query.treatmentStatus = TreatmentStatus.ACTIVE;
        }
        const result = await this.treatmentModel
            .findOne(query)
            .exec();
        if (!result) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        }

        return result;
    }

    // Admin ro'yxati uchun barcha holatdagi xizmatlarni bazadan olish
    public async getAllTreatments(): Promise<Treatment[]> {
        const result = await this.treatmentModel.find().sort({ createdAt: -1, _id: 1 }).exec();
        return result;
    }

    // Tekshirilgan maydonlar bilan yangi davolash xizmatini yaratish
    public async createNewTreatment(input: TreatmentInput): Promise<Treatment> {
        this.validateTreatmentInput(input);
        try {
            return await this.treatmentModel.create(input);
        } catch (err) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    // Ruxsat etilgan maydonlarni sxema tekshiruvi bilan yangilash
    public async updateChosenTreatment(id: string, input: TreatmentUpdateInput): Promise<Treatment> {
        const treatmentId = this.getTreatmentId(id);
        this.validateTreatmentInput(input, true);
        const result = await this.treatmentModel.findOneAndUpdate(
            { _id: treatmentId },
            { $set: input },
            { new: true, runValidators: true },
        ).exec();
        if (!result) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        }
        return result;
    }

    // ID shaklini tekshirib, MongoDB identifikatoriga aylantirish
    private getTreatmentId(id: string) {
        if (typeof id !== "string" || !/^[a-fA-F0-9]{24}$/.test(id)) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_ID);
        }
        return shapeIntMongooseObjectId(id);
    }

    // Yaratish va tahrirlash uchun umumiy maydon hamda davomiylik tekshiruvini bajarish
    private validateTreatmentInput(input: TreatmentInput | TreatmentUpdateInput, isUpdate = false): void {
        const allowedFields = [
            "treatmentName", "treatmentDesc", "treatmentStatus", "treatmentDuration", "treatmentImages",
        ];
        if (!input || typeof input !== "object" || Array.isArray(input)) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_INPUT);
        }
        const fields = Object.keys(input);
        if (!fields.length) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_INPUT);
        }
        for (const field of fields) {
            if (!allowedFields.includes(field)) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_INPUT);
            }
        }

        for (const field of ["treatmentName", "treatmentDesc"] as const) {
            if (!isUpdate || field in input) {
                const value = input[field];
                if (typeof value !== "string" || !value.trim()) {
                    throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_INPUT);
                }
                input[field] = value.trim();
            }
        }
        if (!isUpdate || "treatmentDuration" in input) {
            let duration = input.treatmentDuration;
            if (typeof duration === "string") {
                duration = Number(duration);
            }
            if (typeof duration !== "number" || !Number.isInteger(duration) || duration <= 0) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_INPUT);
            }
            input.treatmentDuration = duration;
        }
        if ("treatmentStatus" in input) {
            const status = input.treatmentStatus;
            if (status !== TreatmentStatus.ACTIVE && status !== TreatmentStatus.INACTIVE) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_INPUT);
            }
        }
        if ("treatmentImages" in input) {
            const images = input.treatmentImages;
            if (!Array.isArray(images) || images.length > 5) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_INPUT);
            }
            const imagePathPattern = /^uploads\/treatments\/[a-f0-9-]+\.(jpe?g|png)$/i;
            for (const image of images) {
                if (typeof image !== "string" || !imagePathPattern.test(image)) {
                    throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_INPUT);
                }
            }
        }
    }
}

export default TreatmentService;
