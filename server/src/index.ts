import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { swaggerSpec } from './docs/swagger';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import clientsRoutes from './modules/clients/clients.routes';
import servicesRoutes from './modules/services/services.routes';
import materialsRoutes from './modules/materials/materials.routes';
import ordersRoutes from './modules/orders/orders.routes';
import orderServicesRoutes from './modules/order-services/orderServices.routes';
import orderMaterialsRoutes from './modules/order-materials/orderMaterials.routes';
import materialRequestsRoutes from './modules/material-requests/materialRequests.routes';

const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api', orderServicesRoutes);
app.use('/api', orderMaterialsRoutes);
app.use('/api', materialRequestsRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
  console.log(`Swagger docs:    http://localhost:${env.port}/api/docs`);
});
