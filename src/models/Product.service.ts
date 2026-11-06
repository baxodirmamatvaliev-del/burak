import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Error";
import { Product, ProductInput, ProductInquiry, ProductUpdateInput } from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { FilterQuery } from "mongoose";
import { ProductCollection, ProductStatus } from "../libs/enums/product.enum";

class ProductService {
    private readonly productModel;

    constructor() {
        this.productModel = ProductModel;
    }

    /*SPA */
    public async getProducts(input: ProductInquiry): Promise<Product[]> {
        const { page = "1", limit = "8", order = "createdAt", productCollection, search } = input;
        if (
            typeof page !== "string" || !/^\d+$/.test(page) ||
            typeof limit !== "string" || !/^\d+$/.test(limit) ||
            typeof order !== "string" || !["createdAt", "productViews", "productPrice"].includes(order) ||
            (productCollection !== undefined &&
                (typeof productCollection !== "string" || !Object.values(ProductCollection).includes(productCollection))) ||
            (search !== undefined && (typeof search !== "string" || search.length > 100))
        ) throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_PRODUCT_QUERY);

        const pageNumber = Number(page), limitNumber = Number(limit);
        if (
            !Number.isSafeInteger(pageNumber) || pageNumber < 1 || pageNumber > 1000000 ||
            limitNumber < 1 || limitNumber > 100
        ) throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_PRODUCT_QUERY);

        const query: FilterQuery<Product> = { productStatus: ProductStatus.PROCESS };
        if (productCollection) query.productCollection = productCollection;
        if (search) {
            query.productName = {
                $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                $options: "i",
            };
        }

        const result = await this.productModel.find(query)
            .sort({ [order]: order === "productPrice" ? 1 : -1, _id: 1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .exec();
        return result;
    }
    
    /*SSR */

        public async getAllProducts(): Promise<Product[]> {
        const result = await this.productModel.find().exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

      
        return result;
            
        
    }

    public async createNewProduct(input: ProductInput): Promise<Product> {
         try {
             return await this.productModel.create(input);
    } 
         catch (err) {
             console.log("Error, model:createNewProduct:", err);
      // Provide error details and a status code to Errors constructor
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATED_FAILED);
    }
    }


    public async updateChosenProduct(
        id: string,
        input: ProductUpdateInput): Promise<Product> {
        // string => ObjectId
        id = shapeIntoMongooseObjectId(id);                       // search query, qanday ozgartiramiz, qanday malumotni qaytarsin
        const result = await this.productModel.findOneAndUpdate({ _id: id }, input, { new: true }).exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

      
        return result;
            
        
    }

}

  

export default ProductService;
