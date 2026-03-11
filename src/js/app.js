const $ = id => document.getElementById(id);

const state = { model: null };

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function addArrowDefs(svg) {
  const defs = svgEl('defs');
  const marker = svgEl('marker', { id: 'arrow', markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto' });
  marker.appendChild(svgEl('path', { d: 'M0,0 L8,4 L0,8 z', fill: '#d4d7dc' }));
  defs.appendChild(marker);
  svg.appendChild(defs);
}

function drawNode(svg, node, scaleX = 10, scaleY = 10, w = 150, h = 42) {
  const g = svgEl('g', { class: 'node-group', 'data-id': node.id, transform: `translate(${node.x * scaleX - w / 2},${node.y * scaleY - h / 2})` });
  g.append(svgEl('rect', { class: 'node-rect', width: w, height: h }));
  const t = svgEl('text', { class: 'node-label', x: w / 2, y: h / 2 });
  node.label.split(' / ').forEach((part, i) => {
    const span = svgEl('tspan', { x: w / 2, dy: i === 0 ? 0 : 12 });
    span.textContent = part;
    t.appendChild(span);
  });
  g.appendChild(t);
  g.addEventListener('click', () => showDetailsByLabel(node.label));
  svg.appendChild(g);
}

function drawEdge(svg, from, to, scaleX = 10, scaleY = 10) {
  svg.appendChild(svgEl('path', { class: 'edge', d: `M ${from.x * scaleX} ${from.y * scaleY} L ${to.x * scaleX} ${to.y * scaleY}` }));
}

function showDetailsByLabel(label) {
  const found = state.model.objects.find(o => label.toLowerCase().includes(o.name.toLowerCase().replace(' / sets','')) || o.name.toLowerCase().includes(label.toLowerCase()));
  const detail = $('object-detail');
  if (!found) {
    detail.innerHTML = `<h3>${label}</h3><p>Needs review: detailed mapping to objects in /docs.</p>`;
    return;
  }
  detail.innerHTML = `
    <h3>${found.name}</h3>
    <p><strong>Plain English:</strong> ${found.definition}</p>
    <p><strong>Oracle term:</strong> ${found.oracleTerm}</p>
    <p><strong>Purpose:</strong> ${found.purpose}</p>
    <p><strong>Where it fits:</strong> ${found.flowFit}</p>
    <p><strong>Common mistakes:</strong></p>
    <ul>${found.commonMistakes.map(m => `<li>${m}</li>`).join('')}</ul>
  `;
}

function renderOverview(model) {
  $('source-warning').textContent = model.meta.sourceStatus;
  $('overview-cards').innerHTML = `
    <article><h3>Core objects</h3><p>${model.objects.length}</p></article>
    <article><h3>Relationships</h3><p>${model.relationships.length}</p></article>
    <article><h3>Lifecycle steps</h3><p>${model.lifecycleStages.length}</p></article>
    <article><h3>Troubleshooting checks</h3><p>${model.troubleshootingBranches.length}</p></article>
  `;
}

function renderArchitecture(model) {
  const svg = $('architecture-svg');
  svg.innerHTML = '';
  addArrowDefs(svg);
  svg.appendChild(svgEl('rect', { class: 'band', x: 1, y: 1, width: 998, height: 450 }));
  svg.appendChild(svgEl('rect', { class: 'band', x: 35, y: 500, width: 930, height: 560 }));
  svg.appendChild(svgEl('rect', { class: 'band', x: 100, y: 1080, width: 850, height: 100 }));
  [['Setup / Design', 500, 20], ['Runtime / Daily Use', 500, 520], ['Consumers', 500, 1095]].forEach(([txt, x, y]) => {
    const t = svgEl('text', { class: 'band-label', x, y }); t.textContent = txt; svg.appendChild(t);
  });
  const nodes = model.diagram.setupRuntimeConsumers.nodes;
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  model.diagram.setupRuntimeConsumers.edges.forEach(([a, b]) => drawEdge(svg, byId[a], byId[b]));
  nodes.forEach(n => drawNode(svg, n));
}

function renderLifecycle(model) {
  const svg = $('lifecycle-svg');
  svg.innerHTML = ''; addArrowDefs(svg);
  const y = 65; const w = 160; const h = 50;
  model.lifecycleStages.forEach((s, i) => {
    const x = 80 + i * 195;
    const node = { id: `life-${i}`, label: s, x: x / 10, y: y / 10 };
    drawNode(svg, node, 10, 10, w, h);
    if (i < model.lifecycleStages.length - 1) svg.appendChild(svgEl('path', { class: 'edge', d: `M ${x + 80} ${y} L ${x + 118} ${y}` }));
  });
}

function renderTroubleshoot(model) {
  const svg = $('troubleshoot-svg');
  svg.innerHTML = ''; addArrowDefs(svg);
  const x = 300;
  model.troubleshootingBranches.forEach((q, i) => {
    const y = 80 + i * 200;
    const node = { id: `tb-${i}`, label: q, x: x / 10, y: y / 10 };
    drawNode(svg, node, 10, 10, 540, 130);
    if (i < model.troubleshootingBranches.length - 1) svg.appendChild(svgEl('path', { class: 'edge', d: `M ${x} ${y + 65} L ${x} ${y + 125}` }));
  });
}

function renderRelationship(model) {
  const svg = $('relationship-svg');
  svg.innerHTML = ''; addArrowDefs(svg);
  const nodes = [
    { id: 'a1', label: 'Worker / Manager / Device', x: 105, y: 25 },
    { id: 'a2', label: 'Time Entry Experience', x: 105, y: 75 },
    { id: 'a3', label: '3rd Party Device / Load', x: 90, y: 130 },
    { id: 'a4', label: 'Web Clock', x: 103, y: 130 },
    { id: 'a5', label: 'Calendar', x: 115, y: 130 },
    { id: 'a6', label: 'Time Card', x: 127, y: 130 },
    { id: 'a7', label: 'Entered Time Data', x: 105, y: 175 },
    { id: 'a8', label: 'Rules Engine', x: 40, y: 245 },
    { id: 'a9', label: 'Worker Time Processing Profile', x: 100, y: 245 },
    { id: 'a10', label: 'Worker Time Entry Profile', x: 145, y: 245 },
    { id: 'a11', label: 'Time Attributes', x: 185, y: 245 },
    { id: 'a12', label: 'HCM Groups', x: 185, y: 205 },
    { id: 'a13', label: 'Time Card Fields', x: 185, y: 300 },
    { id: 'a14', label: 'Layout Components / Layout Sets', x: 180, y: 360 },
    { id: 'a15', label: 'Validation Rules', x: 72, y: 300 },
    { id: 'a16', label: 'Calculation Rules', x: 55, y: 300 },
    { id: 'a17', label: 'Time Consumer Set', x: 120, y: 300 },
    { id: 'a18', label: 'Payroll', x: 145, y: 360 },
    { id: 'a19', label: 'Project Costing', x: 125, y: 360 },
    { id: 'a20', label: 'Project Execution Mgmt', x: 80, y: 360 },
    { id: 'a21', label: 'Transfer Status', x: 20, y: 450 },
    { id: 'a22', label: 'Payroll Transfer', x: 42, y: 500 },
    { id: 'a23', label: 'Project Costing Transfer', x: 22, y: 500 },
    { id: 'a24', label: 'Other External Uses', x: 2, y: 500 }
  ];
  const by = Object.fromEntries(nodes.map(n => [n.id, n]));
  const edges = [['a1','a2'],['a2','a3'],['a2','a4'],['a2','a5'],['a2','a6'],['a3','a7'],['a4','a7'],['a5','a7'],['a6','a7'],['a7','a8'],['a7','a9'],['a7','a10'],['a8','a15'],['a8','a16'],['a9','a17'],['a10','a17'],['a11','a13'],['a13','a14'],['a12','a10'],['a10','a14'],['a17','a18'],['a17','a19'],['a17','a20'],['a8','a21'],['a21','a22'],['a21','a23'],['a21','a24']];
  edges.forEach(([a,b]) => drawEdge(svg, by[a], by[b]));
  nodes.forEach(n => drawNode(svg, n, 10, 1, 160, 34));
}

function renderGlossary(model) {
  $('glossary-list').innerHTML = model.glossary.map(g => `
    <article class="glossary-item">
      <h3>${g.term}</h3>
      <p><strong>Oracle term:</strong> ${g.oracleTerm}</p>
      <p>${g.definition}</p>
    </article>
  `).join('');
}

async function init() {
  const res = await fetch('src/data/otl-model.json');
  state.model = await res.json();
  renderOverview(state.model);
  renderArchitecture(state.model);
  renderLifecycle(state.model);
  renderTroubleshoot(state.model);
  renderRelationship(state.model);
  renderGlossary(state.model);
}

init();
