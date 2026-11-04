import { supabase } from './supabase.js'
import { exigirEmpreendimento, ligarBotaoSair, SITUACOES } from './sessao.js'

const BUCKET = 'fotos-item'
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp']
const TAMANHO_MAX = 5 * 1024 * 1024

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

const form = document.querySelector('form')
const miniaturas = form.querySelector('.miniaturas')
const inputFotos = form.querySelector('#fotos-item')
const params = new URLSearchParams(location.search)
const idItem = params.get('id') ? Number(params.get('id')) : null
let fotosAtuais = []

function escapar(texto) {
  const d = document.createElement('div')
  d.textContent = texto == null ? '' : texto
  return d.innerHTML
}

async function carregarTipos() {
  const { data } = await supabase
    .from('tipo_de_item')
    .select('id, id_natureza, nome')
    .order('nome')

  if (!data) return

  const listaProduto = form.querySelector('[name="tiposProduto"]')?.closest('fieldset')
  const listaServico = form.querySelector('[name="tiposServico"]')?.closest('fieldset')

  if (!listaProduto || !listaServico) return

  const renderTipos = (container, natureza) => {
    const lista = container.querySelector('.chips') || container
    const tipos = data.filter(t => t.id_natureza === natureza)
    tipos.forEach(tipo => {
      if (container.querySelector(`[value="${tipo.id}"]`)) return
      const label = document.createElement('label')
      label.className = 'chip'
      label.innerHTML = `<input type="checkbox" name="${natureza === 1 ? 'tiposProduto' : 'tiposServico'}" value="${tipo.id}"><span>${escapar(tipo.nome)}</span>`
      lista.append(label)
    })
  }

  renderTipos(listaProduto, 1)
  renderTipos(listaServico, 2)
}

function renderizarMiniaturas() {
  miniaturas.innerHTML = ''

  if (!fotosAtuais.length) {
    miniaturas.innerHTML = '<li class="apagado" style="list-style:none;padding:8px 0">Nenhuma foto ainda.</li>'
    return
  }

  fotosAtuais.forEach((foto, posicao) => {
    const li = document.createElement('li')
    li.className = 'miniatura'
    li.dataset.id = foto.id || ''
    li.dataset.url = foto.url || ''
    li.dataset.local = foto.local ? '1' : ''

    const img = foto.url
      ? `<img src="${escapar(foto.url)}" alt="Foto ${posicao + 1}" style="width:100%;height:100%;object-fit:cover;border-radius:6px">`
      : `<div class="foto-vazia textura1" style="--c1:#2E7D5B" role="img" aria-label="Foto ${posicao + 1}"></div>`

    li.innerHTML = `
      <div class="foto-preview-wrap" style="width:100%;aspect-ratio:4/3;border-radius:6px;overflow:hidden">${img}</div>
      <div class="rodape-miniatura">
        ${posicao === 0 ? '<span class="selo sit-principal">Capa</span>' : `<button class="botao vazado pequeno" type="button" data-acao="capa">Usar como capa</button>`}
        <button class="botao perigo pequeno" type="button" data-acao="remover">Remover</button>
      </div>`

    li.querySelector('[data-acao="remover"]').addEventListener('click', async () => {
      if (!confirm('Remover esta foto?')) return
      if (foto.id && !foto.local) {
        const url = new URL(foto.url)
        const partes = url.pathname.split(`/${BUCKET}/`)
        const caminho = partes[1] || ''
        await supabase.storage.from(BUCKET).remove([caminho])
        await supabase.from('foto_item').delete().eq('id', foto.id)
        await renumerarFotos()
      }
      fotosAtuais = fotosAtuais.filter((_, i) => i !== posicao)
      renderizarMiniaturas()
    })

    const botaoCapa = li.querySelector('[data-acao="capa"]')
    if (botaoCapa) {
      botaoCapa.addEventListener('click', () => {
        const removida = fotosAtuais.splice(posicao, 1)[0]
        fotosAtuais.unshift(removida)
        renderizarMiniaturas()
      })
    }

    miniaturas.append(li)
  })
}

async function renumerarFotos() {
  if (!idItem) return
  const { data } = await supabase
    .from('foto_item')
    .select('id')
    .eq('id_item', idItem)
    .order('seq')

  for (let i = 0; i < (data || []).length; i++) {
    await supabase.from('foto_item').update({ seq: i + 1 }).eq('id', data[i].id)
  }
}

async function carregarItem() {
  if (!idItem) return

  const { data: item } = await supabase
    .from('item')
    .select('*')
    .eq('id', idItem)
    .maybeSingle()

  if (!item) return

  form.querySelector('[name="nome"]').value = item.nome || ''
  form.querySelector('[name="descricao"]').value = item.descricao || ''
  form.querySelector('[name="preco"]').value = item.preco_atual || ''
  form.querySelector('[name="precoVisivel"]').checked = item.preco_atual_visivel
  form.querySelector('[name="estoque"]').value = item.estoque || ''
  form.querySelector('[name="estoqueVisivel"]').checked = item.estoque_visivel

  const unidadeMap = { na: 'Não se aplica', un: 'Unidade', kg: 'Quilo', litro: 'Litro', m: 'Metro' }
  const selectUnidade = form.querySelector('[name="unidade"]')
  const unidadeTexto = unidadeMap[item.unidade] || 'Unidade'
  for (const opt of selectUnidade.options) {
    if (opt.text === unidadeTexto) { opt.selected = true; break }
  }

  const situacaoMap = { 2: 'Disponível', 3: 'Indisponível', 4: 'Descontinuado' }
  const selectSit = form.querySelector('[name="situacao"]')
  const sitTexto = situacaoMap[item.id_situacao] || 'Disponível'
  for (const opt of selectSit.options) {
    if (opt.text === sitTexto) { opt.selected = true; break }
  }

  const naturezaRadio = form.querySelector(`[name="natureza"][value="${item.id_natureza === 1 ? 'produto' : 'servico'}"]`)
  if (naturezaRadio) naturezaRadio.checked = true

  const { data: vinculos } = await supabase
    .from('item_tipo_de_item')
    .select('id_tipo')
    .eq('id_item', idItem)

  for (const v of (vinculos || [])) {
    const cb = form.querySelector(`[value="${v.id_tipo}"]`)
    if (cb) cb.checked = true
  }

  const { data: fotos } = await supabase
    .from('foto_item')
    .select('*')
    .eq('id_item', idItem)
    .order('seq')

  fotosAtuais = (fotos || []).map(f => ({ id: f.id, url: f.url_imagem, local: false }))
  renderizarMiniaturas()
}

