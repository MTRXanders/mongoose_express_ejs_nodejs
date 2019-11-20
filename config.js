const dotenv = require('dotenv');
const path =require('path');

const root = path.join.bind(this, __dirname);
dotenv.config({path:root('.env')});

module.exports ={
    PORT: process.env.PORT || 3000,
    MONGO_URL:process.env.MONGO_URL,
    SESSION_SECRET:process.env.SESSION_SECRET,//secret word fo crypto
    IS_PRODUCTION: process.env.NODE_ENV ==='production',
    PER_PAGE: process.env.PER_PAGE,
    ROUNDS_SALT: process.env.ROUNDS_SALT,
    DESTINATION: 'uploads',
    EMAIL_USER: 'proglist1@gmail.com',
    EMAIL_USER_PASS: '527556116250'
}