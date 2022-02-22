const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Index Page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username};
  res.render("urls_index", templateVars);
});

//Create new shortURL page
app.get("/urls/new", (req, res) => {
  const templateVars = {  username: req.cookies.username};
  res.render("urls_new", templateVars);
});

//Newly Generated display shortURL page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies.username  }; // making sure to set longURL as a value to key of shortURL
  res.render("urls_show", templateVars); // showing HTML from urls_show with populated longURL from the form
});

//Hyperlink to re-direct client to original longURL landing-page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
  
});

//Delete Row 
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect(`/urls`);
  
});

//Get info from edit button on urls/
app.get("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

//Edit Row
app.post("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls`);
});

//Setting Username Cookies
app.post("/login", (req, res) => {
  const username = req.body.username
  res.cookie('username', username); 
  res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {

  let shortURL = Math.random().toString(36).substring(2,8);
  return shortURL;

};

