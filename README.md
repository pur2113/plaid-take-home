# API
This API is a REST API. JSON is returned by all responses (including errors). To see some usages of the API, refer to this doc or the test cases under `test/` directory.

API endpoint
```
http://104.236.191.170/
```

## Errors
If the API call results in an error, it will return a JSON of the following format:
```json
{
  "error": "some error message"
}
```

## Core Resources
### Customers
#### Create a Customer
You can create a customer object by providing `name` field in a POST request.

##### Definition
```
POST http://104.236.191.170/customers
```

##### Arguments
- `name` (required): Non-empty string

##### Example Request
```bash
$ curl http://104.236.191.170/customers \
    -d name="Brian Park"
```

##### Example Response
```json
{
  "name":"Brian Park",
  "id":5
}
```

##### Returns
Returns the created customer object if the call succeeded. The returned object will have `name` and `id` fields. If invalid `name` was provided when calling the API (e.g. no `name`, no string, empty string), the call will return an error with an appropriate message.

#### Retrieve a Customer
You can retrieve the details of an existing customer. It will give the customer's accounts information, including each account's transfer history.

##### Definition
```
GET http://104.236.191.170/customers/:customerId
```

##### Example Request
```bash
$ curl http://104.236.191.170/customers/1
```

##### Example Response
```json
{
  "id": 1,
  "name": "Jane Woods",
  "createdAt": "2016-04-25T23:52:57.000Z",
  "updatedAt": "2016-04-25T23:52:57.000Z",
  "accounts": [
    {
      "id": 1,
      "customerId": 1,
      "balance": 2000,
      "createdAt": "2016-04-26T00:10:00.000Z",
      "updatedAt": "2016-04-26T00:10:54.000Z",
      "transfers": [
        {
          "id": 1,
          "accountFrom": 1,
          "accountTo": 2,
          "amount": 1000,
          "createdAt": "2016-04-26T00:10:54.000Z"
        }
      ]
    },
    {
      "id": 2,
      "customerId": 1,
      "balance": 6000,
      "createdAt": "2016-04-26T00:10:13.000Z",
      "updatedAt": "2016-04-26T00:10:54.000Z",
      "transfers": [
        {
          "id": 1,
          "accountFrom": 1,
          "accountTo": 2,
          "amount": 1000,
          "createdAt": "2016-04-26T00:10:54.000Z"
        }
      ]
    }
  ]
}
```

##### Returns
Returns the detailed information of the existing customer. If the customer has accounts and transfer history, it will nest those records in the response. If you call the API with a non-existing customer id, it will return an error with an appropriate message.

### Account
#### Create an Account
You can create an account for the existing customer by providing the valid `customerId` and the initial `balance` in a POST request.

##### Definition
```
POST http://104.236.191.170/accounts
```

##### Arguments
- `customerId` (required): Valid customer id
- `balance` (required): Positive number

##### Example Request
```bash
$ curl http://104.236.191.170/accounts \
    -d customerId=5
    -d balance=5000
```

##### Example Response
```json
{
  "id": 4,
  "customerId": "5",
  "balance": 5000,
  "transfers": []
}
```

##### Returns
Returns the created account for the given customer if the call succeeded. The returned object will have `id` (account id), `customerId`, `balance` and `transfers` (empty since the account is just created). If invalid `customerId` or `balance` was provided when calling the API (e.g. no `customerId`, non-existing `customerId`, no `balance`, non-number `balance`, etc.), the call will return an error with an appropriate message.

#### Retrieve an Account
You can retrieve the details of an existing account using a GET request.

##### Definition
```
GET http://104.236.191.170/accounts/:accountId
```

##### Example Request
```bash
$ curl http://104.236.191.170/accounts/1
```

##### Example Response
```json
{
  "id": 1,
  "customerId": 1,
  "balance": 2000,
  "createdAt": "2016-04-26T00:10:00.000Z",
  "updatedAt": "2016-04-26T00:10:54.000Z",
  "transfers": [
    {
      "id": 1,
      "accountFrom": 1,
      "accountTo": 2,
      "amount": 1000,
      "createdAt": "2016-04-26T00:10:54.000Z"
    }
  ]
}
```

##### Returns
Returns the detailed information of the existing account. If the account has transfer history, it will nest that information in the response. If you call the API with a non-existing account id, it will return an error with an appropriate message.

### Transfer
#### Create a Transfer
You can transfer money from one account to another (regardless of the customer) by creating a POST request. If the sending account (corresponding to `accountFrom`) has less `balance` than the `amount` it's trying to transfer, the transfer will fail. The transfer occurs in a transaction so if money is deducted from the sending account (`accountFrom`), then you can be assured that it is added to the receiving account (`accountTo`).

##### Definition
```
POST http://104.236.191.170/transfers
```

##### Arguments
- `accountFrom` (required): Valid account id (not the same id as `accountTo`)
- `accountTo` (required): Valid account id (not the same id as `accountFrom`)
- `amount` (required): Positive number

##### Example Request
```bash
$ curl http://104.236.191.170/transfers \
    -d accountFrom=1
    -d accountTo=3
    -d amount=1000
```

##### Example Response
```json
{
  "accountFrom": "1",
  "accountTo": "3",
  "amount": 1000,
  "id": 2
}
```

##### Returns
Returns the created transfer object if the API call succeeded. If the wrong account ids (`accountFrom`, `accountTo`) and/or `amount` are given, it will return an error with an appropriate message.

