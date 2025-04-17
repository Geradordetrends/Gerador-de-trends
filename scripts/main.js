const urlCSVBrasil = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIzpUcmDHc3WShOfdmYm8Q_kRArltuIED0bl60NWIS-kX6Ud_-PeCn4NgYuZ-DG0wQiqcOT0JwG4bN/pub?output=csv";
const urlCSVMundo = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSp0ri_74vNOA_LFpRtmCTFvCFWGumfBDs3pv9sYExADEeM-MxlnW5GXH1lOr7CooeCNP0ZU5QIHVgc/pub?output=csv";

let urlCSVAtual = urlCSVBrasil;  // Valor inicial é Brasil

// Função para atualizar os termos com base na região
function atualizarTermos() {
    const regiaoSelecionada = document.getElementById('regiao').value;
    if (regiaoSelecionada === 'brasil') {
        urlCSVAtual = urlCSVBrasil;
    } else {
        urlCSVAtual = urlCSVMundo;
    }
}

// Função para sortear um termo
async function sortearTermo() {
    try {
        const response = await fetch(urlCSVAtual);
        const csv = await response.text();

        const termos = csv
            .split('\n')        // separa por linha
            .slice(1)           // remove o cabeçalho
            .map(l => l.trim()) // limpa espaços

        const sorteado = termos[Math.floor(Math.random() * termos.length)];
        document.getElementById('resultado').innerText = `🔍 ${sorteado}`;
    } catch (error) {
        document.getElementById('resultado').innerText = 'Erro ao carregar os termos.';
        console.error(error);
    }
}

// Função para copiar o termo sorteado
function copiarTermo() {
    const texto = document.getElementById('resultado').innerText;
    if (texto) {
        navigator.clipboard.writeText(texto)
            .then(() => alert('Termo copiado com sucesso!'))
            .catch(err => alert('Erro ao copiar o termo.'));
    }
}

// funcção para exibir o sucesso do copiar
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
  