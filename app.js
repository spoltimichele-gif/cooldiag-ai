const $ = id => document.getElementById(id);

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  if(id === 'result') analyze();
  if(id === 'report') makeReport();
  if(id === 'history') renderHistory();
}

document.querySelectorAll('[data-screen]').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.screen));
});

function n(id){ return Number($(id).value) || 0; }
function v(id){ return $(id).value || ''; }
function c(id){ return $(id).checked; }

$('toggleInfo').addEventListener('click', () => $('infoPanel').classList.toggle('hidden'));

$('calcSuperheat').addEventListener('click', () => {
  $('superheat').value = (n('suctionTemp') - n('evapTemp')).toFixed(1);
});

function analyze(){
  const dt = n('returnAir') - n('supplyAir');
  const sh = n('superheat');
  const evap = n('evapTemp');
  const amp = n('ampsPercent');
  const gas = v('gas');

  let score = 0;
  const notes = [];
  const todo = [];

  if(dt >= 8 && dt <= 12) score += 2;
  else { notes.push('ΔT aria fuori zona ideale.'); todo.push('Rimisurare ripresa e mandata a macchina stabilizzata.'); }

  if(sh >= 3 && sh <= 7) score += 2;
  else if(sh > 7) { score += 1; notes.push('Surriscaldamento alto.'); todo.push('Verificare portata aria, batteria e possibile carenza refrigerante.'); }
  else { notes.push('Surriscaldamento basso.'); todo.push('Controllare EEV, sensori e rischio ritorno liquido.'); }

  if(evap >= 3 && evap <= 18) score += 1;
  else { notes.push('Temperatura evaporazione poco coerente.'); todo.push('Controllare gas selezionato e stabilità macchina.'); }

  if(amp >= 45 && amp <= 100) score += 1;
  else { notes.push('Assorbimento fuori campo atteso.'); todo.push('Misurare con pinza True RMS e confrontare con targa/manuale.'); }

  if(c('dirtyFilter') || c('dirtyIndoorCoil') || c('dirtyOutdoorCoil')) {
    notes.push('Possibile problema di scambio aria.');
    todo.push('Pulire filtri/batterie e ripetere le misure prima di valutare gas.');
  }

  if(c('fanIssue')) {
    notes.push('Ventilazione anomala.');
    todo.push('Risolvere ventilazione prima di valutare la carica.');
  }

  if(c('ice')) {
    notes.push('Ghiaccio presente.');
    todo.push('Sbrinare e verificare portata aria, sensori e refrigerante.');
  }

  if(c('oil') || c('leak')) {
    notes.push('Indizio di perdita.');
    todo.push('Eseguire ricerca perdita prima di qualsiasi ricarica.');
  }

  if(c('errorCode')) {
    notes.push('Codice errore presente: ' + v('errorText'));
    todo.push('Consultare procedura guasto per marca e modello.');
  }

  if(gas === 'R290') {
    notes.push('R290 infiammabile.');
    todo.push('Applicare procedura di sicurezza R290 e caricare solo a peso.');
  }

  let status = 'Dubbio';
  let confidence = '55%';
  let action = 'Misurare meglio';

  if(score >= 5 && !c('leak') && !c('oil') && !c('dirtyFilter') && !c('dirtyIndoorCoil') && !c('dirtyOutdoorCoil')){
    status = 'OK probabile';
    confidence = '80-90%';
    action = 'Non caricare';
  }

  if(sh > 8 && dt < 8 && amp < 70){
    status = 'Possibile gas basso';
    confidence = '60-75%';
    action = 'Cerca perdita';
  }

  if(c('dirtyFilter') || c('dirtyIndoorCoil') || c('dirtyOutdoorCoil') || c('fanIssue')){
    status = 'Problema aria/scambio';
    confidence = '70%';
    action = 'Pulire/verificare';
  }

  if(c('oil') || c('leak')){
    status = 'Perdita sospetta';
    confidence = '75%';
    action = 'Ricerca perdita';
  }

  if(gas === 'R290' && status === 'Possibile gas basso'){
    action = 'Procedura R290';
  }

  $('resultStatus').textContent = status;
  $('confidence').textContent = confidence;
  $('nextAction').textContent = action;
  $('diagnosisText').textContent = `${status}. ΔT aria ${dt.toFixed(1)} °C, surriscaldamento ${sh.toFixed(1)} K. ${notes.join(' ')}`;

  const list = $('todoList');
  list.innerHTML = '';
  [...new Set(todo)].forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    list.appendChild(li);
  });
}

