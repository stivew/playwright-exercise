### Data-Driven Playwright Test Suite

This suite verifies the demo app board's cards and their tags using a data-driven approach and the Page Object Model (POM).

### Tech
- Playwright (@playwright/test)
- JavaScript
- dotenv for environment configuration

### Environment
Create a `.env` at the repository root:

```
BASE_URL=https://animated-gingersnap-8cf7f2.netlify.app/
DEMO_EMAIL=admin
DEMO_PASSWORD=password123
```

`BASE_URL` is also defaulted in config to the demo app if not set.

### Structure

```
tests/
├── cardsTags.spec.js        # Data-driven cards/tags suite
└── utils/
    └── testHelpers.js       # POMs, including BoardPage
data/
└── testData.json            # Card titles and expected tags
```

### Run

```
npm install
npx playwright install
npx playwright test
```

Open HTML report:

```
npx playwright show-report
```

### Notes
- Tests are driven entirely from `data/testData.json`
- Uses `BoardPage` POM to find a card by title and assert tags within that card
- Designed to be resilient with text-based selectors, given the demo app is read-only
   - This also determines all tests to be mockups by nature: there is no demo app to explicitly test