const BasePage = require('./BasePage');

class LandingPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.selectors = {
      navigationMenu: '[data-testid="navigation-menu"], .nav-menu, nav',
      mobileMenuToggle: '[data-testid="mobile-menu-toggle"], .mobile-menu-toggle, .hamburger',
      mobileMenu: '[data-testid="mobile-menu"], .mobile-menu, .nav-mobile',
      colorPalette: '[data-testid="color-palette"], .color-palette',
      typography: '[data-testid="typography"], .typography',
      paymentForm: '[data-testid="payment-form"], .payment-form, form[data-payment]',
      apiDocs: '[data-testid="api-docs"], .api-docs, [data-api-documentation]',
      pushNotificationButton: '[data-testid="push-notification"], .push-notification-btn',
      offlineIndicator: '[data-testid="offline-indicator"], .offline-indicator',
      appIcon: '[data-testid="app-icon"], .app-icon, img[alt*="app icon"]',
      socialMediaCalendar: '[data-testid="social-calendar"], .social-calendar',
      emailCampaign: '[data-testid="email-campaign"], .email-campaign',
      landingPageContent: '[data-testid="landing-content"], .landing-content',
      signupForm: '[data-testid="signup-form"], .signup-form, form[data-signup]',
      signupSuccessMessage: '[data-testid="signup-success"], .signup-success, .success-message'
    };
  }

  async navigateToLandingPage() {
    await this.navigateTo('/');
    await this.waitForPageLoad();
  }

  async openMobileMenu() {
    await this.clickElement(this.selectors.mobileMenuToggle);
    await this.waitForElementVisible(this.selectors.mobileMenu);
  }

  async closeMobileMenu() {
    if (await this.isElementVisible(this.selectors.mobileMenu)) {
      await this.clickElement(this.selectors.mobileMenuToggle);
      await this.page.waitForSelector(this.selectors.mobileMenu, { state: 'hidden' });
    }
  }

  async isMobileMenuOpen() {
    return await this.isElementVisible(this.selectors.mobileMenu);
  }

  async getColorPaletteValues() {
    const colorElements = await this.page.$$(this.selectors.colorPalette);
    const colors = [];
    
    for (const element of colorElements) {
      const computedStyle = await element.evaluate(el => {
        return window.getComputedStyle(el);
      });
      colors.push({
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color
      });
    }
    
    return colors;
  }

  async getTypographyValues() {
    const typographyElements = await this.page.$$(this.selectors.typography);
    const typography = [];
    
    for (const element of typographyElements) {
      const computedStyle = await element.evaluate(el => {
        return window.getComputedStyle(el);
      });
      typography.push({
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight
      });
    }
    
    return typography;
  }

  async isPaymentFormVisible() {
    return await this.isElementVisible(this.selectors.paymentForm);
  }

  async isApiDocsVisible() {
    return await this.isElementVisible(this.selectors.apiDocs);
  }

  async getApiDocsContent() {
    if (await this.isElementVisible(this.selectors.apiDocs)) {
      return await this.getElementText(this.selectors.apiDocs);
    }
    return null;
  }

  async clickPushNotificationButton() {
    if (await this.isElementVisible(this.selectors.pushNotificationButton)) {
      await this.clickElement(this.selectors.pushNotificationButton);
      return true;
    }
    return false;
  }

  async getNotificationPermission() {
    return await this.page.evaluate(() => {
      return Notification.permission;
    });
  }

  async isOfflineIndicatorVisible() {
    return await this.isElementVisible(this.selectors.offlineIndicator);
  }

  async getAppIcons() {
    const iconElements = await this.page.$$(this.selectors.appIcon);
    const icons = [];
    
    for (const icon of iconElements) {
      const src = await icon.getAttribute('src');
      const alt = await icon.getAttribute('alt');
      const width = await icon.getAttribute('width');
      const height = await icon.getAttribute('height');
      
      icons.push({ src, alt, width, height });
    }
    
    return icons;
  }

  async getSocialMediaCalendarContent() {
    if (await this.isElementVisible(this.selectors.socialMediaCalendar)) {
      return await this.getElementText(this.selectors.socialMediaCalendar);
    }
    return null;
  }

  async getEmailCampaignContent() {
    if (await this.isElementVisible(this.selectors.emailCampaign)) {
      return await this.getElementText(this.selectors.emailCampaign);
    }
    return null;
  }

  async getLandingPageContent() {
    if (await this.isElementVisible(this.selectors.landingPageContent)) {
      return await this.getElementText(this.selectors.landingPageContent);
    }
    return null;
  }

  async fillSignupForm(email, password, confirmPassword) {
    if (await this.isElementVisible(this.selectors.signupForm)) {
      await this.page.fill(this.selectors.signupForm + ' input[type="email"]', email);
      await this.page.fill(this.selectors.signupForm + ' input[type="password"]', password);
      await this.page.fill(this.selectors.signupForm + ' input[name="confirmPassword"]', confirmPassword);
      return true;
    }
    return false;
  }

  async submitSignupForm() {
    if (await this.isElementVisible(this.selectors.signupForm)) {
      await this.page.click(this.selectors.signupForm + ' button[type="submit"]');
      return true;
    }
    return false;
  }

  async waitForSignupSuccess() {
    await this.page.waitForSelector(this.selectors.signupSuccessMessage, { state: 'visible' });
  }
}

module.exports = LandingPage;
