const http = require('http');
const request = require('superagent');


http.createServer((req, res) => {
  
  request('http://localhost:3000/api/cats')
    .pipe(res);

}).listen(3003);