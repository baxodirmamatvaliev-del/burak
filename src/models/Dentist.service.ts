import { shapeIntMongooseObjectId } from "../libs/config";
import { DentistStatus } from "../libs/enums/dentist.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Dentist, DentistInput, DentistInquiry, DentistProfile, DentistUpdateInput } from "../libs/types/dentist";
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
        const data = await this.validateDentistInput(input);
        try {
            return await this.dentistModel.create(data);
        } catch (err) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    // Admin tahriri uchun stomatologni holatidan qat'i nazar olish
    public async getChosenDentist(id: string): Promise<Dentist> {
        const dentistId = this.getDentistId(id);
        const result = await this.dentistModel.findById(dentistId).lean<Dentist>().exec();
        if (!result) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        }
        return result;
    }

    // Tekshirilgan o'zgarishlarni saqlab, yuborilmagan rasmni o'z holida qoldirish
    public async updateChosenDentist(id: string, input: DentistUpdateInput): Promise<Dentist> {
        const dentistId = this.getDentistId(id);
        const data = await this.validateDentistInput(input);
        const result = await this.dentistModel.findOneAndUpdate(
            { _id: dentistId },
            { $set: data },
            { new: true, runValidators: true },
        ).exec();
        if (!result) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        }
        return result;
    }

    // ID ni tekshirib, faqat faol stomatologning ommaviy profilini olish
    public async getDentist(id: string): Promise<DentistProfile> {
        const dentistId = this.getDentistId(id);
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

    // Stomatolog ID sini tekshirib, MongoDB identifikatoriga aylantirish
    private getDentistId(id: string) {
        if (typeof id !== "string" || !/^[a-fA-F0-9]{24}$/.test(id)) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_ID);
        }
        return shapeIntMongooseObjectId(id);
    }

    // Yaratish va tahrirlashdagi maydonlar hamda davolash havolalarini bir joyda tekshirish
    private async validateDentistInput(input: DentistInput | DentistUpdateInput): Promise<DentistUpdateInput> {
        const allowedFields = [
            "dentistName", "dentistSpecialty", "dentistIntro", "dentistStatus", "dentistImage", "treatmentIds",
        ];
        if (!input || typeof input !== "object" || Array.isArray(input)) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_INPUT);
        }
        if (!Object.keys(input).length) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_INPUT);
        }
        for (const field of Object.keys(input)) {
            if (!allowedFields.includes(field)) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_INPUT);
            }
        }
        const data: DentistUpdateInput = { ...input };
        for (const field of ["dentistName", "dentistSpecialty", "dentistIntro"] as const) {
            if (field in input) {
                const value = input[field];
                if (typeof value !== "string" || !value.trim()) {
                    throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_INPUT);
                }
                data[field] = value.trim();
            }
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

        if (!("treatmentIds" in input)) {
            return data;
        }
        const references = input.treatmentIds;
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

        data.treatmentIds = treatmentIds;
        return data;
    }
}

export default DentistService;
