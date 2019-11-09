const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const staticAsset = require('static-asset');
const mongoose = require('mongoose');
const config = require('./config');
const routes =require('./routes');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
//database
mongoose.Promise =global.Promise;
mongoose.set('debug',config.IS_PRODUCTION);
mongoose.connection
.on('error', error => console.log(error))
.on('close',()=>console.log('Database connection closed.'))
.once('open', () => {
    const info = mongoose.connections[0];
    console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
  // require('./mocks')();
});
mongoose.connect(config.MONGO_URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then().catch(err=>{
    console.log(err)
});


//express
const app = express();

//session 
app.use(session({
    secret: config.SESSION_SECRET,
    resave:true,
    saveUninitialized: false,
    store:new MongoStore({
        mongooseConnection: mongoose.connection
    })
}))
//sets and uses middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));// extract body request for middleware
app.use(bodyParser.json());// translate response from client to server
app.use(staticAsset(path.join(__dirname,'public')));//sets hash to url for static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads',express.static(path.join(__dirname, config.DESTINATION)));

app.use('/javascripts',express.static(path.join(__dirname,'node_modules','jquery', 'dist')));


//routes
app.use('/', routes.archive);
app.use('/api/auth', routes.auth);
app.use('/post', routes.post);
app.use('/comment', routes.comment);
app.use('/upload',routes.upload);

// app.get('/', (req, res) =>{
//    const id = req.session.userId;
//    const login = req.session.userLogin;
// res.render('index',{ user:{ id, login}})
// });




 //catch 404 and forward to error handler
 app.use((req,res,next)=>{
     const err = new Error('Not Found');
     err.status = 404;
     next(err);
 })
 //error handler
 // eslint-disable-next-line no-unused-vars
 app.use((error,req,res,next)=>{
     res.status(error.status || 500);
     res.render('error',{
         message:error.message,
         error: !config.IS_PRODUCTION ? error :{},
         title:'Oops...'
     });
 })

app.listen(config.PORT,()=> console.log(`Example app listening on port ${config.PORT}!`));
