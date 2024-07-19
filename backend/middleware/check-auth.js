const jwt = require('jsonwebtoken');

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
        if (!token) {
            throw new Error('Authentication failed token not found!');
        }
        const decodedToken = jwt.verify(token, process.env.JWT);
        req.userData = { userId: decodedToken.userId }
        next();
    } catch (err) {
        const error = new HttpError('Authentication failed! jwt failed', 403);
        return next(error); 
    }
};
