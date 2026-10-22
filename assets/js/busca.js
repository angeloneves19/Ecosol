import { supabase } from './supabase.js'

const grade = document.querySelector('.grade')
const contador = document.querySelector('.res-head p')
const tituloSecao = document.querySelector('.res-head')

function escapar(texto) {
  const caixa = document.createElement('div')
  caixa.textContent = texto == null ? '' : texto
  return caixa.innerHTML
}

const texturas = ['textura1', 'textura2', 'textura3', 'textura4', 'textura0']
const cores = ['#2E7D5B', '#8A3F7C', '#1F6F8B', '#B0771A', '#27337A']

function cartao(emp, indice) {
  const endereco = emp.endereco && emp.endereco[0]
  const local = endereco ? `${endereco.bairro || endereco.cidade}, ${endereco.cidade}` : 'Viamão'
  const zap = [emp.whatsapp1_visivel ? emp.whatsapp1 : null, emp.telefone1_visivel ? emp.telefone1 : null]
    .filter(Boolean)[0]

  let contato = ''
  if (zap) contato += `<a class="botao zap pequeno" href="https://wa.me/55${zap.replace(/\D/g, '')}" target="_blank" rel="noopener">WhatsApp</a>`
  if (emp.email_visivel) contato += `<a class="botao vazado pequeno" href="mailto:${emp.email}">E-mail</a>`

  return `
    <article class="cartao">
      <a class="cartao-link" href="pages/empreendimento.html?id=${emp.id}">
        <div class="foto-vazia ${texturas[indice % 5]}" style="--c1:${cores[indice % 5]}" role="img" aria-label="Espaço para foto"></div>
        <div class="corpo">
          <span class="etiqueta">${escapar(emp.categoria_de_empreendimento?.nome || 'Empreendimento')}</span>
          <h3>${escapar(emp.nome_fantasia_visivel && emp.nome_fantasia ? emp.nome_fantasia : emp.nome)}</h3>
          <div class="origem">${escapar(local)}</div>
        </div>
      </a>
      ${contato ? `<div class="cartao-contato">${contato}</div>` : ''}
    </article>`
}

async function carregar() {
  grade.innerHTML = '<p class="apagado">Carregando...</p>'

  const { data, error } = await supabase
    .from('empreendimento')
    .select('*, categoria_de_empreendimento(nome), endereco(bairro, cidade, uf, seq)')
    .eq('id_situacao', 2)
    .order('nome')

  if (error) {
    grade.innerHTML = `<div class="aviso erro">Não consegui carregar: ${escapar(error.message)}</div>`
    return
  }

  contador.textContent = `${data.length} ${data.length === 1 ? 'empreendimento encontrado' : 'empreendimentos encontrados'}`

  if (!data.length) {
    grade.innerHTML = '<div class="vazio"><h3>Nenhum empreendimento ativo ainda</h3>'
      + '<p>Os cadastros aparecem aqui depois da aprovação da administração.</p></div>'
    return
  }

  grade.innerHTML = data.map(cartao).join('')
}

if (tituloSecao) {
  const aviso = document.createElement('p')
  aviso.className = 'dica'
  aviso.textContent = 'Os filtros de item entram em funcionamento na próxima etapa. Por enquanto, a busca lista os empreendimentos já aprovados.'
  tituloSecao.after(aviso)
}

carregar()