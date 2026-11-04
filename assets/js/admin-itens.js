import { supabase } from './supabase.js'
import { usuarioLogado, ehAdministrador, ligarBotaoSair } from './sessao.js'

const lista = document.querySelector('.lista')
const abas = document.querySelector('.abas')
let filtro = 0

function escapar(texto) {
  const d = document.createElement('div')
  d.textContent = texto == null ? '' : texto
  return d.innerHTML
}

const situacaoMap = {
  1: { nome: 'Pendente', classe: 'sit-pendente' },
  2: { nome: 'Disponível', classe: 'sit-disponivel' },
  3: { nome: 'Indisponível', classe: 'sit-indisponivel' },
  4: { nome: 'Descontinuado', classe: 'sit-descontinuado' },
  5: { nome: 'Recusado', classe: 'sit-recusado' }
}

const unidadeMap = { na: 'N/A', un: 'un', kg: 'kg', litro: 'litro', m: 'm' }

function acoesPara(situacao, id) {
  const btn = (texto, classe, nova, pedeMotivo) =>
    `<button class="botao ${classe} pequeno" data-id="${id}" data-nova="${nova}" data-motivo="${pedeMotivo ? 1 : 0}">${texto}</button>`

  if (situacao === 1) return btn('Aprovar', 'positivo', 2) + btn('Recusar', 'perigo', 5, true)
  if (situacao === 2) return btn('Tornar indisponível', 'vazado', 3) + btn('Recusar', 'perigo', 5, true)
  if (situacao === 3) return btn('Tornar disponível', 'positivo', 2) + btn('Recusar', 'perigo', 5, true)
  if (situacao === 5) return btn('Reativar', 'positivo', 2)
  return '<span class="apagado">Sem ações</span>'
}

function cartao(item) {
  const sit = situacaoMap[item.id_situacao] || situacaoMap[1]
  const natureza = item.natureza_de_item?.nome || ''
  const preco = item.preco_atual_visivel
    ? `R$ ${Number(item.preco_atual).toFixed(2).replace('.', ',')}`
    : 'Preço sob consulta'
  const estoque = item.estoque_visivel ? `${item.estoque} ${unidadeMap[item.unidade] || ''}` : ''
  const emp = item.empreendimento

  return `
    <article class="cartao-linha">
      <div class="informacao">
        <h3>${escapar(item.nome)} <span class="selo ${sit.classe}">${sit.nome}</span></h3>
        <p>${escapar(natureza)} · ${preco}${estoque ? ' · ' + escapar(estoque) : ''}</p>
        <p>Por <a href="admin-empreendimentos.html">${escapar(emp?.nome || '')}</a></p>
        ${item.motivo_situacao ? `<p class="apagado">Motivo: ${escapar(item.motivo_situacao)}</p>` : ''}
      </div>
      <div class="botoes">${acoesPara(item.id_situacao, item.id)}</div>
    </article>`
}

async function carregar() {
  lista.innerHTML = '<p class="apagado">Carregando...</p>'

  let consulta = supabase
    .from('item')
    .select('*, natureza_de_item(nome), empreendimento(nome)')
    .order('id')

  if (filtro) consulta = consulta.eq('id_situacao', filtro)

  const { data, error } = await consulta

  if (error) {
    lista.innerHTML = `<p class="aviso erro">Não consegui carregar: ${escapar(error.message)}</p>`
    return
  }

  if (!data.length) {
    lista.innerHTML = '<div class="vazio"><h3>Nenhum item nessa situação</h3></div>'
    return
  }

  lista.innerHTML = data.map(cartao).join('')
  ligarAcoes()
}

function ligarAcoes() {
  for (const botao of lista.querySelectorAll('[data-nova]')) {
    botao.addEventListener('click', async () => {
      const nova = Number(botao.dataset.nova)
      const pedeMotivo = botao.dataset.motivo === '1'
      let motivo = null

      if (pedeMotivo) {
        motivo = prompt('Motivo (aparece para o empreendimento):')
        if (motivo === null) return
        if (!motivo.trim()) { alert('O motivo é obrigatório.'); return }
      }

      botao.disabled = true
      const alteracao = { id_situacao: nova }
      if (pedeMotivo) alteracao.motivo_situacao = motivo.trim()

      const { error } = await supabase
        .from('item')
        .update(alteracao)
        .eq('id', Number(botao.dataset.id))

      if (error) { alert('Não consegui alterar: ' + error.message); botao.disabled = false; return }
      carregar()
    })
  }
}

async function contar() {
  const { data } = await supabase.from('item').select('id_situacao')
  if (!data) return

  const total = data.length
  const por = (s) => data.filter(i => i.id_situacao === s).length

  abas.innerHTML = [
    [0, 'Todos', total],
    [1, 'Pendentes', por(1)],
    [2, 'Disponíveis', por(2)],
    [3, 'Indisponíveis', por(3)],
    [4, 'Descontinuados', por(4)],
    [5, 'Recusados', por(5)]
  ].map(([valor, nome, qtd]) =>
    `<a href="#" data-filtro="${valor}"${valor === filtro ? ' aria-current="page"' : ''}>${nome} (${qtd})</a>`
  ).join('')

  for (const aba of abas.querySelectorAll('[data-filtro]')) {
    aba.addEventListener('click', (e) => {
      e.preventDefault()
      filtro = Number(aba.dataset.filtro)
      contar()
      carregar()
    })
  }
}

async function iniciar() {
  const usuario = await usuarioLogado()
  if (!usuario || !(await ehAdministrador(usuario.id))) {
    document.querySelector('main').innerHTML =
      '<div class="situacao"><h1 class="titulo-pagina">Acesso restrito</h1><p>Esta área é exclusiva da administração.</p></div>'
    return
  }
  document.querySelector('.quem .apagado').textContent = usuario.nome
  ligarBotaoSair()
  await contar()
  await carregar()
}

iniciar()