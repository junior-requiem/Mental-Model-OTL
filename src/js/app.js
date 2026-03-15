const $ = id => document.getElementById(id);
const page = document.body.dataset.page;
const layout = document.body.dataset.layout || '';
const state = { model: null, drawnNodes: [], relationship: null, tour: null, immersive: false };

function isRelationshipMapTest() {
  return page === 'relationships' && layout === 'map-test';
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
  if (activeNode) centerNodeInView(activeNode);

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
}

function getDiagramViewport() {
  return $('relationship-viewport') || document.querySelector('.diagram-wrap.scrollable');
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
  const left = Math.max(0, bounds.x - (viewport.clientWidth - bounds.width) / 2);
  const top = Math.max(0, bounds.y - (viewport.clientHeight - bounds.height) / 2);
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
  g.append(svgEl('rect', { class: 'node-rect', width: w, height: h }));

  const iconKind = iconKindFromLabel(node.label);
  drawNodeGlyph(g, iconKind, 24, h / 2);

  const fontSize = options.fontSize || 14;
  const lineHeight = options.lineHeight || Math.max(16, fontSize + 2);
  const lines = wrapLabel(node.label, options.wrap || 28, options.maxLines || 3);
  const startY = h / 2 - ((lines.length - 1) * lineHeight) / 2;
  const textX = 44;

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
    if (activeNode) centerNodeInView(activeNode);
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

function renderArchitecture() {
  state.drawnNodes = [];
  const svg = $('architecture-svg');
  svg.innerHTML = '';
  addArrowDefs(svg);

  svg.append(
    svgEl('rect', { class: 'band setup-band', x: 1, y: 1, width: 998, height: 450 }),
    svgEl('rect', { class: 'band runtime-band', x: 35, y: 500, width: 930, height: 560 }),
    svgEl('rect', { class: 'band consumer-band', x: 100, y: 1080, width: 850, height: 100 })
  );

  [['Setup / Design', 500, 24], ['Runtime / Daily Use', 500, 524], ['Consumers', 500, 1098]].forEach(([txt, x, y]) => {
    const t = svgEl('text', { class: 'band-label', x, y });
    t.textContent = txt;
    svg.appendChild(t);
  });

  const nodes = state.model.diagram.setupRuntimeConsumers.nodes;
  const by = Object.fromEntries(nodes.map(n => [n.id, n]));
  state.model.diagram.setupRuntimeConsumers.edges.forEach(([a, b]) => drawEdge(svg, by[a], by[b]));
  nodes.forEach(n => drawNode(svg, n, 10, 10, 230, 68, { wrap: 23, fontSize: 13 }));

  attachSearch();
  attachGuidedTour(nodes.slice(0, 10).map(n => n.label));
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
      svg.appendChild(svgEl('path', { class: 'edge', d: `M ${current.x * 10 + 151} ${current.y * 10} L ${next.x * 10 - 151} ${next.y * 10}` }));
    } else {
      svg.appendChild(svgEl('path', { class: 'edge', d: `M ${current.x * 10} ${current.y * 10 + 51} L ${next.x * 10} ${next.y * 10 - 51}` }));
    }
  });

  attachSearch();
  attachGuidedTour(nodes.map(n => n.label));
}

