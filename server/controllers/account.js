import _ from 'lodash';
import HttpStatus from 'http-status-codes';

import { INTERNAL_SERVER_ERROR_MESSAGE } from 'server/constants';
import logger from 'server/logger';
import Account from 'server/models/Account';
import Customer from 'server/models/Customer';

export async function create(req, res) {
  const { customerId, balance } = req.body;

  // Input data check.
  if (!_.isFinite(Number(balance))) {
    res.status(HttpStatus.BAD_REQUEST).json({
      error: '`balance` has to be a number.',
    });
    return;
  }

  try {
    const exist = await Customer.doesExist(customerId);
    if (!exist) {
      res.status(HttpStatus.BAD_REQUEST).json({
        error: `Customer with \`customerId\` (${ customerId }) does not exist.`,
      });
      return;
    }
    const newAccount = await Account.forge().save({
      customerId,
      balance,
    });
    res.status(HttpStatus.OK).json(newAccount);
    return;
  } catch (err) {
    logger('error', __filename, err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(INTERNAL_SERVER_ERROR_MESSAGE);
    return;
  }
}

export async function fetchAll(req, res) {
  try {
    const allAccounts = await Account.fetchAll({
      withRelated: ['transfersSent', 'transfersReceived'],
    });
    res.status(HttpStatus.OK).json(allAccounts);
    return;
  } catch (err) {
    logger('error', __filename, err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(INTERNAL_SERVER_ERROR_MESSAGE);
    return;
  }
}

export async function fetch(req, res) {
  try {
    const { accountId } = req.params;
    const account = await Account.where({ id: accountId }).fetch({
      withRelated: ['transfersSent', 'transfersReceived'],
    });
    if (!account) {
      res.status(HttpStatus.NOT_FOUND).json({
        error: `Account with id = "${accountId}" does not exist.`,
      });
    } else {
      res.status(HttpStatus.OK).json(account);
    }
    return;
  } catch (err) {
    logger('error', __filename, err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(INTERNAL_SERVER_ERROR_MESSAGE);
    return;
  }
}
