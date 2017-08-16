var express = require("express"); //create express
var app = express(); //initialization
var bodyParser = require("body-parser"); //get parameter from our POST request
var morgan = require("morgan"); //log request to the console
var mongoose = require("mongoose"); //interact with our MongoDB database

var jwt = require("jsonwebtoken"); //used to create, sign, and verify token
var config = require("./config"); //get our config file
var User = require("./app/model/user"); //get out mongoose model

var cors = require('cors');


//configuration
var port = process.env.PORT || 8080; //set port
mongoose.connect(config.database); //connect to database
app.set('superSecret', config.secret); //secret variable

//use body parser and we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use(cors());

//routes
app.get('/', function(req, res){
    res.send('Hello, the API is at http://localhost:'+ port +'/api');
});

app.get('/setup', function(req, res) {

  // create a sample user
  var nick = new User({ 
    email: 'rakamaheka@gmail.com', 
    password: 'mumumumu',
    admin: true 
  });

  // save the sample user
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

// API ROUTES -------------------

// get an instance of the router for api routes
var apiRoutes = express.Router(); 

// TODO: route to authenticate a user (POST http://localhost:8080/api/authenticate)

// TODO: route middleware to verify a token

apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });

  }
});

// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});   

apiRoutes.get('/user/:id', function(req, res) {
  User.findById({_id:req.params.id}, function(err, users) {
    res.json(users);
  });
});   


apiRoutes.delete('/delete/:id', function(req, res){
    
    User.findByIdAndRemove({_id :req.params.id}, function(err,data){
        if(err){
            res.send(err);
        }
        res.json({ message: 'Successfully deleted' });
    });     
});


// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);






var authRoutes = express.Router(); 

authRoutes.post('/', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn : 60*60*24 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }   

    }

  });
});

app.use('/authentication', authRoutes);

//start the server
app.listen(port);
console.log("Magic Happens at http://localhost:"+port);

