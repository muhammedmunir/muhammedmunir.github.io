process.env.MOTION_URL ||= process.env.UI_URL || 'http://127.0.0.1:4203/';
const { run } = await import('./motion-regression.mjs');
await run();
