const $ = id => document.getElementById(id);
const page = document.body.dataset.page;
const state = { model: null, drawnNodes: [], relationship: null };

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function addArrowDefs(svg) {
  const defs = svgEl('defs');
  const marker = svgEl('marker', { id: 'arrow', markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto' });
  marker.appendChild(svgEl('path', { d: 'M0,0 L8,4 L0,8 z', fill: '#94a2c8' }));
  defs.appendChild(marker);
  svg.appendChild(defs);
}

function nodeContext(label) {
  return state.model.nodeContexts?.[label] || {
    plainEnglish: `${label}: TODO: Needs review against /docs.`,
    oracleTerm: label,
    context: 'TODO: Needs review'
  };
}

function inferGroup(node) {
  if (node.group) return node.group;
  const l = node.label.toLowerCase();
  if (l.includes('worker') || l.includes('validat') || l.includes('calculat') || l.includes('approval') || l.includes('entry') || l.includes('time card')) return 'runtime';
  if (l.includes('payroll') || l.includes('project') || l.includes('external') || l.includes('transfer') || l.includes('consumer')) return 'consumer';
  if (l.includes('profile') || l.includes('attribute') || l.includes('group') || l.includes('category') || l.includes('layout') || l.includes('rules')) return 'setup';
  return 'misc';
}

function showTooltip(event, label) {
  const tip = $('tooltip');
  if (!tip) return;
  const ctx = nodeContext(label);
  tip.innerHTML = `<strong>${label}</strong><br>${ctx.plainEnglish}<br><em>${ctx.context}</em>`;
  tip.classList.add('visible');
  tip.style.left = `${event.offsetX + 12}px`;
  tip.style.top = `${event.offsetY + 12}px`;
}
function hideTooltip() { $('tooltip')?.classList.remove('visible'); }

function showDetailsByLabel(label) {
  state.drawnNodes.forEach(n => n.classList.remove('active'));
  const activeNode = state.drawnNodes.find(n => n.dataset.label === label);
  activeNode?.classList.add('active');

  const detail = $('object-detail');
  if (!detail) return;
  const obj = state.model.objects.find(o => label.toLowerCase().includes(o.name.toLowerCase().replace(' / sets', '')) || o.name.toLowerCase().includes(label.toLowerCase()));
  const ctx = nodeContext(label);
  detail.innerHTML = obj
    ? `<h3>${obj.name}</h3><p><strong>Plain English:</strong> ${obj.definition}</p><p><strong>Oracle term:</strong> ${obj.oracleTerm}</p><p><strong>Purpose:</strong> ${obj.purpose}</p><p><strong>Where it fits:</strong> ${obj.flowFit}</p><p><strong>Common mistakes:</strong></p><ul>${obj.commonMistakes.map(m => `<li>${m}</li>`).join('')}</ul><p><strong>Related objects:</strong> ${obj.relatedObjects.join(', ') || 'None listed'}</p><p><strong>Node context:</strong> ${ctx.context}</p>`
    : `<h3>${label}</h3><p><strong>Plain English:</strong> ${ctx.plainEnglish}</p><p><strong>Oracle term:</strong> ${ctx.oracleTerm}</p><p><strong>Context:</strong> ${ctx.context}</p><p>TODO: Needs review mapping to /docs and major object catalog.</p>`;
}

function drawNode(svg, node, sx = 10, sy = 10, w = 150, h = 42) {
  const x = node.x * sx - w / 2;
  const y = node.y * sy - h / 2;
  const group = inferGroup(node);
  const g = svgEl('g', { class: `node-group ${group}`, transform: `translate(${x},${y})`, tabindex: '0', 'data-label': node.label, role: 'button', 'aria-label': `Node ${node.label}` });
  g.append(svgEl('rect', { class: 'node-rect', width: w, height: h, rx: 10, ry: 10 }));
  const t = svgEl('text', { class: 'node-label', x: w / 2, y: h / 2 });
  node.label.split(' / ').forEach((part, i) => {
    const span = svgEl('tspan', { x: w / 2, dy: i === 0 ? 0 : 12 });
    span.textContent = part;
    t.appendChild(span);
  });
  g.appendChild(t);
  g.addEventListener('mouseenter', e => showTooltip(e, node.label));
  g.addEventListener('mousemove', e => showTooltip(e, node.label));
  g.addEventListener('mouseleave', hideTooltip);
  g.addEventListener('click', () => showDetailsByLabel(node.label));
  g.addEventListener('focus', e => showTooltip(e, node.label));
  g.addEventListener('blur', hideTooltip);
  g.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showDetailsByLabel(node.label);
    }
  });
  state.drawnNodes.push(g);
  svg.appendChild(g);
}

