const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.selectors = {
      emailInput: '[data-testid="email-input"], input[type="email"], #email',
      passwordInput: '[data-testid="password-input"], input[type="password"], #password',
      loginButton: '[data-testid="login-button"], button[type="submit"], .login-btn',
      loginForm: '[data-testid="login-form"], form',
      errorMessage: '[data-testid="error-message"], .error-message, .alert-error',
      successMessage: '[data-testid="success-message"], .success-message, .alert-success',
      forgotPasswordLink: '[data-testid="forgot-password"], a[href*="forgot"]',
      signupLink: '[data-testid="signup-link"], a[href*="signup"]',
      pageTitle: 'h1, .page-title',
      loadingSpinner: '[data-testid="loading"], .spinner, .loading'
    };
  }

  async navigateToLoginPage() {
    await this.navigateTo('/login');
    await this.waitForPageLoad();
  }

  async fillEmail(email) {
    await this.fillInput(this.selectors.emailInput, email);
  }

  async fillPassword(password) {
    await this.fillInput(this.selectors.passwordInput, password);
  }

  async clickLoginButton() {
    await this.clickElement(this.selectors.loginButton);
  }

  async login(email, password) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  async waitForLoginForm() {
    await this.waitForElementVisible(this.selectors.loginForm);
  }

  async isLoginFormVisible() {
    return await this.isElementVisible(this.selectors.loginForm);
  }

  async getErrorMessage() {
    return await this.getElementText(this.selectors.errorMessage);
  }

  async getSuccessMessage() {
    return await this.getElementText(this.selectors.successMessage);
  }

  async isErrorMessageVisible() {
    return await this.isElementVisible(this.selectors.errorMessage);
  }

  async isSuccessMessageVisible() {
    return await this.isElementVisible(this.selectors.successMessage);
  }

  async clickForgotPasswordLink() {
    await this.clickElement(this.selectors.forgotPasswordLink);
  }

  async clickSignupLink() {
    await this.clickElement(this.selectors.signupLink);
  }

  async getPageTitleText() {
    return await this.getElementText(this.selectors.pageTitle);
  }

  async waitForLoadingToComplete() {
    try {
      await this.page.waitForSelector(this.selectors.loadingSpinner, { state: 'hidden', timeout: 10000 });
    } catch (error) {
    }
  }

  async assertLoginFormVisible() {
    await this.assertElementVisible(this.selectors.loginForm);
  }

  async assertErrorMessageContains(expectedText) {
    await this.assertElementContainsText(this.selectors.errorMessage, expectedText);
  }

  async assertSuccessMessageContains(expectedText) {
    await this.assertElementContainsText(this.selectors.successMessage, expectedText);
  }

  async assertPageTitleContains(expectedText) {
    await this.assertElementContainsText(this.selectors.pageTitle, expectedText);
  }

  async clearForm() {
    await this.page.fill(this.selectors.emailInput, '');
    await this.page.fill(this.selectors.passwordInput, '');
  }

  async isLoggedIn() {
    const dashboardSelectors = [
      '[data-testid="dashboard"]',
      '.dashboard',
      '[data-testid="user-menu"]',
      '.user-menu',
      '[data-testid="logout"]',
      '.logout'
    ];

    for (const selector of dashboardSelectors) {
      if (await this.isElementVisible(selector)) {
        return true;
      }
    }
    return false;
  }
}

module.exports = LoginPage;
