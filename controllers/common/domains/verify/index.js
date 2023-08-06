const dns = require('dns').promises;
const express = require('express');
const createError = require('http-errors');
const mongoose = require('mongoose');

const DnsRecordType = require('../../../../constants/dns_record_type');
const DomainStatus = require('../../../../constants/domain_status');

const Domain = require("../../../../models/app_domains");

const amazonService = require("../../../../services/amazon");

const router = express.Router();

router.post('/domains/verify/:id', async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { id } = req.params;
        const { organisationId } = req.user;

        const domain = await Domain.findOne({
            _id: id,
            organisation: organisationId
        }).session(session);
        if(!domain) {
            throw createError(400, "Invalid domain ID.");
        }

        let verified = true;

        for (const record of domain.records) {
            switch (record.type) {
                case DnsRecordType.MX:
                    verified = verified || await verifyMx({ domainName: domain.name, value: record.value, priority: record.priority });
                    if(!verified) {
                        throw createError(500, `Please add ${ record.value } with priority ${ record.priority } as a ${ DnsRecordType.MX } value to your DNS records.`);
                    }
                    break;
                case DnsRecordType.TXT:
                    verified = verified && await verifyTxt({ domainName: domain.name, value: record.value});
                    if(!verified) {
                        throw createError(500, `Please add ${ record.value } as a ${ DnsRecordType.TXT } value to your DNS records.`);
                    }
                    break;
                    default:
                    break;
            }
        }

        verified = verified && await amazonService.checkDomainVerificationStatus(domain.name);
        if(verified) {
            domain.status = DomainStatus.VERIFIED;
        } else {
            domain.status = DomainStatus.FAILED;
        }

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


const verifyMx = async function({ domainName, value, priority }) {
    try {
        let records = await dns.resolveMx(domainName);
 
        const exists = records.some(x => (x.exchange == value) && (x.priority == priority));

        return exists;
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

const verifyTxt = async function({ domainName, value }) {
    try {
        let records = await dns.resolveTxt(domainName);
        
        const exists = records.some(x => x.includes(value));

        return exists;
    } catch (error) {
        console.log(error);

        return false;
    }
}

module.exports = router;