function makeReport(){
  analyze();
  $('reportText').textContent =
`COOLDIAG AI - REPORT DIAGNOSI

Cliente: ${v('customer')}
Luogo: ${v('place')}
Marca: ${v('brand')}
Modello: ${v('model')}
Gas: ${v('gas')}
Tipo: ${v('machineType')}
BTU: ${v('btu')}
Tubazioni: ${v('pipeLength')} m

MISURE
Pressione aspirazione: ${v('pressure')} bar
Temperatura evaporazione: ${v('evapTemp')} °C
Temperatura aspirazione: ${v('suctionTemp')} °C
Surriscaldamento: ${v('superheat')} K
Temperatura ripresa: ${v('returnAir')} °C
Temperatura mandata: ${v('supplyAir')} °C
Temperatura esterna: ${v('outdoorTemp')} °C
Assorbimento: ${v('ampsPercent')}% targa

ESITO
${$('diagnosisText').textContent}

NOTE
${v('notes')}

Firma cliente: ______________________`;
}

$('refreshReport').addEventListener('click', makeReport);

function getHistory(){
  try { return JSON.parse(localStorage.getItem('cooldiag_history') || '[]'); }
  catch(e){ return []; }
}

function setHistory(items){
  localStorage.setItem('cooldiag_history', JSON.stringify(items));
}

$('saveDiagnosis').addEventListener('click', () => {
  analyze();
  const item = {
    date: new Date().toLocaleString('it-IT'),
    customer: v('customer'),
    brand: v('brand'),
    model: v('model'),
    gas: v('gas'),
    status: $('resultStatus').textContent,
    diagnosis: $('diagnosisText').textContent
  };
  const history = getHistory();
  history.unshift(item);
  setHistory(history.slice(0, 50));
  alert('Diagnosi salvata nello storico locale.');
});

function renderHistory(){
  const history = getHistory();
  const box = $('historyList');
  if(!history.length){
    box.textContent = 'Nessuna diagnosi salvata.';
    return;
  }
  box.innerHTML = '';
  history.forEach(item => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<b>${item.date}</b><br>${item.customer || 'Cliente non indicato'} — ${item.brand} ${item.model}<br><b>${item.status}</b><br><small>${item.diagnosis}</small>`;
    box.appendChild(div);
  });
}

$('clearHistory').addEventListener('click', () => {
  localStorage.removeItem('cooldiag_history');
  renderHistory();
});

$('toolboxCalc').addEventListener('click', () => {
  const sh = Number($('tbSuction').value) - Number($('tbEvap').value);
  const dt = Number($('tbReturn').value) - Number($('tbSupply').value);
  const psi = Number($('tbBar').value) * 14.5038;
  const mbar = Number($('tbMicron').value) * 0.00133322;

  $('toolboxOut').innerHTML =
    `Surriscaldamento: <b>${isFinite(sh) ? sh.toFixed(1) : '—'} K</b><br>
     ΔT aria: <b>${isFinite(dt) ? dt.toFixed(1) : '—'} °C</b><br>
     bar → psi: <b>${isFinite(psi) ? psi.toFixed(1) : '—'} psi</b><br>
     micron → mbar: <b>${isFinite(mbar) ? mbar.toFixed(3) : '—'} mbar</b>`;
});

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
