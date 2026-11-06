import { NextFunction, Request, Response } from "express";
import { unlink } from "fs/promises";
import path from "path";
import { MulterError } from "multer";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { DentistInput, DentistInquiry, DentistUpdateInput } from "../libs/types/dentist";
import { AdminRequest } from "../libs/types/member";
import makeUploader from "../libs/utils/uploader";
import DentistService from "../models/Dentist.service";
import TreatmentService from "../models/Treatment.service";

const dentistService = new DentistService();
const treatmentService = new TreatmentService();
const dentistController: T = {};
const dentistUpload = makeUploader("dentists", {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const isJpeg = [".jpg", ".jpeg"].includes(extension) && file.mimetype === "image/jpeg";
        const isPng = extension === ".png" && file.mimetype === "image/png";
        if (!isJpeg && !isPng) {
            cb(new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_IMAGE));
            return;
        }
        cb(null, true);
    },
}).single("dentistImage");

// Xato so'rovda yuklangan yangi profil rasmini tozalash
async function removeDentistUpload(req: AdminRequest): Promise<void> {
    if (!req.file) {
        return;
    }
    try {
        await unlink(req.file.path);
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
            console.log("ERROR, removeDentistImage:", err);
        }
    }
}

// Ixtiyoriy profil rasmini mavjud uploader bilan xavfsiz qabul qilish
dentistController.uploadDentistImage = (req: AdminRequest, res: Response, next: NextFunction) => {
    dentistUpload(req, res, async err => {
        if (err) {
            if (err instanceof Errors || err instanceof MulterError) {
                res.status(HttpCode.BAD_REQUEST).json(new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_IMAGE));
            } else {
                res.status(Errors.standart.code).json(Errors.standart);
            }
            return;
        }
        req.body = req.body || {};
        if (Object.prototype.hasOwnProperty.call(req.body, "dentistImage")) {
            await removeDentistUpload(req);
            res.status(HttpCode.BAD_REQUEST).json(new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_INPUT));
            return;
        }
        if (req.file) {
            req.body.dentistImage = req.file.path.replace(/\\/g, "/");
        }
        if (typeof req.body.treatmentIds === "string") {
            req.body.treatmentIds = [req.body.treatmentIds];
        }
        next();
    });
};

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

// Stomatologlar ro'yxatini olib, admin jadvalini EJS orqali ko'rsatish
dentistController.getAllDentists = async (req: Request, res: Response) => {
    try {
        console.log("getAllDentists");
        const result = await dentistService.getAllDentists();
        res.render("dentists", { dentists: result });
    } catch (err) {
        console.log("ERROR, getAllDentists:", err);
        if (err instanceof Errors) {
            res.status(err.code).json(err);
        } else {
            res.status(Errors.standart.code).json(Errors.standart);
        }
    }
};

// Mavjud davolash xizmatlarini olib, stomatolog yaratish formasini ko'rsatish
dentistController.getCreateDentist = async (req: Request, res: Response) => {
    try {
        console.log("getCreateDentist");
        const treatments = await treatmentService.getAllTreatments();
        res.render("dentist-form", { dentist: {}, dentistId: null, treatments, message: null });
    } catch (err) {
        console.log("ERROR, getCreateDentist:", err);
        if (err instanceof Errors) {
            res.status(err.code).json(err);
        } else {
            res.status(Errors.standart.code).json(Errors.standart);
        }
    }
};

// Formadagi ma'lumot va yuklangan rasm bilan yangi stomatologni saqlash
dentistController.createNewDentist = async (req: AdminRequest, res: Response) => {
    try {
        console.log("createNewDentist");
        const input: DentistInput = req.body;
        await dentistService.createNewDentist(input);
        res.redirect(303, "/admin/dentist/all");
    } catch (err) {
        await removeDentistUpload(req);
        console.log("ERROR, createNewDentist:", err);
        const error = err instanceof Errors ? err : Errors.standart;
        try {
            const treatments = await treatmentService.getAllTreatments();
            res.status(error.code).render("dentist-form", { dentist: req.body, dentistId: null, treatments, message: error.message });
        } catch (formError) {
            console.log("ERROR, getCreateDentist:", formError);
            res.status(Errors.standart.code).json(Errors.standart);
        }
    }
};

// Tanlangan stomatolog ma'lumotlarini mavjud tahrirlash formasiga joylash
dentistController.getEditDentist = async (req: Request, res: Response) => {
    try {
        console.log("getEditDentist");
        const id = req.params.id as string;
        const result = await dentistService.getChosenDentist(id);
        const treatments = await treatmentService.getAllTreatments();
        const dentist = { ...result, treatmentIds: result.treatmentIds.map(value => value.toString()) };
        res.render("dentist-form", { dentist, dentistId: id, treatments, message: null });
    } catch (err) {
        console.log("ERROR, getEditDentist:", err);
        if (err instanceof Errors) {
            res.status(err.code).json(err);
        } else {
            res.status(Errors.standart.code).json(Errors.standart);
        }
    }
};

// Profil o'zgarishlarini saqlab, yangi rasm bo'lmasa avvalgisini saqlash
dentistController.updateChosenDentist = async (req: AdminRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        console.log("updateChosenDentist");
        const isForm = req.is("multipart/form-data") || req.is("application/x-www-form-urlencoded");
        if (isForm && req.body.treatmentIds === undefined) {
            req.body.treatmentIds = [];
        }
        const input: DentistUpdateInput = req.body;
        await dentistService.updateChosenDentist(id, input);
        res.redirect(303, "/admin/dentist/all");
    } catch (err) {
        await removeDentistUpload(req);
        console.log("ERROR, updateChosenDentist:", err);
        const error = err instanceof Errors ? err : Errors.standart;
        try {
            const treatments = await treatmentService.getAllTreatments();
            res.status(error.code).render("dentist-form", { dentist: req.body, dentistId: id, treatments, message: error.message });
        } catch (formError) {
            console.log("ERROR, getEditDentist:", formError);
            res.status(Errors.standart.code).json(Errors.standart);
        }
    }
};

export default dentistController;
