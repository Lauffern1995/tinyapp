
const { urlsForUser, emailFinder, checkEmpty, generateRandomString } = require('./helpers');
const express = require('express');
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const app = express();
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['My', 'Secret', 'Keys'],

}));
app.set('view engine', 'ejs');

const urlDatabase = {};
const users = {};


//Home page
app.get('/', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});


//Index Page
app.get('/urls', (req, res) => {

  const userURl = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls: userURl, user: users[req.session.user_id]};
  res.render('urls_index', templateVars);// rendering urls with ejs from urls_index and passing in tempVars as arg

});

//Registration page
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }

  const templateVars = {  user: users[req.session.user_id] };
  res.render(`urls_register`, templateVars);

});

//Login
app.get('/login', (req, res) => {
  console.log('check if im logged in', req.session.user_id);
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  console.log('im logged in');
  const templateVars = {  user: users[req.session.user_id] };
  
  res.render(`urls_login`, templateVars);
});

//Create new shortURL page
app.get('/urls/new', (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect('/login');
    return;
  }

  const templateVars = {  user: users[req.session.user_id] }; //declaring cookie for each instance of a new page render
  res.render('urls_new', templateVars);

});

//Newly Generated display shortURL page
app.get('/urls/:shortURL', (req, res) => {

  if (!req.session.user_id) {
    res.status(400).send("Please <a href='/login'>Log In!</a> to continue.");
    return;
  }

  const shortURL = req.params.shortURL;
  const filteredURLs = urlsForUser(req.session.user_id, urlDatabase);

  // if the short URL for the user (taken from :id) does not exist send error
  if (!filteredURLs[shortURL]) {
    res.status(401).send('You do not have permission to access this url. Please return to your <a href="/urls">Homepage!</a>');
    return;
  }

  const templateVars = { shortURL: shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]  }; // making sure to set longURL as a value to key of shortURL
  res.render('urls_show', templateVars);
  // showing HTML from urls_show with populated longURL from the form
    
});

//Hyperlink to re-direct client to original longURL landing-page
app.get('/u/:shortURL', (req, res) => {

  if (!urlDatabase[req.params.shortURL]) {

    res.status(404).send('The URL does not exist. Please return to your <a href="/urls">Homepage!</a>');
    return;
  
  }
  
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Get info from edit button on urls/
app.get('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});


////////////////////POSTS//////////////////////


// Main Page
app.post('/urls', (req, res) => {

  if (!req.session.user_id) {
    res.status(401)
      .send('Please Log In!');
    return;
  }

  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls/${shortURL}`);
  
});

//Delete Row on Index
app.post('/urls/:shortURL/delete', (req, res) => {

  if (!req.session.user_id) {
    return res.status(400)
      .send('Permission denied. Try <a href="/login">Logging In</a>, or <a href="/register">Registering.</a>');
  }
  
  if (!urlsForUser(req.session.user_id, users)) {
    return res.status(400)
      .send('Permission denied. You do not have access to this URL');
    
  }
  
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');


});

//setting LOGOUT to clear cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//Register page
app.post('/register', (req, res) => {
  
  ///mentor notes to check before setting any user propreties
  if (checkEmpty(req.body.password, req.body.email)) {
    res.status(400)
      .send('Please enter a valid Email and Password Try <a href="/register">Again.</a>');
    return;
  }
  
  if (emailFinder(req.body.email, users)) {
    res.status(400)
      .send('Email has already been Registered! Try <a href="/login">Logging In.</a>');
    return;
    
  }
  const newUserId = generateRandomString();
  const id = newUserId;
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[newUserId] = { id, email, hashedPassword};
  
  
  req.session.user_id = users[newUserId].id;
  res.redirect('/urls');
  
});

//Login page
app.post('/login', (req, res) => {

  const password = req.body.password;
  const email = req.body.email;
  const userObj = emailFinder(email, users);
 
  if (checkEmpty(password, email)) {
    res.status(400)
      .send('Please enter a valid Email and Password. Try <a href="/login">Again.</a>');
    return;
  }

  if (userObj === false) {
    res.status(403)
      .send('Email Not Registered. Try <a href="/register">Registering.</a>');
    return;
  }

  
  if (bcrypt.compareSync(password, userObj.hashedPassword)) {
    req.session.user_id = userObj.id;
    res.redirect('/urls');
    return;
  }

  res.status(403)
    .send('Incorrect Password');
    

});

//Edit URLS button return
app.post('/urls/:shortURL/edit', (req, res) => {

  if (!req.session.user_id) {
    return res.status(400)
      .send('Permission denied. Try <a href="/login">Logging In</a>, or <a href="/register">Registering.</a>');
  }
  if (!urlsForUser(req.session.user_id, users)) {
    return res.status(400)
      .send('Permission denied. You do not have access to this URL.');
  
  }
  
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
  return;
  
});

//Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});