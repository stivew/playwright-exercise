import fs from 'fs';
import path from 'path';
import { expect } from '@playwright/test';

export const testData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/testData.json'), 'utf8'));

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message');
    this.successMessage = page.locator('.success-message');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async submitEmptyForm() {
    await this.submitButton.click();
  }

  async getValidationErrors() {
    return {
      email: await this.emailInput.getAttribute('aria-invalid'),
      password: await this.passwordInput.getAttribute('aria-invalid')
    };
  }
}

export class SignupPage {
  constructor(page) {
    this.page = page;
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message');
    this.successMessage = page.locator('.success-message');
  }

  async navigate() {
    await this.page.goto('/signup');
  }

  async signup(userData) {
    await this.firstNameInput.fill(userData.firstName);
    await this.lastNameInput.fill(userData.lastName);
    await this.emailInput.fill(userData.email);
    await this.passwordInput.fill(userData.password);
    await this.confirmPasswordInput.fill(userData.confirmPassword);
    await this.submitButton.click();
  }
}

export class MobileNavigation {
  constructor(page) {
    this.page = page;
    this.hamburgerButton = page.locator('.hamburger-menu, .mobile-menu-toggle, [aria-label="Menu"]');
    this.mobileMenu = page.locator('.mobile-menu, .nav-menu');
    this.closeButton = page.locator('.close-menu, .menu-close, [aria-label="Close menu"]');
  }

  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async openMenu() {
    await this.hamburgerButton.click();
  }

  async closeMenu() {
    await this.closeButton.click();
  }

  async clickMenuItem(menuItem) {
    await this.page.click(`text=${menuItem}`);
  }

  async clickOutsideMenu() {
    await this.page.click('body', { position: { x: 50, y: 50 } });
  }

  async isMenuVisible() {
    return await this.mobileMenu.isVisible();
  }
}

export class PaymentPage {
  constructor(page) {
    this.page = page;
    this.cardNumberInput = page.locator('input[name="cardNumber"]');
    this.expiryDateInput = page.locator('input[name="expiryDate"]');
    this.cvvInput = page.locator('input[name="cvv"]');
    this.amountInput = page.locator('input[name="amount"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message');
    this.successMessage = page.locator('.success-message');
  }

  async navigate() {
    await this.page.goto('/payment');
  }

  async processPayment(paymentData) {
    await this.cardNumberInput.fill(paymentData.cardNumber);
    await this.expiryDateInput.fill(paymentData.expiryDate);
    await this.cvvInput.fill(paymentData.cvv);
    await this.amountInput.fill(paymentData.amount.toString());
    await this.submitButton.click();
  }

  async submitEmptyForm() {
    await this.submitButton.click();
  }

  async getValidationErrors() {
    return {
      cardNumber: await this.cardNumberInput.getAttribute('aria-invalid'),
      expiryDate: await this.expiryDateInput.getAttribute('aria-invalid'),
      cvv: await this.cvvInput.getAttribute('aria-invalid')
    };
  }
}

export class ApiDocsPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('h1');
    this.tryItOutButton = page.locator('button:has-text("Try it out")');
    this.interactiveSection = page.locator('.try-it-out, .test-endpoint');
  }

  async navigate() {
    await this.page.goto('/api-docs');
  }

  async getEndpointElements() {
    return this.page.locator('.endpoint, .api-endpoint');
  }

  async getAuthenticationIndicators() {
    return this.page.locator('text=Authentication Required');
  }
}

export class BoardPage {
  constructor(page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto('/');
  }

  cardTitleLocator(titleText) {
    return this.page.getByText(titleText, { exact: false }).first();
  }

  cardContainerFromTitle(titleText) {
    const title = this.cardTitleLocator(titleText);

    return title.locator('xpath=ancestor::*[self::div or self::article or self::li][1]');
  }

  async expectCardVisible(titleText) {
    const title = this.cardTitleLocator(titleText);
    await expect(title, `Card with title containing "${titleText}" should be visible`).toBeVisible();
  }

  async expectCardHasTags(titleText, expectedTags) {
    const card = this.cardContainerFromTitle(titleText);

    for (const tagText of expectedTags) {
      const tagLocator = card.getByText(tagText, { exact: false });
      await expect(tagLocator, `Tag "${tagText}" for card "${titleText}"`).toBeVisible();
    }
  }
}

export async function waitForPageLoad(page) {
  await page.waitForLoadState('networkidle');
}

export async function takeScreenshot(page, name) {
  await page.screenshot({ path: `screenshots/${name}-${Date.now()}.png` });
}

export async function generateTestData() {
  return {
    timestamp: Date.now(),
    randomEmail: `test${Date.now()}@example.com`,
    randomName: `TestUser${Date.now()}`
  };
}

export function validateDesignSystem(page, colors, typography) {
  return {
    async validateColorPalette() {
      const primaryButton = page.locator('.btn-primary, button.primary');
      if (await primaryButton.isVisible()) {
        await expect(primaryButton).toHaveCSS('background-color', colors.primary);
      }
    },

    async validateTypography() {
      const bodyElement = page.locator('body');
      await expect(bodyElement).toHaveCSS('font-family', typography.fontFamily);
    }
  };
}

export async function mockApiResponse(page, url, response) {
  await page.route(url, route => {
    route.fulfill({
      status: response.status || 200,
      contentType: 'application/json',
      body: JSON.stringify(response.body || {})
    });
  });
}

export function createTestUser() {
  const timestamp = Date.now();
  return {
    firstName: `Test${timestamp}`,
    lastName: `User${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  };
}

export function createTestPayment() {
  return {
    cardNumber: testData.webapp.apiIntegration.paymentGateway.testCards.success,
    expiryDate: '12/25',
    cvv: '123',
    amount: testData.webapp.apiIntegration.paymentGateway.amounts.small
  };
}

export const testDataGenerators = {
  validCredentials: () => testData.webapp.userAuth.login.validCredentials,
  invalidCredentials: () => testData.webapp.userAuth.login.invalidCredentials,
  validUser: () => testData.webapp.userAuth.signup.validUser,
  passwordMismatchUser: () => testData.webapp.userAuth.signup.passwordMismatch,
  successfulPayment: () => ({
    cardNumber: testData.webapp.apiIntegration.paymentGateway.testCards.success,
    expiryDate: '12/25',
    cvv: '123',
    amount: testData.webapp.apiIntegration.paymentGateway.amounts.small
  }),
  declinedPayment: () => ({
    cardNumber: testData.webapp.apiIntegration.paymentGateway.testCards.declined,
    expiryDate: '12/25',
    cvv: '123',
    amount: testData.webapp.apiIntegration.paymentGateway.amounts.medium
  }),
  menuItems: () => testData.webapp.navigation.mobileMenu.menuItems,
  colorPalette: () => testData.webapp.designSystem.colorPalette,
  typography: () => testData.webapp.designSystem.typography,
  apiEndpoints: () => testData.webapp.documentation.apiEndpoints
}; 