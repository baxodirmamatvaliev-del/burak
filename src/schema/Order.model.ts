import mongoose, { Schema } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enum";

const orderSchema = new Schema (
 {
    orderTotal: {       // Buyurtmaning umumiy summasi. Masalan: 3 ta ovqat oldi, jami 120000
        type: Number,
        required: true,
    },

    orderDelivery: {    // Yetkazib berish narxi. Masalan dostavka 15000
        type: Number,
        required: true,    
    },

    orderStatus: {     // Buyurtma hozir qaysi holatda ekanini bildiradi.PAUSE,PROCESS,FINISH,DELETE 
        type: String,
        enum: OrderStatus,
        default: OrderStatus.PAUSE,
    },

    memberId: {        // Bu buyurtmani qaysi user qilganini bildiradi. Ya’ni “bu zakaz kimniki?” degan joy.
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Member",
    }
 }, {timestamps: true, collection: "orders"} // Masalan product narxi o‘zgarsa, rasmi o‘zgarsa, statusi o‘zgarsa, updatedAt ham yangi vaqtga o‘zgaradi.
);

export default mongoose.model("Order",orderSchema)