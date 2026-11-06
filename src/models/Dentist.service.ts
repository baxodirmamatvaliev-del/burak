import { shapeIntMongooseObjectId } from "../libs/config";
import { DentistStatus } from "../libs/enums/dentist.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Dentist, DentistInput, DentistInquiry, DentistProfile } from "../libs/types/dentist";
import DentistModel from "../schema/Dentist.model";
import TreatmentModel from "../schema/Treatment.model";
import { isObjectIdOrHexString } from "mongoose";

const publicProfileFields = "_id dentistName dentistSpecialty dentistIntro dentistImage treatmentIds";

class DentistService {
    private readonly dentistModel;
    private readonly treatmentModel;

    // Stomatolog modeli bilan ishlashni sozlash
    constructor() {
        this.dentistModel = DentistModel;
        this.treatmentModel = TreatmentModel;
    }

    // Faol stomatologlarning ommaviy profillarini sahifalab olish
    public async getDentists(inquiry: DentistInquiry): Promise<DentistProfile[]> {
        if (!Number.isSafeInteger(inquiry.page) || inquiry.page < 1 || inquiry.page > 1000000) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_QUERY);
        }
        if (!Number.isSafeInteger(inquiry.limit) || inquiry.limit < 1 || inquiry.limit > 100) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_QUERY);
        }

        const result = await this.dentistModel
            .find({ dentistStatus: DentistStatus.ACTIVE })
            .select(publicProfileFields)
            .sort({ createdAt: -1, _id: 1 })
            .skip((inquiry.page - 1) * inquiry.limit)
            .limit(inquiry.limit)
            .lean<DentistProfile[]>()
            .exec();

        return result;
    }

    // Admin jadvali uchun barcha holatdagi stomatologlarni olish
    public async getAllDentists(): Promise<Dentist[]> {
        const result = await this.dentistModel.find().sort({ createdAt: -1, _id: 1 }).exec();
        return result;
    }

    // Ruxsat etilgan maydonlar va davolash havolalarini tekshirib, stomatolog yaratish
    public async createNewDentist(input: DentistInput): Promise<Dentist> {
        const allowedFields = [
            "dentistName", "dentistSpecialty", "dentistIntro", "dentistStatus", "dentistImage", "treatmentIds",
        ];
        if (!input || typeof input !== "object" || Array.isArray(input)) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_INPUT);
        }
        for (const field of Object.keys(input)) {
            if (!allowedFields.includes(field)) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_INPUT);
            }
        }
        for (const field of ["dentistName", "dentistSpecialty", "dentistIntro"] as const) {
            const value = input[field];
            if (typeof value !== "string" || !value.trim()) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_INPUT);
            }
            input[field] = value.trim();
        }
        if ("dentistStatus" in input) {
            const status = input.dentistStatus;
            if (status !== DentistStatus.ACTIVE && status !== DentistStatus.INACTIVE) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_INPUT);
            }
        }
        if ("dentistImage" in input) {
            const image = input.dentistImage;
            if (typeof image !== "string" || !/^uploads\/dentists\/[a-f0-9-]+\.(jpe?g|png)$/i.test(image)) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_IMAGE);
            }
        }

        const references = input.treatmentIds === undefined ? [] : input.treatmentIds;
        if (!Array.isArray(references)) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_TREATMENTS);
        }
        for (const id of references) {
            if (!isObjectIdOrHexString(id)) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_TREATMENTS);
            }
        }
        const treatmentIds = references.map(id => shapeIntMongooseObjectId(id));
        const uniqueIds = new Set(treatmentIds.map(id => id.toString()));
        if (uniqueIds.size !== treatmentIds.length) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_TREATMENTS);
        }
        if (treatmentIds.length) {
            const count = await this.treatmentModel.countDocuments({ _id: { $in: treatmentIds } }).exec();
            if (count !== treatmentIds.length) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_TREATMENTS);
            }
        }

        try {
            return await this.dentistModel.create({ ...input, treatmentIds });
        } catch (err) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    // ID ni tekshirib, faqat faol stomatologning ommaviy profilini olish
    public async getDentist(id: string): Promise<DentistProfile> {
        if (typeof id !== "string" || !/^[a-fA-F0-9]{24}$/.test(id)) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_ID);
        }

        const dentistId = shapeIntMongooseObjectId(id);
        const result = await this.dentistModel
            .findOne({ _id: dentistId, dentistStatus: DentistStatus.ACTIVE })
            .select(publicProfileFields)
            .lean<DentistProfile>()
            .exec();
        if (!result) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        }

        return result;
    }
}

export default DentistService;
