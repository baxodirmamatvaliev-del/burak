
import express from 'express';
const routerAdmin = express.Router();
import restaurantController from './controllers/restaurant.controller'
import productController from './controllers/product.controller';
import makeUploader from './libs/utils/uploader';
import treatmentController from './controllers/treatment.controller';
import dentistController from './controllers/dentist.controller';
routerAdmin.get("/", restaurantController.goHome);
routerAdmin
    .get("/login", restaurantController.getLogin) // CALL
    .post("/login", restaurantController.processLogin);
routerAdmin
    .get("/signup", restaurantController.getSignup)
    .post(
        "/signup",
        makeUploader("members").single("memberImage"),
        restaurantController.processSignup);
routerAdmin.get("/logout", restaurantController.logout);
routerAdmin.get("/check-me", restaurantController.checkAuthSession);
/* Product*/
routerAdmin.get("/product/all", restaurantController.verifyRestaurant, productController.getAllProducts);
routerAdmin.post("/product/create",
    restaurantController.verifyRestaurant,
    makeUploader("products").array("productImages", 5),
    productController.createNewProduct);
routerAdmin.post("/product/:id",
    restaurantController.verifyRestaurant,
    productController.updateChosenProduct);
/* USER*/
routerAdmin.get("/user/all", restaurantController.verifyRestaurant, restaurantController.getUser)
routerAdmin.post("/user/edit", restaurantController.verifyRestaurant, restaurantController.updateChosenUser)

/* Treatment */
// Xizmatlar jadvalini faqat admin uchun ochish
routerAdmin.get("/treatment/all", restaurantController.verifyRestaurant, treatmentController.getAllTreatments);
// Yaratish formasini autentifikatsiyadan keyin ko'rsatish
routerAdmin.get("/treatment/create", restaurantController.verifyRestaurant, treatmentController.getCreateTreatment);
// Rasm yuklash va yangi xizmat yaratishni admin bilan cheklash
routerAdmin.post("/treatment/create", restaurantController.verifyRestaurant,
    treatmentController.uploadTreatmentImages, treatmentController.createNewTreatment);
// Tahrirlash so'rovini himoyalangan controllerga yo'naltirish
routerAdmin.get("/treatment/:id", restaurantController.verifyRestaurant, treatmentController.getEditTreatment);
// Yangilash va rasm yuklashdan oldin admin huquqini tekshirish
routerAdmin.post("/treatment/:id", restaurantController.verifyRestaurant,
    treatmentController.uploadTreatmentImages, treatmentController.updateChosenTreatment);

/* Dentist */
// Stomatologlar jadvalini faqat autentifikatsiyadan o'tgan admin uchun ochish
routerAdmin.get("/dentist/all", restaurantController.verifyRestaurant, dentistController.getAllDentists);
// Yaratish formasini faqat admin uchun ochish
routerAdmin.get("/dentist/create", restaurantController.verifyRestaurant, dentistController.getCreateDentist);
// Rasm yuklash va stomatolog yaratishdan oldin admin huquqini tekshirish
routerAdmin.post("/dentist/create", restaurantController.verifyRestaurant,
    dentistController.uploadDentistImage, dentistController.createNewDentist);

export default routerAdmin;
