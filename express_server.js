
const { urlsForUser, emailFinder, checkEmpty, generateRandomString } = require('./helpers');
const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const app = express();
app.use(morgan('tiny'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['My', 'Secret', 'Keys'],

}));
app.set("view engine", "ejs");

const urlDatabase = {};
const users = {};


app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});


//Index Page
app.get("/urls", (req, res) => {

  let userURl = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls: userURl, user: users[req.session.user_id]};
  res.render("urls_index", templateVars);// rendering urls with ejs from urls_index and passing in tempVars as arg

});

//Registration page
app.get("/urls/register", (req, res) => {
  const templateVars = {  user: users[req.session.user_id] };
  
  res.render(`urls_register`, templateVars);
});

//Login
app.get("/urls/login", (req, res) => {

  const templateVars = {  user: users[req.session.user_id] };
  
  res.render(`urls_login`, templateVars);
});

//Create new shortURL page
app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    res.status(400)
      .send('Please Log In!');
    return;
  }

  const templateVars = {  user: users[req.session.user_id] }; //declaring cookie for each instance of a new page render
  res.render("urls_new", templateVars);

});

//Newly Generated display shortURL page
app.get("/urls/:shortURL", (req, res) => {

  if (!req.session.user_id) {
    res.redirect('/urls');
  }

  const shortURL = req.params.shortURL;
  const filteredURLs = urlsForUser(req.session.user_id, urlDatabase);

  // if the short URL for the user (taken from :id) does not exist send error
  if (!filteredURLs[shortURL]) {
    res.status(401).send("The URL does not exist.");
    return;
  }

  const templateVars = { shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]  }; // making sure to set longURL as a value to key of shortURL
  res.render("urls_show", templateVars);
  // showing HTML from urls_show with populated longURL from the form
    

});

//Hyperlink to re-direct client to original longURL landing-page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Get info from edit button on urls/
app.get("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});


////////////////////POSTS//////////////////////


// Main Page
app.post("/urls", (req, res) => {

  if (!req.session.user_id) {
    res.status(401)
      .send('Please Log In!');
    return;
  }

  let shortURL = generateRandomString();
  let userID = req.session.user_id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls/${shortURL}`);
  
});

//Delete Row on Index
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');

});

//setting LOGOUT to clear cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//Register page
app.post("/urls/register", (req, res) => {
  
  if (emailFinder(req.body.email, users)) {
    res.status(400)
      .send('Email has already been Registered');
    return;
    
  }
    
  let newUserId = generateRandomString();
  let id = newUserId;
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[newUserId] = { id, email, hashedPassword};
 
  if (checkEmpty(password, email)) {
    res.status(400)
      .send('Please enter a valid Email and Password');
    return;
  }
    
  req.session.user_id = users[newUserId].id;
  res.redirect('/urls');
  
});

//Login page
app.post("/urls/login", (req, res) => {

  let password = req.body.password;
 
  let email = req.body.email;
  let userObj = emailFinder(email, users);
 
  if (userObj === false) {
    res.status(403)
      .send('Email Not Registered');
    return;
  }

  if (checkEmpty(password, email)) {
    res.status(400)
      .send('Please enter a valid Email and Password');
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
app.post("/urls/:shortURL/edit", (req, res) => {

  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);

});

//Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});






