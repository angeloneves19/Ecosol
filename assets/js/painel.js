import { supabase } from './supabase.js'
import { exigirEmpreendimento, ligarBotaoSair, SITUACOES } from './sessao.js'

const dados = await exigirEmpreendimento()
if (dados) {
  const { usuario, empreendimento } = dados
  const situacao = SITUACOES[empreendimento.id_situacao]

  document.querySelector('.quem b').textContent = empreendimento.nome
  document.querySelector('.quem .apagado').textContent = usuario.nome

  const selo = document.querySelector('.quem .selo')
  selo.textContent = situacao.nome
  selo.className = 'selo ' + situacao.classe

  document.querySelector('.cabecalho h1').textContent = 'Olá, ' + usuario.nome.split(' ')[0]

  const painelSituacao = document.querySelectorAll('.painel')[1]
  const texto = painelSituacao.querySelector('p')
  const acoes = painelSituacao.querySelector('.acoes')

  if (empreendimento.id_situacao === 1) {
    texto.innerHTML = 'Seu cadastro está <b>pendente</b>. A administração ainda está analisando. Enquanto isso você pode completar o perfil.'
    acoes.innerHTML = '<a class="botao vazado" href="perfil.html">Completar perfil</a>'
  } else if (empreendimento.id_situacao === 2) {
    texto.innerHTML = 'Seu cadastro está <b>ativo</b>. Se precisar parar de receber contatos por um período, pause o cadastro.'
    acoes.innerHTML = '<button class="botao vazado" type="button" data-situacao="3">Pausar cadastro</button>'
      + '<button class="botao perigo" type="button" data-situacao="6">Excluir cadastro</button>'
  } else if (empreendimento.id_situacao === 3) {
    texto.innerHTML = 'Seu cadastro está <b>pausado</b> por decisão sua. Seus itens não aparecem na busca.'
    acoes.innerHTML = '<button class="botao" type="button" data-situacao="2">Reativar cadastro</button>'
  } else {
    texto.innerHTML = `Seu cadastro está <b>${situacao.nome.toLowerCase()}</b>.`
    if (empreendimento.motivo_situacao) {
      texto.innerHTML += `<br><span class="apagado">Motivo: ${empreendimento.motivo_situacao}</span>`
    }
    acoes.innerHTML = '<a class="botao vazado" href="perfil.html">Ver perfil</a>'
  }

  for (const botao of acoes.querySelectorAll('[data-situacao]')) {
    botao.addEventListener('click', async () => {
      const nova = Number(botao.dataset.situacao)
      if (nova === 6 && !confirm('Excluir o cadastro? Os itens saem da busca e o grupo precisará se cadastrar de novo para voltar.')) return

      botao.disabled = true
      const { error } = await supabase
        .from('empreendimento')
        .update({ id_situacao: nova })
        .eq('id', empreendimento.id)

      if (error) {
        alert('Não consegui alterar: ' + error.message)
        botao.disabled = false
        return
      }

      window.location.href = SITUACOES[nova].pagina
    })
  }

  const link = document.querySelector('a[href="empreendimento.html"]')
  if (link) link.href = `empreendimento.html?id=${empreendimento.id}`

  ligarBotaoSair()
}