import { $, loadModel, applySource, setupSvg, drawInteractiveNode, drawEdge } from './common.js';
const model = await loadModel(); applySource(model);
const svg = $('diagram'); const detail = $('detail'); setupSvg(svg);
const nodes = model.lifecycleStages.map((s, i) => ({ id: `l${i}`, label: `${i + 1}. ${s}`, x: 110 + i * 210, y: 90, context: 'Lifecycle stage from reference diagram' }));
const by = Object.fromEntries(nodes.map(n => [n.id, n]));
nodes.forEach((n, i) => {
  drawInteractiveNode({ svg, node: n, width: 200, height: 78, detailEl: detail, model });
  if (i < nodes.length - 1) drawEdge(svg, { x: n.x + 100, y: n.y }, { x: nodes[i + 1].x - 100, y: nodes[i + 1].y });
});
