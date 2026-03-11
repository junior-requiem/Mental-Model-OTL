import { $, loadModel, applySource } from './common.js';

const model = await loadModel();
applySource(model);
$('overview-cards').innerHTML = `
<article><h3>Core objects</h3><p>${model.objects.length}</p></article>
<article><h3>Relationships</h3><p>${model.relationships.length}</p></article>
<article><h3>Lifecycle stages</h3><p>${model.lifecycleStages.length}</p></article>
<article><h3>Troubleshooting checks</h3><p>${model.troubleshootingBranches.length}</p></article>`;
$('glossary-list').innerHTML = model.glossary.map(g => `<article class="glossary-item"><h3>${g.term}</h3><p><strong>Oracle term:</strong> ${g.oracleTerm}</p><p>${g.definition}</p></article>`).join('');
