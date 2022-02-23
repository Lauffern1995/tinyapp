const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {}

//Index Page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, users_ID: req.cookies.users_ID};
  res.render("urls_index", templateVars);// rendering urls with ejs from urls_index and passing in tempVars as arg
});

//Registration page
app.get("/urls/register", (req, res) => {
  const templateVars = {  users_ID: req.cookies.users_ID };
  
  res.render(`urls_register`, templateVars);
});

app.get("/urls/login", (req, res) => {
  const templateVars = {  users_ID: req.cookies.users_ID };
  
  res.render(`urls_login`, templateVars);
});

//Create new shortURL page
app.get("/urls/new", (req, res) => {
  const templateVars = {  users_ID: req.cookies.users_ID }; //declaring cookie for each instance of a new page render
  res.render("urls_new", templateVars);
});

//Newly Generated display shortURL page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], users_ID: req.cookies.users_ID  }; // making sure to set longURL as a value to key of shortURL
  res.render("urls_show", templateVars); // showing HTML from urls_show with populated longURL from the form
});

//Hyperlink to re-direct client to original longURL landing-page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Get info from edit button on urls/
app.get("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});


app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
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
  res.clearCookie('users_ID');
  res.redirect('/urls');
});


app.post("/urls/register", (req, res) => {
  
  if (emailFinder(req.body.email, users, res)) {
    res.status(400)
    .send('Email has already been Registered');
    
  } else { 

  let newUserID = generateRandomString();
  let ID = newUserID;
  let password = req.body.password;
  let email = req.body.email;
  checkEmpty(password, email, res)
  emailFinder(email, users, res)
  users[newUserID] = { ID, email, password};
  
  if (checkEmpty(password, email, res)) {
    res.status(400)
    .send('Please enter a valid Email and Password');
  }
  
   res.cookie('users_ID', users[newUserID]);
   res.redirect('/urls');
  }

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


///////////HELPER FUNCS///////////////

const generateRandomString = function() {

  let shortURL = Math.random().toString(36).substring(2,8);
  return shortURL;

};

const checkEmpty = function (pass, email, res){
  if(!pass || !email) {
   return true
  };
  return false
};

const emailFinder = function (email, users, res) {
  for (let user in users) {
    if (email === users[user].email) {
      return true
    }
  }
  return false;
};




