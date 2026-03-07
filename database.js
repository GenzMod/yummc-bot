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

getMarriage(userId){
const data = load();
return data.marriages[userId];
},

marry(user1,user2){
const data = load();

data.marriages[user1] = {
partner:user2,
time:Date.now()
}

data.marriages[user2] = {
partner:user1,
time:Date.now()
}

save(data)
},

divorce(user){
const data = load();

const partner = data.marriages[user]?.partner

if(partner){
delete data.marriages[user]
delete data.marriages[partner]
}

save(data)
},

getAll(){
return load().marriages
}

}