function renderTroubleshooting() {
  state.drawnNodes = [];
  const svg = $('troubleshoot-svg');
  svg.innerHTML = '';
  addArrowDefs(svg);
  const x = 460;

  state.model.troubleshootingBranches.forEach((label, i) => {
    const y = 95 + i * 155;
    drawNode(svg, { label, x: x / 10, y: y / 10, group: 'runtime' }, 10, 10, 780, 106, { wrap: 50, fontSize: 15, lineHeight: 20 });
    if (i < state.model.troubleshootingBranches.length - 1) {
      svg.appendChild(svgEl('path', { class: 'edge', d: `M ${x} ${y + 54} L ${x} ${y + 103}` }));
    }
  });

  attachSearch();
  attachGuidedTour(state.model.troubleshootingBranches);
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
    rel.zoom = Math.min(2.1, Math.max(0.7, next));
    viewport.style.transform = `scale(${rel.zoom})`;
    if (zoomValue) zoomValue.textContent = `${Math.round(rel.zoom * 100)}%`;
    const activeNode = state.drawnNodes.find(n => n.classList.contains('active'));
    if (activeNode) window.setTimeout(() => centerNodeInView(activeNode), 120);
  };
  rel.setZoom = setZoom;

  $('zoom-in')?.addEventListener('click', () => setZoom(rel.zoom + 0.12));
  $('zoom-out')?.addEventListener('click', () => setZoom(rel.zoom - 0.12));
  $('zoom-reset')?.addEventListener('click', () => setZoom(isRelationshipMapTest() ? 0.94 : 1.08));

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

  setZoom(isRelationshipMapTest() ? 0.94 : 1.08);
}

