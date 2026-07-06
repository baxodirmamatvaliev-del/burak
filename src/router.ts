import express from 'express';
const router = express.Router();
import memberController from './controllers/member.controller'
import uploader from "./libs/utils/uploader";

router.get("/");

/** MEmber */
router.post("/member/login", memberController.login);
router.post("/member/signup",memberController.signup);
router.post("/member/logout",
     memberController.verifyAuth,
     memberController.logout);
router.get
("/member/detail", 
    memberController.verifyAuth,
     memberController.getMemberDetail)

 router.post(
    "/member/update",
    memberController.verifyAuth,  // cradantion  check
    uploader("members").single("memberImage"),
    memberController.updateMember
);    

export default router;
