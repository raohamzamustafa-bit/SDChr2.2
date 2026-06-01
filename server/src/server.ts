import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/database.js';
import { ensureBucketExists } from './config/minio.js';

const PORT = env.PORT || 4000;
const server = http.createServer(app);

async function startServer() {
  try {
    // 1. Verify Database Connection
    console.log('🔄 Connecting to PostgreSQL database...');
    const dbClient = await pool.connect();
    console.log('✅ PostgreSQL connected successfully!');
    dbClient.release();

    // 2. Verify MinIO Connection & Bucket Creation
    console.log('🔄 Checking MinIO S3 bucket configuration...');
    await ensureBucketExists();
    console.log('✅ MinIO configured successfully!');

    // 3. Boot Express Server
    server.listen(PORT, () => {
      console.log(`🚀 HRMS Backend Server running on http://localhost:${PORT}`);
      console.log(`👉 API Docs Health Check available at http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Failed to boot HRMS Server:', err);
    process.exit(1);
  }
}

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received. Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ HTTP server closed.');
    pool.end(() => {
      console.log('✅ Database connections closed.');
      process.exit(0);
    });
  });
});

startServer();
