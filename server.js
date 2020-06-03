/** 
 * Server back end for chat application
*/


/**
 * requires statement
 */
const express = require('express');

const config = require('./config/config');
const logger = require('./config/logger');

/**
 * configuration of serve
 */
const PORT = config.PORT;


/**
 * creation of server
 */

 const app = express();

 /**
  * launches the server
  */

  app.listen(config.PORT, () ={
      logger.log('info', 'Chat server started on port '+config.PORT);
  })