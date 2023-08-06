const express = require('express');
const { body, validationResult } = require('express-validator');
const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const DomainStatus = require('../../../../constants/domain_status');

const Domain = require('../../../../models/app_domains');

const amazonService = require("../../../../services/amazon");

const validators = [
    body('name')
        .not().isEmpty().withMessage('Please provide the name of this domain.'),
];

const router = express.Router();

router.post('/domains', validators, async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { name } = req.body;

        const { organisationId } = req.user;

        let exists = await Domain.exists({
            organisation: organisationId,
            name
        }).session(session);
        if(exists) {
            throw createHttpError(400, "This name is in use already.");
        }

        const records = await amazonService.verifyDomain("saf.net.ng");

        const domain = new Domain({
            organisation: organisationId,
            name,
            records,
            status: DomainStatus.PENDING
        });
        await domain.save(session);
        
        await session.commitTransaction();

        res.json(domain);
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
})

module.exports = router;