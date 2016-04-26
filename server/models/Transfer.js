import bookshelf from 'server/bookshelf';
import './Account';

const Transfer = bookshelf.Model.extend({
  tableName: 'Transfer',

  // ===========================================================================

  accountFrom() {
    return this.belongsTo('Account', 'accountFrom');
  },

  accountTo() {
    return this.belongsTo('Account', 'accountTo');
  },
});

export default bookshelf.model('Transfer', Transfer);
