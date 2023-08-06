const express = require('express');
const mongoose = require('mongoose');

const Conversation = require("../../../../models/app_conversations");
const ConversationItem = require('../../../../models/app_conversation_items');

const router = express.Router();

router.get('/conversations/all/:status/:date', async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { organisationId } = req.user;
        const { date, status } = req.params;
        
        const items = await ConversationItem.find({
            organisation: organisationId,
            dateSent: {
                $lt: date
            }
        }).populate({
            path: "conversation",
            model: "Conversation",
            match: {
                status: {
                    $bitsAnySet: status
                }    
            },
            populate: [{
                path: "contactAccount",
                populate: {
                    path: "contact"
                }
            }, {
                path: "channelAccount"
            }]
        }).sort({
            dateSent: "desc"
        }).session(session);


        // const items = await Conversation.find(filter)
        //     .populate({
        //         path: "contactAccount",
        //         model: "ContactAccount", 
        //         populate: { 
        //             path: "contact" 
        //         },
        //     }).populate({
        //         path: "channelAccount",
        //         model: "ChannelAccount"
        //     }).sort({
        //         name: "asc"
        //     }).skip((page - 1) * size)
        //     .limit(size)
        //     .session(session);

        await session.commitTransaction();

        res.json({
            items
        });
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
})

module.exports = router;