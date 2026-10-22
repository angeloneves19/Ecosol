function renumerar(item, indice) {
  for (const campo of item.querySelectorAll('[name]')) {
    campo.name = campo.name.replace(/(\d+)(?=\D*$)/, indice)
  }
  const rotulo = item.querySelector('.campo > span')
  if (rotulo) rotulo.innerHTML = rotulo.innerHTML.replace(/ \d+/, ' ' + indice)
}

function limpar(item) {
  for (const campo of item.querySelectorAll('input, select, textarea')) {
    if (campo.type === 'checkbox') {
      campo.checked = !campo.name.includes('oordenadas')
    } else if (campo.tagName === 'SELECT') {
      campo.value = 'RS'
    } else {
      campo.value = campo.name.startsWith('cidade') ? 'Viamão' : ''
    }
  }
}

function criarRemover(aoClicar) {
  const botao = document.createElement('button')
  botao.type = 'button'
  botao.className = 'botao perigo pequeno'
  botao.textContent = 'Remover'
  botao.addEventListener('click', aoClicar)
  return botao
}

export function ligarRepetidor({ lista, botao, maximo }) {
  function reindexar() {
    const itens = [...lista.children]
    itens.forEach((item, posicao) => {
      renumerar(item, posicao + 1)
      const selo = item.querySelector('.cabecalho-endereco h3')
      if (selo) {
        selo.innerHTML = posicao === 0
          ? 'Endereço <span class="selo sit-principal">Principal</span>'
          : 'Endereço'
      }
    })
    if (maximo) botao.hidden = itens.length >= maximo
  }

  botao.addEventListener('click', () => {
    const itens = [...lista.children]
    if (maximo && itens.length >= maximo) return

    const novo = itens[0].cloneNode(true)
    limpar(novo)

    const velho = novo.querySelector('.botao.perigo')
    if (velho) velho.remove()

    const remover = criarRemover(() => {
      novo.remove()
      reindexar()
    })

    const area = novo.querySelector('.mover-endereco') || novo.querySelector('.campo-com-marcador') || novo
    if (area.classList.contains('mover-endereco')) {
      area.append(remover)
    } else {
      novo.append(remover)
    }

    lista.append(novo)
    reindexar()

    const primeiro = novo.querySelector('input')
    if (primeiro) primeiro.focus()
  })

  reindexar()
}

export function coletar(lista, campos) {
  return [...lista.children].map((item) => {
    const linha = {}
    for (const [chave, seletor] of Object.entries(campos)) {
      const campo = item.querySelector(seletor)
      if (!campo) continue
      linha[chave] = campo.type === 'checkbox' ? campo.checked : campo.value.trim()
    }
    return linha
  })
}