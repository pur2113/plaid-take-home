import _ from 'lodash';
import { expect } from 'chai';

import { fetchHelper } from './fetchHelper';

describe('API', () => {
  describe('Customer', () => {
    it('should return pre-populated customers', async () => {
      const [
        customer1,
        customer2,
        customer3,
        customer4,
      ] = await Promise.all([
        fetchHelper('/customers/1'),
        fetchHelper('/customers/2'),
        fetchHelper('/customers/3'),
        fetchHelper('/customers/4'),
      ]);

      expect(customer1.id).to.equal(1);
      expect(customer1.name).to.equal('Jane Woods');
      expect(customer1.accounts).to.be.empty;

      expect(customer2.id).to.equal(2);
      expect(customer2.name).to.equal('Michael Li');
      expect(customer2.accounts).to.be.empty;

      expect(customer3.id).to.equal(3);
      expect(customer3.name).to.equal('Heidi Hasselbach');
      expect(customer3.accounts).to.be.empty;

      expect(customer4.id).to.equal(4);
      expect(customer4.name).to.equal('Rahul Pour');
      expect(customer4.accounts).to.be.empty;
    });

    it('should give an error when trying to fetch non-existing customer', async () => {
      const result = await fetchHelper('/customers/999');
      expect(result.error).to.contain('does not exist');
    });

    it('should give an error if `name` is not given when creating a customer', async () => {
      const result = await fetchHelper('/customers', {
        method: 'POST',
        body: {
        },
      });
      expect(result.error).to.contain('`name` has to be a non-empty string');
    });

    it('should give an error if `name` is not a string when creating a customer', async () => {
      const result = await fetchHelper('/customers', {
        method: 'POST',
        body: {
          name: 123,
        },
      });
      expect(result.error).to.contain('`name` has to be a non-empty string');
    });

    it('should give an error if `name` is an empty string when creating a customer', async () => {
      const result = await fetchHelper('/customers', {
        method: 'POST',
        body: {
          name: '',
        },
      });
      expect(result.error).to.contain('`name` has to be a non-empty string');
    });

    it('should successfully create a customer given a valid name', async () => {
      const newCustomer = await fetchHelper('/customers', {
        method: 'POST',
        body: {
          name: 'Brian Park',
        },
      });
      expect(newCustomer.name).to.contain('Brian Park');

      const customer = await fetchHelper(`/customers/${newCustomer.id}`);
      expect(customer.name).to.contain('Brian Park');
      expect(customer.accounts).to.be.empty;
    });
  });

  describe('Account', () => {
    it('should give an error when trying to fetch non-existing account', async () => {
      const result = await fetchHelper('/accounts/999');
      expect(result.error).to.contain('does not exist');
    });

    it('should give an error when trying to create an account with no initial balance', async () => {
      const result = await fetchHelper('/accounts', {
        method: 'POST',
        body: {
        },
      });
      expect(result.error).to.contain('`balance` has to be a number');
    });

    it('should give an error when trying to create an account with non-number balance', async () => {
      const result = await fetchHelper('/accounts', {
        method: 'POST',
        body: {
          balance: 'should be number',
        },
      });
      expect(result.error).to.contain('`balance` has to be a number');
    });

    it('should give an error when trying to create an account with non-existing `customerId`', async () => {
      const result = await fetchHelper('/accounts', {
        method: 'POST',
        body: {
          balance: 2000,
          customerId: 999,
        },
      });
      expect(result.error).to.contain('does not exist');
    });

    it('should successfully create an account', async () => {
      const account = await fetchHelper('/accounts', {
        method: 'POST',
        body: {
          balance: 2000,
          customerId: 1,
        },
      });
      const customer1 = await fetchHelper('/customers/1');
      expect(customer1.accounts.length).to.equal(1);
      expect(customer1.accounts[0].customerId).to.equal(1);
      expect(customer1.accounts[0].balance).to.equal(2000);
      expect(customer1.accounts[0].id).to.equal(account.id);
    });

    it('should successfully create multiple accounts', async () => {
      const account1 = await fetchHelper('/accounts', {
        method: 'POST',
        body: {
          balance: 2000,
          customerId: 2,
        },
      });
      const account2 = await fetchHelper('/accounts', {
        method: 'POST',
        body: {
          balance: 5000,
          customerId: 2,
        },
      });
      const customer2 = await fetchHelper('/customers/2');
      expect(customer2.accounts.length).to.equal(2);
      expect(customer2.accounts[0].customerId).to.equal(2);
      expect(customer2.accounts[0].balance).to.equal(2000);
      expect(customer2.accounts[0].id).to.equal(account1.id);
      expect(customer2.accounts[1].customerId).to.equal(2);
      expect(customer2.accounts[1].balance).to.equal(5000);
      expect(customer2.accounts[1].id).to.equal(account2.id);
    });
  });

  describe('Transfer', () => {
    it('should give an error when trying to transfer if `amount` is not given', async () => {
      const result = await fetchHelper('/transfers', {
        method: 'POST',
        body: {
        },
      });
      expect(result.error).to.contain('`amount` has to be a positive number');
    });

    it('should give an error when trying to transfer if `amount` is not a number', async () => {
      const result = await fetchHelper('/transfers', {
        method: 'POST',
        body: {
          amount: 'not a number',
        },
      });
      expect(result.error).to.contain('`amount` has to be a positive number');
    });

    it('should give an error when trying to transfer if `amount` is not a positive number', async () => {
      const result = await fetchHelper('/transfers', {
        method: 'POST',
        body: {
          amount: -32,
        },
      });
      expect(result.error).to.contain('`amount` has to be a positive number');
    });

    it('should give an error when trying to transfer if `accountFrom` is missing', async () => {
      const result = await fetchHelper('/transfers', {
        method: 'POST',
        body: {
          amount: 1000,
        },
      });
      expect(result.error).to.contain('`accountFrom` and/or `accountTo` is not provided');
    });

    it('should give an error when trying to transfer if `accountTo` is missing', async () => {
      const result = await fetchHelper('/transfers', {
        method: 'POST',
        body: {
          amount: 1000,
          accountFrom: 1,
        },
      });
      expect(result.error).to.contain('`accountFrom` and/or `accountTo` is not provided');
    });

    it('should give an error when trying to transfer if `accountTo` === `accountFrom`', async () => {
      const result = await fetchHelper('/transfers', {
        method: 'POST',
        body: {
          amount: 1000,
          accountFrom: 1,
          accountTo: 1,
        },
      });
      expect(result.error).to.contain('You are not allowed to transfer from one account to the same account');
    });

    it('should give an error when trying to transfer if `accountFrom` does not exist', async () => {
      const result = await fetchHelper('/transfers', {
        method: 'POST',
        body: {
          amount: 1000,
          accountFrom: 9999,
          accountTo: 1,
        },
      });
      expect(result.error).to.contain('`accountFrom` and/or `accountTo` does not exist');
    });

    it('should give an error when trying to transfer if `accountTo` does not exist', async () => {
      const result = await fetchHelper('/transfers', {
        method: 'POST',
        body: {
          amount: 1000,
          accountFrom: 1,
          accountTo: 9999,
        },
      });
      expect(result.error).to.contain('`accountFrom` and/or `accountTo` does not exist');
    });

    it('should successfully transfer money between two accounts owned by the same customer', async () => {
      let customer = await fetchHelper('/customers/2');
      expect(customer.accounts.length).to.equal(2);

      const origAccount1Balance = customer.accounts[0].balance;
      const origAccount2Balance = customer.accounts[1].balance;

      const transfer = await fetchHelper('/transfers', {
        method: 'POST',
        body: {
          amount: 1000,
          accountFrom: customer.accounts[0].id,
          accountTo: customer.accounts[1].id,
        },
      });
      expect(transfer.accountFrom).to.equal(customer.accounts[0].id);
      expect(transfer.accountTo).to.equal(customer.accounts[1].id);
      expect(transfer.amount).to.equal(1000);

      customer = await fetchHelper('/customers/2');
      expect(customer.accounts[0].balance).to.equal(origAccount1Balance - 1000);
      expect(customer.accounts[1].balance).to.equal(origAccount2Balance + 1000);
    });

    it('should successfully transfer money between two accounts owned by the different customers', async () => {
      const customer1 = await fetchHelper('/customers/1');
      const customer2 = await fetchHelper('/customers/2');

      const transfer = await fetchHelper('/transfers', {
        method: 'POST',
        body: {
          amount: 500,
          accountFrom: customer1.accounts[0].id,
          accountTo: customer2.accounts[0].id,
        },
      });
      expect(transfer.accountFrom).to.equal(customer1.accounts[0].id);
      expect(transfer.accountTo).to.equal(customer2.accounts[0].id);
      expect(transfer.amount).to.equal(500);

      const customer1Again = await fetchHelper('/customers/1');
      const customer2Again = await fetchHelper('/customers/2');

      expect(customer1Again.accounts[0].balance).to.equal(customer1.accounts[0].balance - 500);
      expect(customer2Again.accounts[0].balance).to.equal(customer2.accounts[0].balance + 500);
    });

    it('should fail to transfer if the amount is larger than the sender\'s account balance', async () => {
      const customer1 = await fetchHelper('/customers/1');
      const customer2 = await fetchHelper('/customers/2');

      const transfer = await fetchHelper('/transfers', {
        method: 'POST',
        body: {
          amount: 2000,
          accountFrom: customer1.accounts[0].id,
          accountTo: customer2.accounts[0].id,
        },
      });
      expect(transfer.error).to.contain('Not enough balance on the sender');

      // Balance shouldn't have changed.
      const customer1Again = await fetchHelper('/customers/1');
      const customer2Again = await fetchHelper('/customers/2');
      expect(customer1Again.accounts[0].balance).to.equal(customer1.accounts[0].balance);
      expect(customer2Again.accounts[0].balance).to.equal(customer2.accounts[0].balance);
    });

    it('should retrieve the balance and transfer history of a given account', async () => {
      // Initially we had:
      // Account 1 (belong to Customer 1): $2,000
      // Account 2 (belong to Customer 2): $2,000
      // Account 3 (belong to Customer 2): $5,000
      //
      // From the above test cases, we have so far transferred:
      // Account 2 -> Account 3: $1,000
      // Account 1 -> Account 2: $500
      //
      // So we should expect:
      // Account 1 (belong to Customer 1): $1,500
      // Account 2 (belong to Customer 2): $1,500
      // Account 3 (belong to Customer 2): $6,000
      const account2 = await fetchHelper(`/accounts/2`);
      expect(account2.transfers.length).to.equal(2);
      expect(account2.transfers[0].accountFrom).to.equal(2);
      expect(account2.transfers[0].accountTo).to.equal(3);
      expect(account2.transfers[1].accountFrom).to.equal(1);
      expect(account2.transfers[1].accountTo).to.equal(2);
      expect(account2.balance).to.equal(1500);
    });
  });
});
