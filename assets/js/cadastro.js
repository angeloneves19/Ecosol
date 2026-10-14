import { supabase } from './supabase.js'

const form = document.querySelector('#form-cadastro')
const aviso = document.querySelector('#aviso-cadastro')
const botao = form.querySelector('button[type="submit"]')
const selectCategoria = form.querySelector('[name="categoria"]')

function mostrar(texto, tipo) {
  aviso.textContent = texto
  aviso.className = 'aviso ' + tipo
  aviso.hidden = false
  aviso.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

async function carregarCategorias() {
  const { data, error } = await supabase
    .from('categoria_de_empreendimento')
    .select('id, nome')
    .order('nome')

  if (error) {
    mostrar('Não foi possível carregar as categorias. Recarregue a página.', 'erro')
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

function soDigitos(valor) {
  return (valor || '').replace(/\D/g, '')
}

function montarDados(dados) {
  const documento = soDigitos(dados.get('documento'))
  const coordenadas = (dados.get('coordenadas1') || '').split(',')

  return {
    id_categoria: dados.get('categoria'),
    nome: dados.get('nome'),
    nome_fantasia: dados.get('nomeFantasia'),
    nome_fantasia_visivel: dados.has('nomeFantasiaVisivel'),
    razao_social: dados.get('razaoSocial'),
    descricao: dados.get('descricao'),
    email_visivel: dados.has('emailVisivel'),
    cpf: documento.length === 11 ? documento : '',
    cnpj: documento.length === 14 ? documento : '',
    documento_visivel: dados.has('documentoVisivel'),
    telefone1: dados.get('telefone1'),
    telefone1_visivel: dados.has('telefone1Visivel'),
    whatsapp1: dados.get('whatsapp1'),
    whatsapp1_visivel: dados.has('whatsapp1Visivel'),
    site: dados.get('site'),
    site_visivel: dados.has('siteVisivel'),
    facebook: dados.get('facebook'),
    facebook_visivel: dados.has('facebookVisivel'),
    instagram: dados.get('instagram'),
    instagram_visivel: dados.has('instagramVisivel'),
    usuario_nome: dados.get('usuarioNome'),
    enderecos: [{
      rua: dados.get('rua1'),
      numero: dados.get('numero1'),
      complemento: dados.get('complemento1'),
      bairro: dados.get('bairro1'),
      cidade: dados.get('cidade1'),
      uf: dados.get('uf1'),
      cep: dados.get('cep1'),
      latitude: (coordenadas[0] || '').trim(),
      longitude: (coordenadas[1] || '').trim(),
      visivel: dados.has('enderecoVisivel1'),
      coordenadas_visivel: dados.has('coordenadasVisivel1')
    }]
  }
}

function validar(dados) {
  const documento = soDigitos(dados.get('documento'))
  if (documento.length !== 11 && documento.length !== 14) {
    return 'Informe um CPF com 11 dígitos ou um CNPJ com 14.'
  }
  if (dados.get('senha') !== dados.get('senhaConfirma')) {
    return 'As duas senhas não conferem.'
  }
  if ((dados.get('senha') || '').length < 6) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }
  if (soDigitos(dados.get('cep1')).length !== 8) {
    return 'Informe um CEP com 8 dígitos.'
  }
  return null
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault()

  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  const dados = new FormData(form)
  const problema = validar(dados)
  if (problema) {
    mostrar(problema, 'erro')
    return
  }

  botao.disabled = true
  botao.textContent = 'Enviando...'

  const { error: erroAuth } = await supabase.auth.signUp({
    email: dados.get('email'),
    password: dados.get('senha')
  })

  if (erroAuth) {
    const repetido = erroAuth.message.includes('already registered')
    mostrar(repetido ? 'Este e-mail já tem cadastro. Entre na sua conta.' : erroAuth.message, 'erro')
    botao.disabled = false
    botao.textContent = 'Enviar cadastro para análise'
    return
  }

  const { error: erroCadastro } = await supabase.rpc('cadastrar_empreendimento', {
    dados: montarDados(dados)
  })

  if (erroCadastro) {
    mostrar('O acesso foi criado, mas o cadastro falhou: ' + erroCadastro.message, 'erro')
    botao.disabled = false
    botao.textContent = 'Enviar cadastro para análise'
    return
  }

  window.location.href = 'status-pendente.html'
})

carregarCategorias()
