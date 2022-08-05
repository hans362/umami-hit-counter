import { join as pathJoin } from 'path'

interface Config {
  listenPort: number
  maxQueryAmount: number
  apiCacheTtl: number
  authToken: string
  umamiUrl: string
  websiteId: string
}

function parseConfig(): Config {
  // TODO: validate
  let config = require(pathJoin(__dirname, '../config.json'))
  return config
}

export { Config, parseConfig }