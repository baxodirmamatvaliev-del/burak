import multer from 'multer';
import { v4 } from 'uuid';
import path from 'path';
import { mkdir } from 'fs';


function getTargetImageStorage(address: any) {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            const destination = `./uploads/${address}`;
            mkdir(destination, { recursive: true }, err => cb(err, destination));
        },
        filename: function (req, file, cb) {
            console.log(file);
            const extension = path.parse(file.originalname).ext;
            const random_name = v4() + extension
            cb(null, random_name)
        },
    })
}

const makeUploader = (address: string, options: multer.Options = {}) => {
    const storage = getTargetImageStorage(address);
    return multer({ ...options, storage: storage })
}


export default makeUploader;


/*
const product_storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, './uploads/products')
        },
        filename: function (req, file, cb) {
            console.log(file);
            const extension = path.parse(file.originalname).ext;
            const random_name = v4() + extension
            cb(null, random_name)
        }

    });

export const uploadProductImage = multer({ storage: product_storage });
*/
