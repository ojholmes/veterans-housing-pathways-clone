require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;
const clientsRouter = require('./routes/clients');
const interactionsRouter = require('./routes/interactions');
const landlordsRouter = require('./routes/landlords');
const dashboardsRouter = require('./routes/dashboards');
const adminRouter = require('./routes/admin');
const templatesRouter = require('./routes/templates');
const authRouter = require('./routes/auth');
const rateLimit = require('express-rate-limit');
const { scheduleDaily } = require('./scheduler');
const http = require('http');
const { initWebSocketServer } = require('./wsServer');

app.use(express.json());
// Enable CORS for local frontend dev
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));

// Basic rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: Number(process.env.RATE_LIMIT_MAX) || 200 });
app.use(limiter);

// Auth routes
app.use('/auth', authRouter);

app.use('/clients', clientsRouter);
app.use('/interactions', interactionsRouter);
app.use('/landlords', landlordsRouter);
app.use('/dashboards', dashboardsRouter);
app.use('/admin', adminRouter);
// Template management (DB-backed)
app.use('/admin/templates', templatesRouter);

app.get('/', (req, res) => res.json({ app: 'Veterans Housing Pathways', version: '0.1.0' }));

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  // start scheduled jobs
  scheduleDaily();
  // start websocket server
  initWebSocketServer(server);
});
