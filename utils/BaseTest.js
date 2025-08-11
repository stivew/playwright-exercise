const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const TestUtils = require('./testUtils');

class BaseTest {
  constructor(page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
    this.dashboardPage = new DashboardPage(page);
  }

  async setupWithLogin() {
    await this.loginPage.navigateToLoginPage();
    const credentials = TestUtils.getCredentials();
    await this.loginPage.login(credentials.email, credentials.password);
    await this.loginPage.waitForLoadingToComplete();
  }

  async setupWithDashboard() {
    await this.setupWithLogin();
    await this.dashboardPage.navigateToDashboard();
    await this.dashboardPage.waitForCardsToLoad();
  }
}

module.exports = BaseTest;
