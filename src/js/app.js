const $ = id => document.getElementById(id);
const page = document.body.dataset.page;
const layout = document.body.dataset.layout || '';
const state = { model: null, drawnNodes: [], relationship: null, architecture: null, tour: null, immersive: false, relationshipResizeBound: false, troubleshootingResizeBound: false, troubleshootingLayout: null };

const RELATIONSHIP_NODE_DEFINITIONS = [
  { id: 'a1', label: 'Worker / Manager / Device', group: 'runtime', x: 968, y: 94, width: 252, height: 56 },
  { id: 'a2', label: 'Time Entry Experience', group: 'runtime', x: 968, y: 156, width: 240, height: 56 },
  { id: 'a3', label: '3rd Party Device / Load', group: 'runtime', x: 665, y: 236, width: 214, height: 56 },
  { id: 'a4', label: 'Web Clock', group: 'runtime', x: 890, y: 236, width: 162, height: 56 },
  { id: 'a5', label: 'Calendar', group: 'runtime', x: 1081, y: 236, width: 162, height: 56 },
  { id: 'a6', label: 'Time Card', group: 'runtime', x: 1285, y: 236, width: 162, height: 56 },
  { id: 'a7', label: 'Entered Time Data', group: 'runtime', x: 972, y: 315, width: 226, height: 56 },
  { id: 'a8', label: 'Rules Engine', group: 'setup', x: 505, y: 414, width: 190, height: 56 },
  { id: 'a9', label: 'Worker Time Processing Profile', group: 'setup', x: 957, y: 414, width: 282, height: 56 },
  { id: 'a10', label: 'Worker Time Entry Profile', group: 'setup', x: 1392, y: 414, width: 280, height: 56 },
  { id: 'a12', label: 'HCM Groups', group: 'setup', x: 1610, y: 342, width: 178, height: 56 },
  { id: 'a11', label: 'Time Attributes', group: 'setup', x: 1598, y: 492, width: 194, height: 56 },
  { id: 'a13', label: 'Time Card Fields', group: 'setup', x: 1598, y: 560, width: 194, height: 56 },
  { id: 'a14', label: 'Layout Components / Layout Sets', group: 'setup', x: 1588, y: 626, width: 246, height: 56 },
  { id: 'a15', label: 'Validation Rules', group: 'setup', x: 692, y: 530, width: 182, height: 56 },
  { id: 'a16', label: 'Calculation Rules', group: 'setup', x: 418, y: 530, width: 190, height: 56 },
  { id: 'a17', label: 'Time Consumer Set', group: 'consumer', x: 1125, y: 586, width: 220, height: 56 },
  { id: 'a18', label: 'Payroll', group: 'consumer', x: 1328, y: 694, width: 148, height: 56 },
  { id: 'a19', label: 'Project Costing', group: 'consumer', x: 1115, y: 748, width: 190, height: 56 },
  { id: 'a20', label: 'Project Execution Mgmt', group: 'consumer', x: 826, y: 694, width: 224, height: 56 },
  { id: 'a21', label: 'Transfer Status', group: 'consumer', x: 450, y: 694, width: 182, height: 56 },
  { id: 'a22', label: 'Payroll Transfer', group: 'consumer', x: 420, y: 778, width: 188, height: 56 },
  { id: 'a23', label: 'Project Costing Transfer', group: 'consumer', x: 655, y: 778, width: 230, height: 56 },
  { id: 'a24', label: 'Other External Uses', group: 'consumer', x: 192, y: 778, width: 194, height: 56 }
];

const RELATIONSHIP_EDGE_DEFINITIONS = [
  { from: 'a1', to: 'a2', fromSide: 'bottom', toSide: 'top' },
  { from: 'a2', to: 'a3', fromSide: 'bottom', toSide: 'top' },
  { from: 'a2', to: 'a4', fromSide: 'bottom', toSide: 'top' },
  { from: 'a2', to: 'a5', fromSide: 'bottom', toSide: 'top' },
  { from: 'a2', to: 'a6', fromSide: 'bottom', toSide: 'top' },
  { from: 'a3', to: 'a7', fromSide: 'bottom', toSide: 'top' },
  { from: 'a4', to: 'a7', fromSide: 'bottom', toSide: 'top' },
  { from: 'a5', to: 'a7', fromSide: 'bottom', toSide: 'top' },
  { from: 'a6', to: 'a7', fromSide: 'bottom', toSide: 'top' },
  { from: 'a7', to: 'a8', fromSide: 'bottom', toSide: 'top' },
  { from: 'a7', to: 'a9', fromSide: 'bottom', toSide: 'top' },
  { from: 'a7', to: 'a10', fromSide: 'bottom', toSide: 'top' },
  { from: 'a8', to: 'a15', fromSide: 'bottom', toSide: 'top' },
  { from: 'a8', to: 'a16', fromSide: 'bottom', toSide: 'top' },
  { from: 'a9', to: 'a17', fromSide: 'bottom', toSide: 'top' },
  { from: 'a10', to: 'a17', fromSide: 'bottom', toSide: 'top' },
  { from: 'a11', to: 'a13', fromSide: 'bottom', toSide: 'top' },
  { from: 'a13', to: 'a14', fromSide: 'bottom', toSide: 'top' },
  { from: 'a12', to: 'a10', fromSide: 'left', toSide: 'top' },
  { from: 'a10', to: 'a14', fromSide: 'bottom', toSide: 'top' },
  { from: 'a17', to: 'a18', fromSide: 'bottom', toSide: 'top' },
  { from: 'a17', to: 'a19', fromSide: 'bottom', toSide: 'top' },
  { from: 'a17', to: 'a20', fromSide: 'bottom', toSide: 'top' },
  { from: 'a8', to: 'a21', fromSide: 'bottom', toSide: 'top' },
  { from: 'a21', to: 'a22', fromSide: 'bottom', toSide: 'top' },
  { from: 'a21', to: 'a23', fromSide: 'bottom', toSide: 'top' },
  { from: 'a21', to: 'a24', fromSide: 'bottom', toSide: 'top' }
];

const RELATIONSHIP_LAYOUT_SPEC = {
  width: 1820,
  height: 860,
  bands: [
    { label: 'Experience Layer (capture time)', className: 'runtime-band', x: 38, y: 48, width: 1744, height: 290, rx: 18 },
    { label: 'Policy Layer (classify, validate, calculate, route)', className: 'setup-band', x: 38, y: 346, width: 1744, height: 312, rx: 18 },
    { label: 'Consumer Layer (transfer + downstream use)', className: 'consumer-band', x: 38, y: 664, width: 1744, height: 166, rx: 18 }
  ]
};

