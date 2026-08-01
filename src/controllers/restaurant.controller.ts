import { T } from '../libs/types/common'
import { NextFunction, Request, Response } from 'express'
const restaurantController: T = {};
import MemberService from '../models/Member.service'
import { AdminRequest, LoginInput, MemberInput } from '../libs/types/member';
import { MemberType } from '../libs/enums/member.enum';
import Errors, { HttpCode, Message } from '../libs/Errors';


const memberService = new MemberService();
/** Restaurant */
// send | json | redirect | end | render
restaurantController.goHome = (req: Request, res: Response) => {
    try {
        console.log("goHome")
        res.render("home")
    } catch (err) {
        console.log("ERROR, goHome:", err)
        res.redirect('/admin')
    }
};

restaurantController.getSignup = (req: Request, res: Response) => {
    try {
        console.log("getSignup")
        res.render("signup")
    } catch (err) {
        console.log("ERROR, getsignUp:", err)
        res.redirect('/admin')
    }
};
// DEFine
restaurantController.getLogin = (req: Request, res: Response) => {
    try {
        console.log("getLogin")
        res.render("login")
    } catch (err) {
        console.log("ERROR, getLogin:", err)
        res.redirect('/admin')
    }
};


restaurantController.processSignup = async (req: AdminRequest, res: Response) => {
    try {
        console.log("processSignup");
        console.log("body:", req.body);
        const file = req.file;
        if (!file)
            throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
        // console.log("File:", file);
        // throw new Error("Forced Quit");
        console.log("body:", req.body);
        const newMember: MemberInput = req.body;
        newMember.memberImage = req.file?.path.replace(/\\/g, '/');
        newMember.memberType = MemberType.RESTAURANT;
        // console.log('====================================');
        // console.log("newMember.memberImage", newMember.memberImage);
        // console.log('====================================');
        // newMember.memberImage = req.file?.path;
        // console.log('====================================');
        // console.log("newMember.memberImage22222", newMember.memberImage);
        // console.log('====================================');

        const result = await memberService.processSignup(newMember);
        // console.log("result1", result)
        req.session.member = result;
        // console.log("result2", req.session.member)
        req.session.save(function () {
            res.redirect("/admin/product/all");
            // console.log("result3", result)
        })


        // res.send("POSTMAN SIGNUP DONE")
    } catch (err) {
        console.log("ERROR, getsignUp:", err)
        const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(`<script> alert("${message}"); window.location.replace('/admin/signup')</script>`);
    }
};

restaurantController.processLogin = async (req: AdminRequest, res: Response) => {
    try {
        console.log("processLogin");
        console.log("bodY:", req.body);
        const input: LoginInput = req.body;
        const memberService = new MemberService();
        const result = await memberService.processLogin(input);
        req.session.member = result;
        req.session.save(function () {
            res.redirect("/admin/product/all");
            // res.send(result);
        })

    } catch (err) {
        console.log("ERROR, processLogin:", err);
        const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(`<script> alert("${message}"): window.location.replace('/admin/login)</script>`);
    }
};

restaurantController.logout = async (req: AdminRequest, res: Response) => {
    try {
        console.log("processLogin");
        console.log("bodY:", req.body);
        req.session.destroy(function () {
            res.redirect("/admin");
        })
    } catch (err) {
        console.log("ERROR, processLogin:", err);
        res.redirect("/admin");
    }
};

restaurantController.getUser = async (req: Request, res: Response) => {
    try {
        console.log("getUser");
        const result = await memberService.getUser();
        console.log("result", result);
        res.render("users", { users: result })

    } catch (err) {
        console.log("ERROR, getUser", err);
        res.redirect("/admin/login");
    }
}

restaurantController.updateChosenUser = async (req: AdminRequest, res: Response) => {
    try {
        console.log("updateChosenUser");
        const result = await memberService.updateChosenUser(req.body);
        res.status(HttpCode.OK).json({ data: result })
    } catch (err) {
        console.log("ERROR, updateChosenUser:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};
restaurantController.checkAuthSession = async (req: AdminRequest, res: Response) => {
    try {
        console.log("checkAuthSession");
        if (req.session?.member)
            res.send(`<script> alert("${req.session.member.memberNick}")</script>`);
        else res.send(`<script> alert("${Message.NOT_AUTHENTICATED}")</script>`);
    } catch (err) {
        console.log("ERROR, checkAuthSession:", err);
        res.send(err);
    }
};

restaurantController.verifyRestaurant = (req: AdminRequest, res: Response, next: NextFunction) => {
    // console.log('====================================');
    // console.log("sdf", req.session?.member);
    // console.log('====================================');
    if (req.session?.member?.memberType === MemberType.RESTAURANT) {
        req.member = req.session.member;
        next();
    } else {
        const message = Message.NOT_AUTHENTICATED
        res.send(`<script> alert("${message}"); window.location.replace('/admin/login'); </script>`);
    }
}



export default restaurantController;