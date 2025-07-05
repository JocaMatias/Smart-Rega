async function obterRedeAtual() {
  try {
    const res = await fetch('/rede/atual');
    const data = await res.json();
    document.getElementById('redeAtual').textContent = "Ligado a: " + (data.ssid || "desconhecida");
  } catch (e) {
    document.getElementById('redeAtual').textContent = "Erro ao obter rede atual";
  }
}

async function carregarRedes() {
  try {
    const res = await fetch('/redes');
    const redes = await res.json();
    const container = document.getElementById('listaRedes');
    container.innerHTML = '';

    if (redes.length === 0) {
      container.innerHTML = '<p>Nenhuma rede guardada.</p>';
      return;
    }

    redes.forEach((r, i) => {
      const div = document.createElement('div');
      div.className = 'rede';
      div.innerHTML = `
        <strong>${r.ssid}</strong><br>
        <div class="acoes">
          <button onclick="ligar('${r.ssid}', '${r.pass}')">Ligar</button>
          <button onclick="remover(${i})">Remover</button>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (e) {
    document.getElementById('listaRedes').innerHTML = 'Erro ao carregar redes';
  }
}

async function adicionarRede() {
  const ssid = document.getElementById('ssid').value;
  const pass = document.getElementById('password').value;
  if (!ssid || !pass) return alert("Preenche todos os campos.");

  await fetch('/rede/adicionar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ssid, pass })
  });

  document.getElementById('ssid').value = '';
  document.getElementById('password').value = '';
  carregarRedes();
}

async function ligar(ssid, pass) {
  await fetch('/rede/trocar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ssid, pass })
  });
  alert("A reiniciar para ligar a: " + ssid);
}

async function remover(index) {
  if (!confirm("Remover esta rede?")) return;
  await fetch('/rede/remover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index })
  });
  carregarRedes();
}

obterRedeAtual();
carregarRedes();
