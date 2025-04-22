function getUsoHoje() {
    const hoje = new Date().toISOString().slice(0, 10);
    const uso = JSON.parse(localStorage.getItem('usoTitulos') || '{}');
  
    if (uso.data !== hoje) {
      return 0;
    }
  
    return uso.usoHoje || 0;
  }
  
  function registrarUso() {
    const hoje = new Date().toISOString().slice(0, 10);
    const uso = JSON.parse(localStorage.getItem('usoTitulos') || '{}');
    const usoAtual = uso.data === hoje ? uso.usoHoje || 0 : 0;
  
    localStorage.setItem('usoTitulos', JSON.stringify({
      data: hoje,
      usoHoje: usoAtual + 1
    }));
  }
  