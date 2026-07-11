import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import { ExtendedRequest } from "../libs/types/member";
import { Response } from "express";
import OrderService from "../models/Order.service";
import { OrderInquiry, OrderUpdateInput } from "../libs/types/order";
import { OrderStatus } from "../libs/enums/order.enum";
import console from "node:console";

const orderService = new OrderService();

const orderController: T = {};

orderController.createOrder = async (req: ExtendedRequest , res: Response) => {
    try {
     console.log("createOrder");
    const result = await orderService.createOrder(req.member, req.body);

    res.status(HttpCode.OK).json(result)
    } catch(err){
 console.log("ERROR, createOrder:", err)
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};

orderController.getMyOrders = async (req: ExtendedRequest , res: Response) => {
    try {
     console.log("getMyOrders");
     const {page, limit, orderStatus} = req.query;
     console.log("req.query:", req.query);
    const inquiry: OrderInquiry = {       // Stringni number ga otkazyapmiz malumotlar stringda kelgani uchun:
        page: Number(page),
        limit: Number(limit),
        orderStatus: orderStatus as OrderStatus
    };
    console.log("inquiry:", inquiry);
    const result = await orderService.getMyOrders(req.member, inquiry);

    res.status(HttpCode.OK).json(result);
    } catch(err){
        console.log("ERROR, getMyOrders:", err)
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};


orderController.updateOrder = async (req: ExtendedRequest , res: Response) => {
    try {
     console.log("updateOrder");
     const input: OrderUpdateInput = req.body;
     const result = await orderController.updateOrder(req.member, input);

    res.status(HttpCode.OK).json(result)
    } catch(err){
 console.log("ERROR, updateOrder:", err)
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};



export default orderController;