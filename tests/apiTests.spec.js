import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load test data from JSON file
const testData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/testData.json'), 'utf8'));

test.describe('API Integration Tests', () => {
  const baseURL = 'http://localhost:3000';

  test.describe('Payment Gateway API', () => {
    test('should create payment intent successfully', async ({ request }) => {
      const paymentData = testData.webapp.apiIntegration.paymentGateway;
      
      const response = await request.post(`${baseURL}${paymentData.endpoints.createPayment}`, {
        data: {
          amount: paymentData.amounts.small,
          currency: 'usd',
          payment_method_types: ['card']
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('amount');
      expect(responseBody.amount).toBe(paymentData.amounts.small);
    });

    test('should process payment with valid card', async ({ request }) => {
      const paymentData = testData.webapp.apiIntegration.paymentGateway;
      
      const response = await request.post(`${baseURL}${paymentData.endpoints.processPayment}`, {
        data: {
          payment_intent_id: 'pi_test_123',
          payment_method: {
            card: {
              number: paymentData.testCards.success,
              exp_month: 12,
              exp_year: 2025,
              cvc: '123'
            }
          }
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.status).toBe('succeeded');
    });

    test('should handle declined payment gracefully', async ({ request }) => {
      const paymentData = testData.webapp.apiIntegration.paymentGateway;
      
      const response = await request.post(`${baseURL}${paymentData.endpoints.processPayment}`, {
        data: {
          payment_intent_id: 'pi_test_123',
          payment_method: {
            card: {
              number: paymentData.testCards.declined,
              exp_month: 12,
              exp_year: 2025,
              cvc: '123'
            }
          }
        }
      });

      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.error).toBe('card_declined');
    });

    test('should get payment status', async ({ request }) => {
      const paymentData = testData.webapp.apiIntegration.paymentGateway;
      
      const response = await request.get(`${baseURL}${paymentData.endpoints.getPaymentStatus}`, {
        params: {
          payment_intent_id: 'pi_test_123'
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('status');
      expect(responseBody).toHaveProperty('amount');
    });
  });

  test.describe('User Management API', () => {
    test('should create new user account', async ({ request }) => {
      const userData = testData.webapp.userAuth.signup.validUser;
      
      const response = await request.post(`${baseURL}/api/users`, {
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password
        }
      });

      expect(response.status()).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('id');
      expect(responseBody.email).toBe(userData.email);
      expect(responseBody).not.toHaveProperty('password'); // Password should not be returned
    });

    test('should authenticate user with valid credentials', async ({ request }) => {
      const credentials = testData.webapp.userAuth.login.validCredentials;
      
      const response = await request.post(`${baseURL}/api/auth/login`, {
        data: {
          email: credentials.email,
          password: credentials.password
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('token');
      expect(responseBody).toHaveProperty('user');
    });

    test('should reject invalid credentials', async ({ request }) => {
      const credentials = testData.webapp.userAuth.login.invalidCredentials;
      
      const response = await request.post(`${baseURL}/api/auth/login`, {
        data: {
          email: credentials.email,
          password: credentials.password
        }
      });

      expect(response.status()).toBe(401);
      const responseBody = await response.json();
      expect(responseBody.error).toBe('Invalid credentials');
    });

    test('should get user profile with authentication', async ({ request }) => {
      // First login to get token
      const credentials = testData.webapp.userAuth.login.validCredentials;
      const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
        data: {
          email: credentials.email,
          password: credentials.password
        }
      });
      
      const loginBody = await loginResponse.json();
      const token = loginBody.token;

      // Use token to get user profile
      const response = await request.get(`${baseURL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('email');
    });

    test('should reject unauthorized access to protected endpoints', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/users/profile`);

      expect(response.status()).toBe(401);
      const responseBody = await response.json();
      expect(responseBody.error).toBe('Authentication required');
    });
  });

  test.describe('API Documentation Endpoints', () => {
    test('should return API documentation in JSON format', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/docs`);

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('endpoints');
      
      // Verify all documented endpoints are present
      const documentedEndpoints = testData.webapp.documentation.apiEndpoints;
      for (const endpoint of documentedEndpoints) {
        const foundEndpoint = responseBody.endpoints.find(
          ep => ep.method === endpoint.method && ep.path === endpoint.path
        );
        expect(foundEndpoint).toBeDefined();
        expect(foundEndpoint.description).toBe(endpoint.description);
        expect(foundEndpoint.requiresAuth).toBe(endpoint.requiresAuth);
      }
    });

    test('should return OpenAPI specification', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/docs/openapi.json`);

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('openapi');
      expect(responseBody).toHaveProperty('info');
      expect(responseBody).toHaveProperty('paths');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle malformed JSON requests', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/users`, {
        data: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.error).toBe('Invalid JSON');
    });

    test('should handle missing required fields', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/users`, {
        data: {
          firstName: 'John'
          // Missing other required fields
        }
      });

      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.error).toBe('Missing required fields');
    });

    test('should handle invalid email format', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/users`, {
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
          password: 'password123'
        }
      });

      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.error).toBe('Invalid email format');
    });

    test('should handle server errors gracefully', async ({ request }) => {
      // Test with an endpoint that might cause server error
      const response = await request.get(`${baseURL}/api/nonexistent-endpoint`);

      expect(response.status()).toBe(404);
      const responseBody = await response.json();
      expect(responseBody.error).toBe('Endpoint not found');
    });
  });
}); 