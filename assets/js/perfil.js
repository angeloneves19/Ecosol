import { supabase } from './supabase.js'
import { exigirEmpreendimento, ligarBotaoSair, SITUACOES } from './sessao.js'
import { ligarRepetidor } from './campos-repetidos.js'

const dados = await exigirEmpreendimento()
if (dados) {
  const { usuario, empreendimento } = dados
  const formDados = document.querySelectorAll('.painel.formulario')[0]
  const formEnderecos = document.querySelectorAll('.painel.formulario')[1]
  const formFotos = document.querySelectorAll('.painel.formulario')[2]
  const formSenha = document.querySelectorAll('.painel.formulario')[3]
  const painelUsuarios = document.querySelectorAll('.painel.formulario')[4]
  const listaEnderecos = formEnderecos.querySelector('.lista-enderecos')

  function escapar(texto) {
    const caixa = document.createElement('div')
    caixa.textContent = texto == null ? '' : texto
    return caixa.innerHTML
  }

  function avisar(formulario, texto, tipo) {
    let caixa = formulario.querySelector('.aviso-salvo')
    if (!caixa) {
      caixa = document.createElement('p')
      caixa.className = 'aviso-salvo'
      formulario.querySelector('.subtitulo').after(caixa)
    }
    caixa.className = 'aviso-salvo aviso ' + tipo
    caixa.textContent = texto
    setTimeout(() => caixa.remove(), 4000)
  }

  function valor(nome) {
    const campo = formDados.querySelector(`[name="${nome}"]`)
    return campo ? campo.value.trim() : ''
  }

  function marcado(nome, form = formDados) {
    const campo = form.querySelector(`[name="${nome}"]`)
    return campo ? campo.checked : false
  }

  function preencher(nome, conteudo, form = formDados) {
    const campo = form.querySelector(`[name="${nome}"]`)
    if (campo) campo.value = conteudo == null ? '' : conteudo
  }

  function marcar(nome, estado, form = formDados) {
    const campo = form.querySelector(`[name="${nome}"]`)
    if (campo) campo.checked = Boolean(estado)
  }

  const situacao = SITUACOES[empreendimento.id_situacao]
  document.querySelector('.quem b').textContent = empreendimento.nome
  document.querySelector('.quem .apagado').textContent = usuario.nome
  const selo = document.querySelector('.quem .selo')
  selo.textContent = situacao.nome
  selo.className = 'selo ' + situacao.classe

  async function carregarCategorias() {
    const select = formDados.querySelector('[name="categoria"]')
    const { data } = await supabase.from('categoria_de_empreendimento').select('id, nome').order('nome')
    if (!data) return
    select.innerHTML = '<option value="">Selecione</option>'
    for (const categoria of data) {
      const opcao = document.createElement('option')
      opcao.value = categoria.id
      opcao.textContent = categoria.nome
      opcao.selected = categoria.id === empreendimento.id_categoria
      select.append(opcao)
    }
  }

  const grupos = [...formDados.querySelectorAll('fieldset.grupo')]
  const grupoTelefones = grupos.find((g) => g.querySelector('legend').textContent.startsWith('Telefones'))
  const grupoWhatsapps = grupos.find((g) => g.querySelector('legend').textContent.startsWith('WhatsApp'))

  function montarContatos(grupo, prefixo) {
    const lista = grupo.querySelector('.lista-multipla')
    const modelo = lista.children[0].cloneNode(true)

    const valores = [1, 2, 3]
      .map((n) => ({
        numero: empreendimento[`${prefixo}${n}`],
        visivel: empreendimento[`${prefixo}${n}_visivel`]
      }))
      .filter((contato) => contato.numero)

    if (!valores.length) valores.push({ numero: '', visivel: true })

    lista.innerHTML = ''

    valores.forEach((contato, posicao) => {
      const item = modelo.cloneNode(true)
      const entrada = item.querySelector('input[type="tel"]')
      const marcador = item.querySelector('input[type="checkbox"]')

      entrada.value = contato.numero
      marcador.checked = contato.visivel !== false

      const velho = item.querySelector('.botao.perigo')
      if (velho) velho.remove()

      if (posicao > 0) {
        const remover = document.createElement('button')
        remover.type = 'button'
        remover.className = 'botao perigo pequeno'
        remover.textContent = 'Remover'
        remover.addEventListener('click', () => {
          item.remove()
          renumerarContatos(lista)
        })
        item.append(remover)
      }

      lista.append(item)
    })

    renumerarContatos(lista)

    ligarRepetidor({
      lista,
      botao: grupo.querySelector(':scope > button[type="button"]'),
      maximo: 3
    })
  }

  function renumerarContatos(lista) {
    ;[...lista.children].forEach((item, posicao) => {
      for (const campo of item.querySelectorAll('[name]')) {
        campo.name = campo.name.replace(/(\d+)(?=\D*$)/, posicao + 1)
      }
      const rotulo = item.querySelector('.campo > span')
      if (rotulo) rotulo.innerHTML = rotulo.innerHTML.replace(/ \d+/, ' ' + (posicao + 1))
    })
  }

  function lerContatos(grupo, prefixo) {
    const valores = {}
    const itens = [...grupo.querySelectorAll('.item-multiplo')]

    for (let n = 1; n <= 3; n += 1) {
      const item = itens[n - 1]
      const entrada = item ? item.querySelector('input[type="tel"]') : null
      const marcador = item ? item.querySelector('input[type="checkbox"]') : null
      valores[`${prefixo}${n}`] = entrada && entrada.value.trim() ? entrada.value.trim() : null
      valores[`${prefixo}${n}_visivel`] = marcador ? marcador.checked : true
    }

    return valores
  }

  function preencherDados() {
    preencher('nome', empreendimento.nome)
    preencher('documento', empreendimento.cnpj || empreendimento.cpf)
    preencher('razaoSocial', empreendimento.razao_social)
    preencher('nomeFantasia', empreendimento.nome_fantasia)
    preencher('descricao', empreendimento.descricao)
    preencher('email', empreendimento.email)
    preencher('site', empreendimento.site)
    preencher('facebook', empreendimento.facebook)
    preencher('instagram', empreendimento.instagram)

    marcar('documentoVisivel', empreendimento.cnpj ? empreendimento.cnpj_visivel : empreendimento.cpf_visivel)
    marcar('nomeFantasiaVisivel', empreendimento.nome_fantasia_visivel)
    marcar('emailVisivel', empreendimento.email_visivel)
    marcar('siteVisivel', empreendimento.site_visivel)
    marcar('facebookVisivel', empreendimento.facebook_visivel)
    marcar('instagramVisivel', empreendimento.instagram_visivel)

    const campoEmail = formDados.querySelector('[name="email"]')
    campoEmail.readOnly = true
    campoEmail.title = 'O e-mail é o login e não pode ser alterado por aqui.'
  }

  formDados.addEventListener('submit', async (evento) => {
    evento.preventDefault()
    const documento = valor('documento').replace(/\D/g, '')
    const ehCpf = documento.length === 11

    if (documento.length !== 11 && documento.length !== 14) {
      avisar(formDados, 'Informe um CPF com 11 dígitos ou um CNPJ com 14.', 'erro')
      return
    }

    const { error } = await supabase.from('empreendimento').update({
      nome: valor('nome'),
      razao_social: valor('razaoSocial') || null,
      nome_fantasia: valor('nomeFantasia') || null,
      nome_fantasia_visivel: marcado('nomeFantasiaVisivel'),
      descricao: valor('descricao') || null,
      id_categoria: Number(formDados.querySelector('[name="categoria"]').value),
      cpf: ehCpf ? documento : null,
      cpf_visivel: ehCpf ? marcado('documentoVisivel') : false,
      cnpj: ehCpf ? null : documento,
      cnpj_visivel: ehCpf ? false : marcado('documentoVisivel'),
      email_visivel: marcado('emailVisivel'),
      ...lerContatos(grupoTelefones, 'telefone'),
      ...lerContatos(grupoWhatsapps, 'whatsapp'),
      site: valor('site') || null,
      site_visivel: marcado('siteVisivel'),
      facebook: valor('facebook') || null,
      facebook_visivel: marcado('facebookVisivel'),
      instagram: valor('instagram') || null,
      instagram_visivel: marcado('instagramVisivel')
    }).eq('id', empreendimento.id)

    avisar(formDados, error ? 'Não consegui salvar: ' + error.message : 'Perfil salvo.', error ? 'erro' : 'informacao')
  })

  function cartaoEndereco(endereco, posicao, total) {
    const principal = posicao === 0
    const uf = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
      .map((sigla) => `<option${sigla === endereco.uf ? ' selected' : ''}>${sigla}</option>`).join('')

    return `
      <li class="endereco" data-id="${endereco.id}">
        <div class="cabecalho-endereco">
          <h3>Endereço${principal ? ' <span class="selo sit-principal">Principal</span>' : ''}</h3>
          <div class="mover-endereco">
            ${principal ? '' : `<button class="botao vazado pequeno" type="button" data-acao="subir">Subir</button>`}
            ${posicao === total - 1 ? '' : `<button class="botao vazado pequeno" type="button" data-acao="descer">Descer</button>`}
            ${principal ? '' : `<button class="botao perigo pequeno" type="button" data-acao="remover">Remover</button>`}
          </div>
        </div>
        <div class="linha">
          <label class="campo duas-colunas"><span>Rua<span class="obrigatorio" aria-hidden="true">*</span></span>
            <input type="text" data-campo="rua" value="${escapar(endereco.rua)}" required></label>
          <label class="campo"><span>Número<span class="obrigatorio" aria-hidden="true">*</span></span>
            <input type="text" data-campo="numero" value="${escapar(endereco.numero)}" required></label>
        </div>
        <div class="linha">
          <label class="campo"><span>Complemento</span>
            <input type="text" data-campo="complemento" value="${escapar(endereco.complemento)}"></label>
          <label class="campo"><span>CEP<span class="obrigatorio" aria-hidden="true">*</span></span>
            <input type="text" data-campo="cep" value="${escapar(endereco.cep)}" maxlength="9" required></label>
        </div>
        <div class="linha">
          <label class="campo"><span>Bairro</span>
            <input type="text" data-campo="bairro" value="${escapar(endereco.bairro)}"></label>
          <label class="campo"><span>Cidade<span class="obrigatorio" aria-hidden="true">*</span></span>
            <input type="text" data-campo="cidade" value="${escapar(endereco.cidade)}" required></label>
          <label class="campo"><span>Estado<span class="obrigatorio" aria-hidden="true">*</span></span>
            <select data-campo="uf">${uf}</select></label>
        </div>
        <label class="campo"><span>Coordenadas do Google Maps</span>
          <input type="text" data-campo="coordenadas" value="${endereco.latitude ? `${endereco.latitude}, ${endereco.longitude}` : ''}" placeholder="-30.0811, -51.0233"></label>
        <label class="marcador junto">
          <input type="checkbox" data-campo="coordenadas_visivel"${endereco.coordenadas_visivel ? ' checked' : ''}>
          <span>Exibir as coordenadas no site</span></label>
        <label class="marcador junto">
          <input type="checkbox" data-campo="visivel"${endereco.visivel ? ' checked' : ''}>
          <span>Exibir este endereço no site</span></label>
      </li>`
  }

  let enderecos = []

  async function carregarEnderecos() {
    const { data } = await supabase
      .from('endereco')
      .select('*')
      .eq('id_empreendimento', empreendimento.id)
      .order('seq')

    enderecos = data || []
    listaEnderecos.innerHTML = enderecos.map(cartaoEndereco).join('')
    ligarAcoesEndereco()
  }

  function ligarAcoesEndereco() {
    for (const item of listaEnderecos.querySelectorAll('.endereco')) {
      const id = Number(item.dataset.id)
      const posicao = enderecos.findIndex((e) => e.id === id)

      for (const botao of item.querySelectorAll('[data-acao]')) {
        botao.addEventListener('click', async () => {
          const acao = botao.dataset.acao

          if (acao === 'remover') {
            if (!confirm('Remover este endereço?')) return
            await supabase.from('endereco').delete().eq('id', id)
          } else {
            const outro = enderecos[acao === 'subir' ? posicao - 1 : posicao + 1]
            if (!outro) return
            await supabase.from('endereco').update({ seq: -1 }).eq('id', id)
            await supabase.from('endereco').update({ seq: enderecos[posicao].seq }).eq('id', outro.id)
            await supabase.from('endereco').update({ seq: outro.seq }).eq('id', id)
          }

          await renumerar()
          await carregarEnderecos()
        })
      }
    }
  }

  async function renumerar() {
    const { data } = await supabase
      .from('endereco')
      .select('id, seq')
      .eq('id_empreendimento', empreendimento.id)
      .order('seq')

    let posicao = 0
    for (const endereco of data || []) {
      posicao += 1
      if (endereco.seq !== posicao) {
        await supabase.from('endereco').update({ seq: posicao + 100 }).eq('id', endereco.id)
      }
    }

    const { data: segunda } = await supabase
      .from('endereco')
      .select('id, seq')
      .eq('id_empreendimento', empreendimento.id)
      .order('seq')

    posicao = 0
    for (const endereco of segunda || []) {
      posicao += 1
      if (endereco.seq !== posicao) {
        await supabase.from('endereco').update({ seq: posicao }).eq('id', endereco.id)
      }
    }
  }

  formEnderecos.addEventListener('submit', async (evento) => {
    evento.preventDefault()

    for (const item of listaEnderecos.querySelectorAll('.endereco')) {
      const campo = (nome) => item.querySelector(`[data-campo="${nome}"]`)
      const coordenadas = (campo('coordenadas').value || '').split(',')

      const { error } = await supabase.from('endereco').update({
        rua: campo('rua').value.trim(),
        numero: campo('numero').value.trim(),
        complemento: campo('complemento').value.trim() || null,
        cep: campo('cep').value.replace(/\D/g, ''),
        bairro: campo('bairro').value.trim() || null,
        cidade: campo('cidade').value.trim(),
        uf: campo('uf').value,
        latitude: coordenadas[0] && coordenadas[0].trim() ? Number(coordenadas[0]) : null,
        longitude: coordenadas[1] && coordenadas[1].trim() ? Number(coordenadas[1]) : null,
        visivel: campo('visivel').checked,
        coordenadas_visivel: campo('coordenadas_visivel').checked
      }).eq('id', Number(item.dataset.id))

      if (error) {
        avisar(formEnderecos, 'Não consegui salvar: ' + error.message, 'erro')
        return
      }
    }

    avisar(formEnderecos, 'Endereços salvos.', 'informacao')
  })

  const botaoNovoEndereco = [...formEnderecos.querySelectorAll('button[type="button"]')]
    .find((b) => b.textContent.includes('Adicionar endereço'))

  botaoNovoEndereco.addEventListener('click', async () => {
    const { error } = await supabase.from('endereco').insert({
      id_empreendimento: empreendimento.id,
      seq: enderecos.length + 1,
      rua: 'Novo endereço',
      numero: '0',
      cidade: 'Viamão',
      uf: 'RS',
      cep: '94000000',
      visivel: true
    })

    if (error) {
      avisar(formEnderecos, 'Não consegui adicionar: ' + error.message, 'erro')
      return
    }

    await carregarEnderecos()
  })

  formSenha.addEventListener('submit', async (evento) => {
    evento.preventDefault()
    const nova = formSenha.querySelector('[name="novaSenhaPropria"]').value
    const confirma = formSenha.querySelector('[name="novaSenhaPropriaConfirma"]').value

    if (!nova) {
      avisar(formSenha, 'Informe a nova senha.', 'erro')
      return
    }
    if (nova.length < 6) {
      avisar(formSenha, 'A senha precisa ter pelo menos 6 caracteres.', 'erro')
      return
    }
    if (nova !== confirma) {
      avisar(formSenha, 'As duas senhas não conferem.', 'erro')
      return
    }

    const { error } = await supabase.auth.updateUser({ password: nova })
    avisar(formSenha, error ? 'Não consegui alterar: ' + error.message : 'Senha alterada.', error ? 'erro' : 'informacao')
    if (!error) formSenha.reset()
  })

  async function carregarUsuarios() {
    const { data: vinculos } = await supabase
      .from('usuario_empreendimento')
      .select('id_usuario')
      .eq('id_empreendimento', empreendimento.id)

    const ids = (vinculos || []).map((v) => v.id_usuario)
    const { data: pessoas } = await supabase
      .from('usuario')
      .select('id, nome, email, id_situacao')
      .in('id', ids.length ? ids : [0])

    const linhas = (pessoas || []).map((pessoa) => `
      <div class="linha-simples">
        <div>
          <b>${escapar(pessoa.nome)}</b>
          ${pessoa.id === usuario.id ? '<span class="etiqueta">você</span>' : ''}
          <span class="selo ${pessoa.id_situacao === 1 ? 'sit-ativo">Ativo' : 'sit-pausado">Inativo'}</span>
          <div class="email-usuario">${escapar(pessoa.email)}</div>
        </div>
      </div>`).join('')

    for (const antiga of painelUsuarios.querySelectorAll('.linha-simples')) antiga.remove()
    painelUsuarios.querySelector('.apagado, .subtitulo').insertAdjacentHTML('afterend', linhas)

    const formNovo = painelUsuarios.querySelector('form')
    formNovo.insertAdjacentHTML('beforebegin',
      '<p class="dica">Convidar outra pessoa do grupo depende de envio de e-mail pelo servidor. Entra na próxima etapa.</p>')
    for (const campo of formNovo.querySelectorAll('input, button')) campo.disabled = true
  }

  formFotos.addEventListener('submit', (evento) => {
    evento.preventDefault()
    avisar(formFotos, 'O envio de fotos depende do Storage do Supabase e entra na próxima etapa.', 'atencao')
  })

  for (const campo of formFotos.querySelectorAll('input, button')) campo.disabled = true
  formFotos.querySelector('.dica').textContent =
    'O envio de fotos depende do Storage do Supabase e entra na próxima etapa.'

  const verPublica = document.querySelector('a[href^="empreendimento.html"]')
  if (verPublica) verPublica.href = `empreendimento.html?id=${empreendimento.id}`

  ligarBotaoSair()
  await carregarCategorias()
  preencherDados()
  montarContatos(grupoTelefones, 'telefone')
  montarContatos(grupoWhatsapps, 'whatsapp')
  await carregarEnderecos()
  await carregarUsuarios()
}