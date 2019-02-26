const express = require('express');
const https = require('https');
const path = require('path');
const http = require('http');
const fs = require('fs');
const compression = require('compression');
const expressEnforcesSSL = require('express-enforces-ssl');

const app = express();

const isProd = process.env.state === 'production';
const port = isProd ? 443 : 3000;

console.info(`[info] server selected port :${port}.`);

// error handling;
function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.render('error', { error: err });
}

if (isProd) {
  // force https;
  app.enable('trust proxy');
  app.use(expressEnforcesSSL());

  // listen 80;
  http.createServer(app).listen(80);
}

// gzip compress;
app.use(compression());

// set static folder;
app.use(express.static(path.resolve(__dirname, '../..', 'public')));

// set error handler;
app.use(errorHandler);


app.listen = function(port) {
  let server = null;

  if (isProd) {
    server = https.createServer({
      ca: fs.readFileSync('/etc/pki/tls/certs/ca_bundle.crt'),
      key: fs.readFileSync('/etc/pki/tls/private/private.key'),
      cert: fs.readFileSync('/etc/pki/tls/certs/certificate.crt')
    }, this);
  } else {
    server = http.createServer(this);
  }  
  return server.listen.apply(server, [port]);
};

app.listen(port);
