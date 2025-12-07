import { Config } from './config'
import Debug from 'debug'
import axios from 'axios'
import fs from 'fs'
import { join as pathJoin } from 'path'
import { parse } from 'csv-parse';

const debug = Debug('api')

class ApiClient {
  protected config: Config

  constructor(config: Config) {
    this.config = config
    debug('config: ' + JSON.stringify(config))
  }

  /**
   * Get pageview count of given pages.
   *
   * @param {string[]} pages
   * @returns {[uri: string]: number}
   * @memberof ApiClient
   */
  async getPageViews(pages: string[]) {
    // Read imported pageviews
    const importedPvCount: { [uri: string]: number } = {}
    const parser = fs
      .createReadStream(pathJoin(__dirname, '../import.csv'))
      .pipe(parse({ delimiter: ',' }));
    for await (const record of parser) {
      importedPvCount[record[0]] = parseInt(record[1])
    }

    // Create Axios instance
    const instance = axios.create({
      headers: { 'Authorization': 'Bearer ' + (process.env.authToken || this.config.authToken) }
    });

    // Build API request body
    const requestBody = {
      type: 'path',
      startAt: '0',
      endAt: Date.now().toString()
    }

    const response = await instance.get((process.env.umamiUrl || this.config.umamiUrl) + '/api/websites/' + (process.env.websiteId || this.config.websiteId) + '/metrics', { params: requestBody })

    const pvCount: { [uri: string]: number } = {}

    // Format API response
    for (const uri of response.data) {
      if (pages.includes(uri.x)) {
        pvCount[uri.x] = uri.y
      }
    }

    // Set pageview of nonexistent URI to 0 and add imported pageviews
    pages.forEach(uri => {
      if (pvCount[uri] === undefined) {
        pvCount[uri] = 0
      }
      if (!(importedPvCount[uri] === undefined)) {
        pvCount[uri] += importedPvCount[uri]
      }
    })

    return pvCount
  }
}

export { ApiClient }
