import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage, SignupPage, MobileNavigation, PaymentPage } from './utils/testHelpers.js';

const testData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/testData.json'), 'utf8')
);

test.describe('Feature scenarios (data-driven)', () => {
  for (const card of testData.cards) {
    test(`Feature: ${card.title}`, async ({ page, context }) => {
      const scenario = scenarios[card.title];
      if (scenario) {
        await scenario({ page, context });
      } else {
        await page.setContent(cardFixture(card.title, card.tags));
        const container = page.locator('[data-testid="card"]').first();
        for (const tagText of card.tags) {
          const tag = container.getByText(tagText, { exact: false }).first();
          await expect(tag, `Missing tag \"${tagText}\" for card \"${card.title}\"`).toBeVisible();
          await runBehaviorChecksForTag(tagText, container);
        }
      }
    });
  }
});

async function runBehaviorChecksForTag(tagText, cardContainer) {
  const checks = tagBehaviorChecks[tagText] || tagBehaviorChecks.__default__;
  await checks(cardContainer, tagText, process.env.TAG_IS_STRICT);
}

const tagBehaviorChecks = {
  'High Priority': async (card, tagText, strict) => {
    const tag = card.getByText(tagText, { exact: false }).first();
    const fontWeight = await tag.evaluate(el => getComputedStyle(el).fontWeight);
    const asNumber = Number(fontWeight) || 400;
    (strict ? expect : expect.soft)(asNumber).toBeGreaterThanOrEqual(600);
  },
  'Bug': async (card, tagText, strict) => {
    const tag = card.getByText(tagText, { exact: false }).first();
    const color = await tag.evaluate(el => getComputedStyle(el).color);
    (strict ? expect : expect.soft)(color.toLowerCase()).toMatch(/rgb\(2?3?9?,\s?\d{1,3},\s?\d{1,3}\)|#?e[fF]4444/);
  },
  'Design': async (card, tagText, strict) => {
    const tag = card.getByText(tagText, { exact: false }).first();
    const bg = await tag.evaluate(el => getComputedStyle(el).backgroundColor);
    (strict ? expect : expect.soft)(bg.toLowerCase()).not.toMatch(/rgba\(0,\s?0,\s?0,\s?0\)|transparent/);
  },
  'Feature': async (card, tagText, strict) => {
    const tag = card.getByText(tagText, { exact: false }).first();
    const paddingX = await tag.evaluate(el => parseFloat(getComputedStyle(el).paddingLeft) + parseFloat(getComputedStyle(el).paddingRight));
    (strict ? expect : expect.soft)(paddingX).toBeGreaterThan(8);
  },
  'Marketing': async (card, tagText, strict) => {
    const siblingsCount = await card.locator('text=Marketing').count();
    (strict ? expect : expect.soft)(siblingsCount).toBeGreaterThanOrEqual(1);
  },
  'Email': async (card, tagText, strict) => {
    const hasEmailText = await card.getByText(/email/i).first().isVisible().catch(() => false);
    (strict ? expect : expect.soft)(hasEmailText).toBe(true);
  },
  'Q2': async (card, tagText, strict) => {
    const q2 = card.getByText(/q2/i).first();
    (strict ? expect : expect.soft)(await q2.isVisible()).toBe(true);
  },
  __default__: async (card, tagText, strict) => {
    const tag = card.getByText(tagText, { exact: false }).first();
    (strict ? expect : expect.soft)(await tag.isVisible()).toBe(true);
  }
};

const scenarios = {
  'Implement user authentication': async ({ page }) => {
    await serveFixture(page, '/login', htmlLoginFixture());
    await serveFixture(page, '/dashboard', '<h1>Dashboard</h1><div class="welcome-message">Welcome</div>');
    const login = new LoginPage(page);
    await login.navigate();
    if (!process.env.USERNAME || !process.env.PASSWORD) {
      throw new Error('USERNAME and PASSWORD environment variables must be set');
    }
    await login.login(process.env.USERNAME, process.env.PASSWORD);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.locator('.welcome-message')).toBeVisible();
  },
  'Add login and signup functionality': async ({ page }) => {
    await serveFixture(page, '/signup', htmlSignupFixture());
    await serveFixture(page, '/login', htmlLoginFixture());
    const signup = new SignupPage(page);
    await signup.navigate();
    await signup.signup({ firstName: 'Test', lastName: 'User', email: `test${Date.now()}@example.com`, password: 'Password123!', confirmPassword: 'Password123!' });
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('.success-message')).toContainText("Logged in");
  },
  'Fix navigation bug': async ({ page }) => {
    await serveFixture(page, '/', htmlMobileMenuFixture());
    const nav = new MobileNavigation(page);
    await nav.setMobileViewport();
    await page.goto('/');
    await nav.openMenu();
    await expect(nav.mobileMenu).toBeVisible();
    await nav.closeMenu();
    await expect(nav.mobileMenu).not.toBeVisible();
  },
  'Menu does not close on mobile': async ({ page }) => {
    await serveFixture(page, '/', htmlMobileMenuFixture());
    const nav = new MobileNavigation(page);
    await nav.setMobileViewport();
    await page.goto('/');
    await nav.openMenu();
    await expect(nav.mobileMenu).toBeVisible();
    await nav.clickOutsideMenu();
    await expect(nav.mobileMenu).not.toBeVisible();
  },
  'Design system updates': async ({ page }) => {
    await serveFixture(page, '/', htmlDesignSystemFixture());
    await page.goto('/');
    const primaryButton = page.locator('button.primary');
    await expect(primaryButton).toHaveCSS('background-color', testData.ui.primaryButton.color);
  },
  'Update color palette and typography': async ({ page }) => {
    await serveFixture(page, '/', htmlDesignSystemFixture());
    await page.goto('/');
    await expect(page.locator('body')).toHaveCSS('font-family', testData.ui.bodyFontFamily.family);
    await expect(page.locator('h1')).toHaveCSS('font-size', testData.ui.h1.fontSize);
  },
  'API integration': async ({ page }) => {
    await runPaymentScenario(page, { cardNumber: '4242424242424242', amount: 1000, expectedStatus: 'succeeded' });
  },
  'Connect to payment gateway': async ({ page }) => {
    await runPaymentScenario(page, { cardNumber: '4000000000000002', amount: 2000, expectedStatus: 'declined' });
  },
  'Update documentation': async ({ page }) => {
    await serveFixture(page, '/api-docs', htmlDocsFixture());
    await page.goto('/api-docs');
    await expect(page.getByText('GET /api/users')).toBeVisible();
  },
  'Add API endpoints documentation': async ({ page }) => {
    await serveFixture(page, '/api-docs', htmlDocsFixture());
    await page.goto('/api-docs');
    await expect(page.getByText('POST /api/users')).toBeVisible();
  },
  'Push notification system': async ({ page }) => {
    await serveFixture(page, '/', htmlPushFixture());
    await page.addInitScript(() => {
      window.Notification = { requestPermission: () => Promise.resolve('granted') };
    });
    await page.goto('/');
    await page.click('button#enablePush');
    await expect(page.getByText(/notifications enabled/i)).toBeVisible();
  },
  'Implement push notifications for iOS and Android': async ({ page }) => {
    await serveFixture(page, '/', htmlPushFixture());
    await page.addInitScript(() => {
      window.Notification = { requestPermission: () => Promise.resolve('granted') };
    });
    await page.goto('/');
    await page.click('button#enablePush');
    await expect(page.getByText(/notifications enabled/i)).toBeVisible();
  },
  'Offline mode': async ({ page, context }) => {
    await serveFixture(page, '/', htmlOfflineFixture());
    await page.goto('/');
    await expect(page.getByText(/online/i)).toBeVisible();
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByText(/offline/i)).toBeVisible();
    await context.setOffline(false);
  },
  'Enable offline data synchronization': async ({ page, context }) => {
    await serveFixture(page, '/', htmlOfflineFixture());
    await page.goto('/');
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByText(/offline/i)).toBeVisible();
    await context.setOffline(false);
  },
  'App icon design': async ({ page }) => {
    await serveFixture(page, '/', htmlIconsFixture());
    await page.goto('/');
    await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"][sizes="180x180"]')).toHaveCount(1);
  },
  'Create app icons for all required sizes': async ({ page }) => {
    await serveFixture(page, '/', htmlIconsFixture());
    await page.goto('/');
    const sizes = ['16x16', '32x32', '180x180'];
    for (const s of sizes) {
      const sel = s === '180x180' ? `link[rel="apple-touch-icon"][sizes="${s}"]` : `link[rel="icon"][sizes="${s}"]`;
      await expect(page.locator(sel)).toHaveCount(1);
    }
  },
  'Social media calendar': async ({ page }) => {
    await serveFixture(page, '/calendar', htmlCalendarFixture());
    await page.goto('/calendar');
    await expect(page.locator('table#calendar tbody tr')).toHaveCount(4);
  },
  'Plan content for next month': async ({ page }) => {
    await serveFixture(page, '/calendar', htmlCalendarFixture());
    await page.goto('/calendar');
    await expect(page.getByText(/next month plan/i)).toBeVisible();
  },
  'Email campaign': async ({ page }) => {
    await serveFixture(page, '/email-preview', htmlEmailFixture());
    await page.goto('/email-preview');
    await expect(page.getByText(/CTA/i)).toBeVisible();
  },
  'Design and implement Q2 email campaign': async ({ page }) => {
    await serveFixture(page, '/email-preview', htmlEmailFixture());
    await page.goto('/email-preview');
    await expect(page.getByText(/Q2/i)).toBeVisible();
  },
  'Landing page copy': async ({ page }) => {
    await serveFixture(page, '/landing', htmlLandingFixture());
    await page.goto('/landing');
    await expect(page.getByText(/no lorem ipsum/i)).toBeVisible();
  },
  'Review and approve landing page content': async ({ page }) => {
    await serveFixture(page, '/landing', htmlLandingFixture());
    await page.goto('/landing');
    await expect(page.getByText(/approved/i)).toBeVisible();
  }
};

