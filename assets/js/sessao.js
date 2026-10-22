import { supabase } from './supabase.js'

export const SITUACOES = {
  1: { nome: 'Pendente', classe: 'sit-pendente', pagina: 'status-pendente.html' },
  2: { nome: 'Ativo', classe: 'sit-ativo', pagina: 'painel.html' },
  3: { nome: 'Pausado', classe: 'sit-pausado', pagina: 'status-pausado.html' },
  4: { nome: 'Suspenso', classe: 'sit-suspenso', pagina: 'status-suspenso.html' },
  5: { nome: 'Recusado', classe: 'sit-recusado', pagina: 'status-recusado.html' },
  6: { nome: 'Excluído', classe: 'sit-excluido', pagina: 'status-excluido.html' }
}

export async function sessaoAtual() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function usuarioLogado() {
  const sessao = await sessaoAtual()
  if (!sessao) return null

  const { data } = await supabase
    .from('usuario')
    .select('id, nome, email')
    .eq('auth_id', sessao.user.id)
    .maybeSingle()

  return data
}

export async function ehAdministrador(idUsuario) {
  const { data } = await supabase
    .from('administrador')
    .select('id_usuario')
    .eq('id_usuario', idUsuario)
    .maybeSingle()

  return Boolean(data)
}

export async function meuEmpreendimento() {
  const usuario = await usuarioLogado()
  if (!usuario) return null

  const { data: vinculo } = await supabase
    .from('usuario_empreendimento')
    .select('id_empreendimento')
    .eq('id_usuario', usuario.id)
    .maybeSingle()

  if (!vinculo) return { usuario, empreendimento: null }

  const { data: empreendimento } = await supabase
    .from('empreendimento')
    .select('*, categoria_de_empreendimento(nome)')
    .eq('id', vinculo.id_empreendimento)
    .maybeSingle()

  return { usuario, empreendimento }
}

export async function exigirEmpreendimento() {
  const dados = await meuEmpreendimento()

  if (!dados || !dados.empreendimento) {
    window.location.href = 'entrar.html'
    return null
  }

  return dados
}

export async function protegerPagina() {
  const sessao = await sessaoAtual()
  if (!sessao) {
    window.location.href = 'entrar.html'
    return false
  }
  return true
}

export async function sair() {
  await supabase.auth.signOut()
  window.location.href = '../index.html'
}

export function ligarBotaoSair() {
  for (const link of document.querySelectorAll('.menu .botao')) {
    if (link.textContent.trim() !== 'Sair') continue
    link.addEventListener('click', async (evento) => {
      evento.preventDefault()
      await sair()
    })
  }
}