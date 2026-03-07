const fs = require("fs");

const FILE = "./userdata.json";

function load() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({ marriages: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {

  getMarriage(userId) {
    const data = load();
    return data.marriages[userId];
  },

  marry(user1, user2) {
    const data = load();

    data.marriages[user1] = user2;
    data.marriages[user2] = user1;

    save(data);
  },

  divorce(userId) {
    const data = load();
    const partner = data.marriages[userId];

    if (partner) {
      delete data.marriages[userId];
      delete data.marriages[partner];
    }

    save(data);
  }

};
