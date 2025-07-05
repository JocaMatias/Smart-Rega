function atualizarRedeAtual() {
  fetch('/rede/atual')
    .then(r => r.json()) 
    .then(data => {
      document.getElementById('redeAtual').textContent = 'Ligado a: ' + data.ssid;
    })
    .catch(() => {
      document.getElementById('redeAtual').textContent = 'Erro ao obter rede atual';
    });
}

function carregarRedes() {
  fetch('/redes')
    .then(r => r.json())
    .then(redes => {
      const lista = document.getElementById('listaRedes');
      lista.innerHTML = '';

      if (redes.length === 0) {
        lista.textContent = 'Nenhuma rede guardada.';
        return;
      }

      redes.forEach((r, i) => {
        const div = document.createElement('div');
        div.className = 'rede';
        div.innerHTML = `
          <b>${r.ssid}</b><br>
          <button onclick="trocar('${r.ssid}')" class="btn">Ligar</button>
          <button onclick="remover('${r.ssid}')" class="btn">Eliminar</button>
        `;
        lista.appendChild(div);
      });
    });
}

function adicionarRede() {
  const ssid = document.getElementById('ssid').value.trim();
  const pass = document.getElementById('pass').value;

  if (!ssid) return alert('SSID não pode estar vazio.');

  fetch('/rede/adicionar', {
    method: 'POST',
    body: JSON.stringify({ ssid, password: pass }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(r => r.text())
  .then(res => {
    alert(res);
    carregarRedes();
    atualizarRedeAtual();
    document.getElementById('ssid').value = '';
    document.getElementById('pass').value = '';
  });
}

function trocar(ssid) {
  fetch('/rede/trocar', {
    method: 'POST',
    body: JSON.stringify({ ssid }),
    headers: { 'Content-Type': 'application/json' }
  });
}

function remover(ssid) {
  fetch('/rede/remover', {
    method: 'POST',
    body: JSON.stringify({ ssid }),
    headers: { 'Content-Type': 'application/json' }
  }).then(() => carregarRedes());
}

atualizarRedeAtual();
carregarRedes();
