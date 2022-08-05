import { Config } from './config'
import Debug from 'debug'
import axios from 'axios'

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

    // Create Axios instance
    const instance = axios.create({
      headers: {'Authorization': 'Bearer ' + this.config.authToken}
    });

    // Build API request body
    const requestBody = {
      type: 'url',
      start_at: '0',
      end_at: Date.now().toString()
    }

    const response = await instance.get(this.config.umamiUrl + '/api/website/' + this.config.websiteId + '/metrics', {params: requestBody})

    const pvCount: {[uri: string]: number} = {}

    // Format API response
    for (const uri of response.data) {
      if (pages.includes(uri.x)) { 
        pvCount[uri.x] = uri.y
      }
    }

    // Set pageview of nonexistent URI to 0
    pages.forEach(uri => {
      if (pvCount[uri] === undefined) {
        pvCount[uri] = 0
      }
    })

    return pvCount
  }
}

export { ApiClient }