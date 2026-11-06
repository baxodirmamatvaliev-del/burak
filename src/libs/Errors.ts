export enum HttpCode {
    OK = 200,
    CREATED = 201,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export enum Message {
    SOMETHING_WENT_WRONG = "Something went wrong!",
    NO_DATA_FOUND = "No data is found!",
    CREATE_FAILED = "Create is failed!",
    UPDATE_FAILED = "Update is failed!",
    INVALID_PRODUCT_QUERY = "Invalid product query",
    INVALID_TREATMENT_QUERY = "Invalid treatment query",
    INVALID_TREATMENT_ID = "Invalid treatment ID",

    USED_NICK_PHONE = "You are inserting already used nick or phone!",
    NO_MEMBER_NICK = "No member with that member nick!",
    WRONG_PASSWORD = "Wrong password, please try again!",
    BLOCKED_USER = "You have been blocked, contact to admin",
    NOT_AUTHENTICATED = "You are not authenticated, Please login first!",
    TOKEN_CREATION_FAILED = "Token creation failed!"
}

class Errors extends Error {
    public code: HttpCode;
    public message: Message;

    static standart = {
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: Message.SOMETHING_WENT_WRONG,
    }
    constructor(statusCode: HttpCode, statusMessage: Message) {
        super();
        this.code = statusCode;
        this.message = statusMessage;
    }
}

export default Errors;
