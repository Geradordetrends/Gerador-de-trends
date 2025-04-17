async function sortearTermo() {
    try {
      const response = await fetch('data/trends.json');
      const termos = await response.json();
  
      const termoAleatorio = termos[Math.floor(Math.random() * termos.length)];
      document.getElementById('resultado').innerText = `🔍 ${termoAleatorio}`;
    } catch (error) {
      document.getElementById('resultado').innerText = 'Erro ao carregar os termos.';
      console.error(error);
    }
  }
  