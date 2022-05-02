const logger = require('pelias-logger').get('parking-areas-pelias');
const axios = require('axios');
const ValidRecordFilterStream = require('./validRecordFilterStream');
const DocumentStream = require('./documentStream');
const AdminLookupStream = require('pelias-wof-admin-lookup');
const model = require( 'pelias-model' );
const JSONStream = require('JSONStream');
const peliasDbclient = require( 'pelias-dbclient');

/**
 * Import otp bike stations into Pelias elasticsearch.
 *
 * @param url OTP address
 *
 */

function createImportPipeline(url) {
 
  let target;
  if (process.argv.length > 4) {
    target = process.argv[3];
  } else {
    logger.error('Data target and/or source missing. Usage: node import.js [url] [target] [source]');
    process.exit(1);
  }
  logger.info( 'Importing parking areas from ' + url + '. Target: ' + target);

  let documentStream;
  if (target == 'carPark') {
    documentStream = DocumentStream.createCarPark();
  } else {
    documentStream = DocumentStream.createBikePark();
  }
  const dbWriter = peliasDbclient({ batchSize: 10 });
  const adminLookupStream = AdminLookupStream.create();
  const validRecordFilterStream = ValidRecordFilterStream.create();

  axios({
    method: 'post',
    url: url,
    headers: { 'Content-Type': 'application/graphql'},
    data: '{ ' + target + 's { name ' + target + 'Id lon lat } }',
    responseType: 'stream'
  }).then(function(res) {
    res.data.pipe(JSONStream.parse('data.' + target + 's.*'))
      .pipe(validRecordFilterStream)
      .pipe(documentStream)
      .pipe(adminLookupStream)
      .pipe(model.createDocumentMapperStream())
      .pipe(dbWriter);
  }).catch(function () { logger.error('failed'); });
}

module.exports = {
  create: createImportPipeline
};
