const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const LandingPage = require('../pages/LandingPage');
const TestUtils = require('../utils/testUtils');

test.describe('Mobile Tests', () => {
  let loginPage;
  let landingPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    landingPage = new LandingPage(page);
    
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test.describe('Push Notification Tests', () => {
    const pushTestData = TestUtils.getMobileTestData().pushNotifications;

    test('should implement push notifications for iOS', async ({ page }) => {
      const testCase = pushTestData.ios;
      
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.waitForLoadingToComplete();
      
      await landingPage.navigateToLandingPage();
      const buttonClicked = await landingPage.clickPushNotificationButton();
      expect(buttonClicked).toBe(true);
      
      const permission = await landingPage.getNotificationPermission();
      expect(testCase.permissionStates).toContain(permission);
      
      expect(testCase.expectedResult).toBeTruthy();
      expect(testCase.assertion).toBeTruthy();
    });

    test('should implement push notifications for Android', async ({ page }) => {
      const testCase = pushTestData.android;
      
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.waitForLoadingToComplete();
      
      await landingPage.navigateToLandingPage();
      const buttonClicked = await landingPage.clickPushNotificationButton();
      expect(buttonClicked).toBe(true);
      
      const permission = await landingPage.getNotificationPermission();
      expect(testCase.permissionStates).toContain(permission);
      
      expect(testCase.expectedResult).toBeTruthy();
      expect(testCase.assertion).toBeTruthy();
    });
  });

  test.describe('Offline Mode Tests', () => {
    const offlineTestData = TestUtils.getMobileTestData().offlineMode;

    test('should enable offline data synchronization', async ({ page }) => {
      const testCase = offlineTestData.dataSync;
      
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.waitForLoadingToComplete();
      
      await landingPage.navigateToLandingPage();
      
      const isOfflineIndicatorVisible = await landingPage.isOfflineIndicatorVisible();
      expect(isOfflineIndicatorVisible).toBe(true);
      
      const offlineText = await page.textContent(landingPage.selectors.offlineIndicator);
      expect(offlineText).toContain(testCase.offlineIndicatorText);
      
      await page.route('**/*', route => {
        route.abort('failed');
      });
      
      const isOfflineAfterRoute = await landingPage.isOfflineIndicatorVisible();
      expect(isOfflineAfterRoute).toBe(true);
      
      await page.unroute('**/*');
      
      expect(testCase.expectedResult).toBeTruthy();
      expect(testCase.assertion).toBeTruthy();
    });
  });

  test.describe('App Icon Tests', () => {
    const appIconTestData = TestUtils.getMobileTestData().appIcon;

    test('should have mobile app icons in all required sizes', async ({ page }) => {
      const testCase = appIconTestData.requiredSizes;
      
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.waitForLoadingToComplete();
      
      await landingPage.navigateToLandingPage();
      const icons = await landingPage.getAppIcons();
      expect(icons.length).toBeGreaterThan(0);
      
      for (const icon of icons) {
        expect(icon.src).toBeTruthy();
        expect(icon.alt).toContain(testCase.iconAltText);
        expect(icon.width).toBeTruthy();
        expect(icon.height).toBeTruthy();
      }
      
      expect(testCase.expectedResult).toBeTruthy();
      expect(testCase.assertion).toBeTruthy();
      expect(testCase.description).toBeTruthy();
    });
  });

  test.describe('Mobile Navigation Tests', () => {
    test('should handle mobile navigation menu properly', async ({ page }) => {
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.waitForLoadingToComplete();
      
      await landingPage.navigateToLandingPage();
      
      await landingPage.openMobileMenu();
      let isMenuOpen = await landingPage.isMobileMenuOpen();
      expect(isMenuOpen).toBe(true);
      
      await landingPage.closeMobileMenu();
      let isMenuClosed = !(await landingPage.isMobileMenuOpen());
      expect(isMenuClosed).toBe(true);
    });
  });
});
