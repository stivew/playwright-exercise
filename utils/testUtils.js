const fs = require('fs');
const path = require('path');

require('dotenv').config();

class TestUtils {
  static _testData = null;

  static loadTestData(filePath = 'data/test-data.json') {
    if (this._testData) {
      return this._testData;
    }

    try {
      const fullPath = path.join(process.cwd(), filePath);
      const data = fs.readFileSync(fullPath, 'utf8');
      this._testData = JSON.parse(data);
      return this._testData;
    } catch (error) {
      console.error(`Error loading test data from ${filePath}:`, error);
      throw error;
    }
  }

  static getCredentials() {
    if (!process.env.EMAIL) {
      throw new Error('EMAIL environment variable is required. Please set it in your .env file.');
    }
    if (!process.env.PASSWORD) {
      throw new Error('PASSWORD environment variable is required. Please set it in your .env file.');
    }
    
    return {
      email: process.env.EMAIL,
      password: process.env.PASSWORD
    };
  }

  static getWebAppTestData() {
    const testData = this.loadTestData();
    if (!testData.webApp) {
      throw new Error('Web app test data not found in test-data.json');
    }
    return testData.webApp;
  }

  static getMobileTestData() {
    const testData = this.loadTestData();
    if (!testData.mobile) {
      throw new Error('Mobile test data not found in test-data.json');
    }
    return testData.mobile;
  }

  static getMarketingTestData() {
    const testData = this.loadTestData();
    if (!testData.marketing) {
      throw new Error('Marketing test data not found in test-data.json');
    }
    return testData.marketing;
  }
}

module.exports = TestUtils;
