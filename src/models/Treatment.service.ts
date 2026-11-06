import { shapeIntMongooseObjectId } from "../libs/config";
import { TreatmentStatus } from "../libs/enums/treatment.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Treatment, TreatmentInquiry } from "../libs/types/treatment";
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

    // ID ni tekshirib, bazadan faqat faol xizmatni topish
    public async getTreatment(id: string): Promise<Treatment> {
        if (typeof id !== "string" || !/^[a-fA-F0-9]{24}$/.test(id))
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_ID);

        const treatmentId = shapeIntMongooseObjectId(id);
        const result = await this.treatmentModel
            .findOne({ _id: treatmentId, treatmentStatus: TreatmentStatus.ACTIVE })
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result;
    }
}

export default TreatmentService;
