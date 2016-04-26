import fetch from 'isomorphic-fetch';

import plaidConfig from 'plaid.config';

export function fetchHelper(endPoint, {
  method = 'GET',
  headers = {},
  body = null,
} = {}) {
  const data = {
    method,
    headers: {
      ...headers,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    data.body = JSON.stringify(body);
  }
  return fetch(`http://localhost:${plaidConfig.server.port}${endPoint}`, data)
      .then(response => response.json());
}
