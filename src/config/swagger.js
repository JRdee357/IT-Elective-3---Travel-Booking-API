const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Travel Booking API',
      version: '1.0.0',
      description:
        'API for searching flights, managing users, and booking travel itineraries.',
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || 'http://localhost:5000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        CreateUser: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
            phone: { type: 'string' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            flightId: { type: 'string' },
            passengers: { type: 'integer', minimum: 1 },
            passengerDetails: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  seat: { type: 'string' },
                },
              },
            },
            extras: {
              type: 'object',
              properties: {
                baggage: { type: 'integer' },
                mealPreference: { type: 'string' },
              },
            },
          },
        },
        Flight: {
          type: 'object',
          required: [
            'flightNumber',
            'origin',
            'destination',
            'departureTime',
            'arrivalTime',
            'price',
            'totalSeats',
            'seatsAvailable'
          ],
          properties: {
            flightNumber: { type: 'string', description: 'Unique flight code (uppercase)' },
            origin: { type: 'string', description: 'Origin airport/city code (uppercase)' },
            destination: { type: 'string', description: 'Destination airport/city code (uppercase)' },
            departureTime: { type: 'string', format: 'date-time' },
            arrivalTime: { type: 'string', format: 'date-time' },
            price: { type: 'number', minimum: 0 },
            totalSeats: { type: 'integer', minimum: 1 },
            seatsAvailable: { type: 'integer', minimum: 0 },
            status: { type: 'string', enum: ['Scheduled', 'Delayed', 'Cancelled'] },
            amenities: {
              type: 'object',
              properties: {
                wifi: { type: 'boolean' },
                meals: { type: 'boolean' }
              }
            }
          }
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);

