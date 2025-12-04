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
        BookingPassenger: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            seat: { type: 'string' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Booking ID' },
            user: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phone: { type: 'string' },
              },
            },
            flight: {
              $ref: '#/components/schemas/Flight',
            },
            passengers: { type: 'integer', minimum: 1 },
            passengerDetails: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/BookingPassenger',
              },
            },
            extras: {
              type: 'object',
              properties: {
                baggage: { type: 'integer' },
                mealPreference: { type: 'string' },
              },
            },
            payment: {
              type: 'object',
              properties: {
                amount: { type: 'number' },
                currency: { type: 'string' },
                method: { type: 'string' },
                last4: { type: 'string' },
              },
            },
            status: { type: 'string', enum: ['Confirmed', 'Canceled'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
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
            _id: { type: 'string', description: 'Flight ID' },
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
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
          },
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

