import mongoose, { mongo, Schema } from 'mongoose';
import { MemberStatus, MemberType } from '../libs/enums/member.enum'

const MemberSchema = new Schema({
    memberType: {
        type: String,
        enum: MemberType,           // aniq qiymat qabul qiladi
        default: MemberType.USER
    },

    memberStatus: {
        type: String,
        enum: MemberStatus,
        default: MemberStatus.ACTIVE
    },

    memberNick: {
        type: String,
        index: { unique: true, sparse: true },     // unique qollaymiz chunki boshqa odam bizni nicknamedan kiraoilmasligi kerak
        required: true
    },

    memberPhone: {
        type: String,
        index: { unique: true, sparse: true },
        required: true
    },

    memberPassword: {
        type: String,
        select: false,      // passwordni kiritayotgandsa login qilayotganda passwordni bermaslik uchun false manual kiritishi kerak 
        required: true
    },

    memberAddress: {
        type: String,
    },

    memberDesc: {
        type: String,
    },

    memberImage: {
        type: String,
    },

    memberPoints: {
        type: Number,
        default: 0,
    }


}, { timestamps: true })   // updatedAt va createdAt


export default mongoose.model("Member", MemberSchema)