const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.selectors = {
      cardContainer: '[data-testid="card-container"], .card-container, .cards-grid',
      card: '[data-testid="card"], .card, .task-card',
      cardTitle: '[data-testid="card-title"], .card-title, h3',
      cardDescription: '[data-testid="card-description"], .card-description, p',
      cardTags: '[data-testid="card-tags"], .card-tags, .tags',
      cardTag: '[data-testid="card-tag"], .tag, .badge',
      categorySection: '[data-testid="category-section"], .category-section',
      categoryTitle: '[data-testid="category-title"], .category-title, h2',
      navigation: '[data-testid="navigation"], nav, .navbar',
      logoutButton: '[data-testid="logout"], .logout, .logout-btn',
      userMenu: '[data-testid="user-menu"], .user-menu',
      loadingSpinner: '[data-testid="loading"], .spinner, .loading',
      emptyState: '[data-testid="empty-state"], .empty-state, .no-results',
      cardClickArea: '[data-testid="card-click"], .card-click, .card-body',
      cardDetails: '[data-testid="card-details"], .card-details, .modal',
      closeButton: '[data-testid="close-button"], .close-btn, .modal-close'
    };
  }

  async navigateToDashboard() {
    await this.navigateTo('/dashboard');
    await this.waitForPageLoad();
  }

  async waitForCardsToLoad() {
    await this.waitForElementVisible(this.selectors.cardContainer);
  }

  async getAllCards() {
    return await this.getElements(this.selectors.card);
  }

  async getCardCount() {
    return await this.countElements(this.selectors.card);
  }

  async getCardByIndex(index) {
    const cards = await this.getAllCards();
    return cards[index];
  }

  async getCardTitleByIndex(index) {
    const card = await this.getCardByIndex(index);
    const titleElement = await card.$(this.selectors.cardTitle);
    return await titleElement.textContent();
  }

  async getCardDescriptionByIndex(index) {
    const card = await this.getCardByIndex(index);
    const descElement = await card.$(this.selectors.cardDescription);
    return await descElement.textContent();
  }

  async getCardTagsByIndex(index) {
    const card = await this.getCardByIndex(index);
    const tagElements = await card.$$(this.selectors.cardTag);
    const tags = [];
    for (const tagElement of tagElements) {
      tags.push(await tagElement.textContent());
    }
    return tags;
  }

  async clickCardByIndex(index) {
    const card = await this.getCardByIndex(index);
    await card.click();
  }

  async getCategorySections() {
    return await this.getElements(this.selectors.categorySection);
  }

  async getCategoryTitleByIndex(index) {
    const sections = await this.getCategorySections();
    const section = sections[index];
    const titleElement = await section.$(this.selectors.categoryTitle);
    return await titleElement.textContent();
  }

  async getCardsInCategory(categoryName) {
    const sections = await this.getCategorySections();
    for (const section of sections) {
      const titleElement = await section.$(this.selectors.categoryTitle);
      const title = await titleElement.textContent();
      if (title.toLowerCase().includes(categoryName.toLowerCase())) {
        return await section.$$(this.selectors.card);
      }
    }
    return [];
  }

  async getCardCountInCategory(categoryName) {
    const cards = await this.getCardsInCategory(categoryName);
    return cards.length;
  }

  async isCardDetailsModalVisible() {
    return await this.isElementVisible(this.selectors.cardDetails);
  }

  async closeCardDetailsModal() {
    await this.clickElement(this.selectors.closeButton);
  }

  async logout() {
    await this.clickElement(this.selectors.logoutButton);
  }

  async assertCardCount(expectedCount) {
    await this.assertElementCount(this.selectors.card, expectedCount);
  }

  async assertCardTitle(cardIndex, expectedTitle) {
    const actualTitle = await this.getCardTitleByIndex(cardIndex);
    expect(actualTitle.trim()).toBe(expectedTitle);
  }

  async assertCardDescription(cardIndex, expectedDescription) {
    const actualDescription = await this.getCardDescriptionByIndex(cardIndex);
    expect(actualDescription.trim()).toBe(expectedDescription);
  }

  async assertCardTags(cardIndex, expectedTags) {
    const actualTags = await this.getCardTagsByIndex(cardIndex);
    expect(actualTags).toEqual(expect.arrayContaining(expectedTags));
  }

  async assertCategoryCardCount(categoryName, expectedCount) {
    const actualCount = await this.getCardCountInCategory(categoryName);
    expect(actualCount).toBe(expectedCount);
  }

  async waitForLoadingToComplete() {
    try {
      await this.page.waitForSelector(this.selectors.loadingSpinner, { state: 'hidden', timeout: 10000 });
    } catch (error) {
    }
  }

  async isEmptyStateVisible() {
    return await this.isElementVisible(this.selectors.emptyState);
  }
}

module.exports = DashboardPage;
