

//+++++++++++HELPER FUNCS+++++++++++++//

//create random ID to assign to each new registered user//
const generateRandomString = function() {

  let shortURL = Math.random().toString(36).substring(2,8);
  return shortURL;

};

///Check to see if client has submitted an empty field//
const checkEmpty = function(pass, email) {
  if (!pass || !email) {
    return true;
  }
  return false;
};

//use to loop thru database to match users to email and return an obj to navigate user info//
const emailFinder = function(email, users) {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return false;
};

//use to find all tiny URLS that user has created//
const urlsForUser = function(userID, urlDatabase) {
  let newObj = {};
  for (let url in urlDatabase) {
    if (userID === urlDatabase[url].userID) {
      newObj[url] = {longURL: urlDatabase[url].longURL,
        userID: urlDatabase[url].userID};
    }
  }
  return newObj;
};



module.exports = { urlsForUser, emailFinder, checkEmpty, generateRandomString };