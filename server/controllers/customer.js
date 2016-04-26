import _ from 'lodash';
import HttpStatus from 'http-status-codes';

import { INTERNAL_SERVER_ERROR_MESSAGE } from 'server/constants';
import logger from 'server/logger';
import Customer from 'server/models/Customer';

export async function create(req, res) {
  const { name } = req.body;

  // Input data check.
  if (!_.isString(name) || _.isEmpty(name)) {
    res.status(HttpStatus.BAD_REQUEST).json({
      error: '`name` has to be a non-empty string.',
    });
    return;
  }

  try {
    const newCustomer = await Customer.forge().save({
      name,
    });
    res.status(HttpStatus.OK).json(newCustomer);
    return;
  } catch (err) {
    logger('error', __filename, err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(INTERNAL_SERVER_ERROR_MESSAGE);
    return;
  }
}

export async function fetchAll(req, res) {
  try {
    const allCustomers = await Customer.fetchAll({
      withRelated: ['accounts'],
    });
    res.status(HttpStatus.OK).json(allCustomers);
    return;
  } catch (err) {
    logger('error', __filename, err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(INTERNAL_SERVER_ERROR_MESSAGE);
    return;
  }
}

export async function fetch(req, res) {
  try {
    const { customerId } = req.params;
    const customer = await Customer.where({ id: customerId }).fetch({
      withRelated: ['accounts', 'accounts.transfersSent', 'accounts.transfersReceived'],
    });
    if (!customer) {
      res.status(HttpStatus.NOT_FOUND).json({
        error: `Customer with id = "${customerId}" does not exist.`,
      });
    } else {
      res.status(HttpStatus.OK).json(customer);
    }
    return;
  } catch (err) {
    logger('error', __filename, err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(INTERNAL_SERVER_ERROR_MESSAGE);
    return;
  }
}
