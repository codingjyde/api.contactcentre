const createError = require("http-errors");
const express = require('express');
const { body, validationResult } = require('express-validator');
const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const LabelStatus = require('../../../../constants/label_status');

const Label = require('../../../../models/app_labels');

const validators = [
    body('name')
        .not().isEmpty().withMessage('Please provide the name of this label.'),
    body('colour')
        .not().isEmpty().withMessage('Please provide the colour of this label.'),
    body('status')
        .not().isEmpty()
            .withMessage('Please provide the status of this label.')
        .isIn([ LabelStatus.ACTIVE, LabelStatus.SUSPENDED])
            .withMessage(`The status of this label should be suspended(${ LabelStatus.SUSPENDED }) or active(${ LabelStatus.ACTIVE }). `),
];

const router = express.Router();

router.put('/labels/:id', validators, async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { name, colour, status } = req.body;
        let { id } = req.params;

        const { organisationId } = req.user;

        let exists = await Label.exists({
            _id: { $ne: id },
            organisation: organisationId,
            name
        }, {
            session
        });
        if(exists) {
            throw createHttpError(400, "This name is in use already.");
        }

        exists = await Label.exists({
            _id: { $ne: id },
            organisation: organisationId,
            colour
        }, {
            session
        });
        if(exists) {
            throw createHttpError(400, "This colour is in use already.");
        }

        console.log(id);

        const label = await Label.findOne({
            _id: id,
            organisation: organisationId,
        }).session(session);
        if(!label) {
            throw createError(400, "Invalid label ID.");
        }

        label.name = name;        
        label.colour = colour;        
        label.status = parseInt(status);
        
        await label.save(session);
        
        await session.commitTransaction();

        res.json(label);
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
})

module.exports = router;