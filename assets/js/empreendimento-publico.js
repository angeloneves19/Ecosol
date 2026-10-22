import { supabase } from './supabase.js'

const parametros = new URLSearchParams(window.location.search)
const id = Number(parametros.get('id'))
const conteiner = document.querySelector('main .conteiner')

function linha(rotulo, valor) {
  return `<dt>${rotulo}</dt><dd>${valor}</dd>`
}

function escapar(texto) {
  const caixa = document.createElement('div')
  caixa.textContent = texto
  return caixa.innerHTML
}

async function carregar() {
  if (!id) {
    conteiner.innerHTML = '<div class="vazio"><h2>Empreendimento não informado</h2><p>Volte para a busca e escolha um empreendimento.</p></div>'
    return
  }

  const { data: emp, error } = await supabase
    .from('empreendimento')
    .select('*, categoria_de_empreendimento(nome)')
    .eq('id', id)
    .maybeSingle()

  if (error || !emp) {
    conteiner.innerHTML = '<div class="vazio"><h2>Empreendimento não encontrado</h2><p>Ele pode não ter sido aprovado ainda.</p></div>'
    return
  }

  const { data: enderecos } = await supabase
    .from('endereco')
    .select('*')
    .eq('id_empreendimento', id)
    .eq('visivel', true)
    .order('seq')

  document.title = `${emp.nome} · Trama Viamão`
  conteiner.querySelector('.trilha').innerHTML =
    `<a href="../index.html">Busca</a> / ${escapar(emp.nome)}`

  conteiner.querySelector('.etiqueta').textContent = emp.categoria_de_empreendimento?.nome || 'Empreendimento'
  conteiner.querySelector('h1').textContent = emp.nome

  const fantasia = conteiner.querySelector('.apagado')
  if (emp.nome_fantasia && emp.nome_fantasia_visivel) {
    fantasia.textContent = 'Nome fantasia: ' + emp.nome_fantasia
  } else {
    fantasia.remove()
  }

  conteiner.querySelector('.abertura').textContent = emp.descricao || 'Este empreendimento ainda não escreveu uma descrição.'

  let contato = ''
  if (emp.cnpj && emp.cnpj_visivel) contato += linha('CNPJ', emp.cnpj)
  if (emp.cpf && emp.cpf_visivel) contato += linha('CPF', emp.cpf)

  const endereco = enderecos && enderecos[0]
  if (endereco) {
    const partes = [endereco.rua, endereco.numero].filter(Boolean).join(', ')
    const local = [endereco.bairro, `${endereco.cidade}/${endereco.uf}`].filter(Boolean).join(' – ')
    contato += linha('Endereço', `${partes} – ${local}`)
  }

  const telefones = [
    emp.telefone1_visivel ? emp.telefone1 : null,
    emp.telefone2_visivel ? emp.telefone2 : null,
    emp.telefone3_visivel ? emp.telefone3 : null
  ].filter(Boolean)
  if (telefones.length) contato += linha('Telefone', telefones.join('<br>'))

  const whatsapps = [
    emp.whatsapp1_visivel ? emp.whatsapp1 : null,
    emp.whatsapp2_visivel ? emp.whatsapp2 : null,
    emp.whatsapp3_visivel ? emp.whatsapp3 : null
  ].filter(Boolean)
  if (whatsapps.length) contato += linha('WhatsApp', whatsapps.join('<br>'))

  if (emp.email_visivel) contato += linha('E-mail', emp.email)
  if (emp.site && emp.site_visivel) contato += linha('Site', `<a href="${emp.site}" target="_blank" rel="noopener">${escapar(emp.site)}</a>`)
  if (emp.facebook && emp.facebook_visivel) contato += linha('Facebook', escapar(emp.facebook))
  if (emp.instagram && emp.instagram_visivel) contato += linha('Instagram', escapar(emp.instagram))

  conteiner.querySelector('.lista-dados').innerHTML = contato

  const acoes = conteiner.querySelector('.painel .acoes')
  const zap = whatsapps[0] ? whatsapps[0].replace(/\D/g, '') : null
  let botoes = ''
  if (zap) botoes += `<a class="botao zap" href="https://wa.me/55${zap}" target="_blank" rel="noopener">WhatsApp</a>`
  if (emp.email_visivel) botoes += `<a class="botao vazado" href="mailto:${emp.email}">E-mail</a>`
  if (endereco && endereco.latitude && endereco.coordenadas_visivel) {
    botoes += `<a class="botao vazado" href="https://www.google.com/maps/search/?api=1&query=${endereco.latitude},${endereco.longitude}" target="_blank" rel="noopener">Mapa</a>`
  }
  acoes.innerHTML = botoes || '<span class="apagado">Este empreendimento não publicou formas de contato.</span>'

  conteiner.querySelector('.galeria').remove()
  const grade = conteiner.querySelector('.grade')
  grade.innerHTML = '<div class="vazio"><h3>Nenhum item publicado ainda</h3><p>Este empreendimento ainda não cadastrou produtos ou serviços.</p></div>'
}

carregar()