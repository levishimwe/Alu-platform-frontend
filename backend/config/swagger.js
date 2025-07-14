const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');

// Check if swagger.json exists in docs folder
const swaggerJsonPath = path.join(__dirname, '../docs/swagger.json');
let swaggerDocument = {};

if (fs.existsSync(swaggerJsonPath)) {
  // Use existing swagger.json
  try {
    swaggerDocument = require(swaggerJsonPath);
    console.log('✅ Loaded existing swagger.json');
  } catch (error) {
    console.log('⚠️ Error loading swagger.json, using default config');
    swaggerDocument = createDefaultSwagger();
  }
} else {
  console.log('📝 Creating default Swagger configuration');
  swaggerDocument = createDefaultSwagger();
}

function createDefaultSwagger() {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'ALU Platform API',
        version: '1.0.0',
        description: 'API documentation for ALU Platform - Graduate Showcase & Investor Portal',
      },
      servers: [
        {
          url: process.env.API_BASE_URL || 'http://localhost:5000/api',
          description: 'Development server',
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
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ['./routes/*.js'], // Path to the API docs
  };

  return swaggerJsdoc(options);
}

module.exports = {
  swaggerUi,
  swaggerDocument,
};
