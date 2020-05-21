// ```
// env.conf.js
// (c) 2016 David Newman
// david.r.niciforovic@gmail.com
// env.conf.js may be freely distributed under the MIT license
// ```

// *env.conf.js*

// This is the file where we will configure our Node environmental
// variables for production

// Reference : http://thewebivore.com/super-simple-environment-variables-node-js/#comment-286662

// # Node Env Variables

import config from './config.json';

// Check each necessary node `environment variable` to see if a
// value has been set and if not, use the `config` object to
// supply appropriate values
export function validateEnvVariables() {

  // If no value has been assigned to our environment variables,
  // set them up...

  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = config.ENV;
  }

  // Check to see if `process.env.NODE_ENV` is valid
  validateNodeEnvironment();

  // For Express/Passport
  if (!process.env.SESSION_SECRET)
    process.env.SESSION_SECRET = config.SESSION_SECRET;

  if (!process.env.PORT) {
    if (process.env.MODULE == 'admin') {
      if (process.env.NODE_ENV == 'development') {
        process.env.PORT = config.PORT.ADMIN.DEV;
      } else if (process.env.NODE_ENV == 'production') {
        process.env.PORT = config.PORT.ADMIN.PROD;
      }
    } else if (process.env.MODULE == 'public') {
      if (process.env.NODE_ENV == 'development') {
        process.env.PORT = config.PORT.PUBLIC.DEV;
      } else if (process.env.NODE_ENV == 'production') {
        process.env.PORT = config.PORT.PUBLIC.PROD;
      }
    } else if (process.env.MODULE == 'mobile') {
      if (process.env.NODE_ENV == 'development') {
        process.env.PORT = config.PORT.MOBILE.DEV;
      } else if (process.env.NODE_ENV == 'production') {
        process.env.PORT = config.PORT.MOBILE.PROD;
      }
    }
  }

  // Set the appropriate MongoDB URI
  validateMongoUri();

  // Set the appropriate Redis Server
  validateRedisServer();

  return;
}

function validateNodeEnvironment() {
  // Check to see that the `process.env.NODE_ENV has been
  // set to an appropriate value of `development`, `production`
  // or `test`. If not, alert the user and default to `development`

  switch (process.env.NODE_ENV) {

    case 'development':

      console.log(`Node environment set for ${process.env.NODE_ENV}`);
      break;

    case 'production':

      console.log(`Node environment set for ${process.env.NODE_ENV}`);
      break;

    case 'test':

      console.log(`Node environment set for ${process.env.NODE_ENV}`);
      break;

    default:

      console.log('Error: process.env.NODE_ENV should be set to a valid '
        + ' value such as \'production\', \'development\', or \'test\'.');
      console.log('Value received: ' + process.env.NODE_ENV);
      console.log('Defaulting value for: development');
      process.env.NODE_ENV = 'development';
      break;
  }

  return;
}

// Set the appropriate MongoDB URI with the `config` object
// based on the value in `process.env.NODE_ENV
function validateMongoUri() {

  if (!process.env.MONGO_URI) {

    console.log('No value set for MONGO_URI...');
    console.log('Using the supplied value from config object...')

    switch (process.env.NODE_ENV) {

      case 'development':

        process.env.MONGO_URI = config.MONGO_URI.DEVELOPMENT;
        console.log(`MONGO_URI set for ${process.env.NODE_ENV}`);
        break;

      case 'production':

        process.env.MONGO_URI = config.MONGO_URI.PRODUCTION;
        console.log(`MONGO_URI set for ${process.env.NODE_ENV}`);
        break;

      case 'test':

        process.env.MONGO_URI = config.MONGO_URI.TEST;
        console.log(`MONGO_URI set for ${process.env.NODE_ENV}`);
        break;

      default:

        console.log('Unexpected behavior! process.env.NODE_ENV set to ' +
          'unexpected value!');
        break;
    }
  }

  return;
}

// Set the appropriate Redis Server with the `config` object
// based on the value in `process.env.NODE_ENV
function validateRedisServer() {

  if (!process.env.REDIS_SERVER) {

    switch (process.env.NODE_ENV) {

      case 'development':
        process.env.REDIS_SERVER = config.REDIS_SERVER.DEVELOPMENT;
        console.log(`REDIS_SERVER set for ${process.env.NODE_ENV}`);
        break;

      case 'production':
        process.env.REDIS_SERVER = config.REDIS_SERVER.PRODUCTION;
        console.log(`REDIS_SERVER set for ${process.env.NODE_ENV}`);
        break;

      default:
        console.log('Could not set REDIS_SERVER !!');
        break;

    }
  }
}