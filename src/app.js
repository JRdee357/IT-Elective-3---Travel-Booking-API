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

// Swagger UI needs relaxed CSP to load its assets (inline init + CDN scripts/styles)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        "style-src": ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        "connect-src": ["'self'", "https://unpkg.com"],
        "img-src": ["'self'", "data:", "https://unpkg.com"],
        "font-src": ["'self'", "https://unpkg.com"],
      },
    },
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

// Serve Swagger UI using CDN assets to avoid local asset path issues on serverless hosting
app.get('/api-docs', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        SwaggerUIBundle({
          url: '/api-docs.json',
          dom_id: '#swagger-ui',
          docExpansion: 'none',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset
          ],
          layout: "BaseLayout",
          displayRequestDuration: true,
          showExtensions: true
        });
      };
    </script>
  </body>
</html>
  `);
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;

