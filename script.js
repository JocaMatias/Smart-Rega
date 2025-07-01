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

    document.getElementById('ctrl1').style.display = d.modo === 'Manual' ? 'block' : 'none';
    document.getElementById('ctrl2').style.display = d.modo === 'Manual' ? 'block' : 'none';

    atualizarGauge("circleTemp", "valorTemp", d.temp, "°C", 40);
    atualizarGauge("circleH1", "valorH1", d.h1, "%");
    atualizarGauge("circleH2", "valorH2", d.h2, "%");
    atualizarGauge("circleLuz", "valorLuz", d.luz, "%");

    document.getElementById('spTemp').value = d.setTempMin;
    document.getElementById('spHum1').value = d.setHumMin1;
    document.getElementById('spHum2').value = d.setHumMin2;
    document.getElementById('spLuz').value = d.setLuzMin;
  }
});

function enviarComando(cmd) {
  client.publish('irhub/comando', cmd);
}

function modoAuto() { enviarComando('autoOn'); }
function modoManual() { enviarComando('autoOff'); }
function ligar1() { enviarComando('ligar1'); }
function desligar1() { enviarComando('desligar1'); }
function ligar2() { enviarComando('ligar2'); }
function desligar2() { enviarComando('desligar2'); }

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

function atualizar() {
  client.publish('irhub/comando', 'getEstado'); // ESP32 deve responder com o estado em 'irhub/estado'
}

function atualizarGauge(circleId, textId, valor, unidade = "%", max = 100) {
  const dash = Math.round((valor / max) * 251);
  document.getElementById(circleId).setAttribute("stroke-dasharray", `${dash} ${251 - dash}`);
  document.getElementById(textId).textContent = valor + unidade;
}

// Bloqueio de atualização durante edição dos setpoints
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

// Aplica o atraso aos campos de input
["spTemp", "spHum1", "spHum2", "spLuz"].forEach(id => {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener("input", iniciarDelayEdicao);
  }
});

// Atualização automática (só se não estiver a editar)
setInterval(() => {
  if (!bloquearAtualizacao) atualizar();
}, 2000);

atualizar();

//RELATORIO