function drawEdge(svg, from, to, sx = 10, sy = 10) {
  const edge = svgEl('path', { class: 'edge', d: `M ${from.x * sx} ${from.y * sy} L ${to.x * sx} ${to.y * sy}` });
  svg.appendChild(edge);
  return edge;
}

function attachSearch() {
  const input = $('node-search');
  const clear = $('clear-search');
  if (!input || !clear) return;
  const apply = () => {
    const q = input.value.trim().toLowerCase();
    state.drawnNodes.forEach(n => n.classList.toggle('match', q && n.dataset.label.toLowerCase().includes(q)));
  };
  input.addEventListener('input', apply);
  clear.addEventListener('click', () => {
    input.value = '';
    apply();
  });
}

function renderOverview() {
  $('source-warning').textContent = state.model.meta.sourceStatus;
  $('overview-cards').innerHTML = `<article><h3>Core objects</h3><p>${state.model.objects.length}</p></article><article><h3>Relationships</h3><p>${state.model.relationships.length}</p></article><article><h3>Lifecycle steps</h3><p>${state.model.lifecycleStages.length}</p></article><article><h3>Troubleshooting checks</h3><p>${state.model.troubleshootingBranches.length}</p></article>`;
  $('glossary-list').innerHTML = state.model.glossary.map(g => `<article class="glossary-item"><h3>${g.term}</h3><p><strong>Oracle term:</strong> ${g.oracleTerm}</p><p>${g.definition}</p></article>`).join('');
}

function renderArchitecture() {
  state.drawnNodes = [];
  const svg = $('architecture-svg'); svg.innerHTML = ''; addArrowDefs(svg);
  svg.append(svgEl('rect', { class: 'band setup-band', x: 1, y: 1, width: 998, height: 450 }), svgEl('rect', { class: 'band runtime-band', x: 35, y: 500, width: 930, height: 560 }), svgEl('rect', { class: 'band consumer-band', x: 100, y: 1080, width: 850, height: 100 }));
  [['Setup / Design', 500, 24], ['Runtime / Daily Use', 500, 524], ['Consumers', 500, 1098]].forEach(([txt, x, y]) => { const t = svgEl('text', { class: 'band-label', x, y }); t.textContent = txt; svg.appendChild(t); });
  const nodes = state.model.diagram.setupRuntimeConsumers.nodes; const by = Object.fromEntries(nodes.map(n => [n.id, n]));
  state.model.diagram.setupRuntimeConsumers.edges.forEach(([a, b]) => drawEdge(svg, by[a], by[b]));
  nodes.forEach(n => drawNode(svg, n));
  attachSearch();
}

function renderLifecycle() {
  state.drawnNodes = [];
  const svg = $('lifecycle-svg'); svg.innerHTML = ''; addArrowDefs(svg);
  const y = 85;
  state.model.lifecycleStages.forEach((label, i) => {
    const x = 92 + i * 195; const n = { label, x: x / 10, y: y / 10, group: 'runtime' };
    drawNode(svg, n, 10, 10, 175, 58);
    if (i < state.model.lifecycleStages.length - 1) svg.appendChild(svgEl('path', { class: 'edge', d: `M ${x + 88} ${y} L ${x + 118} ${y}` }));
  });
  attachSearch();
}

