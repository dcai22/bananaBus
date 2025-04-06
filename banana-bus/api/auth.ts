import HTTPError from "http-errors";
import { AuthUserId, DataStore, Error, UserBuilder } from "./interface";
import { getData, setData } from "./dataStore";
import { getHash, compareHash, findUserByToken, findUserByResetToken } from "./helper";
import crypto from "crypto";

export function authRegister(email: string, password: string, firstName: string, lastName: string) {
    const data = getData();

    for (const index in data.users) {
        if (email === data.users[index].email) {
            throw HTTPError(400, 'email address already in use');
        }
    }

    const hashedPassword = getHash(password);
    
    let userId = 0;
    if (data.users.length !== 0) {
        userId = data.users[data.users.length - 1].userId + 1;
    }
    const token = crypto.randomBytes(64).toString('hex')
    const hashedToken = getHash(token);

    data.users.push(new UserBuilder()
        .withFirstName(firstName)
        .withLastName(lastName)
        .withEmail(email)
        .withPassword(hashedPassword)
        .withTokens([ hashedToken ])
        .withUserId(userId)
        .build()
    );


    setData(data);
    return {
        userId,
        token
    };
}

export function authLogin(email: string, password: string) {
    const data = getData();
    for (const index in data.users) {
        if (email === data.users[index].email) {
            if (!compareHash(password, data.users[index].password)) {
                throw HTTPError(400, 'incorrect password');
            } else {
                const token = crypto.randomBytes(64).toString('hex')
                const hashedToken = getHash(token);
                data.users[index].tokens.push(hashedToken);
                setData(data);
                return {
                    userId: data.users[index].userId,
                    token: token
                }
            }
        }
    }
    throw HTTPError(400, 'email not found');
}

export function authAutoLogin(token: string) {
    const data = getData();
    const strippedToken = token.replace('Bearer ', '');
    for (const user of data.users) {
        for (const userToken of user.tokens) {
            if (compareHash(strippedToken, userToken)) {
                return {
                    userId: user.userId,
                    token: strippedToken
                }
            }
        }
    }
    throw HTTPError(403, 'invalid token');
}

export function authLogout(userId: number, token: string) {
    const data = getData();
    let userIndex = -1;
    for (const index in data.users) {
        if (data.users[index].userId === userId) {
            userIndex = parseInt(index);
            break;
        }
    }
    if (userIndex === -1) {
        throw HTTPError(403, 'invalid userId ' + userId);
    }
    const strippedToken = token.replace('Bearer ', '');
    const userBytoken = findUserByToken(strippedToken);
    if (userBytoken === undefined) {
        throw HTTPError(403, 'invalid token');
    }
    if (data.users[userIndex].userId !== userBytoken.userId) {
        throw HTTPError(403, 'invalid data');
    }
    for (const user of data.users) {
        if (user.userId === userId) {
            for (const index in user.tokens) {
                if (compareHash(strippedToken, user.tokens[index])) {
                    user.tokens.splice(parseInt(index), 1);
                    setData(data);
                    return {};
                }
            }
        }
    }
}

export function authPasswordResetEmail(email: string) {

    const data = getData();
    let isvalid = false;
    for (const user of data.users) {
        if (user.email === email) {
            isvalid = true;
        }
    }

    const code = Math.floor(Math.random() * 899999 + 100000).toString();
    const token = crypto.randomBytes(64).toString('hex');

    if (!isvalid) {
        return {
            message: 'Email not found',
            token
        }
    }

    for (const user of data.users) {
        if (user.email === email) {
            const hashedCode = getHash(code);
            const hashedToken = getHash(token);
            user.resetTokens.push({
                token: hashedToken,
                code: hashedCode,
                expiry: new Date(Date.now() + 15 * 60 * 1000)
            });
            setData(data);
        }
    }

    const nodemailer = require('nodemailer');
    // for now just use ethereal email
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'delphine.batz@ethereal.email',
            pass: 'djexbJqVg88mr4u38u'
        }
    });
    const mailOptions = {
        from: 'Banana Bus 2025',
        to: email,
        subject: 'Banana Bus Password Reset',
        text: `This is your one time passcode: ${code}. It will expire in 15 minutes.`
    }

    transporter.sendMail(mailOptions, function(error: Error, info: any) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    return {
        message: 'Email sent',
        token
    }
}

// checks the token in the query of the url is correct, ensures that this person is actually trying to reset their password
export function authPasswordVerifyCode(token: string, code: string) {
    const user = findUserByResetToken(token);
    if (!user) {
        throw HTTPError(400, 'invalid token');
    }
    for (const userToken of user.resetTokens) {
        if (compareHash(token, userToken.token)) {
            if (userToken.expiry < new Date()) {
                throw HTTPError(400, 'token expired');
            }
            if (!compareHash(code, userToken.code)) {
                throw HTTPError(400, 'incorrect code');
            }
            return true;
        }
    }
    throw HTTPError(400, 'invalid token');
}

export function authPasswordReset(token: string, password: string) {
    const user = findUserByResetToken(token);
    if (!user) {
        throw HTTPError(400, 'invalid token');
    }
    for (const userToken of user.resetTokens) {
        if (compareHash(token, userToken.token)) {
            if (userToken.expiry < new Date()) {
                throw HTTPError(400, 'token expired');
            }
            const hashedPassword = getHash(password);
            user.password = hashedPassword;
            setData(getData());
            return true;
        }
    }
    throw HTTPError(400, 'invalid token');

    //TODO: remove resetToken after use/expiry
}