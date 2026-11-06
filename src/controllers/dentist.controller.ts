import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { DentistInquiry } from "../libs/types/dentist";
import DentistService from "../models/Dentist.service";

const dentistService = new DentistService();
const dentistController: T = {};

// Sahifalash parametrlarini tekshirib, profillar ro'yxatini JSON shaklida qaytarish
dentistController.getDentists = async (req: Request, res: Response) => {
    try {
        console.log("getDentists");
        const { page = "1", limit = "8" } = req.query;
        if (typeof page !== "string" || !/^\d+$/.test(page)) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_QUERY);
        }
        if (typeof limit !== "string" || !/^\d+$/.test(limit)) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_QUERY);
        }

        const inquiry: DentistInquiry = {
            page: Number(page),
            limit: Number(limit),
        };
        const result = await dentistService.getDentists(inquiry);

        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("ERROR, getDentists:", err);
        if (err instanceof Errors) {
            res.status(err.code).json(err);
        } else {
            res.status(Errors.standart.code).json(Errors.standart);
        }
    }
};

// So'rovdagi ID bo'yicha stomatolog profilini JSON shaklida qaytarish
dentistController.getDentist = async (req: Request, res: Response) => {
    try {
        console.log("getDentist");
        const id = req.params.id as string;
        const result = await dentistService.getDentist(id);

        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("ERROR, getDentist:", err);
        if (err instanceof Errors) {
            res.status(err.code).json(err);
        } else {
            res.status(Errors.standart.code).json(Errors.standart);
        }
    }
};

export default dentistController;
