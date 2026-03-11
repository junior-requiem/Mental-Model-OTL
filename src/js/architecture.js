import { $, loadModel, applySource, setupSvg, svgEl, drawEdge, drawInteractiveNode } from './common.js';
const model = await loadModel(); applySource(model);
const svg = $('diagram'); const detail = $('detail'); setupSvg(svg);
const d = model.diagrams.architecture;
d.bands.forEach(b => {
  svg.appendChild(svgEl('rect', { class: 'band', x: b.x, y: b.y, width: b.w, height: b.h }));
  const t = svgEl('text', { class: 'band-label', x: b.x + b.w / 2, y: b.y + 30 }); t.textContent = b.label; svg.appendChild(t);
});
const by = Object.fromEntries(d.nodes.map(n => [n.id, n]));
d.edges.forEach(([a,b]) => drawEdge(svg, by[a], by[b]));
d.nodes.forEach(n => drawInteractiveNode({ svg, node: n, width: 280, height: 62, detailEl: detail, model }));
