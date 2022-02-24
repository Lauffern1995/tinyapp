const { assert } = require('chai');
const { emailFinder } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = emailFinder("user@example.com", testUsers).id
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user, expectedUserID)
  });

  it('should return undefined if email is not in Database', function() {
    const user = emailFinder("bob@syouruncle.ca", testUsers).id
    const expectedUserID = undefined;
    // Write your assert statement here
    assert.isUndefined(user, expectedUserID)
  });

});