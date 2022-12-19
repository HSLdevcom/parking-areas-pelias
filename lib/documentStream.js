const through = require('through2');
const peliasModel = require('pelias-model');
const logger = require('pelias-logger').get('parking-areas-pelias');

/*
 * Create a stream of Documents from valid json records
 */
function createVehicleParkingDocumentStream() {
  let badRecordCount = 0;
  return through.obj(
    function write(record, enc, next) {
      const { enTrans, svTrans } = this;
      try {
        const source = process.argv[4];
        const name = record.name;
        const id = record.vehicleParkingId;
        const doc = new peliasModel.Document('parks' + source, record.bicyclePlaces ? 'bikepark' : 'carpark', id)
          .setName('default', name)
          .setName('sv', svTrans[id])
          .setName('en', enTrans[id])
          .setCentroid({lon: record.lon, lat: record.lat})
          .setPopularity(5);
        this.push(doc);
      } catch (ex) {
        badRecordCount++;
      }
      next();
    }, function end(done) {
      logger.info('Bad record count: ' + badRecordCount);
      done();
    }
  )
}

module.exports = {
  createVehicleParking: createVehicleParkingDocumentStream
};