function renderTroubleshooting() {
  state.drawnNodes = [];
  const svg = $('troubleshoot-svg'); svg.innerHTML = ''; addArrowDefs(svg);
  const x = 300;
  state.model.troubleshootingBranches.forEach((label, i) => {
    const y = 90 + i * 200;
    drawNode(svg, { label, x: x / 10, y: y / 10, group: 'runtime' }, 10, 10, 540, 130);
    if (i < state.model.troubleshootingBranches.length - 1) svg.appendChild(svgEl('path', { class: 'edge', d: `M ${x} ${y + 65} L ${x} ${y + 125}` }));
  });
  attachSearch();
}
function setRelationshipFocus(activeNodeId) {
  const rel = state.relationship;
  if (!rel) return;
  const connected = new Set([activeNodeId]);
  rel.edges.forEach(e => {
    if (e.from === activeNodeId || e.to === activeNodeId) {
      connected.add(e.from);
      connected.add(e.to);
    }
  });

  rel.nodeEls.forEach((el, id) => {
    el.classList.toggle('faded', activeNodeId && !connected.has(id));
  });
  rel.edgeEls.forEach(({ from, to, el }) => {
    const isConnected = activeNodeId && (from === activeNodeId || to === activeNodeId);
    el.classList.toggle('edge-highlight', Boolean(isConnected));
    el.classList.toggle('faded', Boolean(activeNodeId && !isConnected));
  });
}

function bindRelationshipControls() {
  const rel = state.relationship;
  if (!rel) return;
  const viewport = $('relationship-viewport');
  const zoomValue = $('zoom-value');
  const setZoom = next => {
    rel.zoom = Math.min(1.8, Math.max(0.55, next));
    viewport.style.transform = `scale(${rel.zoom})`;
    if (zoomValue) zoomValue.textContent = `${Math.round(rel.zoom * 100)}%`;
  };

  $('zoom-in')?.addEventListener('click', () => setZoom(rel.zoom + 0.1));
  $('zoom-out')?.addEventListener('click', () => setZoom(rel.zoom - 0.1));
  $('zoom-reset')?.addEventListener('click', () => setZoom(1));

  document.querySelectorAll('[data-filter-group]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.filterGroup;
      document.querySelectorAll('[data-filter-group]').forEach(b => b.classList.toggle('active', b === btn));
      rel.nodeEls.forEach(el => {
        const show = group === 'all' || el.classList.contains(group);
        el.classList.toggle('hidden-node', !show);
      });
      rel.edgeEls.forEach(({ from, to, el }) => {
        const fromEl = rel.nodeEls.get(from);
        const toEl = rel.nodeEls.get(to);
        const show = !fromEl.classList.contains('hidden-node') && !toEl.classList.contains('hidden-node');
        el.classList.toggle('hidden-edge', !show);
      });
    });
  });

  $('tour-next')?.addEventListener('click', () => {
    rel.tourIndex = (rel.tourIndex + 1) % rel.tour.length;
    const nodeId = rel.tour[rel.tourIndex];
    rel.nodeEls.get(nodeId)?.dispatchEvent(new Event('click'));
  });

  setZoom(1);
}

function drawCurvedEdge(svg, from, to, id) {
  const midX = (from.x + to.x) / 2;
  const d = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
  const path = svgEl('path', { class: 'edge relationship-edge', d, 'data-edge-id': id, 'marker-end': 'url(#arrow)' });
  svg.appendChild(path);
  return path;
}

function setRelationshipFocus(activeNodeId) {
  const rel = state.relationship;
  if (!rel) return;
  const connected = new Set([activeNodeId]);
  rel.edges.forEach(e => {
    if (e.from === activeNodeId || e.to === activeNodeId) {
      connected.add(e.from);
      connected.add(e.to);
    }
  });

  rel.nodeEls.forEach((el, id) => {
    el.classList.toggle('faded', activeNodeId && !connected.has(id));
  });
  rel.edgeEls.forEach(({ from, to, el }) => {
    const isConnected = activeNodeId && (from === activeNodeId || to === activeNodeId);
    el.classList.toggle('edge-highlight', Boolean(isConnected));
    el.classList.toggle('faded', Boolean(activeNodeId && !isConnected));
  });
}

