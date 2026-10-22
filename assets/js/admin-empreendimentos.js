import { supabase } from './supabase.js'
import { usuarioLogado, ehAdministrador, ligarBotaoSair, SITUACOES } from './sessao.js'

const lista = document.querySelector('.lista')
const abas = document.querySelector('.abas')
const painelRecusa = document.querySelector('.painel.formulario')
let filtro = 0

function escapar(texto) {
  const caixa = document.createElement('div')
  caixa.textContent = texto == null ? '' : texto
  return caixa.innerHTML
}

function acoesPara(situacao, id) {
  const botao = (texto, classe, nova, pedeMotivo) =>
    `<button class="botao ${classe} pequeno" data-id="${id}" data-nova="${nova}" data-motivo="${pedeMotivo ? 1 : 0}">${texto}</button>`

  if (situacao === 1) return botao('Aprovar', 'positivo', 2) + botao('Recusar', 'perigo', 5, true)
  if (situacao === 2) return botao('Suspender', 'vazado', 4, true) + botao('Excluir', 'perigo', 6)
  if (situacao === 3) return botao('Suspender', 'vazado', 4, true) + botao('Excluir', 'perigo', 6)
  if (situacao === 4) return botao('Reativar', 'positivo', 2) + botao('Excluir', 'perigo', 6)
  if (situacao === 5) return botao('Excluir', 'perigo', 6)
  return '<span class="apagado">Sem ações disponíveis</span>'
}

function cartao(emp) {
  const situacao = SITUACOES[emp.id_situacao]
  const endereco = emp.endereco && emp.endereco[0]
  const local = endereco ? `${endereco.bairro || endereco.cidade}, ${endereco.cidade}/${endereco.uf}` : 'Sem endereço'
  const documento = emp.cnpj || emp.cpf || 'sem documento'
  const data = new Date(emp.criado_em).toLocaleDateString('pt-BR')

  return `
    <article class="cartao-linha">
      <div class="informacao">
        <h3>${escapar(emp.nome)} <span class="selo ${situacao.classe}">${situacao.nome}</span></h3>
        <p>${escapar(emp.categoria_de_empreendimento?.nome || '')} · ${escapar(local)}</p>
        <p>${escapar(emp.email)} · ${escapar(emp.telefone1)} · ${escapar(documento)}</p>
        <p>cadastrado em ${data}</p>
        ${emp.motivo_situacao ? `<p class="motivo"><b>Motivo:</b> ${escapar(emp.motivo_situacao)}</p>` : ''}
      </div>
      <div class="botoes">${acoesPara(emp.id_situacao, emp.id)}</div>
    </article>`
}

async function carregar() {
  lista.innerHTML = '<p class="apagado">Carregando...</p>'

  let consulta = supabase
    .from('empreendimento')
    .select('*, categoria_de_empreendimento(nome), endereco(bairro, cidade, uf, seq)')
    .order('id')

  if (filtro) consulta = consulta.eq('id_situacao', filtro)

  const { data, error } = await consulta

  if (error) {
    lista.innerHTML = `<div class="aviso erro">Não consegui carregar: ${escapar(error.message)}</div>`
    return
  }

  if (!data.length) {
    lista.innerHTML = '<div class="vazio"><h3>Nenhum empreendimento nessa situação</h3></div>'
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
        if (!motivo.trim()) {
          alert('O motivo é obrigatório nessa ação.')
          return
        }
      }

      if (nova === 6 && !confirm('Excluir definitivamente este cadastro?')) return

      botao.disabled = true
      const alteracao = { id_situacao: nova }
      if (pedeMotivo) alteracao.motivo_situacao = motivo.trim()

      const { error } = await supabase
        .from('empreendimento')
        .update(alteracao)
        .eq('id', Number(botao.dataset.id))

      if (error) {
        alert('Não consegui alterar: ' + error.message)
        botao.disabled = false
        return
      }

      carregar()
    })
  }
}

async function contar() {
  const { data } = await supabase.from('empreendimento').select('id_situacao')
  if (!data) return

  const total = data.length
  const por = (s) => data.filter((e) => e.id_situacao === s).length

  abas.innerHTML = [
    [0, 'Todos', total],
    [1, 'Pendentes', por(1)],
    [2, 'Ativos', por(2)],
    [3, 'Pausados', por(3)],
    [4, 'Suspensos', por(4)],
    [5, 'Recusados', por(5)],
    [6, 'Excluídos', por(6)]
  ].map(([valor, nome, quantos]) =>
    `<a href="#" data-filtro="${valor}"${valor === filtro ? ' aria-current="page"' : ''}>${nome} (${quantos})</a>`
  ).join('')

  for (const aba of abas.querySelectorAll('[data-filtro]')) {
    aba.addEventListener('click', (evento) => {
      evento.preventDefault()
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
      '<div class="situacao"><h1 class="titulo-pagina">Acesso restrito</h1>'
      + '<p>Esta área é da administração da plataforma.</p>'
      + '<div class="acoes centralizado"><a class="botao" href="entrar.html">Entrar</a></div></div>'
    return
  }

  document.querySelector('.quem .apagado').textContent = usuario.nome
  if (painelRecusa) painelRecusa.remove()

  ligarBotaoSair()
  await contar()
  await carregar()
}

iniciar()