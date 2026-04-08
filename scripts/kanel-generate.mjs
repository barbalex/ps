import config from '../kanel.config.mjs'
import processDatabaseModule from 'kanel/build/processDatabase.js'

const processDatabase = processDatabaseModule.default || processDatabaseModule

try {
  await processDatabase(config)
} catch (error) {
  console.error(error)
  process.exit(1)
}