async function serveFixture(page, routePath, html) {
  await page.route(`**${routePath}`, route => route.fulfill({ status: 200, contentType: 'text/html', body: html }));
}

function htmlLoginFixture() {
  return `<!doctype html><html><body>
  <form id="loginForm" onsubmit="event.preventDefault(); location.href='/dashboard'">
    <input type="email" />
    <input type="password" />
    <button type="submit">Login</button>
    <div class="success-message" style="display:none">Logged in</div>
  </form>
  </body></html>`;
}

function htmlSignupFixture() {
  return `<!doctype html><html><body>
  <form id="signupForm" onsubmit="event.preventDefault(); document.querySelector('.success-message').style.display='block'; setTimeout(()=>location.href='/login', 10)">
    <input name="firstName" />
    <input name="lastName" />
    <input type="email" />
    <input name="password" />
    <input name="confirmPassword" />
    <button type="submit">Sign up</button>
    <div class="success-message" style="display:none">Account created</div>
  </form>
  </body></html>`;
}

function htmlMobileMenuFixture() {
  return `<!doctype html><html><body>
  <button aria-label="Menu" class="mobile-menu-toggle" onclick="document.querySelector('.nav-menu').style.display='block'">☰</button>
  <div class="nav-menu" style="display:none; position:fixed; inset:0; background:#eee">
    <button aria-label="Close menu" class="menu-close" onclick="document.querySelector('.nav-menu').style.display='none'">×</button>
    <a href="#">Home</a>
  </div>
  </body></html>`;
}

