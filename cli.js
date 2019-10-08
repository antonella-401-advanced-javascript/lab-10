const request = require('superagent');

request('http://localhost:3000/api/cats')
  .then(({ body }) => console.log(body));