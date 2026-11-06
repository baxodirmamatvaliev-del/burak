import { NextFunction, Request, Response } from "express";
import { unlink } from "fs/promises";
import path from "path";
import { MulterError } from "multer";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { DentistInput, DentistInquiry } from "../libs/types/dentist";
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

// Ixtiyoriy profil rasmini mavjud uploader bilan xavfsiz qabul qilish
dentistController.uploadDentistImage = (req: Request, res: Response, next: NextFunction) => {
    dentistUpload(req, res, err => {
        if (err) {
            if (err instanceof Errors || err instanceof MulterError) {
                res.status(HttpCode.BAD_REQUEST).json(new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_IMAGE));
            } else {
                res.status(Errors.standart.code).json(Errors.standart);
            }
            return;
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
        res.render("dentist-form", { dentist: {}, treatments, message: null });
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
    req.body = req.body || {};
    try {
        console.log("createNewDentist");
        if (Object.prototype.hasOwnProperty.call(req.body, "dentistImage")) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_DENTIST_INPUT);
        }
        if (req.file) {
            req.body.dentistImage = req.file.path.replace(/\\/g, "/");
        }
        if (typeof req.body.treatmentIds === "string") {
            req.body.treatmentIds = [req.body.treatmentIds];
        }
        const input: DentistInput = req.body;
        await dentistService.createNewDentist(input);
        res.redirect(303, "/admin/dentist/all");
    } catch (err) {
        if (req.file) {
            try {
                await unlink(req.file.path);
            } catch (fileError) {
                if ((fileError as NodeJS.ErrnoException).code !== "ENOENT") {
                    console.log("ERROR, removeDentistImage:", fileError);
                }
            }
        }
        console.log("ERROR, createNewDentist:", err);
        const error = err instanceof Errors ? err : Errors.standart;
        try {
            const treatments = await treatmentService.getAllTreatments();
            res.status(error.code).render("dentist-form", { dentist: req.body, treatments, message: error.message });
        } catch (formError) {
            console.log("ERROR, getCreateDentist:", formError);
            res.status(Errors.standart.code).json(Errors.standart);
        }
    }
};

export default dentistController;