function isRelationshipMapTest() {
  return page === 'relationships' && layout === 'map-test';
}

function isFullscreenDiagramLayout() {
  return document.body.classList.contains('diagram-page') || isRelationshipMapTest();
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function addArrowDefs(svg) {
  const defs = svgEl('defs');
  const marker = svgEl('marker', { id: 'arrow', markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto' });
  marker.appendChild(svgEl('path', { d: 'M0,0 L8,4 L0,8 z', fill: '#88a2c3' }));
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

function stripCopyPrefix(text = '') {
  return text
    .trim()
    .replace(/^Plain English(?: first)?:\s*/i, '')
    .replace(/^Lifecycle stage:\s*/i, '')
    .replace(/^Troubleshooting checkpoint:\s*/i, '');
}

function dedupeLine(text = '', anchor = '') {
  const normalized = stripCopyPrefix(text);
  if (!normalized) return '';
  return normalized.toLowerCase() === anchor.trim().toLowerCase() ? '' : normalized;
}

function inferGroup(node) {
  if (node.group) return node.group;
  const l = node.label.toLowerCase();
  if (l.includes('worker') || l.includes('validat') || l.includes('calculat') || l.includes('approval') || l.includes('entry') || l.includes('time card')) return 'runtime';
  if (l.includes('payroll') || l.includes('project') || l.includes('external') || l.includes('transfer') || l.includes('consumer')) return 'consumer';
  if (l.includes('profile') || l.includes('attribute') || l.includes('group') || l.includes('category') || l.includes('layout') || l.includes('rules')) return 'setup';
  return 'misc';
}

function iconKindFromLabel(label = '') {
  const l = label.toLowerCase();
  if (l.includes('hcm group') || l.includes('worker / manager')) return 'audience';
  if (l.includes('entry profile') || l.includes('entry experience')) return 'entry';
  if (l.includes('processing profile') || l.includes('rules engine')) return 'policy';
  if (l.includes('attribute')) return 'tag';
  if (l.includes('field')) return 'fields';
  if (l.includes('layout')) return 'layout';
  if (l.includes('repeating') || l.includes('calendar')) return 'calendar';
  if (l.includes('validation')) return 'validation';
  if (l.includes('calculation')) return 'calculation';
  if (l.includes('category')) return 'category';
  if (l.includes('consumer set')) return 'routing';
  if (l.includes('approval')) return 'approval';
  if (l.includes('transfer status') || l.includes('transfer')) return 'transfer';
  if (l.includes('payroll')) return 'payroll';
  if (l.includes('project')) return 'project';
  if (l.includes('web clock') || l.includes('clock')) return 'clock';
  if (l.includes('time card')) return 'card';
  if (l.includes('troubleshooting') || l.includes('check')) return 'search';
  return 'node';
}

function iconMarkup(kind = 'node') {
  const glyphs = {
    audience: '<circle cx="7" cy="8" r="2.2"/><circle cx="14" cy="8" r="2.2"/><path d="M4 15c0-2 1.4-3.2 3-3.2s3 1.2 3 3.2"/><path d="M11 15c0-2 1.4-3.2 3-3.2s3 1.2 3 3.2"/>',
    entry: '<path d="M4 4h11l3 3v9H4z"/><path d="M15 4v3h3"/><path d="M7 11h7"/>',
    policy: '<circle cx="11" cy="10" r="3.4"/><path d="M11 4v2M11 14v2M5 10h2M15 10h2M7 6l1.2 1.2M13.8 12.8L15 14M15 6l-1.2 1.2M8.2 12.8L7 14"/>',
    tag: '<path d="M4 9l5-5h7v7l-5 5z"/><circle cx="12.6" cy="7.4" r="1.3"/>',
    fields: '<rect x="4" y="4" width="14" height="14" rx="2"/><path d="M7 8h8M7 12h5M7 16h6"/>',
    layout: '<rect x="4" y="4" width="6" height="6"/><rect x="12" y="4" width="6" height="6"/><rect x="4" y="12" width="14" height="6"/>',
    calendar: '<rect x="4" y="5" width="14" height="13" rx="2"/><path d="M7 3v4M15 3v4M4 9h14"/>',
    validation: '<path d="M11 3l7 3v5c0 4-3 6-7 8-4-2-7-4-7-8V6z"/><path d="M8 11l2 2 4-4"/>',
    calculation: '<rect x="5" y="3" width="12" height="16" rx="2"/><path d="M8 7h6M8 11h2M12 11h2M8 15h6"/>',
    category: '<path d="M4 6h16M4 11h16M4 16h16"/><circle cx="6" cy="6" r="1"/><circle cx="6" cy="11" r="1"/><circle cx="6" cy="16" r="1"/>',
    routing: '<path d="M4 6h8"/><path d="M10 4l2 2-2 2"/><path d="M4 12h12"/><path d="M14 10l2 2-2 2"/><path d="M4 18h6"/><path d="M8 16l2 2-2 2"/>',
    approval: '<circle cx="11" cy="11" r="8"/><path d="M7.5 11.3l2.2 2.2 4.7-4.7"/>',
    transfer: '<path d="M4 10h10"/><path d="M11 7l4 3-4 3"/><path d="M4 15h10"/><path d="M11 12l4 3-4 3"/>',
    payroll: '<circle cx="11" cy="11" r="7"/><path d="M11 7v8M8.5 9.2c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2-1 1.8-2.5 2-2.5.8-2.5 2 1.1 2 2.5 2 2.5-.8 2.5-2"/>',
    project: '<path d="M4 8h14v9H4z"/><path d="M8 8V6h6v2"/><path d="M4 12h14"/>',
    clock: '<circle cx="11" cy="11" r="8"/><path d="M11 6v5l3 2"/>',
    card: '<rect x="3" y="5" width="16" height="12" rx="2"/><path d="M3 9h16"/><path d="M6 13h5"/>',
    search: '<circle cx="9" cy="9" r="5"/><path d="M13 13l5 5"/>',
    node: '<circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6"/>'
  };
  const glyph = glyphs[kind] || glyphs.node;
  return `<svg viewBox="0 0 22 22" aria-hidden="true" focusable="false">${glyph}</svg>`;
}

function drawNodeGlyph(target, kind, centerX, centerY) {
  const g = svgEl('g', { class: 'node-icon-wrap', transform: `translate(${centerX - 11},${centerY - 11})` });
  g.innerHTML = iconMarkup(kind);
  const svg = g.querySelector('svg');
  const fragment = document.createDocumentFragment();
  Array.from(svg.children).forEach(child => {
    child.setAttribute('class', 'node-icon');
    fragment.appendChild(child);
  });
  const circle = svgEl('circle', { class: 'node-icon-circle', cx: 11, cy: 11, r: 10 });
  g.innerHTML = '';
  g.appendChild(circle);
  g.appendChild(fragment);
  target.appendChild(g);
}

function showTooltip(event, label) {
  const tip = $('tooltip');
  if (!tip) return;
  const ctx = nodeContext(label);
  const plain = dedupeLine(ctx.plainEnglish, label) || ctx.context;
  const context = dedupeLine(ctx.context, label);
  const contextLine = context && context !== plain ? `<div><em>${context}</em></div>` : '';
  const iconClass = inferGroup({ label });
  tip.innerHTML = `<div class="icon-line"><span class="icon-badge ${iconClass}">${iconMarkup(iconKindFromLabel(label))}</span><strong>${label}</strong></div><div>${plain}</div>${contextLine}`;
  tip.classList.add('visible');
  tip.style.left = `${event.offsetX + 12}px`;
  tip.style.top = `${event.offsetY + 12}px`;
}

function hideTooltip() {
  $('tooltip')?.classList.remove('visible');
}

function objectForLabel(label) {
  const normalized = label.toLowerCase();
  return state.model.objects.find(o => {
    const left = o.name.toLowerCase();
    return normalized.includes(left.replace(' / sets', '')) || left.includes(normalized) || normalized.includes(o.id.replace(/-/g, ' '));
  });
}

function relatedNames(ids = []) {
  return ids
    .map(id => state.model.objects.find(obj => obj.id === id)?.name || id)
    .join(', ');
}

function showDetailsByLabel(label) {
  state.drawnNodes.forEach(n => n.classList.remove('active'));
  const activeNode = state.drawnNodes.find(n => n.dataset.label === label);
  activeNode?.classList.add('active');

  const detail = $('object-detail');
  if (!detail) return;

  const obj = objectForLabel(label);
  const ctx = nodeContext(label);
  const iconClass = obj ? inferGroup({ label: obj.name }) : inferGroup({ label });
  const icon = iconMarkup(iconKindFromLabel(obj?.name || label));
  const plain = obj ? dedupeLine(obj.definition, obj.name) || obj.purpose : dedupeLine(ctx.plainEnglish, label);
  const oracle = obj ? obj.oracleTerm : dedupeLine(ctx.oracleTerm, label);
  const context = dedupeLine(ctx.context, label);

  detail.innerHTML = obj
    ? `<div class="detail-header"><span class="icon-badge ${iconClass}">${icon}</span><h3>${obj.name}</h3></div><p><strong>Plain English:</strong> ${plain}</p><p><strong>Oracle term:</strong> ${obj.oracleTerm}</p><p><strong>Purpose:</strong> ${obj.purpose}</p><p><strong>Where it fits:</strong> ${obj.flowFit}</p><p><strong>Common mistakes:</strong></p><ul>${obj.commonMistakes.map(m => `<li>${m}</li>`).join('')}</ul><p><strong>Related objects:</strong> ${relatedNames(obj.relatedObjects) || 'None listed'}</p>${context ? `<p><strong>Node context:</strong> ${context}</p>` : ''}`
    : `<div class="detail-header"><span class="icon-badge ${iconClass}">${icon}</span><h3>${label}</h3></div>${plain ? `<p><strong>Plain English:</strong> ${plain}</p>` : ''}${oracle ? `<p><strong>Oracle term:</strong> ${oracle}</p>` : ''}${context ? `<p><strong>Context:</strong> ${context}</p>` : ''}<p>Needs review: confirm direct mapping to object catalog in /docs before production use.</p>`;

  if (activeNode) {
    if (page === 'architecture') syncArchitectureViewForNode(label);
    positionFloatingDetail(activeNode);
    if (page !== 'architecture') centerNodeInView(activeNode);
  }
}

function getDiagramViewport() {
  return $('relationship-viewport') || document.querySelector('.diagram-wrap.scrollable');
}

function getDiagramSize(svg) {
  const viewBox = (svg?.getAttribute('viewBox') || '').split(/\s+/).map(Number);
  const width = viewBox[2] || svg?.viewBox?.baseVal?.width || svg?.clientWidth || 0;
  const height = viewBox[3] || svg?.viewBox?.baseVal?.height || svg?.clientHeight || 0;
  return { width, height };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getViewportContentSize(viewport) {
  if (!viewport) return { width: 0, height: 0 };
  const style = getComputedStyle(viewport);
  const paddingX = (Number.parseFloat(style.paddingLeft) || 0) + (Number.parseFloat(style.paddingRight) || 0);
  const paddingY = (Number.parseFloat(style.paddingTop) || 0) + (Number.parseFloat(style.paddingBottom) || 0);
  return {
    width: Math.max(0, viewport.clientWidth - paddingX),
    height: Math.max(0, viewport.clientHeight - paddingY)
  };
}

function buildRelationshipLayout() {
  const nodes = RELATIONSHIP_NODE_DEFINITIONS.map(node => ({ ...node }));
  const by = Object.fromEntries(nodes.map(node => [node.id, node]));
  const bands = RELATIONSHIP_LAYOUT_SPEC.bands.map(band => ({ ...band }));
  const edges = RELATIONSHIP_EDGE_DEFINITIONS.map((edge, i) => ({ ...edge, i }));

  return { width: RELATIONSHIP_LAYOUT_SPEC.width, height: RELATIONSHIP_LAYOUT_SPEC.height, nodes, by, bands, edges };
}

function relationshipAnchorPoint(node, side) {
  const halfWidth = node.width / 2;
  const halfHeight = node.height / 2;
  if (side === 'top') return { x: node.x, y: node.y - halfHeight };
  if (side === 'bottom') return { x: node.x, y: node.y + halfHeight };
  if (side === 'left') return { x: node.x - halfWidth, y: node.y };
  return { x: node.x + halfWidth, y: node.y };
}

function relationshipEdgePath(edge, by) {
  const from = by[edge.from];
  const to = by[edge.to];
  const explicitSides = Boolean(edge.fromSide || edge.toSide);
  if (explicitSides) {
    const start = relationshipAnchorPoint(from, edge.fromSide || 'bottom');
    const end = relationshipAnchorPoint(to, edge.toSide || 'top');
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const laneOffset = ((edge.i % 3) - 1) * 9;
    const horizontalFlow = ['left', 'right'].includes(edge.fromSide) || ['left', 'right'].includes(edge.toSide);

    if (horizontalFlow) {
      const direction = dx >= 0 ? 1 : -1;
      const bend = Math.max(56, Math.abs(dx) * 0.38);
      const c1 = { x: start.x + bend * direction, y: start.y + laneOffset };
      const c2 = { x: end.x - bend * direction, y: end.y + laneOffset };
      return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
    }

    const direction = dy >= 0 ? 1 : -1;
    const bend = Math.max(44, Math.abs(dy) * 0.44);
    const lateral = dx * 0.18 + laneOffset;
    const c1 = { x: start.x + lateral, y: start.y + bend * direction };
    const c2 = { x: end.x - lateral, y: end.y - bend * direction };
    return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
  }

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const sameRow = Math.abs(dy) < 56;

  if (sameRow) {
    const direction = dx >= 0 ? 1 : -1;
    const start = relationshipAnchorPoint(from, direction > 0 ? 'right' : 'left');
    const end = relationshipAnchorPoint(to, direction > 0 ? 'left' : 'right');
    const bend = Math.max(44, Math.abs(dx) * 0.34);
    const laneOffset = ((edge.i % 3) - 1) * 10;
    const c1 = { x: start.x + bend * direction, y: start.y + laneOffset };
    const c2 = { x: end.x - bend * direction, y: end.y + laneOffset };
    return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
  }

  const direction = dy >= 0 ? 1 : -1;
  const start = relationshipAnchorPoint(from, direction > 0 ? 'bottom' : 'top');
  const end = relationshipAnchorPoint(to, direction > 0 ? 'top' : 'bottom');
  const bend = Math.max(40, Math.abs(dy) * 0.42);
  const lateral = dx * 0.14 + ((edge.i % 3) - 1) * 12;
  const c1 = { x: start.x + lateral, y: start.y + bend * direction };
  const c2 = { x: end.x - lateral, y: end.y - bend * direction };
  return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
}

function computeRelationshipFitZoom(rel = state.relationship) {
  const viewport = getDiagramViewport();
  if (!rel || !viewport) return 1;
  const { width, height } = getViewportContentSize(viewport);
  const fitInset = rel.fitPadding || 0;
  const widthFit = Math.max(0.2, (width - fitInset * 2) / rel.baseWidth);
  const heightFit = Math.max(0.2, (height - fitInset * 2) / rel.baseHeight);
  return clamp(Math.min(widthFit, heightFit), rel.minZoom || 0.4, rel.maxZoom || 2.1);
}

function refreshRelationshipFit({ force = false, behavior = 'auto' } = {}) {
  const rel = state.relationship;
  const viewport = getDiagramViewport();
  if (!rel || !viewport) return;
  const nextDefault = computeRelationshipFitZoom(rel);
  const wasAtDefault = !rel.zoom || Math.abs(rel.zoom - (rel.defaultZoom || nextDefault)) < 0.025;
  rel.defaultZoom = nextDefault;
  if (force || wasAtDefault) {
    rel.setZoom(nextDefault, { recenter: false });
  }
  const activeNode = state.drawnNodes.find(node => node.classList.contains('active'));
  if (activeNode) {
    positionFloatingDetail(activeNode);
    centerNodeInView(activeNode);
  } else {
    positionFloatingDetail(null);
    viewport.scrollTo({ left: 0, top: 0, behavior });
  }
}

function getFloatingDetailMetrics() {
  if (!isFullscreenDiagramLayout()) return null;
  const detail = $('object-detail');
  const stage = detail?.closest('.diagram-stage, .map-test-stage');
  if (!detail || !stage || getComputedStyle(detail).position !== 'absolute') return null;

  const gap = 24;
  const width = detail.offsetWidth;
  const height = detail.offsetHeight;
  const stageHeight = stage.clientHeight;
  const stageWidth = stage.clientWidth;
  const rightDock = Math.max(gap, stageWidth - width - gap);
  const topDock = gap;
  const bottomDock = Math.max(gap, stageHeight - height - gap);
  const currentLeft = Number.parseFloat(detail.style.left);
  const currentTop = Number.parseFloat(detail.style.top);
  const left = Number.isFinite(currentLeft) ? currentLeft : rightDock;
  const top = Number.isFinite(currentTop) ? currentTop : topDock;
  return { detail, stage, gap, width, height, stageWidth, stageHeight, left, top, rightDock, topDock, bottomDock };
}

function positionFloatingDetail(nodeEl) {
  const metrics = getFloatingDetailMetrics();
  const viewport = getDiagramViewport();
  if (!metrics || !viewport) return;

  if (page === 'architecture') {
    positionArchitectureDetail(nodeEl, metrics);
    return;
  }

  const { detail, gap, width, height, stageWidth, stageHeight, rightDock, topDock, bottomDock } = metrics;
  const bounds = nodeEl ? nodeBounds(nodeEl) : null;
  const zoom = page === 'relationships' ? state.relationship?.zoom || 1 : 1;
  const nodeCenter = bounds ? (bounds.x + bounds.width / 2) * zoom : viewport.scrollLeft + viewport.clientWidth / 2;
  const nodeMiddle = bounds ? (bounds.y + bounds.height / 2) * zoom : viewport.scrollTop + viewport.clientHeight / 2;
  const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
  const viewportMiddle = viewport.scrollTop + viewport.clientHeight / 2;
  const dockLeft = bounds ? nodeCenter >= viewportCenter : false;
  const dockBottom = bounds ? nodeMiddle >= viewportMiddle && stageHeight - height - gap > topDock : false;
  const targetLeft = dockLeft ? gap : rightDock;
  const targetTop = dockBottom ? bottomDock : topDock;
  const clampedLeft = Math.max(gap, Math.min(targetLeft, stageWidth - width - gap));
  const clampedTop = Math.max(gap, Math.min(targetTop, stageHeight - height - gap));

  detail.dataset.side = dockLeft ? 'left' : 'right';
  detail.dataset.vertical = dockBottom ? 'bottom' : 'top';
  detail.style.left = `${clampedLeft}px`;
  detail.style.top = `${clampedTop}px`;
  detail.style.right = 'auto';
}

function positionArchitectureDetail(nodeEl, metrics) {
  const { detail, stage, gap, width, height, stageWidth, stageHeight, rightDock, topDock } = metrics;
  if (!nodeEl) {
    detail.dataset.side = 'right';
    detail.dataset.vertical = 'top';
    detail.style.left = `${rightDock}px`;
    detail.style.top = `${topDock}px`;
    detail.style.right = 'auto';
    return;
  }

  const stageRect = stage.getBoundingClientRect();
  const nodeRect = nodeEl.getBoundingClientRect();
  const nodeLeft = nodeRect.left - stageRect.left;
  const nodeRight = nodeRect.right - stageRect.left;
  const nodeCenterY = nodeRect.top - stageRect.top + nodeRect.height / 2;
  const spaceRight = stageWidth - nodeRight - gap;
  const spaceLeft = nodeLeft - gap;
  const dockRight = spaceRight >= width || (spaceRight >= spaceLeft && spaceRight > 180);
  const targetLeft = dockRight
    ? Math.min(stageWidth - width - gap, nodeRight + gap)
    : Math.max(gap, nodeLeft - width - gap);
  const targetTop = Math.max(gap, Math.min(stageHeight - height - gap, nodeCenterY - height / 2));

  detail.dataset.side = dockRight ? 'right' : 'left';
  detail.dataset.vertical = 'middle';
  detail.style.left = `${targetLeft}px`;
  detail.style.top = `${targetTop}px`;
  detail.style.right = 'auto';
}

function parseTranslate(transform = '') {
  const match = /translate\(([-\d.]+),([-\d.]+)\)/.exec(transform);
  if (!match) return { x: 0, y: 0 };
  return { x: Number(match[1]), y: Number(match[2]) };
}

function nodeBounds(nodeEl) {
  const rect = nodeEl.querySelector('.node-rect');
  const transform = parseTranslate(nodeEl.getAttribute('transform') || '');
  const width = Number(rect?.getAttribute('width')) || 0;
  const height = Number(rect?.getAttribute('height')) || 0;
  return { x: transform.x, y: transform.y, width, height };
}

function centerNodeInView(nodeEl) {
  const viewport = getDiagramViewport();
  if (!viewport || !nodeEl) return;

  const bounds = nodeBounds(nodeEl);
  const zoom = page === 'relationships' ? state.relationship?.zoom || 1 : 1;
  const detail = getFloatingDetailMetrics();
  if (!detail) {
    const left = Math.max(0, bounds.x - (viewport.clientWidth - bounds.width) / 2);
    const top = Math.max(0, bounds.y - (viewport.clientHeight - bounds.height) / 2);
    viewport.scrollTo({ left, top, behavior: 'smooth' });
    return;
  }

  const occludedLeft = detail?.detail.dataset.side === 'left' ? detail.width + detail.gap : 0;
  const occludedRight = detail?.detail.dataset.side === 'right' ? detail.width + detail.gap : 0;
  const occludedTop = detail?.detail.dataset.vertical === 'top' ? detail.height + detail.gap : 0;
  const occludedBottom = detail?.detail.dataset.vertical === 'bottom' ? detail.height + detail.gap : 0;
  const usableWidth = Math.max(120, viewport.clientWidth - occludedLeft - occludedRight);
  const usableHeight = Math.max(120, viewport.clientHeight - occludedTop - occludedBottom);
  const scaledX = bounds.x * zoom;
  const scaledY = bounds.y * zoom;
  const scaledWidth = bounds.width * zoom;
  const scaledHeight = bounds.height * zoom;
  const targetCenterX = scaledX + scaledWidth / 2 - (occludedRight - occludedLeft) / 2;
  const targetCenterY = scaledY + scaledHeight / 2 - (occludedBottom - occludedTop) / 2;
  const maxLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  const left = Math.max(0, Math.min(maxLeft, targetCenterX - usableWidth / 2 - occludedLeft));
  const top = Math.max(0, Math.min(maxTop, targetCenterY - usableHeight / 2 - occludedTop));
  viewport.scrollTo({ left, top, behavior: 'smooth' });
}

function wrapLabel(label, maxChars = 28, maxLines = 3) {
  const words = label.split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach(word => {
    const next = `${line} ${word}`.trim();
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].slice(0, maxChars - 3)}...`;
    return kept;
  }
  return lines;
}

function drawNode(svg, node, sx = 10, sy = 10, w = 150, h = 42, options = {}) {
  const x = node.x * sx - w / 2;
  const y = node.y * sy - h / 2;
  const group = inferGroup(node);
  const g = svgEl('g', { class: `node-group ${group}`, transform: `translate(${x},${y})`, tabindex: '0', 'data-label': node.label, role: 'button', 'aria-label': `Node ${node.label}` });
  const tileInset = options.tileInset || 6;
  g.append(svgEl('rect', { class: 'node-tile', x: -tileInset, y: -tileInset, width: w + tileInset * 2, height: h + tileInset * 2 }));
  g.append(svgEl('rect', { class: 'node-rect', width: w, height: h }));

  const iconKind = iconKindFromLabel(node.label);
  drawNodeGlyph(g, iconKind, options.iconX || 30, h / 2);

  const fontSize = options.fontSize || 14.5;
  const lineHeight = options.lineHeight || Math.max(18, fontSize + 3);
  const lines = wrapLabel(node.label, options.wrap || 28, options.maxLines || 3);
  const startY = h / 2 - ((lines.length - 1) * lineHeight) / 2;
  const textX = options.textX || 58;

  const t = svgEl('text', { class: 'node-label', x: textX, y: startY, 'font-size': fontSize });
  lines.forEach((line, i) => {
    const span = svgEl('tspan', { x: textX, dy: i === 0 ? 0 : lineHeight });
    span.textContent = line;
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

function attachGuidedTour(labels = []) {
  const nextBtn = $('tour-next');
  if (!nextBtn || !labels.length) return;
  state.tour = { labels, index: -1 };
  nextBtn.disabled = false;
  nextBtn.addEventListener('click', () => {
    state.tour.index = (state.tour.index + 1) % state.tour.labels.length;
    showDetailsByLabel(state.tour.labels[state.tour.index]);
  });
}

function bindFocusMode() {
  const toggle = $('toggle-focus');
  if (!toggle) return;

  const sync = () => {
    const active = Boolean(document.fullscreenElement);
    state.immersive = active;
    document.body.classList.toggle('immersive-mode', active);
    toggle.textContent = active ? 'Exit Full Screen' : 'Full Screen Mode';
    toggle.setAttribute('aria-pressed', active ? 'true' : 'false');

    if (page === 'relationships' && state.relationship) {
      const targetZoom = active ? 1.18 : 1.08;
      state.relationship.setZoom?.(targetZoom);
    }

    const activeNode = state.drawnNodes.find(n => n.classList.contains('active')) || state.drawnNodes[0];
    if (activeNode) window.setTimeout(() => centerNodeInView(activeNode), 120);
  };

  document.addEventListener('fullscreenchange', sync);
  window.addEventListener('resize', () => {
    const activeNode = state.drawnNodes.find(n => n.classList.contains('active'));
    if (activeNode) {
      positionFloatingDetail(activeNode);
      centerNodeInView(activeNode);
    }
  });

  toggle.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      state.immersive = !state.immersive;
      document.body.classList.toggle('immersive-mode', state.immersive);
      toggle.textContent = state.immersive ? 'Exit Full Screen' : 'Full Screen Mode';
      toggle.setAttribute('aria-pressed', state.immersive ? 'true' : 'false');
    }
  });
}

function renderOverview() {
  $('source-warning').textContent = state.model.meta.sourceStatus;

  const layerCards = [
    { title: 'Experience Layer', text: 'Where workers and managers capture time through time card, calendar, web clock, or device import.', icon: 'entry', cls: 'runtime' },
    { title: 'Policy Layer', text: 'Where OTL classifies, validates, calculates, and routes entries based on configured rules and profiles.', icon: 'policy', cls: 'setup' },
    { title: 'Consumer Layer', text: 'Where approved and ready time transfers to payroll, projects, and external consumers.', icon: 'routing', cls: 'consumer' },
    { title: 'Core Objects', text: 'Major setup and runtime objects in this model.', icon: 'layout', cls: 'setup', metric: state.model.objects.length },
    { title: 'Lifecycle Stages', text: 'Ordered journey from worker context through downstream audit status.', icon: 'transfer', cls: 'runtime', metric: state.model.lifecycleStages.length },
    { title: 'Troubleshooting Checks', text: 'Decision sequence for diagnosing entry, rules, approval, and transfer failures.', icon: 'search', cls: 'consumer', metric: state.model.troubleshootingBranches.length }
  ];

  $('overview-cards').innerHTML = layerCards
    .map(card => `<article class="learn-card"><div class="icon-line"><span class="icon-badge ${card.cls}">${iconMarkup(card.icon)}</span><h3>${card.title}</h3></div><p>${card.text}</p>${card.metric ? `<p class="metric">${card.metric}</p>` : ''}</article>`)
    .join('');

  $('glossary-list').innerHTML = state.model.glossary
    .map(g => `<article class="glossary-item"><div class="icon-line"><span class="icon-badge setup">${iconMarkup(iconKindFromLabel(g.oracleTerm))}</span><h3>${g.term}</h3></div><p><strong>Oracle term:</strong> ${g.oracleTerm}</p><p>${g.definition}</p></article>`)
    .join('');
}

function renderIntroDetail() {
  const detail = $('object-detail');
  if (!detail) return;

  const intros = {
    architecture: {
      iconClass: 'setup',
      icon: 'layout',
      title: 'How to read this diagram',
      paragraphs: [
        'Start at the Experience layer, where workers and managers capture time through time cards, calendars, web clock, or device loads.',
        'Move to the Policy layer next. This is the decision engine: profiles, attributes, fields, rules, categories, and consumer routing.',
        'Finish at the Consumer layer, where approved time transfers to payroll, project costing, project execution, or external uses.'
      ]
    },
    lifecycle: {
      iconClass: 'runtime',
      icon: 'transfer',
      title: 'How to read this flow',
      paragraphs: [
        'Follow the stages from left to right across the top row, then continue along the lower row as the time entry moves through validation, calculation, approval, and transfer.',
        'This view is the mental movie of OTL: capture time, interpret it, approve it if needed, then hand it to downstream consumers.'
      ]
    },
    troubleshooting: {
      iconClass: 'consumer',
      icon: 'search',
      title: 'How to use this tree',
      paragraphs: [
        'Work from top to bottom and stop at the first branch that fails. Most OTL issues trace back to worker setup, profile targeting, rule execution, approval state, or transfer readiness.',
        'Use this order to avoid chasing downstream failures before verifying the upstream policy setup.'
      ]
    },
    relationships: {
      iconClass: 'runtime',
      icon: 'routing',
      title: 'How to use this map',
      paragraphs: [
        'Click any object to highlight direct dependencies and bring the related context card alongside the map.',
        'Use the Experience, Policy, and Consumer filters to study one layer at a time, or follow Guided Step to trace the full capture-to-consumer path.'
      ]
    }
  };

  const intro = intros[page];
  if (!intro) return;

  detail.innerHTML = `<div class="detail-header"><span class="icon-badge ${intro.iconClass}">${iconMarkup(intro.icon)}</span><h3>${intro.title}</h3></div>${intro.paragraphs.map(text => `<p>${text}</p>`).join('')}`;
  positionFloatingDetail(null);
}

function architectureViewForNode(node) {
  if (!node) return 'full';
  if (node.group === 'consumer') return 'consumer';
  if (node.group === 'runtime') return 'runtime';
  return 'setup';
}

function syncArchitectureViewForNode(label) {
  const architecture = state.architecture;
  if (!architecture) return;
  const node = architecture.nodeByLabel.get(label);
  if (!node) return;
  if (architecture.currentView === 'full') return;

  const targetView = architectureViewForNode(node);
  if (targetView !== architecture.currentView) {
    architecture.setView(targetView);
  }
}

function bindArchitectureControls() {
  const architecture = state.architecture;
  const svg = $('architecture-svg');
  const viewport = getDiagramViewport();
  if (!architecture || !svg) return;

  const fitArchitectureView = view => {
    if (!viewport) return;
    const parts = architecture.views[view].split(/\s+/).map(Number);
    const [, , viewWidth, viewHeight] = parts;
    const horizontalPadding = 32;
    const verticalPadding = 32;
    const availableWidth = Math.max(240, viewport.clientWidth - horizontalPadding);
    const availableHeight = Math.max(240, viewport.clientHeight - verticalPadding);
    const scale = Math.max(1, Math.min(availableWidth / viewWidth, availableHeight / viewHeight));

    svg.style.width = `${Math.floor(viewWidth * scale)}px`;
    svg.style.height = `${Math.floor(viewHeight * scale)}px`;
  };

  const setView = view => {
    const nextView = architecture.views[view] ? view : 'full';
    architecture.currentView = nextView;
    svg.setAttribute('viewBox', architecture.views[nextView]);
    document.querySelectorAll('[data-architecture-view]').forEach(button => {
      button.classList.toggle('active', button.dataset.architectureView === nextView);
    });

    window.requestAnimationFrame(() => {
      fitArchitectureView(nextView);
      const activeNode = state.drawnNodes.find(node => node.classList.contains('active'));
      if (activeNode) {
        positionFloatingDetail(activeNode);
      } else {
        positionFloatingDetail(null);
      }
    });
  };

  architecture.fitView = fitArchitectureView;
  architecture.setView = setView;
  document.querySelectorAll('[data-architecture-view]').forEach(button => {
    button.addEventListener('click', () => setView(button.dataset.architectureView));
  });
  setView('full');
}

function renderArchitecture() {
  state.drawnNodes = [];
  const svg = $('architecture-svg');
  svg.innerHTML = '';
  addArrowDefs(svg);
  svg.setAttribute('viewBox', '0 0 1140 900');

  svg.append(
    svgEl('rect', { class: 'band setup-band', x: 24, y: 18, width: 1092, height: 338, rx: 18 }),
    svgEl('rect', { class: 'band runtime-band', x: 48, y: 388, width: 1044, height: 340, rx: 18 }),
    svgEl('rect', { class: 'band consumer-band', x: 118, y: 760, width: 904, height: 110, rx: 18 })
  );

  [['Setup / Design', 570, 46], ['Runtime / Daily Use', 570, 416], ['Consumers', 570, 788]].forEach(([txt, x, y]) => {
    const t = svgEl('text', { class: 'band-label', x, y });
    t.textContent = txt;
    svg.appendChild(t);
  });

  const nodes = state.model.diagram.setupRuntimeConsumers.nodes;
  const by = Object.fromEntries(nodes.map(n => [n.id, n]));
  state.model.diagram.setupRuntimeConsumers.edges.forEach(([a, b]) => drawEdge(svg, by[a], by[b], 12.2, 7.15));
  nodes.forEach(n => drawNode(svg, n, 12.2, 7.15, 220, 64, { wrap: 21, fontSize: 12.8, lineHeight: 17, textX: 54, iconX: 28 }));

  state.architecture = {
    currentView: 'full',
    nodeByLabel: new Map(nodes.map(node => [node.label, node])),
    views: {
      full: '0 0 1140 900',
      setup: '0 0 1140 380',
      runtime: '60 372 1020 390',
      consumer: '90 730 960 170'
    },
    setView: null
  };

  attachSearch();
  attachGuidedTour(nodes.slice(0, 10).map(n => n.label));
  bindArchitectureControls();
  renderIntroDetail();
  window.requestAnimationFrame(() => {
    state.architecture?.fitView?.(state.architecture?.currentView || 'full');
    positionFloatingDetail(null);
  });
  window.addEventListener('resize', () => {
    const activeNode = state.drawnNodes.find(n => n.classList.contains('active'));
    state.architecture?.fitView?.(state.architecture?.currentView || 'full');
    positionFloatingDetail(activeNode || null);
  });
}

function renderLifecycle() {
  state.drawnNodes = [];
  const svg = $('lifecycle-svg');
  svg.innerHTML = '';
  addArrowDefs(svg);

  const rowBreak = 5;
  const xStart = 230;
  const xGap = 330;
  const topY = 130;
  const bottomY = 360;

  const nodes = state.model.lifecycleStages.map((label, i) => {
    const secondRow = i >= rowBreak;
    const rowIndex = secondRow ? (rowBreak - 1) - (i - rowBreak) : i;
    return {
      label,
      x: (xStart + rowIndex * xGap) / 10,
      y: (secondRow ? bottomY : topY) / 10,
      group: 'runtime'
    };
  });

  nodes.forEach((n, i) => {
    drawNode(svg, n, 10, 10, 302, 102, { wrap: 31, fontSize: 14, lineHeight: 18 });
    if (i >= nodes.length - 1) return;

    const current = nodes[i];
    const next = nodes[i + 1];
    if (current.y === next.y) {
      const horizontalDirection = next.x >= current.x ? 1 : -1;
      const startX = current.x * 10 + 151 * horizontalDirection;
      const endX = next.x * 10 - 151 * horizontalDirection;
      svg.appendChild(svgEl('path', { class: 'edge', d: `M ${startX} ${current.y * 10} L ${endX} ${next.y * 10}` }));
    } else {
      svg.appendChild(svgEl('path', { class: 'edge', d: `M ${current.x * 10} ${current.y * 10 + 51} L ${next.x * 10} ${next.y * 10 - 51}` }));
    }
  });

  attachSearch();
  attachGuidedTour(nodes.map(n => n.label));
  renderIntroDetail();
}

function renderTroubleshooting() {
  state.drawnNodes = [];
  const svg = $('troubleshoot-svg');
  const viewport = getDiagramViewport();
  const branchCount = state.model.troubleshootingBranches.length;
  const compactMode = window.innerWidth <= 1440;
  const canvasWidth = compactMode ? 860 : 920;
  const nodeWidth = compactMode ? 720 : 780;
  const nodeHeight = compactMode ? 92 : 106;
  const lineHeight = compactMode ? 18 : 20;
  const fontSize = compactMode ? 14 : 15;
  const stepY = compactMode ? 126 : 155;
  const startY = compactMode ? 82 : 95;
  const bottomPadding = compactMode ? 72 : 96;
  const canvasHeight = startY + (branchCount - 1) * stepY + nodeHeight + bottomPadding;

  svg.innerHTML = '';
  addArrowDefs(svg);
  svg.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
  svg.setAttribute('width', canvasWidth);
  svg.setAttribute('height', canvasHeight);

  const x = Math.round(canvasWidth / 2);

  state.model.troubleshootingBranches.forEach((label, i) => {
    const y = startY + i * stepY;
    drawNode(svg, { label, x: x / 10, y: y / 10, group: 'runtime' }, 10, 10, nodeWidth, nodeHeight, {
      wrap: compactMode ? 44 : 50,
      fontSize,
      lineHeight
    });
    if (i < state.model.troubleshootingBranches.length - 1) {
      const edgeStart = y + Math.round(nodeHeight / 2);
      const edgeEnd = startY + (i + 1) * stepY - Math.round(nodeHeight / 2);
      svg.appendChild(svgEl('path', { class: 'edge', d: `M ${x} ${edgeStart} L ${x} ${edgeEnd}` }));
    }
  });

  attachSearch();
  attachGuidedTour(state.model.troubleshootingBranches);
  renderIntroDetail();

  const fitTroubleshootingDiagram = () => {
    if (!viewport) return;
    const available = getViewportContentSize(viewport);
    const scale = clamp(Math.min(available.width / canvasWidth, available.height / canvasHeight), 0.52, 1);
    svg.style.width = `${Math.floor(canvasWidth * scale)}px`;
    svg.style.height = `${Math.floor(canvasHeight * scale)}px`;
  };

  state.troubleshootingLayout = { compactMode, fitDiagram: fitTroubleshootingDiagram };

  fitTroubleshootingDiagram();
  window.requestAnimationFrame(fitTroubleshootingDiagram);

  if (!state.troubleshootingResizeBound) {
    window.addEventListener('resize', () => {
      if (page === 'troubleshooting') {
        const nextCompactMode = window.innerWidth <= 1440;
        if (state.troubleshootingLayout?.compactMode !== nextCompactMode) {
          renderTroubleshooting();
          return;
        }
        state.troubleshootingLayout?.fitDiagram?.();
        const activeNode = state.drawnNodes.find(node => node.classList.contains('active'));
        positionFloatingDetail(activeNode || null);
      }
    });
    state.troubleshootingResizeBound = true;
  }
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
  const svg = $('relationship-svg');
  const zoomValue = $('zoom-value');
  const setZoom = (next, options = {}) => {
    rel.zoom = clamp(next, rel.minZoom || 0.45, rel.maxZoom || 2.1);
    if (svg) {
      svg.style.width = `${rel.baseWidth * rel.zoom}px`;
      svg.style.height = `${rel.baseHeight * rel.zoom}px`;
    }
    if (viewport) viewport.style.transform = '';
    if (zoomValue) zoomValue.textContent = `${Math.round(rel.zoom * 100)}%`;
    const activeNode = state.drawnNodes.find(n => n.classList.contains('active'));
    if (activeNode && options.recenter !== false) {
      positionFloatingDetail(activeNode);
      window.setTimeout(() => centerNodeInView(activeNode), 120);
    }
  };
  rel.setZoom = setZoom;

  $('zoom-in')?.addEventListener('click', () => setZoom(rel.zoom + 0.12));
  $('zoom-out')?.addEventListener('click', () => setZoom(rel.zoom - 0.12));
  $('zoom-reset')?.addEventListener('click', () => refreshRelationshipFit({ force: true }));

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
}

function renderRelationships() {
  state.drawnNodes = [];
  const svg = $('relationship-svg');
  svg.innerHTML = '';
  addArrowDefs(svg);
  const viewport = $('relationship-viewport');
  if (viewport) {
    viewport.style.transform = '';
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
  }
  const layoutModel = buildRelationshipLayout();
  svg.setAttribute('viewBox', `0 0 ${layoutModel.width} ${layoutModel.height}`);
  svg.setAttribute('width', layoutModel.width);
  svg.setAttribute('height', layoutModel.height);

  layoutModel.bands.forEach(band => {
    svg.appendChild(svgEl('rect', { class: `band ${band.className}`, x: band.x, y: band.y, width: band.width, height: band.height, rx: band.rx || 18 }));
    const text = svgEl('text', { class: 'band-label', x: band.x + 18, y: band.y + 18 });
    text.textContent = band.label;
    svg.appendChild(text);
  });

  const edgeEls = layoutModel.edges.map(edge => {
    const d = relationshipEdgePath(edge, layoutModel.by);
    const el = svgEl('path', { class: 'edge relationship-edge', d });
    svg.appendChild(el);
    return { ...edge, el };
  });

  const nodeEls = new Map();
  layoutModel.nodes.forEach(node => {
    drawNode(svg, node, 1, 1, node.width, node.height, {
      wrap: Math.max(18, Math.floor((node.width - 86) / 7.1)),
      fontSize: 13.7,
      lineHeight: 16.4,
      textX: 54,
      iconX: 27,
      tileInset: 6
    });
    const current = state.drawnNodes[state.drawnNodes.length - 1];
    current.dataset.nodeId = node.id;
    current.addEventListener('click', () => setRelationshipFocus(node.id));
    nodeEls.set(node.id, current);
  });

  state.relationship = {
    zoom: 0,
    defaultZoom: 1,
    minZoom: 0.42,
    maxZoom: 2.1,
    fitPadding: 12,
    baseWidth: layoutModel.width,
    baseHeight: layoutModel.height,
    edges: layoutModel.edges,
    edgeEls,
    nodeEls,
    tour: ['a1', 'a2', 'a7', 'a9', 'a10', 'a17', 'a18', 'a19', 'a21'],
    tourIndex: -1
  };

  const detail = $('object-detail');
  if (detail) {
    renderIntroDetail();
  }

  bindRelationshipControls();
  attachSearch();

  if (!state.relationshipResizeBound) {
    window.addEventListener('resize', () => {
      if (page === 'relationships' && state.relationship) {
        refreshRelationshipFit();
      }
    });
    state.relationshipResizeBound = true;
  }

  refreshRelationshipFit({ force: true });
  window.requestAnimationFrame(() => refreshRelationshipFit({ force: true }));
}

function renderPageSubtitle() {
  const subtitle = $('hero-subtitle');
  if (!subtitle) return;
  const copy = {
    home: 'Learn Oracle Time and Labor as a policy engine: capture, classify, validate/calculate, approve, and transfer.',
    architecture: 'Study how setup objects, runtime behavior, and downstream consumers connect into one operating model.',
    lifecycle: 'Follow one time entry from worker context through transfer and downstream audit status.',
    troubleshooting: 'Use this decision path to isolate where failures happen: setup, policy execution, approvals, or transfer.',
    relationships: isRelationshipMapTest()
      ? 'Full-screen relationship map test view.'
      : 'Explore object dependencies across Experience, Policy, and Consumer layers with guided focus.'
  };
  subtitle.textContent = copy[page] || copy.home;
}

async function init() {
  const res = await fetch('src/data/otl-model.json');
  state.model = await res.json();

  bindFocusMode();
  renderPageSubtitle();

  if (page === 'home') renderOverview();
  if (page === 'architecture') renderArchitecture();
  if (page === 'lifecycle') renderLifecycle();
  if (page === 'troubleshooting') renderTroubleshooting();
  if (page === 'relationships') renderRelationships();
}

init();
