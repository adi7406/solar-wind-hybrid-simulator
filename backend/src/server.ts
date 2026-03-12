import express, { Request, Response } from 'express';
import cors from 'cors';
import { calculateHRESPerformance } from './models/systemModel.js';
import { generate24HourProfile } from './utils/simulationGenerator.js';
import type { HRESInputParams } from './types/hres.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'HRES Backend Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Instant simulation endpoint
app.post('/api/simulate/instant', (req: Request, res: Response) => {
  try {
    const params: HRESInputParams = req.body;

    // Validate input parameters
    if (!params || typeof params.solarIrradiance !== 'number') {
      return res.status(400).json({
        error: 'Invalid input parameters',
        message: 'Please provide valid solar, wind, and load parameters',
      });
    }

    // Calculate results
    const results = calculateHRESPerformance(params);

    res.json(results);
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({
      error: 'Calculation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 24-hour simulation endpoint
app.post('/api/simulate/daily', (req: Request, res: Response) => {
  try {
    const baseParams = req.body;

    // Generate 24-hour profile
    const profile = generate24HourProfile(baseParams);

    res.json(profile);
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({
      error: 'Simulation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 HRES Backend Server Started');
  console.log('='.repeat(60));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Instant simulation: POST http://localhost:${PORT}/api/simulate/instant`);
  console.log(`📊 24-hour simulation: POST http://localhost:${PORT}/api/simulate/daily`);
  console.log('='.repeat(60));
  console.log('');
  console.log('🔋 System Configuration:');
  console.log('  - PV Array Capacity: 6.25 kW (25 modules × 250W)');
  console.log('  - Wind Turbine: 5 kW PMSG-based');
  console.log('  - DC Bus: 400V target with ±2.1% stability');
  console.log('  - AC Output: 230V, 50Hz with SPWM control');
  console.log('  - Power Quality: THD < 5% (IEEE 519 compliant)');
  console.log('');
  console.log('✅ Ready to receive simulation requests!');
  console.log('='.repeat(60));
});

export default app;
