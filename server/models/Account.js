import _ from 'lodash';

import bookshelf from 'server/bookshelf';
import './Customer';
import Transfer from './Transfer';

const Account = bookshelf.Model.extend({
  tableName: 'Account',

  serialize(...args) {
    const obj = bookshelf.Model.prototype.serialize.call(this, ...args);
    // TODO: Use custom implementation of merge rather than _.sortBy().
    obj.transfers = _.sortBy([
      ...obj.transfersSent || [],
      ...obj.transfersReceived || [],
    ], 'createdAt');
    delete obj.transfersSent;
    delete obj.transfersReceived;
    return obj;
  },

  // ===========================================================================

  customer() {
    return this.belongsTo('Customer', 'customerId');
  },

  transfersSent() {
    return this.hasMany('Transfer', 'accountFrom');
  },

  transfersReceived() {
    return this.hasMany('Transfer', 'accountTo');
  },
});

Account.doesExist = async function (id) {
  const account = await Account.where({ id }).fetch();
  return !!account;
};

export default bookshelf.model('Account', Account);
