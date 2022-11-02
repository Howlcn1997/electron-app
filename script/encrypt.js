// generate a hash from string
const crypto = require('crypto');
const text = 'hello bob';
const key = 'mysecret key';

// create hash
const hash = crypto.createHmac('sha512', key);
hash.update(text);
const value = hash.digest('hex');

// print result
console.log(value);
