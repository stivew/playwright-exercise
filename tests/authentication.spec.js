const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const TestUtils = require('../utils/testUtils');

test.describe('Authentication Tests', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    const credentials = TestUtils.getCredentials();
    
    await loginPage.login(credentials.email, credentials.password);
    
    await loginPage.waitForLoadingToComplete();
    await loginPage.waitForNavigation();
    
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should show error for invalid email', async ({ page }) => {
    await loginPage.login('invalid@example.com', 'password123');
    
    await loginPage.waitForElementVisible(loginPage.selectors.errorMessage);
    
    const isErrorVisible = await loginPage.isErrorMessageVisible();
    expect(isErrorVisible).toBe(true);
    
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test('should show error for invalid password', async ({ page }) => {
    const credentials = TestUtils.getCredentials();
    
    await loginPage.login(credentials.email, 'wrongpassword');
    
    await loginPage.waitForElementVisible(loginPage.selectors.errorMessage);
    
    const isErrorVisible = await loginPage.isErrorMessageVisible();
    expect(isErrorVisible).toBe(true);
    
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test('should display login form correctly', async ({ page }) => {
    await loginPage.assertLoginFormVisible();
    
    await loginPage.assertElementVisible(loginPage.selectors.emailInput);
    await loginPage.assertElementVisible(loginPage.selectors.passwordInput);
    await loginPage.assertElementVisible(loginPage.selectors.loginButton);
  });

  test('should clear form fields when cleared', async ({ page }) => {
    const credentials = TestUtils.getCredentials();
    
    await loginPage.fillEmail(credentials.email);
    await loginPage.fillPassword(credentials.password);
    
    await loginPage.clearForm();
    
    const emailValue = await page.inputValue(loginPage.selectors.emailInput);
    const passwordValue = await page.inputValue(loginPage.selectors.passwordInput);
    
    expect(emailValue).toBe('');
    expect(passwordValue).toBe('');
  });

  test('should handle empty form submission', async ({ page }) => {
    await loginPage.clickLoginButton();
    
    try {
      await loginPage.waitForElementVisible(loginPage.selectors.errorMessage, 3000);
      const isErrorVisible = await loginPage.isErrorMessageVisible();
      expect(isErrorVisible).toBe(true);
    } catch (error) {
      await loginPage.assertLoginFormVisible();
    }
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await loginPage.clickForgotPasswordLink();
    
    await loginPage.waitForNavigation();
    
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain('forgot');
  });

  test('should navigate to signup page', async ({ page }) => {
    await loginPage.clickSignupLink();
    
    await loginPage.waitForNavigation();
    
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain('signup');
  });

  test('should maintain form state after failed login', async ({ page }) => {
    const credentials = TestUtils.getCredentials();
    
    await loginPage.fillEmail(credentials.email);
    await loginPage.fillPassword('wrongpassword');
    
    await loginPage.clickLoginButton();
    
    await loginPage.waitForElementVisible(loginPage.selectors.errorMessage);
    
    const emailValue = await page.inputValue(loginPage.selectors.emailInput);
    expect(emailValue).toBe(credentials.email);
    
    const passwordValue = await page.inputValue(loginPage.selectors.passwordInput);
    expect(passwordValue).toBe('');
  });

  test('should handle special characters in credentials', async ({ page }) => {
    const specialCredentials = {
      email: 'test@example.com',
      password: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };
    
    await loginPage.fillEmail(specialCredentials.email);
    await loginPage.fillPassword(specialCredentials.password);
    
    await loginPage.clickLoginButton();
    
    await loginPage.waitForElementVisible(loginPage.selectors.errorMessage);
    
    const isErrorVisible = await loginPage.isErrorMessageVisible();
    expect(isErrorVisible).toBe(true);
  });

  test('should handle very long credentials', async ({ page }) => {
    const longCredentials = {
      email: 'a'.repeat(100) + '@example.com',
      password: 'b'.repeat(100)
    };
    
    await loginPage.fillEmail(longCredentials.email);
    await loginPage.fillPassword(longCredentials.password);
    
    await loginPage.clickLoginButton();
    
    await loginPage.waitForElementVisible(loginPage.selectors.errorMessage);
    
    const isErrorVisible = await loginPage.isErrorMessageVisible();
    expect(isErrorVisible).toBe(true);
  });
});
