import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
    /*  #swagger.tags = ['Health Check']
        #swagger.description = 'Check the health status of the server'
        #swagger.responses[200] = {
            description: 'Server is running normally',
            schema: {
                type: 'object',
                properties: {
                    status: { type: 'string', example: 'OK' },
                    timestamp: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00Z' },
                    uptime: { type: 'number', example: 3600 },
                    version: { type: 'string', example: '1.0.0' }
                }
            }
        }
    */
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

export default router;
