// Both routes share the same component and interaction contract.
process.env.PORTFOLIO_URL ||= process.env.SPATIAL_URL || 'http://127.0.0.1:4193/spatial/';
await import('./portfolio-regression.mjs');