function bindRelationshipControls() {
  const rel = state.relationship;
  if (!rel) return;
  const viewport = $('relationship-viewport');
  const zoomValue = $('zoom-value');
  const setZoom = next => {
    rel.zoom = Math.min(1.8, Math.max(0.55, next));
    viewport.style.transform = `scale(${rel.zoom})`;
    if (zoomValue) zoomValue.textContent = `${Math.round(rel.zoom * 100)}%`;
  };

  $('zoom-in')?.addEventListener('click', () => setZoom(rel.zoom + 0.1));
  $('zoom-out')?.addEventListener('click', () => setZoom(rel.zoom - 0.1));
  $('zoom-reset')?.addEventListener('click', () => setZoom(1));

  document.querySelectorAll('[data-filter-group]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.filterGroup;
      document.querySelectorAll('[data-filter-group]').forEach(b => b.classList.toggle('active', b === btn));
      rel.nodeEls.forEach(el => {
        const show = group === 'all' || el.classList.contains(group);
        el.classList.toggle('hidden-node', !show);
      });
      rel.edgeEls.forEach(({ from, to, el }) => {
        const fromEl = rel.nodeEls.get(from);
        const toEl = rel.nodeEls.get(to);
        const show = !fromEl.classList.contains('hidden-node') && !toEl.classList.contains('hidden-node');
        el.classList.toggle('hidden-edge', !show);
      });
    });
  });

  $('tour-next')?.addEventListener('click', () => {
    rel.tourIndex = (rel.tourIndex + 1) % rel.tour.length;
    const nodeId = rel.tour[rel.tourIndex];
    rel.nodeEls.get(nodeId)?.dispatchEvent(new Event('click'));
  });

  setZoom(1);
}

