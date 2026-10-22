import { protegerPagina, ligarBotaoSair } from './sessao.js'

if (await protegerPagina()) {
  ligarBotaoSair()
}