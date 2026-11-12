export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'MyJourney Bus Booking & Operations API',
    version: '1.0.0',
    description: 'REST API for MyJourney bus booking, fleet management, operator manifests, and ticketing portal.',
    contact: {
      name: 'ALGIONS AI LABS Development Team',
      email: 'engineering@algions.com'
    }
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1'
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token'
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check endpoint',
        responses: {
          200: { description: 'Server is healthy' }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Register new passenger user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  phone: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Registration successful' },
          409: { description: 'Email already exists' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user and set cookie',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/stops': {
      get: {
        summary: 'List active bus stops',
        responses: {
          200: { description: 'List of bus stops' }
        }
      }
    },
    '/trips': {
      get: {
        summary: 'Search trips by origin, destination, and travel date',
        parameters: [
          { name: 'originStopId', in: 'query', schema: { type: 'string' } },
          { name: 'destinationStopId', in: 'query', schema: { type: 'string' } },
          { name: 'travelDate', in: 'query', required: true, schema: { type: 'string', example: '2026-11-10' } }
        ],
        responses: {
          200: { description: 'Matching trips with availability and calculated fare' }
        }
      }
    },
    '/bookings': {
      post: {
        summary: 'Book one or more seats with ACID transactional guarantee',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          201: { description: 'Booking confirmed with PNR' },
          409: { description: 'Seat conflict: one or more seats are already booked' }
        }
      }
    },
    '/bookings/{pnr}/cancel': {
      post: {
        summary: 'Cancel confirmed booking and release seats with simulated refund calculation',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'pnr', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Booking cancelled and seats released' },
          400: { description: 'Not eligible or trip departed' }
        }
      }
    }
  }
};