inputFotos?.addEventListener('change', () => {
  const arquivos = [...inputFotos.files]
  for (const arquivo of arquivos) {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      alert(`${arquivo.name}: formato inválido. Use JPEG, PNG ou WebP.`)
      continue
    }
    if (arquivo.size > TAMANHO_MAX) {
      alert(`${arquivo.name}: máximo 5 MB.`)
      continue
    }
    const url = URL.createObjectURL(arquivo)
    fotosAtuais.push({ id: null, url, local: true, arquivo })
  }
  inputFotos.value = ''
  renderizarMiniaturas()
})

form.addEventListener('submit', async (evento) => {
  evento.preventDefault()

  const botao = form.querySelector('button[type="submit"]')
  botao.disabled = true
  botao.textContent = 'Enviando...'

  const aviso = document.querySelector('.aviso-item') || (() => {
    const p = document.createElement('p')
    p.className = 'aviso-item aviso'
    form.prepend(p)
    return p
  })()
  aviso.hidden = true

  try {
    const nome = form.querySelector('[name="nome"]').value.trim()
    const descricao = form.querySelector('[name="descricao"]').value.trim()
    const preco = Number(form.querySelector('[name="preco"]').value)
    const precoVisivel = form.querySelector('[name="precoVisivel"]').checked
    const estoque = Number(form.querySelector('[name="estoque"]').value) || 0
    const estoqueVisivel = form.querySelector('[name="estoqueVisivel"]').checked

    const unidadeOpcoes = { 'Não se aplica': 'na', 'Unidade': 'un', 'Quilo': 'kg', 'Litro': 'litro', 'Metro': 'm' }
    const unidadeTexto = form.querySelector('[name="unidade"]').value
    const unidade = unidadeOpcoes[unidadeTexto] || 'un'

    const situacaoMap = { 'Disponível': 2, 'Indisponível': 3, 'Descontinuado': 4 }
    const situacaoTexto = form.querySelector('[name="situacao"]').value
    const idSituacao = idItem ? (situacaoMap[situacaoTexto] || 2) : 1

    const naturezaRadio = form.querySelector('[name="natureza"]:checked')
    const idNatureza = naturezaRadio?.value === 'servico' ? 2 : 1

    let itemId = idItem

    if (!itemId) {
      const { data: novoItem, error } = await supabase
        .from('item')
        .insert({
          id_empreendimento: empreendimento.id,
          id_natureza: idNatureza,
          id_situacao: idSituacao,
          nome, descricao, preco_atual: preco, preco_atual_visivel: precoVisivel,
          estoque, estoque_visivel: estoqueVisivel, unidade
        })
        .select('id')
        .single()

      if (error) throw error
      itemId = novoItem.id
    } else {
      const { error } = await supabase
        .from('item')
        .update({
          id_natureza: idNatureza,
          id_situacao: 1,
          nome, descricao, preco_atual: preco, preco_atual_visivel: precoVisivel,
          estoque, estoque_visivel: estoqueVisivel, unidade
        })
        .eq('id', itemId)

      if (error) throw error
      await supabase.from('item_tipo_de_item').delete().eq('id_item', itemId)
    }

    const checkboxesMarcados = [...form.querySelectorAll('[name="tiposProduto"]:checked, [name="tiposServico"]:checked')]
    for (const cb of checkboxesMarcados) {
      const idTipo = Number(cb.value)
      await supabase.from('item_tipo_de_item').insert({
        id_item: itemId, id_tipo: idTipo, id_natureza: idNatureza
      })
    }

    let seq = fotosAtuais.filter(f => !f.local).length + 1
    for (const foto of fotosAtuais.filter(f => f.local)) {
      const ext = foto.arquivo.name.split('.').pop().toLowerCase()
      const caminho = `${empreendimento.id}/${itemId}/${Date.now()}.${ext}`
      const { error: erroUp } = await supabase.storage.from(BUCKET).upload(caminho, foto.arquivo)
      if (erroUp) continue

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(caminho)
      await supabase.from('foto_item').insert({
        id_item: itemId, seq, url_imagem: urlData.publicUrl, descricao: null
      })
      seq++
    }

    await renumerarFotos()
    window.location.href = 'itens.html'
  } catch (erro) {
    aviso.textContent = 'Não consegui salvar: ' + erro.message
    aviso.className = 'aviso-item aviso erro'
    aviso.hidden = false
    botao.disabled = false
    botao.textContent = 'Enviar para aprovação'
  }
})

await carregarTipos()
await carregarItem()
renderizarMiniaturas()