const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://vicky4830:vicky111@cluster0.lmsnl7w.mongodb.net/mydb', { useNewUrlParser: true, useUnifiedTopology: true });

const mqtt = require('mqtt');
const express = require('express');
const bodyParser = require('body-parser');
const Logindata = require('./models/device1');

const app = express();
app.use(express.static('public'));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const port = 5003;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const brokerUrl = 'mqtt://localhost:1884';
const topic = 'sensor_data'
const dandt = 'date'
const loadcell = 'loadcelldata'

const client = mqtt.connect(brokerUrl);

app.get('/send-data/sensor-data', (req, res) => {
  Logindata.find()
    .then(data => {
      res.send(data);
    })
});

a = 0;
b = 0;
c = 0;
d = 0;

app.post('/send-data/sensor-data', async (req, res) => {
  const { username, password } = req.body;
  c = username;
  d = password;

  client.on('message', function (topic, message) {
    // console.log('Received message on topic', topic, ' ', message.toString());

    if (topic === 'sensor_data') {
      data = message;

    } else if (topic === 'date') {
      a = message;
    }
    else if (topic == 'loadcelldata') {
      b = message;
    }

    if (data && a && b) {
      const NewDevice = new Logindata({
        username: c,
        password: d,
        data: data,
        date: a,
        loadcelldata: b
      })
      NewDevice.save()
    }
  })
})

// app.get('/send-data/logindata', (req, res) => {
//   Logindata.find()
//     .then((userdata) => {
//       res.send(userdata);
//     })
// });

client.on('connect', function () {
  console.log('Connected to MQTT broker');

  client.subscribe(topic, function (err) {
    if (err) {
      console.error('Failed to subscribe to topic', err);
    } else {
      console.log('Subscribed to topic', topic);
    }
  });

  client.subscribe(dandt, function (err) {
    if (err) {
      console.error('Failed to subscribe to dandt', err);
    } else {
      console.log('Subscribed to topic', dandt);
    }
  });

  client.subscribe(loadcell, function (err) {
    if (err) {
      console.error('Failed to subscribe to loadcelldata', err);
    } else {
      console.log('Subscribed to topic', loadcell);
    }
  });
});

a = 0;
b = 0;
c = 0;
d = 0;

// client.on('message', function (topic, message) {
//   // console.log('Received message on topic', topic, ' ', message.toString());

//   if (topic === 'sensor_data') {
//     data = message;

//   } else if (topic === 'date') {
//     a = message;
//   }
//   else if (topic == 'loadcelldata') {
//     b = message;
//   }

//   fetch('http://localhost:5003/send-data/sensor-data')
//     .then(response => response.json())
//     .then(userdata => {
//       c = userdata.username;
//       d = userdata.password;

//       if (data && a && b) {
//         const NewDevice = new Logindata({
//           username: userdata.username,
//           password: userdata.password,
//           data: data,
//           date: a,
//           loadcelldata: b
//         })
//         NewDevice.save()
//       }
//     })
// })

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});