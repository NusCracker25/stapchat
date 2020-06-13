// simple implementation of users eveything is kept in memory here
// later on connection to user db will come here
const users =[];

const config = require('../config/config');

//user joins a specific room
function userJoin(id, username , room){
    if(username === null){
        username = config.chatBot.DEFAULT_USER; 
    }
    if(room === null){
        room = config.chatBot.DEFAULT_ROOM;
    }
    const user = {id, username, room};
    users.push(user);
    return user;
}

/*
* search for a user with its id
*/ 
function getUserById(id){
    return users.find(user => user.id === id);
}

/**
 * user leaves
 */
function userLeave(id){
    //get index of the users which has the specific id we are looking for
    const index = users.findIndex(user=>user.id === id);
    if(index != -1){
        // splice returns an array, we are only interested in getting the first element
        return users.splice(index,1)[0];
    }
}

/**
 * gives the list of users in a specific room
 */
function getRoomUsers(room){
    // filter the list of user based on the room they are in
   return users.filter(user => user.room = room); 
}

module.exports= {
    userJoin,
    getUserById,
    userLeave,
    getRoomUsers
}