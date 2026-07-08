import Errors, { HttpCode, Message } from "../libs/Errors";
import { Product, ProductInput, ProductInquiry, ProductUpdateInput } from "../libs/types/product";
import { shapeIntMongooseObjectId } from "../libs/config";
import ProductModel from "../schema/Product.model";
import { T } from "../libs/types/common";
import { ProductStatus } from "../libs/enums/product.enum";
import { ObjectId } from "mongoose";


class ProductService {
    private readonly productModel;

    constructor() {
        this.productModel = ProductModel;
    }
    /* SPA */


   public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    console.log("inquiry:", inquiry);
    const match: T = {ProductStatus: ProductStatus.PROCESS}

    if(inquiry.productCollection) 
        match.productCollection = inquiry.productCollection;
    if(inquiry.search) {
        match.productName = {$regex: new RegExp(inquiry.search,"i")}
    }

    const sort: T = 
    inquiry.order === 
    "productPrice" ?     // narxi eng arzon bolgan narxdan yuqori bolgan productni olib ber degani!
     {[inquiry.order]: 1} :  // [] <--- stringni key ga aylantirib berar ekan.
     {[inquiry.order]: -1};

     const result = await this.productModel.aggregate([
        { $match: match }, // PROCESS da bolgan productni topib ber!
        { $sort: sort },
        { $skip: (inquiry.page*1 -1)*inquiry.limit },  // nechtadir malumotni otkazish. (0)
        { $limit: inquiry.limit *1 },                  // limit 3 ta malumotni olib ber
     ]).exec();

     if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
   }

   public async getProduct(memberId: ObjectId | null, id: string ): Promise<Product> {
     const productId = shapeIntMongooseObjectId(id);

     let result = await this.productModel.findOne
     ({_id: productId, productStatus: ProductStatus.PROCESS})
     .exec();

     if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

     //TODO: if authenticated users => first => view log creation 

     return result;
   }


    /* SSR */

    public async getAllProducts(): Promise<Product[]> {

        const result = await this.productModel.find().exec()
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND)

        return result;
    }




    public async createNewProduct(input: ProductInput): Promise<Product> {
        try {
            return await this.productModel.create(input)
        } catch (err) {
            console.error("Error, model: createNewProduct", err)
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }

    }


    public async updateChosenProduct(id: string, input: ProductUpdateInput): Promise<Product> {
        // string ==> onjectID
        id = shapeIntMongooseObjectId(id);
        const result = await this.productModel.findOneAndUpdate({ _id: id }, input, { new: true }).exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.UPDATE_FAILED);

        console.log("RESULT", result)
        return result;
    }

}



export default ProductService;

function getProduct() {
    throw new Error("Function not implemented.");
}

