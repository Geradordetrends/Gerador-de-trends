const urlCSVBrasil = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRl-mFrT28Kzq5TAWm89A6OqVtKOZb2FWi5zd4lpu6Xvgin7VI-1R0LQugtkDxertXxZITNRelam-O/pub?output=csv";
const urlCSVMundo = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIDu9G79jdYgthuurSgm4YzHXkF0ydpWnNfXwDLdrNd_tC3Zdxf3HNWPhpN4L0e33p-SLXlkf4gJhY/pub?output=csv";

let urlCSVAtual = urlCSVBrasil;  // Valor inicial é Brasil

// Função para atualizar os termos com base na região
function atualizarTermos() {
  const regiaoSelecionada = document.getElementById('regiao').value;
  urlCSVAtual = (regiaoSelecionada === 'brasil') ? urlCSVBrasil : urlCSVMundo;
}

// Função para sortear um termo
async function sortearTermo() {
  try {
    const response = await fetch(urlCSVAtual);
    const csv = await response.text();

    const termos = csv
      .split('\n')
      .slice(1)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const sorteado = termos[Math.floor(Math.random() * termos.length)];
    document.getElementById('resultado').innerText = `🔍 ${sorteado}`;
  } catch (error) {
    document.getElementById('resultado').innerText = 'Erro ao carregar os termos.';
    console.error(error);
  }
}

// Função para copiar o termo sorteado
function copiarTermo() {
  const termo = document.getElementById("resultado").textContent;
  if (!termo.trim()) return;

  navigator.clipboard.writeText(termo).then(() => {
    const btn = document.getElementById('copiarTermo');
    if (btn) {
      btn.textContent = 'Termo copiado!';
      btn.classList.remove('secondary');
      btn.classList.add('success');

      setTimeout(() => {
        btn.textContent = 'Copiar termo';
        btn.classList.remove('success');
        btn.classList.add('secondary');
      }, 3000);
    }
  }).catch(() => {
    alert('Erro ao copiar o termo.');
  });
}

// Função para copiar o link da página
function copiarLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('compartilhar');
    btn.textContent = 'Link copiado!';
    btn.classList.remove('secondary');
    btn.classList.add('success');

    setTimeout(() => {
      btn.textContent = 'Compartilhar';
      btn.classList.remove('success');
      btn.classList.add('secondary');
    }, 3000);
  }).catch(() => {
    alert('Erro ao copiar link. Tente manualmente.');
  });
}

// Função para exibir/esconder menu de compartilhamento
function toggleMenu() {
  const menu = document.getElementById('shareMenu');
  if (menu) {
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  }
}

// Fecha o menu ao clicar fora
document.addEventListener('click', function (e) {
  const menu = document.getElementById('shareMenu');
  const botao = document.getElementById('botaoShare');

  if (menu && botao && !menu.contains(e.target) && !botao.contains(e.target)) {
    menu.style.display = 'none';
  }
});

// GA custom events
function trackEvent(name) {
  if (window.gtag) {
    gtag('event', name, {
      event_category: 'interação',
      event_label: name,
      value: 1
    });
  }
}

// Eventos de clique
document.querySelector('.primary').addEventListener('click', () => {
  trackEvent('gerar_tendencia');
});

document.getElementById('copiarTermo').addEventListener('click', () => {
  trackEvent('copiar_termo');
  copiarTermo(); // Chama a função real de copiar
});

// Copiar link da ferramenta

function copiarLinkFerramenta() {
  const input = document.getElementById("toolLink");
  if (!input) return;

  navigator.clipboard.writeText(input.value).then(() => {
    const btn = document.getElementById('copiarLink');
    if (btn) {
      btn.textContent = 'Link copiado!';
      btn.classList.remove('secondary');
      btn.classList.add('success');

      setTimeout(() => {
        btn.textContent = 'Copiar';
        btn.classList.remove('success');
        btn.classList.add('secondary');
      }, 3000);
    }
  }).catch(() => {
    alert('Erro ao copiar o link.');
  });
}

