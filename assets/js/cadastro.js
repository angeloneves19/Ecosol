import { supabase } from './supabase.js'
import { ligarRepetidor, coletar } from './campos-repetidos.js'

const form = document.querySelector('#form-cadastro')
const aviso = document.querySelector('#aviso-cadastro')
const botao = form.querySelector('button[type="submit"]')
const selectCategoria = form.querySelector('[name="categoria"]')

const grupos = [...form.querySelectorAll('fieldset.grupo')]
const grupoTelefones = grupos.find((g) => g.querySelector('legend').textContent.startsWith('Telefones'))
const grupoWhatsapps = grupos.find((g) => g.querySelector('legend').textContent.startsWith('WhatsApp'))
const listaEnderecos = form.querySelector('.lista-enderecos')
const botaoEndereco = [...form.querySelectorAll('button[type="button"]')]
  .find((b) => b.textContent.includes('Adicionar endereço'))

function mostrar(texto, tipo) {
  aviso.textContent = texto
  aviso.className = 'aviso ' + tipo
  aviso.hidden = false
  aviso.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

function liberar() {
  botao.disabled = false
  botao.textContent = 'Enviar cadastro para análise'
}

function digitos(valor) {
  return (valor || '').replace(/\D/g, '')
}

function campo(nome) {
  const elemento = form.querySelector(`[name="${nome}"]`)
  return elemento ? elemento.value.trim() : ''
}

function marcado(nome) {
  const elemento = form.querySelector(`[name="${nome}"]`)
  return elemento ? elemento.checked : false
}

async function carregarCategorias() {
  const { data, error } = await supabase
    .from('categoria_de_empreendimento')
    .select('id, nome')
    .order('nome')

  if (error) {
    mostrar('Não consegui carregar as categorias: ' + error.message, 'erro')
    return
  }

  selectCategoria.innerHTML = '<option value="">Selecione</option>'
  for (const categoria of data) {
    const opcao = document.createElement('option')
    opcao.value = categoria.id
    opcao.textContent = categoria.nome
    selectCategoria.append(opcao)
  }
}

function validar(enderecos) {
  const documento = digitos(campo('documento'))
  if (documento.length !== 11 && documento.length !== 14) {
    return 'Informe um CPF com 11 dígitos ou um CNPJ com 14.'
  }
  if (campo('senha').length < 6) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }
  if (campo('senha') !== campo('senhaConfirma')) {
    return 'As duas senhas não conferem.'
  }
  if (!campo('telefone1')) {
    return 'Informe pelo menos um telefone.'
  }
  for (const [posicao, endereco] of enderecos.entries()) {
    if (!endereco.rua || !endereco.numero || !endereco.cidade) {
      return `Complete rua, número e cidade do endereço ${posicao + 1}.`
    }
    if (digitos(endereco.cep).length !== 8) {
      return `Informe um CEP com 8 dígitos no endereço ${posicao + 1}.`
    }
  }
  return null
}

function lerContatos(grupo, prefixo) {
  const valores = {}
  const itens = [...grupo.querySelectorAll('.item-multiplo')]

  itens.forEach((item, posicao) => {
    const numero = posicao + 1
    const entrada = item.querySelector('input[type="tel"]')
    const visivel = item.querySelector('input[type="checkbox"]')
    valores[`${prefixo}${numero}`] = entrada ? entrada.value.trim() : ''
    valores[`${prefixo}${numero}_visivel`] = visivel ? visivel.checked : true
  })

  return valores
}

function montarDados(enderecos) {
  const documento = digitos(campo('documento'))
  const ehCpf = documento.length === 11

  return {
    id_categoria: campo('categoria'),
    nome: campo('nome'),
    nome_fantasia: campo('nomeFantasia'),
    nome_fantasia_visivel: marcado('nomeFantasiaVisivel'),
    razao_social: campo('razaoSocial'),
    descricao: campo('descricao'),
    email_visivel: marcado('emailVisivel'),
    cpf: ehCpf ? documento : '',
    cnpj: ehCpf ? '' : documento,
    documento_visivel: marcado('documentoVisivel'),
    ...lerContatos(grupoTelefones, 'telefone'),
    ...lerContatos(grupoWhatsapps, 'whatsapp'),
    site: campo('site'),
    site_visivel: marcado('siteVisivel'),
    facebook: campo('facebook'),
    facebook_visivel: marcado('facebookVisivel'),
    instagram: campo('instagram'),
    instagram_visivel: marcado('instagramVisivel'),
    usuario_nome: campo('usuarioNome'),
    enderecos: enderecos.map((endereco) => {
      const coordenadas = (endereco.coordenadas || '').split(',')
      return {
        rua: endereco.rua,
        numero: endereco.numero,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
        cep: endereco.cep,
        latitude: (coordenadas[0] || '').trim(),
        longitude: (coordenadas[1] || '').trim(),
        visivel: endereco.visivel,
        coordenadas_visivel: endereco.coordenadas_visivel
      }
    })
  }
}

function lerEnderecos() {
  return coletar(listaEnderecos, {
    rua: '[name^="rua"]',
    numero: '[name^="numero"]',
    complemento: '[name^="complemento"]',
    cep: '[name^="cep"]',
    bairro: '[name^="bairro"]',
    cidade: '[name^="cidade"]',
    uf: '[name^="uf"]',
    coordenadas: '[name^="coordenadas"]:not([type="checkbox"])',
    coordenadas_visivel: '[name^="coordenadasVisivel"]',
    visivel: '[name^="enderecoVisivel"]'
  })
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault()

  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  const enderecos = lerEnderecos()
  const problema = validar(enderecos)
  if (problema) {
    mostrar(problema, 'erro')
    return
  }

  botao.disabled = true
  botao.textContent = 'Enviando...'

  const { error: erroAuth } = await supabase.auth.signUp({
    email: campo('email').toLowerCase(),
    password: campo('senha')
  })

  if (erroAuth) {
    mostrar(
      erroAuth.message.includes('already registered')
        ? 'Este e-mail já tem cadastro. Entre na sua conta.'
        : erroAuth.message,
      'erro'
    )
    liberar()
    return
  }

  const { error: erroCadastro } = await supabase.rpc('cadastrar_empreendimento', {
    dados: montarDados(enderecos)
  })

  if (erroCadastro) {
    mostrar('O acesso foi criado, mas o cadastro falhou: ' + erroCadastro.message, 'erro')
    liberar()
    return
  }

  window.location.href = 'status-pendente.html'
})

for (const [grupo, maximo] of [[grupoTelefones, 3], [grupoWhatsapps, 3]]) {
  if (!grupo) continue
  ligarRepetidor({
    lista: grupo.querySelector('.lista-multipla'),
    botao: grupo.querySelector('button[type="button"]'),
    maximo
  })
}

if (listaEnderecos && botaoEndereco) {
  ligarRepetidor({ lista: listaEnderecos, botao: botaoEndereco })
}

carregarCategorias()