const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {};

const users = {};

//Index Page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id]};
  res.render("urls_index", templateVars);// rendering urls with ejs from urls_index and passing in tempVars as arg
});

//Registration page
app.get("/urls/register", (req, res) => {
  const templateVars = {  user: users[req.cookies.user_id] };
  
  res.render(`urls_register`, templateVars);
});

//Login
app.get("/urls/login", (req, res) => {
  const templateVars = {  user: users[req.cookies.user_id] };
  
  res.render(`urls_login`, templateVars);
});

//Create new shortURL page
app.get("/urls/new", (req, res) => {
  if (!users[req.cookies.user_id]) {
    res.status(400)
      .send('Please Log In!');
  }
  const templateVars = {  user: users[req.cookies.user_id] }; //declaring cookie for each instance of a new page render
  res.render("urls_new", templateVars);
});

//Newly Generated display shortURL page
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400)
      .send('Cannot Find URL!');
  }
  console.log(urlDatabase);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies.user_id]  }; // making sure to set longURL as a value to key of shortURL
  res.render("urls_show", templateVars); // showing HTML from urls_show with populated longURL from the form
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

  if (!req.cookies.user_id) {
    res.status(401)
      .send('Please Log In!');
    return;
  }
  let shortURL = generateRandomString();
  let userID = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID };


  res.redirect(`/urls/${shortURL}`);
  
});

//Delete Row on Index
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//setting LOGOUT to clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//Register page
app.post("/urls/register", (req, res) => {
  
  if (emailFinder(req.body.email, users)) {
    res.status(400)
      .send('Email has already been Registered');
    
  } else {
    
    let newUserId = generateRandomString();
    let id = newUserId;
    let password = req.body.password;
    let email = req.body.email;
  
    users[newUserId] = { id, email, password};
    
    if (checkEmpty(password, email)) {
      res.status(400)
        .send('Please enter a valid Email and Password');
    }
    
    res.cookie('user_id', users[newUserId].id);
    res.redirect('/urls');
  }
  
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

  if (userObj.password === password) {
    res.cookie('user_id', userObj.id);
    res.redirect('/urls');
  } else {
    res.status(403)
      .send('Incorrect Password');
    
  }

});

//Edit URLS button return
app.post("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);

});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


///////////HELPER FUNCS///////////////

const generateRandomString = function() {

  let shortURL = Math.random().toString(36).substring(2,8);
  return shortURL;

};

const checkEmpty = function(pass, email) {
  if (!pass || !email) {
    return true;
  }
  return false;
};

const emailFinder = function(email, users) {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return false;
};