function renderRelationships() {
  state.drawnNodes = [];
  const svg = $('relationship-svg'); svg.innerHTML = ''; addArrowDefs(svg);
  const viewport = $('relationship-viewport');
  if (viewport) viewport.style.transform = 'scale(1)';

  // Preserve original relationship topology and positioning from the submitted diagram.
  const nodes = [
    { id: 'a1', label: 'Worker / Manager / Device', x: 105, y: 25, group: 'runtime' },
    { id: 'a2', label: 'Time Entry Experience', x: 105, y: 75, group: 'runtime' },
    { id: 'a3', label: '3rd Party Device / Load', x: 90, y: 130, group: 'runtime' },
    { id: 'a4', label: 'Web Clock', x: 103, y: 130, group: 'runtime' },
    { id: 'a5', label: 'Calendar', x: 115, y: 130, group: 'runtime' },
    { id: 'a6', label: 'Time Card', x: 127, y: 130, group: 'runtime' },
    { id: 'a7', label: 'Entered Time Data', x: 105, y: 175, group: 'runtime' },
    { id: 'a8', label: 'Rules Engine', x: 40, y: 245, group: 'setup' },
    { id: 'a9', label: 'Worker Time Processing Profile', x: 100, y: 245, group: 'setup' },
    { id: 'a10', label: 'Worker Time Entry Profile', x: 145, y: 245, group: 'setup' },
    { id: 'a11', label: 'Time Attributes', x: 185, y: 245, group: 'setup' },
    { id: 'a12', label: 'HCM Groups', x: 185, y: 205, group: 'setup' },
    { id: 'a13', label: 'Time Card Fields', x: 185, y: 300, group: 'setup' },
    { id: 'a14', label: 'Layout Components / Layout Sets', x: 180, y: 360, group: 'setup' },
    { id: 'a15', label: 'Validation Rules', x: 72, y: 300, group: 'setup' },
    { id: 'a16', label: 'Calculation Rules', x: 55, y: 300, group: 'setup' },
    { id: 'a17', label: 'Time Consumer Set', x: 120, y: 300, group: 'consumer' },
    { id: 'a18', label: 'Payroll', x: 145, y: 360, group: 'consumer' },
    { id: 'a19', label: 'Project Costing', x: 125, y: 360, group: 'consumer' },
    { id: 'a20', label: 'Project Execution Mgmt', x: 80, y: 360, group: 'consumer' },
    { id: 'a21', label: 'Transfer Status', x: 20, y: 450, group: 'consumer' },
    { id: 'a22', label: 'Payroll Transfer', x: 42, y: 500, group: 'consumer' },
    { id: 'a23', label: 'Project Costing Transfer', x: 22, y: 500, group: 'consumer' },
    { id: 'a24', label: 'Other External Uses', x: 2, y: 500, group: 'consumer' }
  ];

  const layerBands = [
    { label: 'Experience Layer (capture time)', x: 50, y: 10, width: 1900, height: 210, className: 'runtime-band' },
    { label: 'Policy Layer (classify, validate, calculate, route)', x: 50, y: 225, width: 1900, height: 200, className: 'setup-band' },
    { label: 'Consumer Layer (transfer + downstream use)', x: 50, y: 430, width: 1900, height: 175, className: 'consumer-band' }
  ];
  layerBands.forEach(b => {
    svg.appendChild(svgEl('rect', { class: `band ${b.className}`, x: b.x, y: b.y, width: b.width, height: b.height, rx: 14 }));
    const text = svgEl('text', { class: 'band-label', x: b.x + 14, y: b.y + 22, 'text-anchor': 'start' });
    text.textContent = b.label;
    svg.appendChild(text);
  });

  const edges = [['a1','a2'],['a2','a3'],['a2','a4'],['a2','a5'],['a2','a6'],['a3','a7'],['a4','a7'],['a5','a7'],['a6','a7'],['a7','a8'],['a7','a9'],['a7','a10'],['a8','a15'],['a8','a16'],['a9','a17'],['a10','a17'],['a11','a13'],['a13','a14'],['a12','a10'],['a10','a14'],['a17','a18'],['a17','a19'],['a17','a20'],['a8','a21'],['a21','a22'],['a21','a23'],['a21','a24']].map(([from,to]) => ({ from, to }));
  const by = Object.fromEntries(nodes.map(n => [n.id, n]));

  const edgeEls = edges.map(e => ({ ...e, el: drawEdge(svg, by[e.from], by[e.to], 10, 1.15) }));

  const nodeSize = {
    a1: [210, 44], a2: [210, 44],
    a3: [180, 44], a4: [130, 44], a5: [130, 44], a6: [130, 44],
    a7: [200, 44], a8: [160, 44], a9: [250, 44], a10: [220, 44],
    a11: [175, 44], a12: [150, 44], a13: [165, 44], a14: [255, 44],
    a15: [165, 44], a16: [165, 44], a17: [185, 44], a18: [130, 44],
    a19: [170, 44], a20: [190, 44], a21: [165, 44], a22: [170, 44], a23: [210, 44], a24: [180, 44]
  };

  const nodeEls = new Map();
  nodes.forEach(n => {
    const [w, h] = nodeSize[n.id] || [170, 44];
    drawNode(svg, n, 10, 1.15, w, h);
    const current = state.drawnNodes[state.drawnNodes.length - 1];
    current.dataset.nodeId = n.id;
    current.addEventListener('click', () => setRelationshipFocus(n.id));
    nodeEls.set(n.id, current);
  });

  state.relationship = {
    zoom: 1,
    edges,
    edgeEls,
    nodeEls,
    tour: ['a1', 'a2', 'a7', 'a9', 'a10', 'a17', 'a18', 'a19', 'a21'],
    tourIndex: -1
  };

  const detail = $('object-detail');
  if (detail) {
    detail.innerHTML = `<h3>How to use this map</h3><p><strong>1)</strong> Use <em>Next Guided Step</em> to follow end-to-end OTL flow exactly in original diagram order.</p><p><strong>2)</strong> Click any node to focus only connected objects and trace dependencies.</p><p><strong>3)</strong> Filter by Experience, Policy, or Consumer layer to study one stack at a time.</p><p><strong>OTL mental model:</strong> Capture time → apply policy → transfer to consumers.</p>`;
  }

  bindRelationshipControls();
  attachSearch();
}


async function init() {
  const res = await fetch('src/data/otl-model.json');
  state.model = await res.json();
  if (page === 'home') renderOverview();
  if (page === 'architecture') renderArchitecture();
  if (page === 'lifecycle') renderLifecycle();
  if (page === 'troubleshooting') renderTroubleshooting();
  if (page === 'relationships') renderRelationships();
}

init();
