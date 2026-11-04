import { supabase } from './supabase.js'

const grade = document.querySelector('.grade')
const contador = document.querySelector('.res-head p')

function escapar(texto) {
  const d = document.createElement('div')
  d.textContent = texto == null ? '' : texto
  return d.innerHTML
}

const texturas = ['textura1', 'textura2', 'textura3', 'textura4', 'textura0']
const cores = ['#2E7D5B', '#8A3F7C', '#1F6F8B', '#B0771A', '#27337A']

function cartaoItem(item, indice) {
  const emp = item.empreendimento
  const local = emp ? (emp.endereco?.[0]?.cidade || 'Viamão') : 'Viamão'
  const preco = item.preco_atual_visivel
    ? `R$ ${Number(item.preco_atual).toFixed(2).replace('.', ',')}`
    : 'Preço sob consulta'
  const natureza = item.natureza_de_item?.nome || ''
  const fotos = item.foto_item || []
  const fotoUrl = fotos[0]?.url_imagem

  const zap = emp ? [emp.whatsapp1_visivel ? emp.whatsapp1 : null, emp.telefone1_visivel ? emp.telefone1 : null].find(Boolean) : null
  const zapNum = zap ? zap.replace(/\D/g, '') : null
  const texto = encodeURIComponent(`Olá! Vi "${item.nome}" na Trama Viamão.`)

  let contato = ''
  if (zapNum) contato += `<a class="botao zap pequeno" href="https://wa.me/55${zapNum}?text=${texto}" target="_blank" rel="noopener">WhatsApp</a>`
  if (emp?.email_visivel) contato += `<a class="botao vazado pequeno" href="mailto:${emp.email}">E-mail</a>`

  const imgHtml = fotoUrl
    ? `<img src="${escapar(fotoUrl)}" alt="${escapar(item.nome)}" style="width:100%;height:100%;object-fit:cover">`
    : `<div class="foto-vazia ${texturas[indice % 5]}" style="--c1:${cores[indice % 5]}" role="img" aria-label="Sem foto"></div>`

  return `
    <article class="cartao">
      <a class="cartao-link" href="pages/item.html?id=${item.id}">
        <div class="foto-capa" style="aspect-ratio:4/3;overflow:hidden;border-radius:8px 8px 0 0">${imgHtml}</div>
        <div class="corpo">
          <span class="etiqueta">${escapar(natureza)}</span>
          <h3>${escapar(item.nome)}</h3>
          <div class="preco-cartao">${preco}</div>
          <div class="origem">${escapar(emp?.nome || '')} · ${escapar(local)}</div>
        </div>
      </a>
      ${contato ? `<div class="cartao-contato">${contato}</div>` : ''}
    </article>`
}

async function carregar() {
  grade.innerHTML = '<p class="apagado">Carregando...</p>'

  const { data, error } = await supabase
    .from('item')
    .select(`
      id, nome, preco_atual, preco_atual_visivel, id_situacao,
      natureza_de_item(nome),
      foto_item(url_imagem, seq),
      empreendimento(
        id, nome, email, email_visivel,
        telefone1, telefone1_visivel,
        whatsapp1, whatsapp1_visivel,
        nome_fantasia, nome_fantasia_visivel,
        endereco(cidade, bairro, seq)
      )
    `)
    .in('id_situacao', [2, 3])
    .eq('empreendimento.id_situacao', 2)
    .order('nome')

  if (error) {
    grade.innerHTML = `<div class="aviso erro">Não consegui carregar: ${escapar(error.message)}</div>`
    return
  }

  const itens = (data || []).filter(i => i.empreendimento)

  if (contador) {
    contador.textContent = `${itens.length} ${itens.length === 1 ? 'item encontrado' : 'itens encontrados'}`
  }

  if (!itens.length) {
    grade.innerHTML = '<div class="vazio"><h3>Nenhum item disponível ainda</h3><p>Os itens aparecem aqui depois da aprovação da administração.</p></div>'
    return
  }

  grade.innerHTML = itens.map((item, i) => {
    if (item.foto_item) {
      item.foto_item.sort((a, b) => a.seq - b.seq)
    }
    return cartaoItem(item, i)
  }).join('')
}

carregar()