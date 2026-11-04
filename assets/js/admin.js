import { supabase } from './supabase.js'
import { usuarioLogado, ehAdministrador, ligarBotaoSair } from './sessao.js'

function escapar(texto) {
  const d = document.createElement('div')
  d.textContent = texto == null ? '' : texto
  return d.innerHTML
}

async function iniciar() {
  const usuario = await usuarioLogado()
  if (!usuario || !(await ehAdministrador(usuario.id))) {
    document.querySelector('main').innerHTML =
      '<div class="situacao"><h1 class="titulo-pagina">Acesso restrito</h1>' +
      '<p>Esta área é exclusiva da administração.</p>' +
      '<div class="acoes centralizado"><a class="botao" href="entrar.html">Entrar</a></div></div>'
    return
  }

  document.querySelector('.quem b').textContent = 'Administração'
  document.querySelector('.quem .apagado').textContent = usuario.nome
  ligarBotaoSair()

  await carregarStats()
  await carregarFila()
}

async function carregarStats() {
  const numeros = document.querySelector('.numeros')
  if (!numeros) return

  const [empData, itemData] = await Promise.all([
    supabase.from('empreendimento').select('id_situacao'),
    supabase.from('item').select('id_situacao')
  ])

  const emps = empData.data || []
  const itens = itemData.data || []

  const empPendentes = emps.filter(e => e.id_situacao === 1).length
  const empAtivos = emps.filter(e => e.id_situacao === 2).length
  const itensPendentes = itens.filter(i => i.id_situacao === 1).length
  const itensNaBusca = itens.filter(i => [2, 3].includes(i.id_situacao)).length

  numeros.innerHTML = `
    <div class="numero${empPendentes > 0 ? ' e-atencao' : ''}">
      <b>${empPendentes}</b><span>empreendimentos pendentes</span>
    </div>
    <div class="numero${itensPendentes > 0 ? ' e-atencao' : ''}">
      <b>${itensPendentes}</b><span>itens pendentes</span>
    </div>
    <div class="numero e-positivo">
      <b>${empAtivos}</b><span>empreendimentos ativos</span>
    </div>
    <div class="numero">
      <b>${itensNaBusca}</b><span>itens na busca</span>
    </div>`
}

async function carregarFila() {
  const lista = document.querySelector('.lista')
  if (!lista) return

  lista.innerHTML = '<p class="apagado">Carregando...</p>'

  const [empResp, itemResp] = await Promise.all([
    supabase
      .from('empreendimento')
      .select('id, nome, id_situacao, categoria_de_empreendimento(nome), endereco(cidade, uf, seq)')
      .eq('id_situacao', 1)
      .order('criado_em'),
    supabase
      .from('item')
      .select('id, nome, id_situacao, preco_atual, natureza_de_item(nome), empreendimento(nome)')
      .eq('id_situacao', 1)
      .order('criado_em')
  ])

  const emps = empResp.data || []
  const itens = itemResp.data || []

  if (!emps.length && !itens.length) {
    lista.innerHTML = '<div class="vazio"><h3>Fila vazia</h3><p>Nenhum cadastro aguardando aprovação.</p></div>'
    return
  }

  const htmlEmps = emps.map(emp => {
    const categoria = emp.categoria_de_empreendimento?.nome || ''
    const endereco = emp.endereco?.[0]
    const local = endereco ? `${endereco.cidade}/${endereco.uf}` : ''
    return `
      <article class="cartao-linha">
        <div class="informacao">
          <h3>${escapar(emp.nome)} <span class="selo sit-pendente">Pendente</span></h3>
          <p>${escapar(categoria)}${local ? ' · ' + escapar(local) : ''}</p>
        </div>
        <div class="botoes">
          <button class="botao positivo pequeno" data-tipo="emp" data-id="${emp.id}" data-nova="2">Aprovar</button>
          <button class="botao perigo pequeno" data-tipo="emp" data-id="${emp.id}" data-nova="5" data-motivo="1">Recusar</button>
        </div>
      </article>`
  })

  const htmlItens = itens.map(item => {
    const natureza = item.natureza_de_item?.nome || ''
    const preco = `R$ ${Number(item.preco_atual).toFixed(2).replace('.', ',')}`
    const empNome = item.empreendimento?.nome || ''
    return `
      <article class="cartao-linha">
        <div class="informacao">
          <h3>${escapar(item.nome)} <span class="selo sit-pendente">Pendente</span></h3>
          <p>${escapar(natureza)} · ${preco}</p>
          <p>Por <b>${escapar(empNome)}</b></p>
        </div>
        <div class="botoes">
          <button class="botao positivo pequeno" data-tipo="item" data-id="${item.id}" data-nova="2">Aprovar</button>
          <button class="botao perigo pequeno" data-tipo="item" data-id="${item.id}" data-nova="5" data-motivo="1">Recusar</button>
        </div>
      </article>`
  })

  lista.innerHTML = [...htmlEmps, ...htmlItens].join('')

  for (const botao of lista.querySelectorAll('[data-nova]')) {
    botao.addEventListener('click', async () => {
      const { tipo, id, nova, motivo } = botao.dataset
      let motivoTexto = null

      if (motivo === '1') {
        motivoTexto = prompt('Motivo da recusa:')
        if (motivoTexto === null) return
        if (!motivoTexto.trim()) { alert('O motivo é obrigatório.'); return }
      }

      botao.disabled = true
      const tabela = tipo === 'emp' ? 'empreendimento' : 'item'
      const alteracao = { id_situacao: Number(nova) }
      if (motivoTexto) alteracao.motivo_situacao = motivoTexto.trim()

      const { error } = await supabase
        .from(tabela)
        .update(alteracao)
        .eq('id', Number(id))

      if (error) { alert('Erro: ' + error.message); botao.disabled = false; return }

      await carregarStats()
      await carregarFila()
    })
  }
}

iniciar()