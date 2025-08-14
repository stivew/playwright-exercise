const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const LandingPage = require('../pages/LandingPage');
const TestUtils = require('../utils/testUtils');

test.describe('Marketing Tests', () => {
  let loginPage;
  let landingPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    landingPage = new LandingPage(page);
  });

  test.describe('Social Media Tests', () => {
    const socialTestData = TestUtils.getMarketingTestData().socialMedia;

    test('should plan content for next month', async ({ page }) => {
      const testCase = socialTestData.contentPlanning;
      
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.waitForLoadingToComplete();
      
      await landingPage.navigateToLandingPage();
      const content = await landingPage.getSocialMediaCalendarContent();
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
      
      for (const item of testCase.campaignItems) {
        expect(content).toContain(item);
      }
      
      for (const element of testCase.calendarElements) {
        const elementVisible = await page.isVisible(`[data-testid="${element}"]`);
        expect(elementVisible).toBe(true);
      }
      
      expect(testCase.expectedResult).toBeTruthy();
      expect(testCase.assertion).toBeTruthy();
    });
  });

  test.describe('Email Campaign Tests', () => {
    const emailTestData = TestUtils.getMarketingTestData().emailCampaign;

    test('should design and implement Q2 email campaign', async ({ page }) => {
      const testCase = emailTestData.q2Campaign;
      
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.waitForLoadingToComplete();
      
      await landingPage.navigateToLandingPage();
      const content = await landingPage.getEmailCampaignContent();
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
      
      for (const campaignContent of testCase.campaignContent) {
        expect(content).toContain(campaignContent);
      }
      
      for (const element of testCase.campaignElements) {
        const elementVisible = await page.isVisible(`[data-testid="${element}"]`);
        expect(elementVisible).toBe(true);
      }
      
      expect(testCase.expectedResult).toBeTruthy();
      expect(testCase.assertion).toBeTruthy();
    });
  });

  test.describe('Landing Page Tests', () => {
    const landingTestData = TestUtils.getMarketingTestData().landingPage;

    test('should review and approve landing page content', async ({ page }) => {
      const testCase = landingTestData.contentApproval;
      
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.waitForLoadingToComplete();
      
      await landingPage.navigateToLandingPage();
      const content = await landingPage.getLandingPageContent();
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
      
      for (const approvedContent of testCase.approvedContent) {
        expect(content).toContain(approvedContent);
      }
      
      for (const element of testCase.pageElements) {
        const elementVisible = await page.isVisible(`[data-testid="${element}"]`);
        expect(elementVisible).toBe(true);
      }
      
      expect(testCase.expectedResult).toBeTruthy();
      expect(testCase.assertion).toBeTruthy();
    });
  });
});
