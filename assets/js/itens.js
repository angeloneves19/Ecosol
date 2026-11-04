import { supabase } from './supabase.js'
import { exigirEmpreendimento, ligarBotaoSair, SITUACOES } from './sessao.js'

const dados = await exigirEmpreendimento()
if (!dados) throw new Error('Sem sessão')

const { empreendimento } = dados
const situacao = SITUACOES[empreendimento.id_situacao]

document.querySelector('.quem b').textContent = empreendimento.nome
document.querySelector('.quem .apagado').textContent = dados.usuario.nome
const selo = document.querySelector('.quem .selo')
selo.textContent = situacao.nome
selo.className = 'selo ' + situacao.classe

ligarBotaoSair()

const lista = document.querySelector('.lista')

function escapar(texto) {
  const d = document.createElement('div')
  d.textContent = texto == null ? '' : texto
  return d.innerHTML
}

const situacaoItemMap = {
  1: { nome: 'Pendente', classe: 'sit-pendente' },
  2: { nome: 'Disponível', classe: 'sit-disponivel' },
  3: { nome: 'Indisponível', classe: 'sit-indisponivel' },
  4: { nome: 'Descontinuado', classe: 'sit-descontinuado' },
  5: { nome: 'Recusado', classe: 'sit-recusado' }
}

const unidadeMap = { na: 'N/A', un: 'un', kg: 'kg', litro: 'litro', m: 'm' }

async function carregar() {
  lista.innerHTML = '<p class="apagado">Carregando...</p>'

  const { data, error } = await supabase
    .from('item')
    .select('*, natureza_de_item(nome), situacao_item(nome)')
    .eq('id_empreendimento', empreendimento.id)
    .order('id')

  if (error) {
    lista.innerHTML = `<p class="aviso erro">Não consegui carregar: ${escapar(error.message)}</p>`
    return
  }

  if (!data.length) {
    lista.innerHTML = '<div class="vazio"><h3>Nenhum item ainda</h3><p>Clique em "Novo item" para começar.</p></div>'
    return
  }

  lista.innerHTML = data.map(item => {
    const sit = situacaoItemMap[item.id_situacao] || situacaoItemMap[1]
    const natureza = item.natureza_de_item?.nome || ''
    const preco = item.preco_atual_visivel
      ? `R$ ${Number(item.preco_atual).toFixed(2).replace('.', ',')}`
      : 'Preço sob consulta'
    const estoque = item.estoque_visivel ? `${item.estoque} ${unidadeMap[item.unidade] || ''}` : ''

    return `
      <article class="cartao-linha">
        <div class="informacao">
          <h3>${escapar(item.nome)} <span class="selo ${sit.classe}">${sit.nome}</span></h3>
          <p>${escapar(natureza)} · ${preco}${estoque ? ' · ' + escapar(estoque) + ' em estoque' : ''}</p>
          ${item.motivo_situacao ? `<p class="apagado">Motivo: ${escapar(item.motivo_situacao)}</p>` : ''}
        </div>
        <div class="botoes">
          <a class="botao vazado pequeno" href="item-form.html?id=${item.id}">Editar</a>
        </div>
      </article>`
  }).join('')
}

const link = document.querySelector('a[href="item-form.html"]')
if (link && empreendimento.id_situacao !== 2) {
  link.style.opacity = '0.4'
  link.style.pointerEvents = 'none'
  link.title = 'Disponível apenas para empreendimentos ativos'
}

carregar()