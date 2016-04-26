import express from 'express';

import * as account from 'server/controllers/account';
import * as customer from 'server/controllers/customer';
import * as transfer from 'server/controllers/transfer';

const router = express.Router();

router.route('/customers')
    .post(customer.create);
    // .get(customer.fetchAll);

router.route('/customers/:customerId')
    .get(customer.fetch);

router.route('/accounts')
    .post(account.create);
    // .get(account.fetchAll);

router.route('/accounts/:accountId')
    .get(account.fetch);

router.route('/transfers')
    .post(transfer.create);

export default router;
