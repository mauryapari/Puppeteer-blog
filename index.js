const http = require("http");
const fs = require("fs");
//create a server object:

let handleRequest = (req, res) => {
  res.writeHead(200, {"content-type": "text/html"});
  fs.readFile('./index.html',null, function(err, data) {
    if(err) {
      res.writeHead(404);
      res.write('File not Found');
    } else {
      res.write(data);
    }
    res.end();
  });
}

http.createServer(handleRequest).listen(8080, ()=> {
  console.log('Listening on Port ' + 8080 );
}); 
//the server object listens on port 8080