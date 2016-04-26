import bookshelf from 'server/bookshelf';
import './Account';

const Customer = bookshelf.Model.extend({
  tableName: 'Customer',

  // ===========================================================================

  accounts() {
    return this.hasMany('Account', 'customerId');
  },
});

Customer.doesExist = async function (id) {
  const customer = await Customer.where({ id }).fetch();
  return !!customer;
};

export default bookshelf.model('Customer', Customer);
