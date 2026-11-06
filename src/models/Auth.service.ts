import { AUTH_TIMER } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import jwt from 'jsonwebtoken'

class AuthService {
    private readonly secretToken: string;
    constructor() {
        this.secretToken = process.env.SECRET_TOKEN as string
    }

    /**
     * createToken
     */
    public async createToken(payload: Member): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const duration = `${AUTH_TIMER}h`;
            jwt.sign(payload, process.env.SECRET_TOKEN as string, {
                expiresIn: duration
            }, (err, token) => {
                if (err) {
                    reject(new Errors(HttpCode.UNAUTHORIZED, Message.TOKEN_CREATION_FAILED));
                } else resolve(token as string);
            });
        })
    }

    public async chechAuth(token: string): Promise<Member> {
        const result: Member = (await jwt.verify(token, this.secretToken)) as Member;
        console.log('====================================');
        console.log(`--- [AUTH] memberNick: ${result.memberNick}`);
        console.log('====================================');
        return result;
    }
}

export default AuthService;
