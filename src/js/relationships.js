import { $, loadModel, applySource, setupSvg, drawInteractiveNode, drawEdge } from './common.js';
const model = await loadModel(); applySource(model);
const svg = $('diagram'); const detail = $('detail'); setupSvg(svg);
const nodes = [
  { id: 'r1', label: 'Worker / Manager / Device', x: 1100, y: 55, context: 'Entry actors' },
  { id: 'r2', label: 'Time Entry Experience', x: 1100, y: 130, context: 'Entry channels', objectId: 'time-entry-profiles' },
  { id: 'r3', label: '3rd Party Device / Load', x: 900, y: 230 }, { id: 'r4', label: 'Web Clock', x: 1060, y: 230 }, { id: 'r5', label: 'Calendar', x: 1200, y: 230 }, { id: 'r6', label: 'Time Card', x: 1340, y: 230 },
  { id: 'r7', label: 'Entered Time Data', x: 1100, y: 310, context: 'Runtime data state' },
  { id: 'r8', label: 'Rules Engine', x: 420, y: 430, objectId: 'validation-calculation-rules' },
  { id: 'r9', label: 'Worker Time Processing Profile', x: 980, y: 430, objectId: 'time-processing-profiles' },
  { id: 'r10', label: 'Worker Time Entry Profile', x: 1380, y: 430, objectId: 'time-entry-profiles' },
  { id: 'r11', label: 'Time Attributes', x: 1860, y: 430, objectId: 'time-attributes' },
  { id: 'r12', label: 'HCM Groups', x: 1860, y: 350, objectId: 'hcm-groups' },
  { id: 'r13', label: 'Time Card Fields', x: 1860, y: 530, objectId: 'time-card-fields' },
  { id: 'r14', label: 'Layout Components / Layout Sets', x: 1810, y: 640, objectId: 'layout-components' },
  { id: 'r15', label: 'Validation Rules', x: 700, y: 530, objectId: 'validation-calculation-rules' },
  { id: 'r16', label: 'Calculation Rules', x: 530, y: 530, objectId: 'validation-calculation-rules' },
  { id: 'r17', label: 'Time Consumer Set', x: 1220, y: 530, objectId: 'time-consumer-sets' },
  { id: 'r18', label: 'Payroll', x: 1460, y: 640 }, { id: 'r19', label: 'Project Costing', x: 1240, y: 640 }, { id: 'r20', label: 'Project Execution Mgmt', x: 900, y: 640 },
  { id: 'r21', label: 'Transfer Status', x: 250, y: 590 }, { id: 'r22', label: 'Payroll Transfer', x: 360, y: 700 }, { id: 'r23', label: 'Project Costing Transfer', x: 220, y: 700 }, { id: 'r24', label: 'Other External Uses', x: 80, y: 700 }
];
const by = Object.fromEntries(nodes.map(n => [n.id, n]));
[['r1','r2'],['r2','r3'],['r2','r4'],['r2','r5'],['r2','r6'],['r3','r7'],['r4','r7'],['r5','r7'],['r6','r7'],['r7','r8'],['r7','r9'],['r7','r10'],['r8','r15'],['r8','r16'],['r9','r17'],['r10','r17'],['r11','r13'],['r13','r14'],['r12','r10'],['r10','r14'],['r17','r18'],['r17','r19'],['r17','r20'],['r8','r21'],['r21','r22'],['r21','r23'],['r21','r24']].forEach(([a,b]) => drawEdge(svg, by[a], by[b]));
nodes.forEach(n => drawInteractiveNode({ svg, node: n, width: 220, height: 58, detailEl: detail, model }));
