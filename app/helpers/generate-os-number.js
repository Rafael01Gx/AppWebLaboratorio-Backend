function gerarNumeroOrdemDeServico() {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const dia = String(now.getDate()).padStart(2, "0");
    const horas = String(now.getHours()).padStart(2, "0");
    const minutos = String(now.getMinutes()).padStart(2, "0");
    const segundos = String(now.getSeconds()).padStart(2, "0");
  
    const numeroOrdem = `LBF${ano}${mes}${dia}${horas}${minutos}${segundos}`;
  
    return numeroOrdem;
  }
  
  module.exports = gerarNumeroOrdemDeServico;