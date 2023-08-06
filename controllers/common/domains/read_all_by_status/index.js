const express = require('express');
const mongoose = require('mongoose');

const Domain = require("../../../../models/app_domains");

const router = express.Router();

router.get('/domains/all/:status', async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        let { page, size } = req.query;
        page = page ? page : 1;
        size = size ? size : 10;

        const { organisationId } = req.user;
        const { status } = req.params;
        
        const filter = {
            organisation: organisationId,
            status: {
                $bitsAnySet: status
            }
        };

        const count = await Domain.countDocuments(filter)
            .session(session);

        const items = await Domain.find(filter)
            .sort({
                name: "asc"
            })
            .skip((page - 1) * size)
            .limit(size)
            .session(session);

        await session.commitTransaction();

        res.json({
            items,
            page,
            pages: Math.ceil(count / size),
            size
        });
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
})

module.exports = router;