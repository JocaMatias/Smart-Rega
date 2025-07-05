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

      if (!redes || redes.length === 0) {
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
    })
    .catch(() => {
      document.getElementById('listaRedes').textContent = 'Erro ao carregar redes';
    });
}

function adicionarRede() {
  const ssid = document.getElementById('ssid').value;
  const pass = document.getElementById('pass').value;

  if (!ssid) return alert('SSID obrigatório');

  fetch('/rede/adicionar', {
    method: 'POST',
    body: JSON.stringify({ ssid, password: pass }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(r => r.text())
  .then(txt => {
    alert(txt);
    carregarRedes();
    document.getElementById('ssid').value = '';
    document.getElementById('pass').value = '';
  })
  .catch(() => alert('Erro ao adicionar rede'));
}

function trocar(ssid) {
  fetch('/rede/trocar', {
    method: 'POST',
    body: JSON.stringify({ ssid }),
    headers: { 'Content-Type': 'application/json' }
  }).then(() => alert('A mudar de rede...'))
    .catch(() => alert('Erro ao trocar de rede'));
}

function remover(ssid) {
  fetch('/rede/remover', {
    method: 'POST',
    body: JSON.stringify({ ssid }),
    headers: { 'Content-Type': 'application/json' }
  }).then(() => carregarRedes())
    .catch(() => alert('Erro ao remover rede'));
}

atualizarRedeAtual();
carregarRedes();
