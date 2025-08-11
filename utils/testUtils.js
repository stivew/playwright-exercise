const fs = require('fs');
const path = require('path');
const { CARDS } = require('../constants');

require('dotenv').config();

class TestUtils {
  static loadTestData(filePath = 'data/test-data.json') {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      const data = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(data);
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

  static getBaseUrl() {
    if (!process.env.BASE_URL) {
      throw new Error('BASE_URL environment variable is required. Please set it in your .env file.');
    }
    return process.env.BASE_URL;
  }

  static getAllCards() {
    const testData = this.loadTestData();
    return testData.cards;
  }

  static getCardsByCategory(category) {
    const cards = this.getAllCards();
    return cards.filter(card => card.category === category);
  }

  static getCardsByTag(tag) {
    const cards = this.getAllCards();
    return cards.filter(card => card.tags.includes(tag));
  }

  static getCardByTitle(title) {
    const cards = this.getAllCards();
    return cards.find(card => card.title === title) || null;
  }

  static getCardAssertionData(title) {
    return CARDS[title] || null;
  }

  static async wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  static generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static assertArraysEqual(actual, expected) {
    expect(actual.sort()).toEqual(expected.sort());
  }

  static assertArrayContains(actual, expected) {
    expect(actual).toEqual(expect.arrayContaining(expected));
  }

  static logTestInfo(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  static validateTestData(data) {
    if (!data.cards || !Array.isArray(data.cards)) {
      throw new Error('Cards must be an array');
    }

    for (const card of data.cards) {
      const requiredCardFields = ['id', 'title', 'description', 'tags', 'category'];
      for (const field of requiredCardFields) {
        if (!card[field]) {
          throw new Error(`Card missing required field: ${field}`);
        }
      }
    }

    return true;
  }
}

module.exports = TestUtils;
