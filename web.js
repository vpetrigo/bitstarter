var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs')

app.set('views', path.join(__dirname, 'views');
app.use(express.logger());

app.get('/', function(request, response) {
    var buf = fs.readFileSync('views' + 'index.html');
    var string = buf.toString('utf8', 0, buf);
    response.send(string);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
