import { ObjectId } from "mongoose";

import { ProductCollection, ProductSize, ProductStatus } from "../enums/product.enum";

export interface ProductInquiry {
    page?: string;
    limit?: string;
    order?: string;
    productCollection?: ProductCollection;
    search?: string;
}

export interface Product {
    _id: ObjectId;
    productStatus: ProductStatus;
    productCollection: ProductCollection;
    productName: string;
    productPrice: number;
    productLeftCount: number;
    productSize: ProductSize;
    productVolume: number;
    productDesc?: string;
    productImages: string[];
    productViews: number;


}



export interface ProductInput {
    productStatus?: ProductStatus;
    productCollection: ProductCollection;
    productName: string;
    productPrice: number;
    productLeftCount: number;
    productSize?: ProductSize;
    productVolume?: number;
    productDesc?: string;
    productImages?: string[];
    productViews?: number;


}



export interface ProductUpdateInput {
    _id: ObjectId;
    productStatus?: ProductStatus;
    productCollection?: ProductCollection;
    productName?: string;
    productPrice?: number;
    productLeftCount?: number;
    productSize?: ProductSize;
    productVolume?: number;
    productDesc?: string;
    productImages?: string[];
    productViews?: number;


}
