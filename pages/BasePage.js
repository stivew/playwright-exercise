const { expect } = require('@playwright/test');

class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigateTo(url) {
    await this.page.goto(url);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async isElementVisible(selector) {
    return await this.page.isVisible(selector);
  }

  async waitForElementVisible(selector, timeout = 5000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  async clickElement(selector) {
    await this.page.click(selector);
  }

  async fillInput(selector, value) {
    await this.page.fill(selector, value);
  }

  async getElementText(selector) {
    return await this.page.textContent(selector);
  }

  async getElements(selector) {
    return await this.page.$$(selector);
  }

  async countElements(selector) {
    const elements = await this.getElements(selector);
    return elements.length;
  }

  async assertElementVisible(selector) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async assertElementContainsText(selector, text) {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  async assertElementCount(selector, count) {
    await expect(this.page.locator(selector)).toHaveCount(count);
  }

  async waitForNavigation() {
    await this.page.waitForURL('**/*');
  }

  async getCurrentUrl() {
    return this.page.url();
  }

  async reloadPage() {
    await this.page.reload();
  }
}

module.exports = BasePage;
