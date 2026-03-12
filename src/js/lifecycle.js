import { $, loadModel, applySource, setupSvg, drawInteractiveNode, drawEdge } from './common.js';

const model = await loadModel();
applySource(model);

const svg = $('diagram');
const detail = $('detail');
setupSvg(svg);

const cardWidth = 250;
const cardHeight = 96;
const stepX = 320;
const topY = 92;
const bottomY = 252;
const startX = 180;
const rowBreakAt = 5;

const nodes = model.lifecycleStages.map((stage, i) => {
  const inSecondRow = i >= rowBreakAt;
  const rowIndex = inSecondRow ? (rowBreakAt - 1) - (i - rowBreakAt) : i;

  return {
    id: `l${i}`,
    label: `${i + 1}. ${stage}`,
    x: startX + rowIndex * stepX,
    y: inSecondRow ? bottomY : topY,
    context: 'Lifecycle stage from reference diagram'
  };
});

svg.setAttribute('viewBox', '0 0 1700 340');

nodes.forEach((node, i) => {
  drawInteractiveNode({
    svg,
    node,
    width: cardWidth,
    height: cardHeight,
    detailEl: detail,
    model,
    wrapAt: 24,
    lineSpacing: 18,
    fontSize: 12
  });

  if (i >= nodes.length - 1) {
    return;
  }

  const current = nodes[i];
  const next = nodes[i + 1];

  const sameRow = current.y === next.y;
  if (sameRow) {
    drawEdge(svg, { x: current.x + cardWidth / 2, y: current.y }, { x: next.x - cardWidth / 2, y: next.y });
    return;
  }

  // Snake between rows for readability: row 1 flows left→right, row 2 continues right→left.
  drawEdge(svg, { x: current.x, y: current.y + cardHeight / 2 }, { x: next.x, y: next.y - cardHeight / 2 });
});
