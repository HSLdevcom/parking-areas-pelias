const logger = require('pelias-logger').get('parking-areas-pelias');
/**
 * @file entry for the gtfs stop import pipeline
 */

const importPipeline = require( './lib/importPipeline' );
if (process.argv.length > 2) {
  importPipeline.create(process.argv[2]);
} else {
  logger.error('Data source address missing');
  process.exit(1);
}
