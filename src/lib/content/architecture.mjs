export const LAYERS = Object.freeze([
  { id: 'client',   label: { ms: 'Klien',          en: 'Client' } },
  { id: 'service',  label: { ms: 'Perkhidmatan',   en: 'Services' } },
  { id: 'data',     label: { ms: 'Data',           en: 'Data' } },
  { id: 'security', label: { ms: 'Keselamatan',    en: 'Security' } },
  { id: 'infra',    label: { ms: 'Infrastruktur',  en: 'Infrastructure' } }
]);

/** @type {Array<[string, RegExp]>} */
const RULES = [
  ['client',   /^(Vue\.js|SvelteKit|Flutter|Three\.js)/i],
  ['service',  /^(Laravel|Node\.js|Model Context Protocol|Playwright MCP|Cloud Functions|Resend API|Eksport PDF)/i],
  ['data',     /^(MySQL|PostgreSQL|Supabase|Redis|Firebase)/i],
  ['security', /^(JWT|Cloudflare WAF)/i],
  ['infra',    /^(Docker|Linux Server|Azure|Jenkins)/i],
  ['language', /^(JavaScript|TypeScript)$/i]
];

/** @param {string} item */
export function classify(item) {
  for (const [layer, re] of RULES) if (re.test(item)) return layer;
  return 'unknown';
}

/** @typedef {{ id: string, stack: string[], accessType: string, dataArchitecture: string, dataArchitectureEn: string, securityAccess: string, securityAccessEn: string, role: string, roleEn?: string }} Module */
/** @param {Module} module */
export function buildArchitecture(module) {
  /** @type {Array<{ label: string, layer: string }>} */
  const nodes = module.stack.map((/** @type {string} */ label) => ({ label, layer: classify(label) }));
  /** @type {Set<string>} */
  const present = new Set(nodes.map((/** @type {{ layer: string }} */ n) => n.layer));
  // Lapisan keselamatan sentiasa wujud kerana setiap projek mempunyai teks securityAccess.
  present.add('security');
  /** @type {string[]} */
  const order = ['client', 'service', 'data'].filter((l) => present.has(l));
  /** @type {Array<{ from: string, to: string }>} */
  const flows = order.slice(1).map((to, i) => ({ from: order[i], to }));
  return {
    id: module.id,
    restricted: module.accessType === 'restricted',
    layers: LAYERS.filter((/** @type {{ id: string }} */ l) => present.has(l.id)),
    nodes: nodes.filter((/** @type {{ layer: string }} */ n) => n.layer !== 'language'),
    tags: nodes.filter((/** @type {{ layer: string }} */ n) => n.layer === 'language').map((/** @type {{ label: string }} */ n) => n.label),
    flows
  };
}