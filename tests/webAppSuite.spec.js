import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load test data from JSON file
const testData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/testData.json'), 'utf8'));

test.describe('Web Application Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application homepage
    await page.goto('http://localhost:3000');
  });

  test.describe('User Authentication', () => {
    test('should display login form with proper styling', async ({ page }) => {
      // Navigate to login page
      await page.goto('http://localhost:3000/login');
      
      // Verify login form elements exist
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Verify form styling matches design system
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"]');
      
      // Check color palette compliance
      await expect(emailInput).toHaveCSS('border-color', testData.webapp.designSystem.colorPalette.secondary);
      await expect(submitButton).toHaveCSS('background-color', testData.webapp.designSystem.colorPalette.primary);
    });

    test('should successfully login with valid credentials', async ({ page }) => {
      await page.goto('http://localhost:3000/login');
      
      const credentials = testData.webapp.userAuth.login.validCredentials;
      
      // Fill login form
      await page.fill('input[type="email"]', credentials.email);
      await page.fill('input[type="password"]', credentials.password);
      await page.click('button[type="submit"]');
      
      // Verify successful login (redirect to dashboard or show success message)
      await expect(page).toHaveURL(/.*dashboard|.*home/);
      await expect(page.locator('.success-message, .welcome-message')).toBeVisible();
    });

    test('should show error message for invalid credentials', async ({ page }) => {
      await page.goto('http://localhost:3000/login');
      
      const credentials = testData.webapp.userAuth.login.invalidCredentials;
      
      // Fill login form with invalid credentials
      await page.fill('input[type="email"]', credentials.email);
      await page.fill('input[type="password"]', credentials.password);
      await page.click('button[type="submit"]');
      
      // Verify error message is displayed
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.error-message')).toContainText('Invalid credentials');
    });

    test('should validate required fields on login form', async ({ page }) => {
      await page.goto('http://localhost:3000/login');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Verify validation messages
      await expect(page.locator('input[type="email"]')).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('input[type="password"]')).toHaveAttribute('aria-invalid', 'true');
    });

    test('should display signup form with proper styling', async ({ page }) => {
      await page.goto('http://localhost:3000/signup');
      
      // Verify signup form elements
      const signupData = testData.webapp.userAuth.signup.validUser;
      await expect(page.locator('input[name="firstName"]')).toBeVisible();
      await expect(page.locator('input[name="lastName"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    });

    test('should successfully create new user account', async ({ page }) => {
      await page.goto('http://localhost:3000/signup');
      
      const userData = testData.webapp.userAuth.signup.validUser;
      
      // Fill signup form
      await page.fill('input[name="firstName"]', userData.firstName);
      await page.fill('input[name="lastName"]', userData.lastName);
      await page.fill('input[type="email"]', userData.email);
      await page.fill('input[name="password"]', userData.password);
      await page.fill('input[name="confirmPassword"]', userData.confirmPassword);
      await page.click('button[type="submit"]');
      
      // Verify successful signup
      await expect(page).toHaveURL(/.*login|.*dashboard/);
      await expect(page.locator('.success-message')).toBeVisible();
    });

    test('should validate password confirmation match', async ({ page }) => {
      await page.goto('http://localhost:3000/signup');
      
      const userData = testData.webapp.userAuth.signup.passwordMismatch;
      
      // Fill form with mismatched passwords
      await page.fill('input[name="firstName"]', userData.firstName);
      await page.fill('input[name="lastName"]', userData.lastName);
      await page.fill('input[type="email"]', userData.email);
      await page.fill('input[name="password"]', userData.password);
      await page.fill('input[name="confirmPassword"]', userData.confirmPassword);
      await page.click('button[type="submit"]');
      
      // Verify validation error
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.error-message')).toContainText('Passwords do not match');
    });
  });

  test.describe('Navigation - Mobile Menu', () => {
    test('should open mobile menu when hamburger button is clicked', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Click hamburger menu button
      await page.click('.hamburger-menu, .mobile-menu-toggle, [aria-label="Menu"]');
      
      // Verify menu is visible
      await expect(page.locator('.mobile-menu, .nav-menu')).toBeVisible();
      
      // Verify all menu items are present
      for (const menuItem of testData.webapp.navigation.mobileMenu.menuItems) {
        await expect(page.locator(`text=${menuItem}`)).toBeVisible();
      }
    });

    test('should close mobile menu when menu item is clicked', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Open menu
      await page.click('.hamburger-menu, .mobile-menu-toggle, [aria-label="Menu"]');
      await expect(page.locator('.mobile-menu, .nav-menu')).toBeVisible();
      
      // Click on a menu item
      await page.click(`text=${testData.webapp.navigation.mobileMenu.menuItems[0]}`);
      
      // Verify menu is closed
      await expect(page.locator('.mobile-menu, .nav-menu')).not.toBeVisible();
    });

    test('should close mobile menu when clicking outside', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Open menu
      await page.click('.hamburger-menu, .mobile-menu-toggle, [aria-label="Menu"]');
      await expect(page.locator('.mobile-menu, .nav-menu')).toBeVisible();
      
      // Click outside menu area
      await page.click('body', { position: { x: 50, y: 50 } });
      
      // Verify menu is closed
      await expect(page.locator('.mobile-menu, .nav-menu')).not.toBeVisible();
    });

    test('should close mobile menu when close button is clicked', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Open menu
      await page.click('.hamburger-menu, .mobile-menu-toggle, [aria-label="Menu"]');
      await expect(page.locator('.mobile-menu, .nav-menu')).toBeVisible();
      
      // Click close button
      await page.click('.close-menu, .menu-close, [aria-label="Close menu"]');
      
      // Verify menu is closed
      await expect(page.locator('.mobile-menu, .nav-menu')).not.toBeVisible();
    });
  });

  test.describe('Design System - Color Palette and Typography', () => {
    test('should apply correct color palette to UI elements', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      const colors = testData.webapp.designSystem.colorPalette;
      
      // Check primary button color
      const primaryButton = page.locator('.btn-primary, button.primary');
      if (await primaryButton.isVisible()) {
        await expect(primaryButton).toHaveCSS('background-color', colors.primary);
      }
      
      // Check error message color
      const errorElement = page.locator('.error, .alert-error');
      if (await errorElement.isVisible()) {
        await expect(errorElement).toHaveCSS('color', colors.error);
      }
      
      // Check success message color
      const successElement = page.locator('.success, .alert-success');
      if (await successElement.isVisible()) {
        await expect(successElement).toHaveCSS('color', colors.success);
      }
    });

    test('should apply correct typography styles', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      const typography = testData.webapp.designSystem.typography;
      
      // Check font family
      const bodyElement = page.locator('body');
      await expect(bodyElement).toHaveCSS('font-family', typography.fontFamily);
      
      // Check heading sizes
      const h1Element = page.locator('h1');
      if (await h1Element.isVisible()) {
        await expect(h1Element).toHaveCSS('font-size', typography.headingSizes.h1);
      }
      
      const h2Element = page.locator('h2');
      if (await h2Element.isVisible()) {
        await expect(h2Element).toHaveCSS('font-size', typography.headingSizes.h2);
      }
    });

    test('should maintain consistent spacing and layout', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      // Check for consistent spacing between elements
      const mainContent = page.locator('main, .main-content');
      if (await mainContent.isVisible()) {
        const padding = await mainContent.evaluate(el => 
          window.getComputedStyle(el).padding
        );
        expect(padding).toBeTruthy();
      }
    });
  });

  test.describe('API Integration - Payment Gateway', () => {
    test('should display payment form with proper fields', async ({ page }) => {
      await page.goto('http://localhost:3000/payment');
      
      // Verify payment form elements
      await expect(page.locator('input[name="cardNumber"]')).toBeVisible();
      await expect(page.locator('input[name="expiryDate"]')).toBeVisible();
      await expect(page.locator('input[name="cvv"]')).toBeVisible();
      await expect(page.locator('input[name="amount"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should process successful payment', async ({ page }) => {
      await page.goto('http://localhost:3000/payment');
      
      const paymentData = testData.webapp.apiIntegration.paymentGateway;
      
      // Fill payment form with successful test card
      await page.fill('input[name="cardNumber"]', paymentData.testCards.success);
      await page.fill('input[name="expiryDate"]', '12/25');
      await page.fill('input[name="cvv"]', '123');
      await page.fill('input[name="amount"]', paymentData.amounts.small.toString());
      await page.click('button[type="submit"]');
      
      // Verify successful payment
      await expect(page.locator('.success-message')).toBeVisible();
      await expect(page.locator('.success-message')).toContainText('Payment successful');
    });

    test('should handle declined payment gracefully', async ({ page }) => {
      await page.goto('http://localhost:3000/payment');
      
      const paymentData = testData.webapp.apiIntegration.paymentGateway;
      
      // Fill payment form with declined test card
      await page.fill('input[name="cardNumber"]', paymentData.testCards.declined);
      await page.fill('input[name="expiryDate"]', '12/25');
      await page.fill('input[name="cvv"]', '123');
      await page.fill('input[name="amount"]', paymentData.amounts.medium.toString());
      await page.click('button[type="submit"]');
      
      // Verify error message
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.error-message')).toContainText('Payment declined');
    });

    test('should validate payment form fields', async ({ page }) => {
      await page.goto('http://localhost:3000/payment');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Verify validation messages
      await expect(page.locator('input[name="cardNumber"]')).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('input[name="expiryDate"]')).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('input[name="cvv"]')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  test.describe('Documentation - API Endpoints', () => {
    test('should display API documentation page', async ({ page }) => {
      await page.goto('http://localhost:3000/api-docs');
      
      // Verify documentation page loads
      await expect(page.locator('h1')).toContainText('API Documentation');
      
      // Verify all endpoints are listed
      for (const endpoint of testData.webapp.documentation.apiEndpoints) {
        await expect(page.locator(`text=${endpoint.method}`)).toBeVisible();
        await expect(page.locator(`text=${endpoint.path}`)).toBeVisible();
        await expect(page.locator(`text=${endpoint.description}`)).toBeVisible();
      }
    });

    test('should show authentication requirements for endpoints', async ({ page }) => {
      await page.goto('http://localhost:3000/api-docs');
      
      // Check for authentication indicators
      const authRequiredEndpoints = testData.webapp.documentation.apiEndpoints.filter(
        endpoint => endpoint.requiresAuth
      );
      
      for (const endpoint of authRequiredEndpoints) {
        const endpointElement = page.locator(`text=${endpoint.path}`).first();
        await expect(endpointElement.locator('..')).toContainText('Authentication Required');
      }
    });

    test('should provide interactive API testing interface', async ({ page }) => {
      await page.goto('http://localhost:3000/api-docs');
      
      // Verify interactive elements exist
      await expect(page.locator('.try-it-out, .test-endpoint')).toBeVisible();
      await expect(page.locator('button:has-text("Try it out")')).toBeVisible();
    });
  });
});
