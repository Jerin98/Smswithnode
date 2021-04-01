const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');

//init app

const app= express();
// Init Nexmo
const nexmo = new Nexmo({
  apiKey: '639cc77c',
  apiSecret: 'ZOlrtJg7jmJ4xGT1'
}, { debug: true });

//middleware
// Template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// Public folder setup
app.use(express.static(__dirname + '/public'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//index route
app.get('/', (req, res) => {
    res.render('index');
  });

  app.post('/', (req, res) => {
    const { number, text } = req.body;
  
    nexmo.message.sendSms(
      '12034848525', number, text, { type: 'unicode' },
      (err, responseData) => {
        if(err) {
          console.log(err);
        } else {
          const { messages } = responseData;
          const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
          console.dir(responseData);
          // Get data from response
          const data = {
            id,
            number,
            error
          };
  
          // Emit to the client
          io.emit('smsStatus', data);
        }
      }
    );
  });

//port
const port =3000;
//start server

const server = app.listen(port, () => console.log(`Server started on port ${port}`));

// Connect to socket.io
const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Connected');
  io.on('disconnect', () => {
    console.log('Disconnected');
  })
});