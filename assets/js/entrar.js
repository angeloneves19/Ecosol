import { supabase } from './supabase.js'
import { usuarioLogado, ehAdministrador, sessaoAtual, SITUACOES } from './sessao.js'

const form = document.querySelector('form')
const aviso = document.querySelector('#erro-acesso')
const botao = form.querySelector('button[type="submit"]')

aviso.hidden = true

function mostrar(texto) {
  aviso.textContent = texto
  aviso.hidden = false
}

async function destino() {
  const usuario = await usuarioLogado()
  if (!usuario) return 'entrar.html'

  if (await ehAdministrador(usuario.id)) return 'admin.html'

  const { data: vinculo } = await supabase
    .from('usuario_empreendimento')
    .select('id_empreendimento')
    .eq('id_usuario', usuario.id)
    .maybeSingle()

  if (!vinculo) return 'cadastrar.html'

  const { data: empreendimento } = await supabase
    .from('empreendimento')
    .select('id_situacao')
    .eq('id', vinculo.id_empreendimento)
    .maybeSingle()

  const situacao = SITUACOES[empreendimento?.id_situacao]
  return situacao ? situacao.pagina : 'painel.html'
}

if (await sessaoAtual()) {
  window.location.href = await destino()
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault()
  aviso.hidden = true

  const dados = new FormData(form)
  botao.disabled = true
  botao.textContent = 'Entrando...'

  const { error } = await supabase.auth.signInWithPassword({
    email: dados.get('identificador').trim().toLowerCase(),
    password: dados.get('senha')
  })

  if (error) {
    mostrar(
      error.message.includes('Invalid login')
        ? 'E-mail ou senha não conferem.'
        : error.message
    )
    botao.disabled = false
    botao.textContent = 'Entrar'
    return
  }

  window.location.href = await destino()
})