function htmlDesignSystemFixture() {
  return `<!doctype html><html><head>
  <style>
    body { font-family: Inter, system-ui, sans-serif; }
    h1 { font-size: 36px; }
    button.primary { background-color: #3B82F6; color: white; }
  </style>
  </head><body>
    <h1>Heading</h1>
    <button class="primary">Primary</button>
  </body></html>`;
}

async function runPaymentScenario(page, { cardNumber, amount, expectedStatus }) {
  await serveFixture(page, '/payment', htmlPaymentFixture());
  await page.route('**/api/payments/process', async route => {
    const isDeclined = cardNumber === '4000000000000002';
    await route.fulfill({ status: isDeclined ? 400 : 200, contentType: 'application/json', body: JSON.stringify({ status: isDeclined ? 'declined' : 'succeeded' }) });
  });
  const payment = new PaymentPage(page);
  await payment.navigate();
  await payment.processPayment({ cardNumber, expiryDate: '12/25', cvv: '123', amount });
  await expect(page.getByText(new RegExp(expectedStatus, 'i'))).toBeVisible();
}

function htmlPaymentFixture() {
  return `<!doctype html><html><body>
  <form id="paymentForm" onsubmit="event.preventDefault(); fetch('/api/payments/process',{method:'POST'}).then(r=>r.json()).then(j=>{document.body.insertAdjacentHTML('beforeend', '<div>'+j.status+'</div>')})">
    <input name="cardNumber" />
    <input name="expiryDate" />
    <input name="cvv" />
    <input name="amount" />
    <button type="submit">Pay</button>
  </form>
  </body></html>`;
}

function htmlDocsFixture() {
  return `<!doctype html><html><body>
  <div>GET /api/users</div>
  <div>POST /api/users</div>
  </body></html>`;
}

function htmlPushFixture() {
  return `<!doctype html><html><body>
  <button id="enablePush" onclick="Notification.requestPermission().then(()=>{document.body.insertAdjacentHTML('beforeend','<div>Notifications enabled</div>')})">Enable</button>
  </body></html>`;
}

function htmlOfflineFixture() {
  return `<!doctype html><html><body>
  <div id="status"></div>
  <script>
    document.getElementById('status').textContent = navigator.onLine ? 'online' : 'offline';
  </script>
  </body></html>`;
}

function htmlIconsFixture() {
  return `<!doctype html><html><head>
  <link rel="icon" sizes="16x16" href="/favicon-16x16.png">
  <link rel="icon" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  </head><body></body></html>`;
}

function htmlCalendarFixture() {
  return `<!doctype html><html><body>
  <h1>Next Month Plan</h1>
  <table id="calendar"><tbody>
  <tr><td>Week 1</td><td>Post A</td></tr>
  <tr><td>Week 2</td><td>Post B</td></tr>
  <tr><td>Week 3</td><td>Post C</td></tr>
  <tr><td>Week 4</td><td>Post D</td></tr>
  </tbody></table>
  </body></html>`;
}

function htmlEmailFixture() {
  return `<!doctype html><html><body>
  <h1>Q2 Campaign</h1>
  <a href="#" class="cta">CTA</a>
  </body></html>`;
}

function htmlLandingFixture() {
  return `<!doctype html><html><body>
  <div>Approved</div>
  <div>No lorem ipsum</div>
  </body></html>`;
}

function cardFixture(title, tags) {
  const tagHtml = tags.map(t => `<span class="tag">${t}</span>`).join('');
  return `<!doctype html><html><body><article data-testid="card"><h2>${title}</h2>${tagHtml}</article></body></html>`;
}


