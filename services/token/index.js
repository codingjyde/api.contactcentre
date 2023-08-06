const jwt = require('jsonwebtoken');

const config = require("../../constants/config");

const generate = async function({ userId, firstName, middleName, surname, emailAddress, requiresPasswordChange, organisationId, organisationName,
    accessTokenExpiry, refreshTokenExpiry }) {
    const payload = {
        userId, 
        firstName, 
        middleName, 
        surname, 
        emailAddress, 
        requiresPasswordChange, 
        organisationId, 
        organisationName
    }

    const accessToken = await jwt.sign(payload, config.JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: accessTokenExpiry ? accessTokenExpiry : config.JWT_ACCESS_TOKEN_EXPIRY
    });
    let decoded = await verifyAccessToken(accessToken);
    const accessTokenExpiryDate = decoded.exp * 1000;

    const refreshToken = await jwt.sign({ userId }, config.JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: refreshTokenExpiry ? refreshTokenExpiry : config.JWT_REFRESH_TOKEN_EXPIRY
    });
    decoded = await verifyRefreshToken(refreshToken);
    const refreshTokenExpiryDate = decoded.exp * 1000;

    return {
        accessToken,
        accessTokenExpiryDate,
        refreshToken,
        refreshTokenExpiryDate
    }
}

const verifyAccessToken = async function(input) {
    const decoded = await jwt.verify(input, config.JWT_ACCESS_TOKEN_SECRET);

    return decoded;
}

const verifyRefreshToken = async function(input) {
    const decoded = await jwt.verify(input, config.JWT_REFRESH_TOKEN_SECRET);

    return decoded;
}

module.exports = {
    generate,
    verifyAccessToken,
    verifyRefreshToken
}