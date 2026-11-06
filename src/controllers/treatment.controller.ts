import { NextFunction, Request, Response } from "express";
import { unlink } from "fs/promises";
import path from "path";
import { MulterError } from "multer";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { TreatmentInquiry } from "../libs/types/treatment";
import { AdminRequest } from "../libs/types/member";
import makeUploader from "../libs/utils/uploader";
import TreatmentService from "../models/Treatment.service";

const treatmentService = new TreatmentService();
const treatmentController: T = {};
const treatmentUpload = makeUploader("treatments", {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const isJpeg = [".jpg", ".jpeg"].includes(extension) && file.mimetype === "image/jpeg";
        const isPng = extension === ".png" && file.mimetype === "image/png";
        if (!isJpeg && !isPng) {
            cb(new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_IMAGE));
            return;
        }
        cb(null, true);
    },
}).array("treatmentImages", 5);

// Xato so'rov bilan yuklangan yangi fayllarni tozalash
async function removeTreatmentUploads(req: AdminRequest): Promise<void> {
    for (const file of req.files || []) {
        try {
            await unlink(file.path);
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
                console.log("ERROR, removeTreatmentUploads:", err);
            }
        }
    }
}

// Xavfsiz yuklangan rasm yo'llarini formaga qo'shib, keyingi controllerga o'tkazish
treatmentController.uploadTreatmentImages = (req: AdminRequest, res: Response, next: NextFunction) => {
    treatmentUpload(req, res, async err => {
        if (err) {
            if (err instanceof Errors || err instanceof MulterError) {
                res.status(HttpCode.BAD_REQUEST).json(new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_IMAGE));
            } else {
                res.status(Errors.standart.code).json(Errors.standart);
            }
            return;
        }
        req.body = req.body || {};
        if (Object.prototype.hasOwnProperty.call(req.body, "treatmentImages")) {
            await removeTreatmentUploads(req);
            res.status(HttpCode.BAD_REQUEST).json(new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TREATMENT_INPUT));
            return;
        }
        if (req.files?.length) {
            req.body.treatmentImages = req.files.map(file => file.path.replace(/\\/g, "/"));
        }
        next();
    });
};

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

// Barcha xizmatlarni olib, admin jadvalini EJS orqali ko'rsatish
treatmentController.getAllTreatments = async (req: Request, res: Response) => {
    try {
        console.log("getAllTreatments");
        const result = await treatmentService.getAllTreatments();
        res.render("treatments", { treatments: result });
    } catch (err) {
        console.log("ERROR, getAllTreatments:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};

// Yangi xizmat uchun bo'sh yaratish formasini ko'rsatish
treatmentController.getCreateTreatment = (req: Request, res: Response) => {
    console.log("getCreateTreatment");
    res.render("treatment-form", { treatment: {}, treatmentId: null, message: null });
};

// Tanlangan xizmatni holatidan qat'i nazar tahrirlash formasiga joylash
treatmentController.getEditTreatment = async (req: Request, res: Response) => {
    try {
        console.log("getEditTreatment");
        const id = req.params.id as string;
        const result = await treatmentService.getTreatment(id, true);
        res.render("treatment-form", { treatment: result, treatmentId: id, message: null });
    } catch (err) {
        console.log("ERROR, getEditTreatment:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};

// Formadan xizmat yaratib, muvaffaqiyatli so'rovni ro'yxatga qaytarish
treatmentController.createNewTreatment = async (req: AdminRequest, res: Response) => {
    try {
        console.log("createNewTreatment");
        await treatmentService.createNewTreatment(req.body);
        res.redirect(303, "/admin/treatment/all");
    } catch (err) {
        await removeTreatmentUploads(req);
        console.log("ERROR, createNewTreatment:", err);
        const error = err instanceof Errors ? err : Errors.standart;
        res.status(error.code).render("treatment-form", {
            treatment: { ...req.body, treatmentImages: [] }, treatmentId: null,
            message: error.message,
        });
    }
};

// Forma o'zgarishlarini saqlab, adminni xizmatlar ro'yxatiga qaytarish
treatmentController.updateChosenTreatment = async (req: AdminRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        console.log("updateChosenTreatment");
        await treatmentService.updateChosenTreatment(id, req.body);
        res.redirect(303, "/admin/treatment/all");
    } catch (err) {
        await removeTreatmentUploads(req);
        console.log("ERROR, updateChosenTreatment:", err);
        const error = err instanceof Errors ? err : Errors.standart;
        res.status(error.code).render("treatment-form", {
            treatment: { ...req.body, treatmentImages: [] }, treatmentId: id,
            message: error.message,
        });
    }
};

export default treatmentController;
