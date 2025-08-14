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
      loadingSpinner: '[data-testid="loading"], .spinner, .loading',
      loginDashboard: [
        '[data-testid="user-menu"]',
        '.user-menu',
        '[data-testid="logout"]',
        '.logout'
      ]
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

  async isErrorMessageVisible() {
    return await this.isElementVisible(this.selectors.errorMessage);
  }

  async clickSignupLink() {
    await this.clickElement(this.selectors.signupLink);
  }

  async waitForLoadingToComplete() {
    try {
      await this.page.waitForSelector(this.selectors.loadingSpinner, { state: 'hidden' });
    } catch (error) {
      console.error(`Error occurred while waiting for loading to complete:`, error);
      throw error;
    }
  }

  async assertLoginFormVisible() {
    await this.assertElementVisible(this.selectors.loginForm);
  }

  async isLoggedIn() {
    for (const selector of this.selectors.loginDashboard) {
      if (await this.isElementVisible(selector)) {
        return true;
      }
    }
    return false;
  }
}

module.exports = LoginPage;
