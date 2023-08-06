const createError = require('http-errors');
const express = require('express');

const Label = require("../../../../models/app_labels");

const router = express.Router();

router.get('/labels/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { organisationId } = req.user;

        const label = await Label.findOne({
            _id: id,
            organisation: organisationId
        });
        if(!label) {
            throw createError(400, "Invalid label ID.");
        }
        
        res.json(label);
    } catch (error) {
        next(error);
    } 
})

module.exports = router;