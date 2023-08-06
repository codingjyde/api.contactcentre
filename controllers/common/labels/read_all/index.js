const express = require('express');
const mongoose = require('mongoose');

const Label = require("../../../../models/app_labels");

const router = express.Router();

router.get('/labels', async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        let { page, size } = req.query;
        page = page ? page : 1;
        size = size ? size : 10;

        const { organisationId } = req.user;

        const filter = {
            organisation: organisationId
        };

        const count = await Label.countDocuments(filter)
            .session(session);

        const items = await Label.find(filter)
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