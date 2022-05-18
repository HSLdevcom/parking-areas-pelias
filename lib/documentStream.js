const through = require('through2');
const peliasModel = require('pelias-model');
const logger = require('pelias-logger').get('parking-areas-pelias');

/*
 * Create a stream of Documents from valid json records
 */
function createCarParkDocumentStream() {
  let badRecordCount=0;
  return through.obj(
    function write(record, enc, next){
      try {
        const source = process.argv[4];
        const name = record.name;
        const id = record.carParkId || record.name;
        const doc = new peliasModel.Document('parks' + source, 'carpark', id)
          .setName('default', name)
          .setCentroid({lon: record.lon, lat: record.lat})
          .setPopularity(5);
        this.push(doc);
      }
      catch (ex){
        badRecordCount++;
      }
      next();
    }, function end(done) {
      logger.info('Bad record count: ' + badRecordCount);
      done();
    }
  );
}

function createBikeParkDocumentStream() {
  let badRecordCount=0;
  return through.obj(
    function write(record, enc, next){
      try {
        const source = process.argv[4];
        const name = record.name;
        const id = record.bikeParkId || record.name;
        const doc = new peliasModel.Document('parks' + source, 'bikepark', id)
          .setName('default', name)
          .setCentroid({lon: record.lon, lat: record.lat})
          .setPopularity(5);
        this.push(doc);
      }
      catch (ex){
        badRecordCount++;
      }
      next();
    }, function end(done) {
      logger.info('Bad record count: ' + badRecordCount);
      done();
    }
  );
}

module.exports = {
  createCarPark: createCarParkDocumentStream,
  createBikePark: createBikeParkDocumentStream
};
