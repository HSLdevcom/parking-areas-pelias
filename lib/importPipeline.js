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
 
  let target = 'vehicleParking';
  if (process.argv.length <= 3) {
    logger.error('Data source missing. Usage: node import.js [url] [source]');
    process.exit(1);
  }
  logger.info( 'Importing parking areas from ' + url + '.');

  let documentStream = DocumentStream.createVehicleParking();
  
  const dbWriter = peliasDbclient({ batchSize: 10 });
  const adminLookupStream = AdminLookupStream.create();
  const validRecordFilterStream = ValidRecordFilterStream.create();
  
  let svTrans = {};
  let enTrans = {};

  axios({
    method: 'post',
    url: url,
    headers: { 'Content-Type': 'application/graphql', 'Accept-Language': 'sv' },
    data: '{ ' + target + 's { name ' + target + 'Id } }'
  }).then(function(res) {
    let { data } = res.data
    data.vehicleParkings.forEach(parking => {
      svTrans[parking.vehicleParkingId] = parking.name;
    })
    return axios({
      method: 'post',
      url: url,
      headers: { 'Content-Type': 'application/graphql', 'Accept-Language': 'en' },
      data: '{ ' + target + 's { name ' + target + 'Id } }'
    })
  }).then(function(res) {
    let { data } = res.data
    data.vehicleParkings.forEach(parking => {
      enTrans[parking.vehicleParkingId] = parking.name;
    })
    return axios({
      method: 'post',
      url: url,
      headers: { 'Content-Type': 'application/graphql', 'Accept-Language': 'fi' },
      data: '{ ' + target + 's { name ' + target + 'Id lon lat bicyclePlaces carPlaces } }',
      responseType: 'stream'
    })
  }).then(function(res) {
    documentStream.svTrans = svTrans;
    documentStream.enTrans = enTrans;
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
