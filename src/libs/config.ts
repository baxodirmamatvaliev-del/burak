export const AUTH_TIMER = 24;
export const MORGAN_FORMAT = `:method :url :response-time [:status] \n`;

export const shapeIntoMongooseObjectId = (target: any) => {
    if (typeof target !== "string") return target;

    const mongoose = require("mongoose");
    return new mongoose.Types.ObjectId(target);
};
