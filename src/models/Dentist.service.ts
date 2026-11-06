import { shapeIntMongooseObjectId } from "../libs/config";
import { DentistStatus } from "../libs/enums/dentist.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Dentist, DentistInquiry, DentistProfile } from "../libs/types/dentist";
import DentistModel from "../schema/Dentist.model";

const publicProfileFields = "_id dentistName dentistSpecialty dentistIntro dentistImage treatmentIds";

class DentistService {
    private readonly dentistModel;

    // Stomatolog modeli bilan ishlashni sozlash
    constructor() {
        this.dentistModel = DentistModel;
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
