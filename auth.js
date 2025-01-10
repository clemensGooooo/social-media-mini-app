require('dotenv').config();

const express  =  require('express');
const jwt = require("jsonwebtoken");


const auth = express.Router();

auth.use(async (req, res, next) => {

    const bearerToken = req.headers.authorization;
    if (bearerToken && bearerToken.startsWith("Bearer ")) {
        const token = bearerToken.slice(7);
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const { email, id } = decoded;
            req.auth = { user: "user",email, id };
        } catch (error) {
            req.auth = { user: "guest" };
        }
    } else {
        req.auth = { user: "guest" };    
    }
    next();
});

const generateJWT = (email, id) => {

    const token = jwt.sign({email,id}, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
    return token;
};

module.exports =  {auth,generateJWT};