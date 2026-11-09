import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] YatraSetu API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
      console.log(`[Docs] Swagger UI available at http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    console.error('[Server Error] Startup failed:', err.message);
    process.exit(1);
  }
};

startServer();

