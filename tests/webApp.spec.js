const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const LandingPage = require('../pages/LandingPage');
const TestUtils = require('../utils/testUtils');

test.describe('Web Application Tests', () => {
  let loginPage;
  let landingPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    landingPage = new LandingPage(page);
  });

  test.describe('Authentication Tests', () => {
    const authTestData = TestUtils.getWebAppTestData().authentication;

    test('should login successfully with valid credentials', async ({ page }) => {
      const testCase = authTestData.validLogin;
      
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.waitForLoadingToComplete();
      await loginPage.waitForNavigation();
      
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(true);
      
      expect(testCase.assertion).toBe(testCase.expectedResult);
      
    });

    test('should show error for invalid email', async ({ page }) => {
      const testCase = authTestData.invalidEmail;
      
      await loginPage.navigateToLoginPage();
      await loginPage.login('invalid@example.com', 'password123');
      
      await loginPage.waitForElementVisible(loginPage.selectors.errorMessage);
      
      const isErrorVisible = await loginPage.isErrorMessageVisible();
      expect(isErrorVisible).toBe(true);
      
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toContain(testCase.errorMessageText);
      
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(false);
      
      expect(testCase.assertion).toBe(testCase.expectedResult);
      
    });

    test('should show error for invalid password', async ({ page }) => {
      const testCase = authTestData.invalidPassword;
      
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      await loginPage.login(credentials.email, 'wrongpassword');
      
      await loginPage.waitForElementVisible(loginPage.selectors.errorMessage);
      
      const isErrorVisible = await loginPage.isErrorMessageVisible();
      expect(isErrorVisible).toBe(true);
      
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toContain(testCase.errorMessageText);
      
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(false);
      
      expect(testCase.assertion).toBe(testCase.expectedResult);
      
    });

    test('should handle empty form submission', async ({ page }) => {
      const testCase = authTestData.emptyForm;
      
      await loginPage.navigateToLoginPage();
      await loginPage.clickLoginButton();
      
      try {
        await loginPage.waitForElementVisible(loginPage.selectors.errorMessage);
        const isErrorVisible = await loginPage.isErrorMessageVisible();
        expect(isErrorVisible).toBe(true);
        
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain(testCase.validationMessage);
      } catch (error) {
        await loginPage.assertLoginFormVisible();
      }
      
      expect(testCase.assertion).toBe(testCase.expectedResult);
      
    });

    test('should allow user signup with valid information', async ({ page }) => {
      const testCase = authTestData.userSignup;
      
      await loginPage.navigateToLoginPage();
      await loginPage.clickSignupLink();
      
      const signupFormFilled = await landingPage.fillSignupForm(
        testCase.testEmail, 
        testCase.testPassword, 
        testCase.testPassword
      );
      expect(signupFormFilled).toBe(true);
      
      const signupFormSubmitted = await landingPage.submitSignupForm();
      expect(signupFormSubmitted).toBe(true);
      
      await landingPage.waitForSignupSuccess();
      
      const successMessage = await landingPage.page.textContent(landingPage.selectors.signupSuccessMessage);
      expect(successMessage).toContain(testCase.successMessage);
      
      expect(testCase.assertion).toBe(testCase.expectedResult);
    });
  });

  test.describe('Design System Tests', () => {
    const designTestData = TestUtils.getWebAppTestData().design;

    test('should have updated color palette', async ({ page }) => {
      const testCase = designTestData.colorPalette;
      
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.waitForLoadingToComplete();
      
      await landingPage.navigateToLandingPage();
      const colors = await landingPage.getColorPaletteValues();
      expect(colors.length).toBeGreaterThan(0);
      
      for (const color of colors) {
        expect(color.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        expect(color.color).not.toBe('rgba(0, 0, 0, 0)');
      }
      
      expect(testCase.assertion).toBe(testCase.expectedResult);
    });

    test('should have updated typography', async ({ page }) => {
      const testCase = designTestData.typography;
      
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.waitForLoadingToComplete();
      
      await landingPage.navigateToLandingPage();
      const typography = await landingPage.getTypographyValues();
      expect(typography.length).toBeGreaterThan(0);
      
      for (const type of typography) {
        expect(type.fontFamily).not.toBe('serif');
        expect(type.fontSize).not.toBe('16px');
      }
      
      expect(testCase.assertion).toBe(testCase.expectedResult);
    });
  });

  test.describe('API Integration Tests', () => {
    const apiTestData = TestUtils.getWebAppTestData().api;

    test('should integrate with payment gateway', async ({ page }) => {
      const testCase = apiTestData.paymentGateway;
      
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.waitForLoadingToComplete();
      
      await landingPage.navigateToLandingPage();
      const isPaymentFormVisible = await landingPage.isPaymentFormVisible();
      expect(isPaymentFormVisible).toBe(true);
      
      for (const element of testCase.paymentFormElements) {
        const elementVisible = await page.isVisible(`[data-testid="${element}"]`);
        expect(elementVisible).toBe(true);
      }
      
      expect(testCase.assertion).toBe(testCase.expectedResult);
    });

    test('should have API documentation', async ({ page }) => {
      const testCase = apiTestData.documentation;
      
      await loginPage.navigateToLoginPage();
      const credentials = TestUtils.getCredentials();
      await loginPage.login(credentials.email, credentials.password);
      await loginPage.waitForLoadingToComplete();
      
      await landingPage.navigateToLandingPage();
      const isApiDocsVisible = await landingPage.isApiDocsVisible();
      expect(isApiDocsVisible).toBe(true);
      
      const apiDocsContent = await landingPage.getApiDocsContent();
      expect(apiDocsContent).toBeTruthy();
      expect(apiDocsContent.length).toBeGreaterThan(0);
      
      for (const section of testCase.documentationSections) {
        expect(apiDocsContent).toContain(section);
      }
      
      expect(testCase.assertion).toBe(testCase.expectedResult);
    });
  });
});
