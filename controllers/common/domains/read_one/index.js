const createError = require('http-errors');
const express = require('express');

const Domain = require("../../../../models/app_domains");

const router = express.Router();

router.get('/domains/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { organisationId } = req.user;

        const domain = await Domain.findOne({
            _id: id,
            organisation: organisationId
        });
        if(!domain) {
            throw createError(400, "Invalid domain ID.");
        }
        
        res.json(domain);
    } catch (error) {
        next(error);
    } 
})

module.exports = router;