import e from "express";
import { shapeIntMongooseObjectId } from "../libs/config";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { LoginInput, Member, MemberInput, MemberUpdateInput } from "../libs/types/member";
import MemberModel from "../schema/Member.model";
import * as bcrypt from 'bcryptjs'
import { setHeapSnapshotNearHeapLimit } from "node:v8";
import { exec } from "node:child_process";

class MemberService {
    private readonly memberModel;


    constructor() {
        this.memberModel = MemberModel;   //shartli kichik harflar bilan aslida 
    }

    /** SPA */

    public async signup(input: MemberInput): Promise<Member> {
        const salt = await bcrypt.genSalt();
        input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

        try {
            const result = await this.memberModel.create(input);
            result.memberPassword = "";
            return result.toJSON();
        } catch (err) {
            console.error("ERROR, model signup", err)
            throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
        }

    }


    public async login(input: LoginInput): Promise<Member> {

        // TODO: Consider member status
        const member = await this.memberModel
            .findOne(
                {
                    memberNick: input.memberNick,
                    memberStatus: { $ne: MemberStatus.DELETE }
                },
                { memberNick: 1, memberPassword: 1, memberStatus: 1 },
            )
            .exec();
        if (!member) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
        } else if (member.memberStatus === MemberStatus.BLOCK) {
            throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
        }



        const isMatch = await bcrypt.compare(input.memberPassword, member.memberPassword);


        // console.log("isMatch:", isMatch)
        if (!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }

        return await this.memberModel.findById(member._id).lean().exec();
    }



    public async getMemberDetail(member: Member): Promise<Member> {
        const memberId = shapeIntMongooseObjectId(member._id);
        const result = await this.memberModel.findOne(
            { _id: memberId, memberStatus: MemberStatus.ACTIVE }
        ).exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND)
        return result
    }


    public async updateMember(member: Member,
        input: MemberUpdateInput
    ): Promise<Member>{
      const memberId = shapeIntMongooseObjectId(member._id);
      const result = await this.memberModel.
      findByIdAndUpdate({_id: memberId}, input, {new: true})
      .exec();

      if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return  result

    }


    public async getTopUsers(): Promise<Member[]> {
      const result = await this.memberModel.find({
        memberStatus: MemberStatus.ACTIVE,
        memberPoints: { $gte: 1 }
     })
     .sort({memberPoints: -1}).limit(4).exec();
     if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND)


     return result
    }



    /** SSR */


    // public async processSignup(): Promise<void> {
    //     console.log("Passed here from MEMBER SERVICE MODEL")
    // }
    public async processSignup(input: MemberInput): Promise<Member> {
        const exist = await this.memberModel                                        // Bor bolgan admin userni bor bolsa error qilihs yani bitta admin faqat
            .findOne({ memberType: MemberType.RESTAURANT })
            .exec();
        console.log("exist:", exist);
        if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);   // ozimiz creatre qilgan errrorni korsatib bermoqdamiz

        // console.log("before:", input.memberPassword)
        const salt = await bcrypt.genSalt();
        input.memberPassword = await bcrypt.hash(input.memberPassword, salt);
        // console.log("after:", input.memberPassword)

        try {
            const result = await this.memberModel.create(input);   //inputimiz pass qilamiz db yozishi uchun
            result.memberPassword = "";
            return result;
        } catch (err) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);   // ozimiz creatre qilgan errrorni korsatib bermoqdamiz
        }

        // console.log("Passed here from MEMBER SERVICE MODEL")
    }


    public async processLogin(input: LoginInput): Promise<Member> {
        const member = await this.memberModel
            .findOne(
                { memberNick: input.memberNick },
                { memberNick: 1, memberPassword: 1, memberStatus: 1 })
            .exec();
        if (!member) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
        }

        const isMatch = await bcrypt.compare(input.memberPassword, member.memberPassword);
        // const isMatch = input.memberPassword == member.memberPassword;




        console.log("isMatch:", isMatch)
        if (!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }

        return await this.memberModel.findById(member._id).exec();
    }


    public async getUser(): Promise<Member[]> {

        const result = await this.memberModel.find({ memberType: MemberType.USER }).exec();

        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND)

        return result
    }

    public async updateChosenUser(input: MemberUpdateInput): Promise<Member> {

        input._id = shapeIntMongooseObjectId(input._id)

        const result = await this.memberModel.findByIdAndUpdate({ _id: input._id }, input, { new: true }).exec()


        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED)

        return result

    }


}
export default MemberService;