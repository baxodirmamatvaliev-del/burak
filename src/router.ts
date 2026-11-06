import express from "express";
const router = express.Router();
import memberController from './controllers/member.controller';
import productController from './controllers/product.controller';

/** Member */
router.get("/member/top-users", memberController.getTopUsers);
router.post("/login", memberController.login);
router.post("/signup", memberController.signup);

/** Product */
router.get("/product/all", productController.getProducts);

export default router;
