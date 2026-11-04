import { supabase } from './supabase.js'

const BUCKET_EMP = 'fotos-empreendimento'
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp']
const TAMANHO_MAX = 5 * 1024 * 1024 // 5 MB

export function urlPublica(bucket, caminho) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(caminho)
  return data.publicUrl
}

export async function carregarFotosEmpreendimento(idEmpreendimento) {
  const { data, error } = await supabase
    .from('foto_empreendimento')
    .select('id, seq, descricao, url_imagem')
    .eq('id_empreendimento', idEmpreendimento)
    .order('seq')

  if (error) throw error
  return data || []
}

export async function uploadFotoEmpreendimento(arquivo, idEmpreendimento) {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    throw new Error('Formato inválido. Use JPEG, PNG ou WebP.')
  }

  if (arquivo.size > TAMANHO_MAX) {
    throw new Error('Arquivo grande demais. Máximo 5 MB.')
  }

  const extensao = arquivo.name.split('.').pop().toLowerCase()
  const caminho = `${idEmpreendimento}/${Date.now()}.${extensao}`

  const { error: erroUpload } = await supabase.storage
    .from(BUCKET_EMP)
    .upload(caminho, arquivo, { cacheControl: '3600', upsert: false })

  if (erroUpload) throw erroUpload

  const url = urlPublica(BUCKET_EMP, caminho)

  const { data: fotos } = await supabase
    .from('foto_empreendimento')
    .select('seq')
    .eq('id_empreendimento', idEmpreendimento)
    .order('seq', { ascending: false })
    .limit(1)

  const proximoSeq = fotos && fotos.length ? fotos[0].seq + 1 : 1

  const { error: erroBanco } = await supabase
    .from('foto_empreendimento')
    .insert({
      id_empreendimento: idEmpreendimento,
      seq: proximoSeq,
      url_imagem: url,
      descricao: null
    })

  if (erroBanco) {
    await supabase.storage.from(BUCKET_EMP).remove([caminho])
    throw erroBanco
  }

  return url
}

export async function removerFotoEmpreendimento(id, urlImagem, idEmpreendimento) {
  const url = new URL(urlImagem)
  const partes = url.pathname.split(`/${BUCKET_EMP}/`)
  const caminho = partes[1] || ''

  await supabase.storage.from(BUCKET_EMP).remove([caminho])

  await supabase
    .from('foto_empreendimento')
    .delete()
    .eq('id', id)

  const { data: restantes } = await supabase
    .from('foto_empreendimento')
    .select('id')
    .eq('id_empreendimento', idEmpreendimento)
    .order('seq')

  for (let i = 0; i < (restantes || []).length; i += 1) {
    await supabase
      .from('foto_empreendimento')
      .update({ seq: i + 1 })
      .eq('id', restantes[i].id)
  }
}

export function renderizarGaleria(fotos, container, aoRemover) {
  container.innerHTML = ''

  if (!fotos.length) {
    container.innerHTML = '<p class="apagado">Nenhuma foto ainda. Adicione a primeira.</p>'
    return
  }

  for (const foto of fotos) {
    const item = document.createElement('div')
    item.className = 'foto-item'
    item.dataset.id = foto.id
    item.innerHTML = `
      <div class="foto-preview-container">
        <img src="${foto.url_imagem}" alt="${foto.descricao || 'Foto do empreendimento'}"
          class="foto-preview" loading="lazy">
        ${foto.seq === 1 ? '<span class="selo sit-principal">Capa</span>' : ''}
      </div>
      <button class="botao perigo pequeno" type="button">Remover</button>
    `
    item.querySelector('button').addEventListener('click', () => aoRemover(foto))
    container.append(item)
  }
}