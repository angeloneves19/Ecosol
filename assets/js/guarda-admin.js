import { usuarioLogado, ehAdministrador, ligarBotaoSair } from './sessao.js'

const usuario = await usuarioLogado()

if (!usuario || !(await ehAdministrador(usuario.id))) {
  document.querySelector('main').innerHTML = `
    <div class="situacao">
      <h1 class="titulo-pagina">Acesso restrito</h1>
      <p>Esta área é exclusiva da administração da plataforma.</p>
      <div class="acoes centralizado">
        <a class="botao" href="entrar.html">Entrar como administrador</a>
      </div>
    </div>`
} else {
  const quem = document.querySelector('.quem .apagado')
  if (quem) quem.textContent = usuario.nome
  ligarBotaoSair()
}