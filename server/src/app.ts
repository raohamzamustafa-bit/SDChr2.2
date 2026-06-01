import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler.js';

// Routers
import authRouter from './modules/auth/routes.js';
import employeesRouter from './modules/employees/routes.js';
import departmentsRouter from './modules/departments/routes.js';
import attendanceRouter from './modules/attendance/routes.js';
import leavesRouter from './modules/leaves/routes.js';
import payrollRouter from './modules/payroll/routes.js';
import onboardingRouter from './modules/onboarding/routes.js';
import lettersRouter from './modules/letters/routes.js';
import loansRouter from './modules/loans/routes.js';
import complianceRouter from './modules/compliance/routes.js';
import settingsRouter from './modules/settings/routes.js';
import stubsRouter from './modules/stubs/routes.js';

const app = express();

// Standard Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mounting Module Routers
app.use('/api/auth', authRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leaves', leavesRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/letters', lettersRouter);
app.use('/api/loans', loansRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/settings', settingsRouter);

// Mounting premium stubs router (Tier 2 & 3)
app.use('/api', stubsRouter);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
