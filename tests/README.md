# Web Application Test Suite

This test suite covers the comprehensive testing of a web application using Playwright, focusing on the following key areas:

## Features Tested

### 1. User Authentication
- **Login Functionality**: Valid/invalid credentials, form validation, styling compliance
- **Signup Functionality**: User registration, password confirmation, validation
- **Form Validation**: Required fields, email format, password strength

### 2. Navigation - Mobile Menu
- **Mobile Menu Behavior**: Open/close functionality, menu item navigation
- **Responsive Design**: Mobile viewport testing, touch interactions
- **Accessibility**: Proper ARIA labels and keyboard navigation

### 3. Design System
- **Color Palette**: Primary, secondary, success, warning, error colors
- **Typography**: Font families, heading sizes, body text sizes
- **Layout Consistency**: Spacing, padding, responsive design

### 4. API Integration - Payment Gateway
- **Payment Processing**: Successful payments, declined payments, validation
- **Form Handling**: Credit card input, amount validation, error handling
- **API Endpoints**: Payment creation, processing, status checking

### 5. Documentation - API Endpoints
- **API Documentation**: Endpoint listing, authentication requirements
- **Interactive Testing**: Try-it-out functionality, OpenAPI specification
- **Content Validation**: Method, path, description accuracy

## Test Structure

```
tests/
├── webAppSuite.spec.js      # Main UI test suite
├── apiTests.spec.js         # API integration tests
├── utils/
│   └── testHelpers.js       # Page objects and utilities
└── README.md               # This file
```

## Test Data Management

All test data is centralized in `data/testData.json` and includes:

- **User Authentication Data**: Valid/invalid credentials, user profiles
- **Navigation Data**: Menu items, breakpoints
- **Design System Data**: Color codes, typography specifications
- **Payment Data**: Test card numbers, amounts, endpoints
- **API Documentation**: Endpoint specifications, authentication requirements

## Page Object Models

The test suite uses Page Object Models for better maintainability:

- `LoginPage`: Handles login form interactions
- `SignupPage`: Manages user registration
- `MobileNavigation`: Mobile menu functionality
- `PaymentPage`: Payment form processing
- `ApiDocsPage`: API documentation page

## Running the Tests

### Prerequisites
- Node.js (v16 or higher)
- Playwright installed: `npm install @playwright/test`

### Installation
```bash
npm install
npx playwright install
```

### Running Tests

#### Run all tests
```bash
npx playwright test
```

#### Run specific test file
```bash
npx playwright test webAppSuite.spec.js
npx playwright test apiTests.spec.js
```

#### Run tests in headed mode
```bash
npx playwright test --headed
```

#### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

#### Run tests in mobile viewport
```bash
npx playwright test --project="Mobile Chrome"
```

### Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Test Configuration

The test suite is configured in `playwright.config.js` with:

- **Parallel Execution**: Tests run in parallel for faster execution
- **Retry Logic**: Failed tests retry on CI environments
- **Multiple Browsers**: Chrome, Firefox, Safari support
- **Mobile Testing**: Mobile viewport configurations
- **Screenshot Capture**: Automatic screenshots on failure

## Best Practices Implemented

### 1. Data-Driven Testing
- All test data externalized to JSON file
- No hardcoded values in test files
- Easy maintenance and updates

### 2. Page Object Pattern
- Encapsulated page interactions
- Reusable components
- Reduced code duplication

### 3. Comprehensive Coverage
- Happy path scenarios
- Error handling
- Edge cases
- Accessibility testing

### 4. API Testing
- RESTful API testing
- Authentication flows
- Error response validation
- Documentation verification

### 5. Mobile-First Testing
- Responsive design validation
- Touch interaction testing
- Mobile menu functionality

## Test Categories

### UI Tests (`webAppSuite.spec.js`)
- **Authentication Tests**: Login/signup flows, validation
- **Navigation Tests**: Mobile menu behavior
- **Design System Tests**: Colors, typography, layout
- **Payment Tests**: Form validation, user interactions
- **Documentation Tests**: Content verification

### API Tests (`apiTests.spec.js`)
- **Payment Gateway API**: Payment processing endpoints
- **User Management API**: Authentication, user CRUD
- **Documentation API**: Endpoint verification
- **Error Handling**: Malformed requests, validation errors

## Mocking Strategy

Since this is an exercise with non-existent features:

1. **UI Tests**: Use realistic selectors and expect common UI patterns
2. **API Tests**: Test against expected API contracts
3. **Error Scenarios**: Validate proper error handling
4. **Design System**: Verify CSS properties and styling

## Continuous Integration

The test suite is configured for CI environments:

- **Parallel Execution**: Optimized for CI pipelines
- **Retry Logic**: Handles flaky tests
- **Screenshot Capture**: Visual regression testing
- **HTML Reports**: Detailed test results

## Troubleshooting

### Common Issues

1. **Tests failing due to missing elements**
   - Update selectors in page objects
   - Check if application structure changed

2. **API tests failing**
   - Verify base URL configuration
   - Check if API endpoints are available

3. **Mobile tests not working**
   - Ensure mobile viewport is set correctly
   - Verify mobile menu selectors

### Debug Mode

Run tests in debug mode for step-by-step execution:
```bash
npx playwright test --debug
```

## Future Enhancements

1. **Visual Regression Testing**: Compare screenshots across versions
2. **Performance Testing**: Measure page load times
3. **Accessibility Testing**: Automated a11y compliance
4. **Cross-Browser Testing**: Extended browser coverage
5. **Mobile Device Testing**: Real device testing

## Contributing

When adding new tests:

1. Follow the existing page object pattern
2. Add test data to `data/testData.json`
3. Include both positive and negative test cases
4. Add appropriate assertions and error handling
5. Update this README with new test descriptions 