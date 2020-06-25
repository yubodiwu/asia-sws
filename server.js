const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const AWS = require('aws-sdk');
const adminPwHash = require('./admin-pw-hash.json');
AWS.config.loadFromPath('./aws-config.json');
const DDB = new AWS.DynamoDB();

const app = express();

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
          res.send(data);
        }
      });
      res.status(200);
      res.send(`${serviceName} service with src ${src} and starting timestamp ${startTimestamp}`);
    } else {
      res.status(401);
      res.send(err);
    }
  });
});

app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.listen(process.env.PORT || 8080);
