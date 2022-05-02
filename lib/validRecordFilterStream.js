const through = require( 'through2' );
const logger = require( 'pelias-logger' ).get('parking-areas-pelias');

function isValidRecord( record ) {
  return ['name', 'lat', 'lon'].every(function(prop) {
    return record[prop] !== undefined;
  });
}

/*
 * filter out invalid records
 */
function createValidRecordFilterStream() {
  let invalidCount = 0;

  return through.obj(function( record, enc, next ) {
    if (isValidRecord(record)) {
      this.push(record);
    } else {
      invalidCount++;
    }
    next();
  }, function(next) {
    logger.verbose('Skipped invalid records: ' + invalidCount);
    next();
  });
}

module.exports = {
  create: createValidRecordFilterStream
};
