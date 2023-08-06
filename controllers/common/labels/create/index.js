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
];

const router = express.Router();

router.post('/labels', validators, async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { name, colour } = req.body;

        const { organisationId } = req.user;

        let exists = await Label.exists({
            organisation: organisationId,
            name
        }, {
            session
        });
        if(exists) {
            throw createHttpError(400, "This name is in use already.");
        }

        exists = await Label.exists({
            organisation: organisationId,
            colour
        }, {
            session
        });
        if(exists) {
            throw createHttpError(400, "This colour is in use already.");
        }

        const label = new Label({
            organisation: organisationId,
            name,
            colour,
            status: LabelStatus.ACTIVE
        });
        await label.save({ session });
        
        await session.commitTransaction();

        console.log(label);

        res.json(label);
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
})

module.exports = router;