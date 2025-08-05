import { test, expect } from '@playwright/test';
import { 
  LoginPage, 
  SignupPage, 
  MobileNavigation, 
  PaymentPage, 
  ApiDocsPage,
  testDataGenerators,
  createTestUser,
  createTestPayment
} from './utils/testHelpers.js';

test.describe('Example Tests - Demonstrating Page Objects', () => {
  
  test('Example: Login with page object', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Navigate to login page
    await loginPage.navigate();
    
    // Get test data
    const credentials = testDataGenerators.validCredentials();
    
    // Perform login
    await loginPage.login(credentials.email, credentials.password);
    
    // Verify success
    await expect(loginPage.successMessage).toBeVisible();
  });

  test('Example: Signup with page object', async ({ page }) => {
    const signupPage = new SignupPage(page);
    
    // Navigate to signup page
    await signupPage.navigate();
    
    // Create test user data
    const userData = createTestUser();
    
    // Perform signup
    await signupPage.signup(userData);
    
    // Verify success
    await expect(signupPage.successMessage).toBeVisible();
  });

  test('Example: Mobile navigation with page object', async ({ page }) => {
    const mobileNav = new MobileNavigation(page);
    
    // Set mobile viewport
    await mobileNav.setMobileViewport();
    
    // Navigate to homepage
    await page.goto('/');
    
    // Open mobile menu
    await mobileNav.openMenu();
    
    // Verify menu is visible
    expect(await mobileNav.isMenuVisible()).toBe(true);
    
    // Close menu
    await mobileNav.closeMenu();
    
    // Verify menu is hidden
    expect(await mobileNav.isMenuVisible()).toBe(false);
  });

  test('Example: Payment processing with page object', async ({ page }) => {
    const paymentPage = new PaymentPage(page);
    
    // Navigate to payment page
    await paymentPage.navigate();
    
    // Create test payment data
    const paymentData = createTestPayment();
    
    // Process payment
    await paymentPage.processPayment(paymentData);
    
    // Verify success
    await expect(paymentPage.successMessage).toBeVisible();
  });

  test('Example: API documentation with page object', async ({ page }) => {
    const apiDocsPage = new ApiDocsPage(page);
    
    // Navigate to API docs page
    await apiDocsPage.navigate();
    
    // Verify page title
    await expect(apiDocsPage.title).toContainText('API Documentation');
    
    // Verify interactive elements exist
    await expect(apiDocsPage.interactiveSection).toBeVisible();
    await expect(apiDocsPage.tryItOutButton).toBeVisible();
  });

  test('Example: Design system validation', async ({ page }) => {
    await page.goto('/');
    
    // Get design system data
    const colors = testDataGenerators.colorPalette();
    const typography = testDataGenerators.typography();
    
    // Verify color palette
    const primaryButton = page.locator('.btn-primary, button.primary');
    if (await primaryButton.isVisible()) {
      await expect(primaryButton).toHaveCSS('background-color', colors.primary);
    }
    
    // Verify typography
    const bodyElement = page.locator('body');
    await expect(bodyElement).toHaveCSS('font-family', typography.fontFamily);
  });

  test('Example: Form validation testing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Navigate to login page
    await loginPage.navigate();
    
    // Submit empty form
    await loginPage.submitEmptyForm();
    
    // Get validation errors
    const validationErrors = await loginPage.getValidationErrors();
    
    // Verify validation
    expect(validationErrors.email).toBe('true');
    expect(validationErrors.password).toBe('true');
  });

  test('Example: Payment form validation', async ({ page }) => {
    const paymentPage = new PaymentPage(page);
    
    // Navigate to payment page
    await paymentPage.navigate();
    
    // Submit empty form
    await paymentPage.submitEmptyForm();
    
    // Get validation errors
    const validationErrors = await paymentPage.getValidationErrors();
    
    // Verify validation
    expect(validationErrors.cardNumber).toBe('true');
    expect(validationErrors.expiryDate).toBe('true');
    expect(validationErrors.cvv).toBe('true');
  });
}); 