// 🛜 Verificação do estado do ESP32 ao carregar o site
async function verificarOnline() {
  try {
    const res = await fetch('http://smartrega.local/wifi/atual', { method: 'GET', cache: 'no-store' });
    if (res.ok) return true;
  } catch (e) {
    console.warn("ESP32 está offline.");
  }
  return false;
}

window.addEventListener('DOMContentLoaded', async () => {
  const online = await verificarOnline();
  if (!online) {
    const aviso = document.createElement('div');
    aviso.innerHTML = `
      <div style="
        background: #fee2e2;
        color: #991b1b;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        margin: 1rem;
        font-weight: bold;
        box-shadow: 0 0 6px rgba(0,0,0,0.1);
      ">
        ⚠️ Dispositivo offline.<br/>
        Liga-te à rede <strong>SmartRega_Config</strong> no Wi-Fi.<br/>
        <a href="http://192.168.4.1" style="color: #b91c1c; text-decoration: underline;">Clica aqui para configurar</a>.
      </div>
    `;
    document.body.prepend(aviso);
  }
});

// Ligação ao broker MQTT via WebSocket seguro (HiveMQ Cloud)
let client = mqtt.connect('wss://1d5b0c37f4834659a0c05736c16b9504.s1.eu.hivemq.cloud:8884/mqtt', {
  username: "Joao_Matias",
  password: "Regaautomatica1"
});

client.on('connect', () => {
  console.log('Ligado ao broker MQTT (HiveMQ Cloud)');
  client.subscribe('irhub/estado');
  atualizar(); // dispara o pedido inicial
});

client.on('message', (topic, message) => {
  if (topic === 'irhub/estado') {
    const d = JSON.parse(message.toString());

    document.getElementById('modo').innerText = d.modo;

    document.getElementById('h1s').innerText = d.h1s;
    document.getElementById('h2s').innerText = d.h2s;
    document.getElementById('luzs').innerText = d.luzs;

    document.getElementById('b1').innerText = d.b1 ? 'Ligada' : 'Desligada';
    document.getElementById('b2').innerText = d.b2 ? 'Ligada' : 'Desligada';

    document.getElementById('estadoB1Auto').innerText = d.b1 ? 'Ligada' : 'Desligada';
    document.getElementById('estadoB2Auto').innerText = d.b2 ? 'Ligada' : 'Desligada';
    document.getElementById('estadoBombasAuto').style.display = d.modo === 'Automático' ? 'block' : 'none';

    document.getElementById('ctrl1').style.display = d.modo === 'Manual' ? 'block' : 'none';
    document.getElementById('ctrl2').style.display = d.modo === 'Manual' ? 'block' : 'none';

    atualizarGauge("circleTemp", "valorTemp", d.temp, "°C", 40);
    atualizarGauge("circleH1", "valorH1", d.h1, "%");
    atualizarGauge("circleH2", "valorH2", d.h2, "%");
    atualizarGauge("circleLuz", "valorLuz", d.luz, "%");

    if (!bloquearAtualizacao) {
      document.getElementById('spTemp').value = d.setTempMin;
      document.getElementById('spHum1').value = d.setHumMin1;
      document.getElementById('spHum2').value = d.setHumMin2;
      document.getElementById('spLuz').value = d.setLuzMin;
    }
  }
});

// Funções de controlo manual
function enviarComando(cmd) {
  client.publish('irhub/comando', cmd);
}

function modoAuto() { enviarComando('autoOn'); }
function modoManual() { enviarComando('autoOff'); }
function ligar1() { enviarComando('ligar1'); }
function desligar1() { enviarComando('desligar1'); }
function ligar2() { enviarComando('ligar2'); }
function desligar2() { enviarComando('desligar2'); }

// Enviar novos setpoints
function enviarSetpoints() {
  const dados = {
    tempMin: parseFloat(document.getElementById('spTemp').value),
    humMin1: parseInt(document.getElementById('spHum1').value),
    humMin2: parseInt(document.getElementById('spHum2').value),
    luzMin: parseInt(document.getElementById('spLuz').value)
  };

  client.publish('irhub/setpoints', JSON.stringify(dados));
  iniciarDelayEdicao();
}

// Pedir estado atual
function atualizar() {
  client.publish('irhub/comando', 'getEstado');
}

// Atualização visual dos gauges
function atualizarGauge(circleId, textId, valor, unidade = "%", max = 100) {
  const dash = Math.round((valor / max) * 251);
  document.getElementById(circleId).setAttribute("stroke-dasharray", `${dash} ${251 - dash}`);
  document.getElementById(textId).textContent = valor + unidade;
}

// ⏳ Bloqueio de atualização durante edição
let bloquearAtualizacao = false;
let timeoutAtualizacao = null;
let segundosRestantes = 0;

function iniciarDelayEdicao() {
  bloquearAtualizacao = true;
  clearInterval(timeoutAtualizacao);
  segundosRestantes = 10;
  atualizarContador();

  timeoutAtualizacao = setInterval(() => {
    segundosRestantes--;
    atualizarContador();
    if (segundosRestantes <= 0) {
      bloquearAtualizacao = false;
      clearInterval(timeoutAtualizacao);
      document.getElementById('contadorSetpoint').textContent = "";
    }
  }, 1000);
}

function atualizarContador() {
  document.getElementById('contadorSetpoint').textContent =
    `Setpoint a atualizar em: ${segundosRestantes}s`;
}

// Início do bloqueio ao tocar nos inputs
["spTemp", "spHum1", "spHum2", "spLuz"].forEach(id => {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener("focus", iniciarDelayEdicao);
    input.addEventListener("input", iniciarDelayEdicao);
  }
});

// Atualização automática a cada 2s (se permitido)
setInterval(() => {
  if (!bloquearAtualizacao) atualizar();
}, 2000);

// Pedido inicial
atualizar();
