const addrs = require('email-addresses');
const mongoose = require('mongoose');

const Channel = require('../../../../constants/channel');
const ContactAccountType = require('../../../../constants/contact_account_type');
const ConversationItemMode = require('../../../../constants/conversation_item_mode');
const ConversationStatus = require('../../../../constants/conversation_status');
const ConversationItemType = require('../../../../constants/conversation_item_type');
const Gender = require('../../../../constants/gender');

const ChannelAccount = require("../../../../models/app_channel_accounts");
const Contact = require('../../../../models/app_contacts');
const ContactAccount = require('../../../../models/app_contact_accounts');
const Conversation = require('../../../../models/app_conversations');
const ConversationItem = require('../../../../models/app_conversation_items');
const EmailMessage = require("../../../../models/app_email_messages");

const logService = require("../../../logger");

module.exports = async function({ key, email }) {
    const metadata = "jobs/update_database_with_mail_details";
    const session = await mongoose.startSession();

    try {
        
        session.startTransaction();

        const { from, to, cc, bcc, replyTo, dateSent, addresses } = extractMailData(email);

        const channelAccounts = await ChannelAccount.find({
            type: Channel.EMAIL,
            "data.address": {
                $in: addresses
            }
        }).session(session);

        for (const channelAccount of channelAccounts) {
            const organisationId = channelAccount.organisation;
            const channelAccountId = channelAccount._id;
            const inReplyTo = email.inReplyTo;
            const text = email.text;
            const html = email.textAsHtml;

            const contactAccount = await getContactAccount({ session, organisationId, emailAddress: from.address });
            
            const conversationItemId 
                = await getConversationItemId({ session, organisationId, channelAccountId, contactAccount, text, html, dateSent, inReplyTo });

            const emailMessage = new EmailMessage({
                organisation: organisationId,
                channelAccount: channelAccountId,
                conversationItem: conversationItemId,
                messageId: email.messageId,
                messageKey: key,
                subject: email.subject,
                from,
                to,
                cc,
                bcc,
                inReplyTo,
                replyTo,
                references: email.references,
                html: email.html,
                text: email.text,
                textAsHtml: email.textAsHtml,
                attachments: [],
                dateSent,
                dateRetrieved: Date.now(),
                dateProcessed: Date.now()
            });
            await emailMessage.save(session);    
        }

        await session.commitTransaction();
    } catch (error) {
        logService.error(error.message, metadata);
        
        await session.abortTransaction();
    } finally {
        session.endSession();
    }
}

const extractMailData = function(email) {
    let from = null;
    let to = [];
    let cc = [];
    let bcc = [];
    let replyTo = null;
    let dateSent = null;
    let addresses = [];

    if(email.from) {
        from = addrs.parseOneAddress(email.from.text);
        from = { 
            name: from.name,
            address: from.address
        };
    }
    if(email.to) {
        to = addrs.parseAddressList(email.to.text).map(x => {
            return {
                name: x.name,
                address: x.address
            }
        });
    }

    if(email.cc) {
        cc = addrs.parseAddressList(email.cc.text).map(x => {
            return {
                name: x.name,
                address: x.address
            }
        });
    }
    if(email.bcc) {
        bcc = addrs.parseAddressList(email.bcc.text).map(x => {
            return {
                name: x.name,
                address: x.address
            }
        });
    }

    if(email.replyTo) {
        replyTo = addrs.parseOneAddress(email.replyTo.text);
        replyTo = { 
            name: replyTo.name,
            address: replyTo.address
        };
    }

    if(email.date) {
        dateSent = (new Date(email.date)).getTime();
    }

    addresses = to.concat(cc).concat(bcc).map(x => x.address);

    return {
        from,
        to,
        cc,
        bcc,
        replyTo,
        dateSent,
        addresses
    };
}

const getContactAccount = async function({ session, organisationId, emailAddress }) {
    let contactAccount = await ContactAccount.findOne({
        organisation: organisationId,
        value: emailAddress
    }).session(session);
    if(contactAccount) {
        return contactAccount;
    }

    const contact = new Contact({
        organisation: organisationId,
        title: "",
        firstName: "",
        middleName: "",
        surname: "",
        gender: Gender.UNKNOWN
    });
    await contact.save(session);

    contactAccount = new ContactAccount({
        organisation: organisationId,
        contact: contact._id,
        value: emailAddress,
        isVerified: true,
        type: ContactAccountType.TELEPHONE_NUMBER
    })
    await contactAccount.save(session);
    
    return contactAccount;
}

const getConversationId = async function({ session, organisationId, channelAccountId, contactAccountId, inReplyTo }) {
    if(inReplyTo) {
        const emailMessage = await EmailMessage.findOne({
            organisation: organisationId,
            messageId: inReplyTo
        }).populate("conversationItem")
        .session(session);
        if(emailMessage) {
            return emailMessage.conversationItem.conversation;
        }
    }

    const conversation = new Conversation({
        organisation: organisationId,
        channelAccount: channelAccountId,
        contactAccount: contactAccountId,
        mergeId: null,
        status: ConversationStatus.INITIALISED
    })
    await conversation.save(session);

    return conversation._id;
}

const getConversationItemId = async function({ session, organisationId, channelAccountId, contactAccount, text, html, dateSent, inReplyTo }) {
    const conversationId = await getConversationId({ session, organisationId, channelAccountId, contactAccountId: contactAccount._id, inReplyTo });

    const conversationItem = new ConversationItem({
        organisation: organisationId,
        conversation: conversationId,
        sender: {
            name: "",
            emailAddress: contactAccount.value
        },
        text,
        html,
        mode: ConversationItemMode.PUBLIC,
        type: ConversationItemType.EMAIL,
        dateSent
    });

    await conversationItem.save(session);

    return conversationItem._id;
}

