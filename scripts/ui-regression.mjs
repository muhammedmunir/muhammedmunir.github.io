// Keep the established command pointed at the current six-chapter homepage.
process.env.PORTFOLIO_URL ||= process.env.UI_URL || 'http://127.0.0.1:4193/';
await import('./portfolio-regression.mjs');
