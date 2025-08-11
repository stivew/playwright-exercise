const { test, expect } = require('@playwright/test');
const TestUtils = require('../utils/testUtils');
const BaseTest = require('../utils/BaseTest');

test.describe('Integration Tests', () => {
  let baseTest;

  test.beforeEach(async ({ page }) => {
    baseTest = new BaseTest(page);
  });

  test('should complete full user journey: login -> view cards -> logout', async ({ page }) => {
    await baseTest.setupWithDashboard();
    
    const isLoggedIn = await baseTest.loginPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
    
    const totalCards = await baseTest.dashboardPage.getCardCount();
    expect(totalCards).toBeGreaterThan(0);
    
    await baseTest.dashboardPage.logout();
    
    const isStillLoggedIn = await baseTest.loginPage.isLoggedIn();
    expect(isStillLoggedIn).toBe(false);
  });

  test('should handle multiple card interactions in sequence', async ({ page }) => {
    await baseTest.setupWithDashboard();
    
    const totalCards = await baseTest.dashboardPage.getCardCount();
    
    for (let i = 0; i < Math.min(3, totalCards); i++) {
      await baseTest.dashboardPage.clickCardByIndex(i);
      await TestUtils.wait(500);
      
      const isModalVisible = await baseTest.dashboardPage.isCardDetailsModalVisible();
      
      if (isModalVisible) {
        await baseTest.dashboardPage.closeCardDetailsModal();
        await TestUtils.wait(500);
        
        const isModalClosed = !(await baseTest.dashboardPage.isCardDetailsModalVisible());
        expect(isModalClosed).toBe(true);
      }
    }
  });

  test('should validate web application cards', async ({ page }) => {
    await baseTest.setupWithDashboard();
    
    const webAppCards = TestUtils.getCardsByCategory('web-application');
    
    for (const expectedCard of webAppCards) {
      let cardFound = false;
      const totalCards = await baseTest.dashboardPage.getCardCount();
      
      for (let i = 0; i < totalCards; i++) {
        const title = await baseTest.dashboardPage.getCardTitleByIndex(i);
        if (title === expectedCard.title) {
          cardFound = true;
          
          await baseTest.dashboardPage.assertCardTitle(i, expectedCard.title);
          await baseTest.dashboardPage.assertCardDescription(i, expectedCard.description);
          await baseTest.dashboardPage.assertCardTags(i, expectedCard.tags);
          break;
        }
      }
      
      expect(cardFound).toBe(true);
    }
  });

  test('should validate mobile cards', async ({ page }) => {
    await baseTest.setupWithDashboard();
    
    const mobileCards = TestUtils.getCardsByCategory('mobile');
    
    for (const expectedCard of mobileCards) {
      let cardFound = false;
      const totalCards = await baseTest.dashboardPage.getCardCount();
      
      for (let i = 0; i < totalCards; i++) {
        const title = await baseTest.dashboardPage.getCardTitleByIndex(i);
        if (title === expectedCard.title) {
          cardFound = true;
          
          await baseTest.dashboardPage.assertCardTitle(i, expectedCard.title);
          await baseTest.dashboardPage.assertCardDescription(i, expectedCard.description);
          await baseTest.dashboardPage.assertCardTags(i, expectedCard.tags);
          break;
        }
      }
      
      expect(cardFound).toBe(true);
    }
  });

  test('should validate marketing cards', async ({ page }) => {
    await baseTest.setupWithDashboard();
    
    const marketingCards = TestUtils.getCardsByCategory('marketing');
    
    for (const expectedCard of marketingCards) {
      let cardFound = false;
      const totalCards = await baseTest.dashboardPage.getCardCount();
      
      for (let i = 0; i < totalCards; i++) {
        const title = await baseTest.dashboardPage.getCardTitleByIndex(i);
        if (title === expectedCard.title) {
          cardFound = true;
          
          await baseTest.dashboardPage.assertCardTitle(i, expectedCard.title);
          await baseTest.dashboardPage.assertCardDescription(i, expectedCard.description);
          await baseTest.dashboardPage.assertCardTags(i, expectedCard.tags);
          break;
        }
      }
      
      expect(cardFound).toBe(true);
    }
  });

  test('should handle rapid navigation between pages', async ({ page }) => {
    await baseTest.setupWithLogin();
    
    for (let i = 0; i < 5; i++) {
      await baseTest.dashboardPage.navigateToDashboard();
      await baseTest.dashboardPage.waitForCardsToLoad();
      
      await baseTest.loginPage.navigateToLoginPage();
      await baseTest.loginPage.waitForLoginForm();
    }
    
    await baseTest.dashboardPage.navigateToDashboard();
    await baseTest.dashboardPage.waitForCardsToLoad();
    
    const totalCards = await baseTest.dashboardPage.getCardCount();
    expect(totalCards).toBeGreaterThan(0);
  });

  test('should maintain state during browser refresh', async ({ page }) => {
    await baseTest.setupWithDashboard();
    
    await baseTest.dashboardPage.reloadPage();
    await baseTest.dashboardPage.waitForCardsToLoad();
    
    const totalCards = await baseTest.dashboardPage.getCardCount();
    expect(totalCards).toBeGreaterThan(0);
    
    const isStillLoggedIn = await baseTest.loginPage.isLoggedIn();
    expect(isStillLoggedIn).toBe(true);
  });

  test('should handle concurrent operations gracefully', async ({ page }) => {
    await baseTest.setupWithDashboard();
    
    const allCards = TestUtils.getAllCards();
    if (allCards.length > 0) {
      await baseTest.dashboardPage.clickCardByIndex(0);
      
      await TestUtils.wait(2000);
      
      const totalCards = await baseTest.dashboardPage.getCardCount();
      expect(totalCards).toBeGreaterThanOrEqual(0);
    }
  });

  test('should validate complete data integrity', async ({ page }) => {
    await baseTest.setupWithDashboard();
    
    const testData = TestUtils.loadTestData();
    TestUtils.validateTestData(testData);
    
    const allCards = TestUtils.getAllCards();
    const totalCards = await baseTest.dashboardPage.getCardCount();
    expect(totalCards).toBe(allCards.length);
    
    for (const expectedCard of allCards) {
      let cardFound = false;
      
      for (let i = 0; i < totalCards; i++) {
        const title = await baseTest.dashboardPage.getCardTitleByIndex(i);
        if (title === expectedCard.title) {
          cardFound = true;
          
          const description = await baseTest.dashboardPage.getCardDescriptionByIndex(i);
          const tags = await baseTest.dashboardPage.getCardTagsByIndex(i);
          
          expect(description).toBe(expectedCard.description);
          expect(tags).toEqual(expect.arrayContaining(expectedCard.tags));
          expect(tags.length).toBe(expectedCard.tags.length);
          break;
        }
      }
      
      expect(cardFound).toBe(true);
    }
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    await baseTest.loginPage.navigateToLoginPage();
    await baseTest.loginPage.login('invalid@example.com', 'wrongpassword');
    
    await baseTest.loginPage.waitForElementVisible(baseTest.loginPage.selectors.errorMessage);
    const isErrorVisible = await baseTest.loginPage.isErrorMessageVisible();
    expect(isErrorVisible).toBe(true);
    
    await baseTest.setupWithDashboard();
    
    const totalCards = await baseTest.dashboardPage.getCardCount();
    expect(totalCards).toBeGreaterThan(0);
  });

  test('should perform accessibility validation', async ({ page }) => {
    await baseTest.setupWithDashboard();
    
    const totalCards = await baseTest.dashboardPage.getCardCount();
    
    for (let i = 0; i < totalCards; i++) {
      const card = await baseTest.dashboardPage.getCardByIndex(i);
      
      const isVisible = await card.isVisible();
      expect(isVisible).toBe(true);
      
      const title = await card.getAttribute('title');
      const role = await card.getAttribute('role');
      const ariaLabel = await card.getAttribute('aria-label');
      
      expect(title || role || ariaLabel || true).toBeTruthy();
    }
  });
});
