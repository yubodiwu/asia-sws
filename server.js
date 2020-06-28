const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const AWS = require('aws-sdk');
const adminPwHash = require('./admin-pw-hash.json');
AWS.config.loadFromPath('./aws-config.json');
const DDB = new AWS.DynamoDB();
const privateKey = fs.readFileSync('/etc/letsencrypt/live/cloudflare-stream.iusmberkeley.org/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/cloudflare-stream.iusmberkeley.org/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/cloudflare-stream.iusmberkeley.org/chain.pem', 'utf8');

const app = express();

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.json());

app.get('/serviceData/:serviceName', (req, res) => {
  console.log('hit route');

  const params = {
    TableName: 'asia-sws',
    Key: {
      serviceName: { S: req.params.serviceName },
    },
  }
  DDB.getItem(params, (err, data) => {
    if (err) {
      res.status(500);
    } else {
      res.json({
        src: data.Item.src.S,
        startTimestamp: data.Item.startTimestamp.N,
      });
    }
  });
})

app.post('/admin', (req, res) => {
  const { password, serviceName, src, startTimestamp } = req.body;

  bcrypt.compare(password, adminPwHash, (err, result) => {
    if (result) {
      const params = {
        TableName: 'asia-sws',
        Item: {
          serviceName: { S: serviceName },
          src: { S: src },
          startTimestamp: { N: `${startTimestamp}` },
        },
      };
      DDB.putItem(params, (err, data) => {
        if (err) {
          res.status(500);
          res.send(err);
        } else {
          res.status(200);
          res.send(`${serviceName} service with src ${src} and starting timestamp ${startTimestamp}`);
        }
      });
    } else {
      res.status(401);
      res.send(err);
    }
  });
});

app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
  console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
