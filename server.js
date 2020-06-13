/** 
 * Server back end for chat application
*/


/**
 * requires statement
 */
const express = require('express');
const root = require('app-root-path');
const path = require(`path`);
const http = require(`http`);
const socketio = require(`socket.io`);


/**
 * inner app require
 */
const formatMessage = require('./utils/messages');
const {userJoin , getUserById, userLeave, getRoomUsers} = require('./utils/users');
/**
 * settings and config
 */
const config = require('./config/config');
const logger = require('./config/logger');
/**
 * configuration of server
 */
const PORT = config.PORT;


/**
 * creation of server
 */

const app = express();
 // we need to actually access the server itself for socket.io to access it
const server = http.createServer(app);
// create of io connect
const io = socketio(server);


/**
 * if TEST with static server then use the static client
 */
if (config.server.TEST){
    app.use(express.static(path.join(`${root}`,'public')));
}

/**
 * creates the connection and listens to these event
 */
io.on('connection', socket=>{
    logger.log('info', 'New WS connection...'+socket);
    // user joins a specific room
    socket.on('joinRoom' , ({username, room}) =>{
        // socket.id is used as the connection id in our memory
        if(room === null){
            room = config.chatBot.DEFAULT_ROOM;
        }
        // this is different than a true user id if in db
        const user = userJoin(socket.id, username, room);
        // then user is added to the said room
        socket.join(user.room);

        // send message to newly connected user
        socket.emit('message', formatMessage(config.chatBot.BOT,'Welcome to chat!'));
        //broadcast to everyone in the room but the new comer that someone new has connected
        socket.broadcast
            .to(user.room)
            .emit('message',
                                formatMessage(
                                    config.chatBot.BOT,
                                    `${user.username} has joined the room`)
                            );
        
        // shares information on users and room
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

    });

    // receives message from client
    socket.on('chatMessage', (msg)=>{
        //recuperate user from its is
        const user = getUserById(socket.id);
       // message is sent to everynody in the roome(including the emitting user)
       if(user != null){
        if(user.room != null){
            io.to(user.room).emit('message',formatMessage(user.username,msg));
        }else {
            io.to(config.chatBot.DEFAULT_ROOM).emit('message',formatMessage(user.username,msg));
        }
       }
       else{
           io.to(config.chatBot.DEFAULT_ROOM).emit('message',formatMessage('Anonym',msg));
       }
    })
    //on disconnection, we let e
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);
        if(user){
           logger.info(`${user.username} leaves room ${user.room}`);
           io.to(user.room).emit('message', formatMessage(config.chatBot.BOT,`${user.username} has left the chat`));
            // update information on the room to all partipant        // shares information on users and room
            io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
        }    
    })
});

 /**
  * launches the server
  */
  server.listen(config.server.PORT, () =>{
      logger.log('info', 'Chat server started on port '+config.server.PORT);
  });