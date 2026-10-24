process.env.MOTION_URL ||= process.env.SPATIAL_URL || 'http://127.0.0.1:4203/spatial/';
const { run } = await import('./motion-regression.mjs');
await run();
