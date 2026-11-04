import { supabase } from './supabase.js'

const params = new URLSearchParams(location.search)
const id = Number(params.get('id'))

function escapar(texto) {
  const d = document.createElement('div')
  d.textContent = texto == null ? '' : texto
  return d.innerHTML
}

async function carregar() {
  if (!id) {
    document.querySelector('main').innerHTML =
      '<div class="conteiner vazio"><h2>Item não encontrado</h2><p><a href="../index.html">Voltar para a busca</a></p></div>'
    return
  }

  const { data: item, error } = await supabase
    .from('item')
    .select('*, natureza_de_item(nome), empreendimento(*, categoria_de_empreendimento(nome), endereco(*))')
    .eq('id', id)
    .maybeSingle()

  if (error || !item) {
    document.querySelector('main').innerHTML =
      '<div class="conteiner vazio"><h2>Item não encontrado</h2><p><a href="../index.html">Voltar para a busca</a></p></div>'
    return
  }

  const emp = item.empreendimento
  const endereco = emp.endereco?.find(e => e.visivel) || emp.endereco?.[0]

  document.title = `${item.nome} · Trama Viamão`

  const trilha = document.querySelector('.trilha')
  if (trilha) {
    trilha.innerHTML = `<a href="../index.html">Busca</a> / <a href="empreendimento.html?id=${emp.id}">${escapar(emp.nome)}</a> / ${escapar(item.nome)}`
  }

  const { data: tipos } = await supabase
    .from('item_tipo_de_item')
    .select('tipo_de_item(nome)')
    .eq('id_item', id)

  const nomesTipos = (tipos || []).map(t => t.tipo_de_item?.nome).filter(Boolean).join(', ')
  const natureza = item.natureza_de_item?.nome || ''
  const etiqueta = document.querySelector('.etiqueta')
  if (etiqueta) etiqueta.textContent = `${natureza}${nomesTipos ? ' · ' + nomesTipos : ''}`

  const h1 = document.querySelector('h1')
  if (h1) h1.textContent = item.nome

  const precoGrande = document.querySelector('.preco-grande')
  if (precoGrande) {
    precoGrande.textContent = item.preco_atual_visivel
      ? `R$ ${Number(item.preco_atual).toFixed(2).replace('.', ',')}`
      : 'Preço sob consulta'
  }

  const unidadeMap = { na: 'N/A', un: 'unidade', kg: 'kg', litro: 'litro', m: 'm' }
  const infoEstoque = document.querySelector('.preco-grande + .apagado')
  if (infoEstoque) {
    const partes = []
    if (item.estoque_visivel) partes.push(`${item.estoque} ${unidadeMap[item.unidade] || ''} em estoque`)
    partes.push(`vendido por ${unidadeMap[item.unidade] || 'unidade'}`)
    infoEstoque.textContent = partes.join(' · ')
  }

  const descricao = document.querySelector('.painel p')
  if (descricao) descricao.textContent = item.descricao || ''

  // Empreendimento
  const paineis = document.querySelectorAll('.painel')
  const painelEmp = paineis[1]
  if (painelEmp) {
    const categoria = emp.categoria_de_empreendimento?.nome || ''
    const local = endereco ? `${endereco.rua}, ${endereco.numero} – ${endereco.bairro || endereco.cidade}, ${endereco.cidade}/${endereco.uf}` : ''

    const zap = [emp.whatsapp1_visivel && emp.whatsapp1, emp.telefone1_visivel && emp.telefone1].find(Boolean)
    const zapNum = zap ? zap.replace(/\D/g, '') : null
    const texto = encodeURIComponent(`Olá! Vi "${item.nome}" na Trama Viamão.`)

    painelEmp.innerHTML = `
      <h3>Quem oferece</h3>
      <p><a href="empreendimento.html?id=${emp.id}"><b>${escapar(emp.nome)}</b></a>${categoria ? ' · ' + escapar(categoria) : ''}</p>
      ${local ? `<p class="apagado">${escapar(local)}</p>` : ''}
      <div class="acoes">
        ${zapNum ? `<a class="botao zap" href="https://wa.me/55${zapNum}?text=${texto}" target="_blank" rel="noopener">Chamar no WhatsApp</a>` : ''}
        ${emp.email_visivel ? `<a class="botao vazado" href="mailto:${emp.email}?subject=Interesse em: ${encodeURIComponent(item.nome)}">Enviar e-mail</a>` : ''}
        ${endereco?.latitude && endereco?.coordenadas_visivel ? `<a class="botao vazado" href="https://www.google.com/maps/search/?api=1&query=${endereco.latitude},${endereco.longitude}" target="_blank" rel="noopener">Ver no mapa</a>` : ''}
      </div>`
  }

  // Fotos
  const { data: fotos } = await supabase
    .from('foto_item')
    .select('url_imagem, seq')
    .eq('id_item', id)
    .order('seq')

  if (fotos && fotos.length) {
    const fotoPrincipal = document.querySelector('.detalhe > div > div:first-child')
    const galeria = document.querySelector('.galeria')

    if (fotoPrincipal) {
      fotoPrincipal.outerHTML = `<img src="${escapar(fotos[0].url_imagem)}" alt="${escapar(item.nome)}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px">`
    }

    if (galeria && fotos.length > 1) {
      galeria.innerHTML = fotos.slice(1).map((f, i) =>
        `<img src="${escapar(f.url_imagem)}" alt="Foto ${i + 2} de ${escapar(item.nome)}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:6px">`
      ).join('')
    }
  }
}

carregar()