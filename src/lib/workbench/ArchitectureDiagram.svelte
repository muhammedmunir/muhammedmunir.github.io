<script>
  import { buildArchitecture } from '$lib/content/architecture.mjs';

  /** @type {{ module: any, locale?: string }} */
  let { module, locale = 'ms' } = $props();

  const arch = buildArchitecture(module);
  const layers = arch.layers;
  /** @type {Record<string, Array<{ label: string, layer: string }>>} */
  const nodesByLayer = {};
  for (const node of arch.nodes) {
    if (!nodesByLayer[node.layer]) nodesByLayer[node.layer] = [];
    nodesByLayer[node.layer].push(node);
  }

  /** @type {{ label: string, layer: string } | null} */
  let selectedNode = $state(null);
  /** @type {string | null} */
  let selectedLayer = $state(null);

  function selectNode(/** @type {{ label: string, layer: string }} */ node, /** @type {string} */ layer) {
    if (selectedNode === node && selectedLayer === layer) {
      selectedNode = null;
      selectedLayer = null;
    } else {
      selectedNode = node;
      selectedLayer = layer;
    }
  }

  function getNodeText(/** @type {{ label: string, layer: string }} */ node, /** @type {string} */ layer) {
    if (layer === 'data') {
      return locale === 'en' ? module.dataArchitectureEn : module.dataArchitecture;
    }
    if (layer === 'security') {
      return locale === 'en' ? module.securityAccessEn : module.securityAccess;
    }
    return locale === 'en' ? (module.roleEn || module.role) : module.role;
  }

  const restrictedNote = locale === 'en'
    ? 'Confidential government system: generic architecture only.'
    : 'Sistem kerajaan sulit: seni bina umum sahaja.';
</script>

<style>
  .diagram {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 640px) {
    .diagram {
      grid-template-columns: 1fr;
    }
  }

  .layer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .layer-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--work-muted);
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--work-line);
  }

  .nodes {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .node {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--work-line);
    border-radius: 6px;
    background: var(--work-surface);
    color: var(--work-fg);
    font-size: 0.8125rem;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    transition: border-color 150ms ease, background 150ms ease;
  }

  .node:hover {
    border-color: var(--work-accent);
  }

  .node:focus-visible {
    outline: 2px solid var(--work-accent);
    outline-offset: 2px;
    border-color: var(--work-accent);
  }

  .node.active {
    border-color: var(--work-accent);
    background: color-mix(in srgb, var(--work-accent) 10%, var(--work-surface));
  }

  .node-layer {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--work-muted);
    white-space: nowrap;
  }

  .panel {
    margin-top: 1.5rem;
    padding: 1rem;
    border: 1px solid var(--work-line);
    border-radius: 6px;
    background: var(--work-surface);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--work-muted);
  }

  .panel-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--work-fg);
    text-transform: none;
    letter-spacing: normal;
  }

  .panel-body {
    font-size: 0.8125rem;
    line-height: 1.6;
    color: var(--work-fg);
    white-space: pre-wrap;
  }

  .tags {
    margin-top: 1rem;
    font-size: 0.75rem;
    color: var(--work-muted);
  }

  .restricted-note {
    margin-top: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--work-line);
    border-radius: 6px;
    background: color-mix(in srgb, var(--work-warning) 10%, var(--work-surface));
    font-size: 0.8125rem;
    color: var(--work-fg);
  }

  @media (prefers-reduced-motion: no-preference) {
    .flow-line {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: flow 3s linear infinite;
    }
  }

  @keyframes flow {
    to { stroke-dashoffset: 0; }
  }
</style>

<div class="diagram" role="group" aria-label="{module.name} {locale === 'en' ? 'architecture' : 'seni bina'}">
  {#each layers as layer (layer.id)}
    <div class="layer">
      <div class="layer-title">{layer.label[/** @type {'ms' | 'en'} */ (locale)]}</div>
      <div class="nodes" role="list">
        {#each nodesByLayer[layer.id] || [] as node (node.label)}
          <div role="listitem">
            <button
              type="button"
              class="node {selectedNode === node && selectedLayer === layer.id ? 'active' : ''}"
              onclick={() => selectNode(node, layer.id)}
              aria-pressed={selectedNode === node && selectedLayer === layer.id}
              aria-label={node.label}
            >
              <span class="node-layer">{layer.label[/** @type {'ms' | 'en'} */ (locale)]}</span>
              {node.label}
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

{#if selectedNode && selectedLayer}
  <div class="panel" role="region" aria-live="polite">
    <div class="panel-header">
      <span class="panel-title">{selectedNode.label}</span>
      <span>{selectedLayer}</span>
    </div>
    <div class="panel-body">{getNodeText(selectedNode, selectedLayer)}</div>
  </div>
{/if}

{#if arch.tags.length > 0}
  <div class="tags">
    <strong>{locale === 'en' ? 'Languages:' : 'Bahasa:'}</strong> {arch.tags.join(', ')}
  </div>
{/if}

{#if arch.restricted}
  <div class="restricted-note">{restrictedNote}</div>
{/if}

<svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;">
  <defs>
    {#each arch.flows as flow (flow.from + '->' + flow.to)}
      <line
        id="flow-{flow.from}-{flow.to}"
        class="flow-line"
        x1="0" y1="0" x2="0" y2="0"
        stroke="var(--work-accent)"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    {/each}
  </defs>
</svg>