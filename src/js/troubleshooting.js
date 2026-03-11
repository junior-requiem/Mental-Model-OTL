import { $, loadModel, applySource, setupSvg, drawInteractiveNode, drawEdge } from './common.js';
const model = await loadModel(); applySource(model);
const svg = $('diagram'); const detail = $('detail'); setupSvg(svg);
const nodes = model.troubleshootingBranches.map((q, i) => ({ id: `t${i}`, label: `${i + 1}. ${q}`, x: 350, y: 110 + i * 210, context: 'Troubleshooting checkpoint' }));
nodes.forEach((n, i) => {
  drawInteractiveNode({ svg, node: n, width: 620, height: 130, detailEl: detail, model });
  if (i < nodes.length - 1) drawEdge(svg, { x: n.x, y: n.y + 65 }, { x: nodes[i + 1].x, y: nodes[i + 1].y - 65 });
});
