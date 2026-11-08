import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import publicRoutes from './routes/public.routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.disable('x-powered-by');
// Needed behind Render/Railway/Nginx so req.ip is the real client (TRUST_PROXY=1).
app.set('trust proxy', env.trustProxy);

// Public website API — mounted first, outside auth and outside the CRM CORS.
app.use('/api/public', publicRoutes);

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', routes);

app.use(errorMiddleware);

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
