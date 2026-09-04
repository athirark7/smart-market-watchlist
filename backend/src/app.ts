import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import watchlistRouter from './routes/watchlist';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/watchlist', watchlistRouter);

export default app;
