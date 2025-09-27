export const swaggerConfig = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'News Posts API',
            version: '1.0.0',
            description: 'API для управління новинними постами з повним CRUD функціоналом',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:8000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Bearer token for authentication'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./routes/*.ts', './controller/*.ts', './server.ts']
};

export const swaggerOptions = {
    customCss: `
        .swagger-ui .topbar { 
            display: none; 
        }
        .swagger-ui .info .title {
            color: #3b82f6;
            font-size: 2.5rem;
        }
        .swagger-ui .scheme-container {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
    `,
    customSiteTitle: 'News Posts API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
        filter: true,
        syntaxHighlight: {
            theme: 'nord'
        }
    }
};
