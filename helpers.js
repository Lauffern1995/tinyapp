

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