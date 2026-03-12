export const $ = id => document.getElementById(id);

export async function loadModel() {
  const res = await fetch('src/data/otl-model.json');
  return res.json();
}

export function applySource(model) {
  const target = $('source-warning');
  if (target) target.textContent = model.meta.sourceStatus;
}

export function objectById(model, id) {
  return model.objects.find(o => o.id === id);
}

export function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

export function setupSvg(svg) {
  const defs = svgEl('defs');
  const marker = svgEl('marker', { id: 'arrow', markerWidth: 10, markerHeight: 10, refX: 9, refY: 5, orient: 'auto' });
  marker.appendChild(svgEl('path', { d: 'M0,0 L10,5 L0,10 z', fill: '#d4d8dc' }));
  defs.appendChild(marker);
  svg.appendChild(defs);
}

function ensureTooltip() {
  let tip = document.querySelector('.tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'tooltip';
    document.body.appendChild(tip);
  }
  return tip;
}

export function renderDetail(node, model, detailEl) {
  const mapped = node.objectId ? objectById(model, node.objectId) : null;
  if (!detailEl) return;
  if (mapped) {
    detailEl.innerHTML = `<h3>${mapped.name}</h3><p><strong>Plain English:</strong> ${mapped.definition}</p><p><strong>Oracle term:</strong> ${mapped.oracleTerm}</p><p><strong>Purpose:</strong> ${mapped.purpose}</p><p><strong>Where it fits:</strong> ${mapped.flowFit}</p><p><strong>Common mistakes:</strong></p><ul>${mapped.commonMistakes.map(m=>`<li>${m}</li>`).join('')}</ul>`;
  } else {
    detailEl.innerHTML = `<h3>${node.label}</h3><p>${node.context || 'TODO: Needs review'}</p><p><strong>Oracle term:</strong> ${node.oracleTerm || 'Needs review'}</p>`;
  }
}

export function drawInteractiveNode({ svg, node, width = 220, height = 58, detailEl, model, onActivate, wrapAt = 22, lineSpacing = 24, fontSize = 13 }) {
  const g = svgEl('g', { class: 'node-group', transform: `translate(${node.x - width / 2},${node.y - height / 2})` });
  g.appendChild(svgEl('rect', { class: 'node-rect', width, height }));
  const text = svgEl('text', { class: 'node-label', x: width / 2, y: height / 2, 'font-size': fontSize });
  const lines = wrapLines(node.label, wrapAt);
  lines.forEach((line, i) => {
    const tsp = svgEl('tspan', { x: width / 2, dy: i === 0 ? -((lines.length - 1) * (lineSpacing / 2)) : lineSpacing });
    tsp.textContent = line;
    text.appendChild(tsp);
  });
  g.appendChild(text);

  const tip = ensureTooltip();
  g.addEventListener('mouseenter', () => {
    tip.style.display = 'block';
    tip.innerHTML = `<strong>${node.label}</strong><br/>${node.context || objectById(model, node.objectId)?.definition || 'Needs review'}`;
  });
  g.addEventListener('mousemove', e => {
    tip.style.left = `${e.clientX + 14}px`;
    tip.style.top = `${e.clientY + 14}px`;
  });
  g.addEventListener('mouseleave', () => (tip.style.display = 'none'));
  g.addEventListener('click', () => {
    svg.querySelectorAll('.node-group').forEach(n => n.classList.remove('active'));
    g.classList.add('active');
    renderDetail(node, model, detailEl);
    if (onActivate) onActivate(node.id);
  });

  svg.appendChild(g);
}

export function drawEdge(svg, from, to) {
  svg.appendChild(svgEl('path', { class: 'edge', d: `M ${from.x} ${from.y} L ${to.x} ${to.y}` }));
}

function wrapLines(input, maxChars) {
  const words = input.split(' ');
  const lines = [];
  let line = '';
  words.forEach(w => {
    if ((line + ' ' + w).trim().length > maxChars) {
      lines.push(line.trim());
      line = w;
    } else {
      line += ` ${w}`;
    }
  });
  if (line.trim()) lines.push(line.trim());
  return lines;
}
