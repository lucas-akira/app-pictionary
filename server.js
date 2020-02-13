// Database initialization
/********************************************/
// Modify these as necessary
var dbName = process.argv[2];
var dbUsername = process.argv[3];
var dbPassword = process.argv[4];
var dbAddress = 'localhost';
var dbPort = 3306;
if (process.argv.length >= 6) {
  dbAddress = process.argv[5];
}

if (process.argv.length >= 7) {
  dbPort = process.argv[7];
}

const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbName, dbUsername,dbPassword, {
  host: dbAddress,
  port: dbPort,
  dialect: 'mysql'
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// The table name is automatically pluralized by default
// so the table name will be 'users' and not 'user'
const User = sequelize.define('user', {
  // attributes
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  adm: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
}, {
  // options
});

const Host = sequelize.define('host', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  code: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
},{});

const Room = sequelize.define('room', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: false
  },
  max_players: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  finished: {
    type: Sequelize.BOOLEAN
  }
},{});

const Word = sequelize.define('word', {
  word: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  }
}, {});

// Table associations
Room.belongsTo(Host, {foreignKey: 'hostId'});
Room.belongsToMany(User,{through: 'players_in_rooms', foreignKey: 'roomId'});
//User.belongsToMany(Room,{through: 'players_in_rooms', foreignKey: 'playerId'});


function synchronizeDB() {
  // Note: using `force: true` will drop the table(s) if it already exists
  sequelize.sync({ force: false })
  .then(() => {
    console.log('tables synchronized successfully');
  })
  .catch(err => {
    console.error('Unable to synchronize tables:', err);
  });
}
synchronizeDB();

/********************************************/

// Server initialization
/********************************************/
function checkAdminPassword(hash) {
  return (hash == -1863547747);
}

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var g_code = 0;
var g_dataToRoom = false;
var g_numberOfTries = 0;

app.set('view engine', 'ejs');
app.use(bodyParser.json({ extended: true }));

app.get('/', function (req, res) {
  app.use(express.static('front/images'))
  app.use(express.static('front/scripts'))
  app.use(express.static('front/styles'))
  res.render('index')
});

app.post('/room', function (req, res) {
  var randWord = '';
  // Retrieve room object
  Room.findOne({ where: { id: req.body.roomId }})
    .then(room => {
      // Add user to room
      room.addUser(req.body.user.id);

      Host.findOne({where: {id: room.hostId }})
        .then(host => {
          // Verify if user is the host
          if (host.name == req.body.user.name) {
            // Save host "user id" as code
            host.code = req.body.user.id;
            g_code = host.code;
            host.save().then(() => {});

            // Set random word
            Word.findAll().then(words => {
              randWord = words[Math.floor(Math.random() * words.length)];
              g_dataToRoom = {currentUser: req.body.user, roomId: req.body.roomId, host: host, chosenWord: randWord.word};
              //res.redirect('/room/' + g_code);
            });
          } else {
            g_code = host.code;
            g_dataToRoom = {currentUser: req.body.user, roomId: req.body.roomId, host: host, chosenWord: 'N/A'}; // Contains obj user and roomId
          }
          res.redirect('/room/' + g_code);
        });
    });
});

app.get('/room/:g_code', function(req, res){
    /* if nom exists in database -> return ejs template with vars */
    /* else return 404 */
    app.use(express.static('front/images'))
    app.use(express.static('front/scripts'))
    app.use(express.static('front/styles'))
    //console.log('oi');
    if (g_dataToRoom === false) {
      // Don't allow in site if not logged in
      res.status(401).send("You have to login first!");
      return;
    }
    res.render('room', g_dataToRoom);
    g_numberOfTries++;
    if (g_numberOfTries >= 2 ){
      g_dataToRoom = false;
      g_numberOfTries = 0;
    }

});

app.get('/db-users', function (req, res) {
  // Find all users
  User.findAll().then(users => {
    res.json(users);
  });

});

app.post('/login', function(req, res) {
  User.findAll({
    where: {
      name: req.body.username
    }
  }).then(searchResult => {
    let resultIsEmpty = (searchResult.length == 0);

    if (resultIsEmpty) {
      if (req.body.isAdm && !checkAdminPassword(req.body.admPassword)) {
        res.json({ created: false, data:{}, valid: false });
        return;
      }
      // Create a new entry in the database
      User.create({ name: req.body.username, adm: req.body.isAdm }).then(newUser => {
        console.log('Created a new user: ', newUser.name);
        //synchronizeDB();
        // Return response
        res.json({ created: true, data: newUser, valid: true });
      });
    } else {
      if (searchResult[0].adm && !checkAdminPassword(req.body.admPassword)) {
        res.json({ created: false, data:{}, valid: false });
        return;
      }
      // Return response
      console.log('Retrieved user: ', searchResult[0].name);
      res.json({ created: false, data: searchResult[0], valid: true });
    }
  });

});

app.post('/create-room', function(req, res) {
  Host.create({name: req.body.hostName})
    .then(newHost => {
      console.log('Created a new host named', newHost.name);
      //synchronizeDB();

      Room.create({ name: req.body.roomName, hostId: newHost.id, max_players: req.body.maxNumPlayers, finished: false })
        .then(newRoom => {
          console.log('Created a new room named ', newRoom.name);
          // Return response
          res.json({created: true, roomId: newRoom.id});
        });

    });
});

app.post('/add-word', function(req, res) {
  Word.create({word: req.body.wordName})
    .then(newWord => {
      console.log('Created a new word:', newWord.word);
    })
});

app.get('/db-available-rooms', function (req, res) {
  // Find all users
  Room.findAll({
    include: [
      {model: User, through: {attributes: ['playerId', 'roomId']}},
      {model: Host, attributes: ['name']}
    ],
    where: {
      finished: false
    }
  }).then(rooms => {
    //console.log(rooms);
    res.json(rooms);
  });

});

function onConnection(socket){
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
  socket.on('chat message', function(msg){
    //console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function(reason){

    console.log('user disconnected: ' + reason);
  });
}

io.on('connection', onConnection);

http.listen(3000, function () {
  console.log('App listening on port 3000!')
});

// //When a user submits a form, create a new page
// app.post('/submit', urlencodedParser, function(req, res){
//     var nom = req.body.nom;
//     /* save nom to database */
//     res.redirect('http://myDomain/' + nom);
// });
//
// app.get('/:nom', function(req, res){
//     /* if nom exists in database -> return ejs template with vars */
//     /* else return 404 */
// });
