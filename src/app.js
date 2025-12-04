const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const flightRoutes = require('./routes/flight.routes');
const userRoutes = require('./routes/user.routes');
const bookingRoutes = require('./routes/booking.routes');
const authRoutes = require('./routes/auth.routes');
const swaggerSpec = require('./config/swagger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Swagger UI loads its own JS/CSS assets; relax helmet for those resources
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) =>
  res.json({
    message: 'Travel Booking API',
    docs: '/api-docs',
    health: '/health',
  })
);

app.get('/health', (req, res) =>
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
);

app.use('/api/v1/flights', flightRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/auth', authRoutes);

// Expose raw OpenAPI spec for debugging (helps verify Swagger loads correctly)
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
// Custom Swagger UI page to avoid asset path issues on serverless hosting
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: {
    url: '/api-docs.json',
  },
}));

app.use(notFound);
app.use(errorHandler);

module.exports = app;