function renderRelationships() {
  state.drawnNodes = [];
  const svg = $('relationship-svg');
  svg.innerHTML = '';
  addArrowDefs(svg);
  const viewport = $('relationship-viewport');
  if (viewport) viewport.style.transform = 'scale(1.08)';

  const nodes = [
    { id: 'a1', label: 'Worker / Manager / Device', x: 105, y: 55, group: 'runtime' },
    { id: 'a2', label: 'Time Entry Experience', x: 105, y: 125, group: 'runtime' },
    { id: 'a3', label: '3rd Party Device / Load', x: 72, y: 215, group: 'runtime' },
    { id: 'a4', label: 'Web Clock', x: 95, y: 215, group: 'runtime' },
    { id: 'a5', label: 'Calendar', x: 116, y: 215, group: 'runtime' },
    { id: 'a6', label: 'Time Card', x: 138, y: 215, group: 'runtime' },
    { id: 'a7', label: 'Entered Time Data', x: 105, y: 300, group: 'runtime' },
    { id: 'a8', label: 'Rules Engine', x: 54, y: 420, group: 'setup' },
    { id: 'a9', label: 'Worker Time Processing Profile', x: 105, y: 420, group: 'setup' },
    { id: 'a10', label: 'Worker Time Entry Profile', x: 156, y: 420, group: 'setup' },
    { id: 'a11', label: 'Time Attributes', x: 178, y: 500, group: 'setup' },
    { id: 'a12', label: 'HCM Groups', x: 178, y: 340, group: 'setup' },
    { id: 'a13', label: 'Time Card Fields', x: 178, y: 585, group: 'setup' },
    { id: 'a14', label: 'Layout Components / Layout Sets', x: 178, y: 660, group: 'setup' },
    { id: 'a15', label: 'Validation Rules', x: 76, y: 520, group: 'setup' },
    { id: 'a16', label: 'Calculation Rules', x: 46, y: 520, group: 'setup' },
    { id: 'a17', label: 'Time Consumer Set', x: 124, y: 585, group: 'consumer' },
    { id: 'a18', label: 'Payroll', x: 145, y: 700, group: 'consumer' },
    { id: 'a19', label: 'Project Costing', x: 124, y: 760, group: 'consumer' },
    { id: 'a20', label: 'Project Execution Mgmt', x: 92, y: 700, group: 'consumer' },
    { id: 'a21', label: 'Transfer Status', x: 40, y: 700, group: 'consumer' },
    { id: 'a22', label: 'Payroll Transfer', x: 34, y: 790, group: 'consumer' },
    { id: 'a23', label: 'Project Costing Transfer', x: 64, y: 790, group: 'consumer' },
    { id: 'a24', label: 'Other External Uses', x: 16, y: 790, group: 'consumer' }
  ];

  const layerBands = [
    { label: 'Experience Layer (capture time)', x: 40, y: 20, width: 1920, height: 320, className: 'runtime-band' },
    { label: 'Policy Layer (classify, validate, calculate, route)', x: 40, y: 350, width: 1920, height: 340, className: 'setup-band' },
    { label: 'Consumer Layer (transfer + downstream use)', x: 40, y: 700, width: 1920, height: 180, className: 'consumer-band' }
  ];

  layerBands.forEach(b => {
    svg.appendChild(svgEl('rect', { class: `band ${b.className}`, x: b.x, y: b.y, width: b.width, height: b.height, rx: 14 }));
    const text = svgEl('text', { class: 'band-label', x: b.x + 16, y: b.y + 28, 'text-anchor': 'start' });
    text.textContent = b.label;
    svg.appendChild(text);
  });

  const edges = [
    ['a1', 'a2'], ['a2', 'a3'], ['a2', 'a4'], ['a2', 'a5'], ['a2', 'a6'], ['a3', 'a7'], ['a4', 'a7'], ['a5', 'a7'], ['a6', 'a7'], ['a7', 'a8'], ['a7', 'a9'], ['a7', 'a10'], ['a8', 'a15'], ['a8', 'a16'], ['a9', 'a17'], ['a10', 'a17'], ['a11', 'a13'], ['a13', 'a14'], ['a12', 'a10'], ['a10', 'a14'], ['a17', 'a18'], ['a17', 'a19'], ['a17', 'a20'], ['a8', 'a21'], ['a21', 'a22'], ['a21', 'a23'], ['a21', 'a24']
  ].map(([from, to], i) => ({ from, to, i }));

  const by = Object.fromEntries(nodes.map(n => [n.id, n]));

  const drawRelationshipEdge = edge => {
    const from = by[edge.from];
    const to = by[edge.to];
    const sx = from.x * 10;
    const sy = from.y;
    const tx = to.x * 10;
    const ty = to.y;
    const bend = ((edge.i % 3) - 1) * 28;
    const cx1 = sx + (tx - sx) * 0.35 + bend;
    const cx2 = sx + (tx - sx) * 0.7 + bend;
    const d = `M ${sx} ${sy} C ${cx1} ${sy}, ${cx2} ${ty}, ${tx} ${ty}`;
    const el = svgEl('path', { class: 'edge relationship-edge', d, 'marker-end': 'url(#arrow)' });
    svg.appendChild(el);
    return el;
  };

  const edgeEls = edges.map(e => ({ ...e, el: drawRelationshipEdge(e) }));

  const nodeSize = {
    a1: [275, 62], a2: [260, 62],
    a3: [230, 62], a4: [176, 62], a5: [176, 62], a6: [176, 62],
    a7: [246, 62], a8: [208, 62], a9: [310, 62], a10: [286, 62],
    a11: [214, 62], a12: [194, 62], a13: [214, 62], a14: [320, 62],
    a15: [200, 62], a16: [210, 62], a17: [240, 62], a18: [162, 62],
    a19: [210, 62], a20: [244, 62], a21: [200, 62], a22: [205, 62], a23: [252, 62], a24: [210, 62]
  };

  const nodeEls = new Map();
  nodes.forEach(n => {
    const [w, h] = nodeSize[n.id] || [180, 56];
    drawNode(svg, n, 10, 1, w, h, { wrap: 24, fontSize: 13 });
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
    detail.innerHTML = `<div class="detail-header"><span class="icon-badge runtime">${iconMarkup('routing')}</span><h3>How to use this map</h3></div><p><strong>1.</strong> Use <em>Next Guided Step</em> to follow capture -> policy -> consumer flow.</p><p><strong>2.</strong> Click any node to highlight direct dependencies.</p><p><strong>3.</strong> Filter Experience, Policy, or Consumer to study one layer.</p><p><strong>Mental model:</strong> capture time, apply policy, transfer to consumers.</p>`;
  }

  bindRelationshipControls();
  attachSearch();
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
