import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { TreatmentInquiry } from "../libs/types/treatment";
import TreatmentService from "../models/Treatment.service";

const treatmentService = new TreatmentService();
const treatmentController: T = {};

// Sahifalash parametrlarini tekshirib, ro'yxatni JSON shaklida qaytarish
treatmentController.getTreatments = async (req: Request, res: Response) => {
    try {
        console.log("getTreatments");
        const { page = "1", limit = "8" } = req.query;
        if (
            typeof page !== "string" || !/^\d+$/.test(page) ||
            typeof limit !== "string" || !/^\d+$/.test(limit)
        ) throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_QUERY);

        const inquiry: TreatmentInquiry = {
            page: Number(page),
            limit: Number(limit),
        };
        const result = await treatmentService.getTreatments(inquiry);

        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("ERROR, getTreatments:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};

// So'rovdagi ID bo'yicha xizmat tafsilotlarini JSON shaklida qaytarish
treatmentController.getTreatment = async (req: Request, res: Response) => {
    try {
        console.log("getTreatment");
        const id = req.params.id as string;
        const result = await treatmentService.getTreatment(id);

        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("ERROR, getTreatment:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};

export default treatmentController;
