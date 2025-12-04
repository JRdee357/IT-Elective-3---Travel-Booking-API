const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    origin: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    seatsAvailable: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Delayed', 'Cancelled'],
      default: 'Scheduled',
    },
    amenities: {
      wifi: { type: Boolean, default: false },
      meals: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const Flight = mongoose.model('Flight', FlightSchema);

// Shared schema definitions for docs/tools to avoid duplication
const flightSchemaProperties = {
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
      meals: { type: 'boolean' },
    },
  },
};

const flightRequiredFields = [
  'flightNumber',
  'origin',
  'destination',
  'departureTime',
  'arrivalTime',
  'price',
  'totalSeats',
  'seatsAvailable',
];

// OpenAPI / Swagger schema (reference in swagger.js)
Flight.openapiSchema = {
  type: 'object',
  required: flightRequiredFields,
  properties: flightSchemaProperties,
};

// JSON Schema (draft-07) for tooling/scripts
Flight.jsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Flight',
  type: 'object',
  required: flightRequiredFields,
  properties: {
    ...flightSchemaProperties,
    departureTime: { type: 'string', format: 'date-time' },
    arrivalTime: { type: 'string', format: 'date-time' },
  },
  additionalProperties: false,
};

module.exports = Flight;

