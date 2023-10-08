import jwt from "jsonwebtoken";

const createJWT_token = (expiresIn:any, user:object, secretKey:string) => {

    if(typeof user !== "object" || !user){
        throw new Error("Payload must be a non-empty object");
    }

    if(typeof secretKey !== "string" || secretKey === ""){
        throw new Error("secret key must be a non-empty string");
    }

    try {
        const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const token = jwt.sign({user,activationCode},secretKey,{expiresIn});

        return {
            token,
            activationCode
        };
    } catch (error:any) {
        console.error("Faild to load JWT :", error);
        throw error;
    }
}

export default createJWT_token;