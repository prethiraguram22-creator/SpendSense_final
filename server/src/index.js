import { createApp } from './app.js';
import { env } from './config/env.js';
import { isSupabaseConfigured } from './config/supabase.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log('==================================================');
  console.log(`🚀 SpendSense API server running on port ${env.PORT}`);
  console.log(`🌐 Environment: ${env.NODE_ENV}`);
  console.log(`📡 Health check: http://localhost:${env.PORT}/api/health`);
  console.log(`🛡️  Supabase: ${isSupabaseConfigured() ? 'Connected' : 'Offline / Demo fallback active'}`);
  console.log('==================================================');
});

// Graceful shutdown handling
const handleShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Force shutdown timeout expired.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

