import _ from 'lodash';
import HttpStatus from 'http-status-codes';

import bookshelf, { knex } from 'server/bookshelf';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'server/constants';
import logger from 'server/logger';
import Account from 'server/models/Account';
import Transfer from 'server/models/Transfer';

export async function create(req, res) {
  const { accountFrom, accountTo } = req.body;
  const amount = Number(req.body.amount);

  // Input data check.
  if (!_.isFinite(amount) || amount <= 0) {
    res.status(HttpStatus.BAD_REQUEST).json({
      error: '`amount` has to be a positive number.',
    });
    return;
  }
  if (!accountFrom || !accountTo) {
    res.status(HttpStatus.BAD_REQUEST).json({
      error: '`accountFrom` and/or `accountTo` is not provided.',
    });
    return;
  }
  if (accountFrom === accountTo) {
    res.status(HttpStatus.BAD_REQUEST).json({
      error: 'You are not allowed to transfer from one account to the same account.',
    });
    return;
  }
  const exist = await Promise.all([
    Account.doesExist(accountFrom),
    Account.doesExist(accountTo),
  ]);
  if (!_.every(exist)) {
    res.status(HttpStatus.BAD_REQUEST).json({
      error: '`accountFrom` and/or `accountTo` does not exist.',
    });
    return;
  }

  // Inside the transaction, 3 operations occur:
  // (1) subtract `amount` from `accountFrom`.
  // (2) plus `amount` to `accountTo`.
  // (3) create a Transfer.
  // During step (1), if the resulting balance is negative, the transaction
  // is rolled back.
  bookshelf.transaction(tx => {
    // (1)
    const senderQuery = `
      UPDATE \`Account\`
      SET \`balance\` = \`balance\` - ?
      WHERE \`id\` = ?
        AND \`balance\` - ? >= 0
    `;
    const senderValues = [amount, accountFrom, amount];
    const senderRun = knex.raw(senderQuery, senderValues).transacting(tx);

    // (2)
    const receiverQuery = `
      UPDATE \`Account\`
      SET \`balance\` = \`balance\` + ?
      WHERE \`id\` = ?
    `;
    const receiverValues = [amount, accountTo];
    const receiverRun = knex.raw(receiverQuery, receiverValues).transacting(tx);

    // (3)
    const newTransferRun = Transfer.forge().save({
      accountFrom,
      accountTo,
      amount,
    }, {
      transacting: tx,
    });

    Promise.all([
      senderRun,
      receiverRun,
      newTransferRun,
    ]).then(([[senderResult], [receiverResult], newTransfer]) => {
      if (senderResult.affectedRows === 0) {
        tx.rollback(new Error(`Not enough balance on the sender's account (id: ${accountFrom})`));
        return;
      }
      tx.commit(newTransfer);
    }).catch(tx.rollback);
  }).then(newTransfer => {
    res.status(HttpStatus.OK).json(newTransfer);
    return;
  }).catch(err => {
    logger('error', __filename, err);
    if (/not enough balance/i.test(err.message)) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: err.message,
      });
      return;
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(INTERNAL_SERVER_ERROR_MESSAGE);
    return;
  });
}
