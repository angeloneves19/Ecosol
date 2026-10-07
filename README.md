<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-27337A?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-27337A?style=for-the-badge&logo=css3&logoColor=white)
![Javascript](https://img.shields.io/badge/Javascript-1F7A52?style=for-the-badge)
![Supbase](https://img.shields.io/badge/Supabase-F4B63F?style=for-the-badge&labelColor=3A2A00)
### 🧶 Uma rede para quem produz em Viamão

**Plataforma de divulgação e venda dos empreendedores locais que comercializam no IFRS Viamão.**
Quem produz ganha visibilidade além do dia de feira. Quem mora perto encontra e fecha negócio direto com quem faz.

[🔍 Abrir a busca](index.html) · [🗺️ Mapa de telas](pages/telas.html)

</div>

## 🏫 Um projeto real, com gente real vendendo

Isto não é exercício de sala. A plataforma vai ser **usada de verdade** pelos empreendedores locais que comercializam seus produtos no **IFRS Viamão**: gente que produz alimento, artesanato, roupa, serviço, e que hoje vende basicamente para quem passa na frente da banca no dia da feira. 🧺

O problema é concreto: **acabou a feira, acabou a venda**. Quem comprou um pote de mel no mês passado não tem como achar o produtor de novo. Quem nunca foi à feira não sabe que ele existe.

A Trama Viamão dá a esses empreendedores um endereço fixo na internet, com catálogo de foto, preço, estoque e contato, para que a venda continue acontecendo nos outros 29 dias do mês. 📈

## 📖 Sobre o projeto

Circuitos curtos de comercialização dependem de uma coisa simples: **quem produz precisa ser encontrável por quem mora ao lado**. Hoje esses grupos existem espalhados em conversas de WhatsApp, feiras de fim de semana e indicação boca a boca. Não há um lugar comum onde alguém procure por "mel", "conserto de roupa" ou "artesanato no meu bairro".

A Trama Viamão reúne esse catálogo e devolve a negociação para as pessoas. 🤝

### 🛒 Vende, sim. Mas a venda não passa pela plataforma

| Loja virtual comum | 🧶 Trama Viamão |
| --- | --- |
| Carrinho e checkout | Contato direto por WhatsApp ou e-mail |
| Processa pagamento | Não toca em dinheiro |
| Gerencia frete e entrega | Combinados entre cliente e produtor |
| Cobra comissão por venda | Sem taxa, sem intermediação |

> ⚠️ **A venda acontece, só que entre as pessoas.** A plataforma mostra o item, mostra quem faz, entrega o contato e sai do caminho. Preço, forma de pagamento, entrega e retirada são combinados direto entre cliente e produtor, exatamente como já funciona na feira.
>
> Isso é decisão de projeto, não limitação: nenhum empreendedor precisa de maquininha, gateway, cadastro de banco ou comissão para começar a usar. Pix e combinação por WhatsApp já são o que essa gente usa todo dia. 💬

## 👥 Quem usa

### 🔎 Cliente, sem cadastro e sem login

Pesquisa por nome, descrição, natureza, tipo, faixa de preço, categoria e localização do empreendimento, combinando filtros com **E** ou **OU**. Pode partir da própria localização e limitar por raio em quilômetros. Encontrou? Chama no WhatsApp ou manda e-mail pelo próprio resultado da busca.

### 🏪 Empreendimento, o grupo produtor

Faz o próprio cadastro, aguarda aprovação e então mantém perfil, **vários endereços**, até **3 telefones**, até **3 WhatsApp**, redes sociais, fotos e todos os itens ofertados. Cada informação sensível tem um ✅ "exibir no site": o grupo decide o que o cliente vê.

### 🛡️ Administração, a equipe da plataforma

Aprova, recusa, suspende e remove empreendimentos. Aprova e recusa itens, sempre informando o motivo. Configura tipos de produto, tipos de serviço e categorias de empreendimento. Mantém a própria equipe de administradores.

## 🔄 O caminho de um cadastro

Nada aparece na busca pública sem passar por aprovação humana.

```
  📨 cadastro enviado
         │
         ▼
   ┌──────────┐   aprova    ┌────────┐  o grupo pausa   ┌─────────┐
   │ PENDENTE │ ──────────▶ │ ATIVO  │ ───────────────▶ │ PAUSADO │
   └──────────┘             └────────┘ ◀─────────────── └─────────┘
         │                    │    │       reativa
         │ recusa             │    │ a plataforma suspende
         ▼                    │    ▼
   ┌──────────┐               │  ┌──────────┐
   │ RECUSADO │               │  │ SUSPENSO │
   └──────────┘               │  └──────────┘
   definitivo                 │
                              │ o grupo decide sair
                              ▼
                        ┌───────────┐
                        │ EXCLUIDO  │  pode voltar depois
                        └───────────┘
```

O item tem ciclo próprio: nasce **pendente** ⏳ e, aprovado, o grupo escolhe entre **disponível** ✅ (na busca, aceitando pedido), **indisponível** ⏸️ (na busca, sem aceitar pedido) e **descontinuado** 🚫 (fora da busca). A plataforma pode marcá-lo como **recusado** ❌. Editar um item aprovado o devolve para pendente.

## 🖼️ As 20 telas

<details>
<summary><b>Ver a lista completa</b></summary>

<br>

| Área | Tela | Arquivo |
| --- | --- | --- |
| 🔎 Cliente | Busca com filtros | `index.html` |
| 🔎 Cliente | Detalhe do item | `pages/item.html` |
| 🔎 Cliente | Página do empreendimento | `pages/empreendimento.html` |
| 🔑 Acesso | Entrar | `pages/entrar.html` |
| 🔑 Acesso | Cadastro do empreendimento | `pages/cadastrar.html` |
| 🏪 Empreendimento | Visão geral | `pages/painel.html` |
| 🏪 Empreendimento | Meus itens | `pages/itens.html` |
| 🏪 Empreendimento | Novo ou editar item | `pages/item-form.html` |
| 🏪 Empreendimento | Perfil, endereços e usuários | `pages/perfil.html` |
| 🏪 Empreendimento | Situação: em análise | `pages/status-pendente.html` |
| 🏪 Empreendimento | Situação: pausado | `pages/status-pausado.html` |
| 🏪 Empreendimento | Situação: suspenso | `pages/status-suspenso.html` |
| 🏪 Empreendimento | Situação: recusado | `pages/status-recusado.html` |
| 🏪 Empreendimento | Situação: excluído | `pages/status-excluido.html` |
| 🛡️ Administração | Painel e fila de análise | `pages/admin.html` |
| 🛡️ Administração | Empreendimentos | `pages/admin-empreendimentos.html` |
| 🛡️ Administração | Itens ofertados | `pages/admin-itens.html` |
| 🛡️ Administração | Tipos e categorias | `pages/admin-tipos.html` |
| 🛡️ Administração | Administradores | `pages/admin-administradores.html` |
| 🗺️ Documentação | Mapa de telas | `pages/telas.html` |

</details>

## 🗂️ Estrutura

```
trama-viamao/
├── 🏠 index.html          busca pública, ponto de entrada
├── 📄 README.md           este arquivo
├── 🖼️ favicon.ico
├── assets/
│   ├── css/
│   │   └── style.css      tokens, componentes e layout do sistema
│   └── img/
│       ├── banner.svg     cabeçalho animado deste arquivo
│       └── favicon.svg    ícone das abas do navegador
└── pages/                 as outras 19 telas
```

O `index.html` fica na raiz porque é o arquivo que o servidor procura quando alguém acessa o endereço sem caminho. O CSS mora fora de `pages/` por ser recurso estático, e não tela. **Todos os caminhos são relativos**, então o projeto roda de qualquer pasta, sem configuração.

## 🚀 Como rodar

```bash
git clone <url-do-repositorio>
cd trama-viamao
```

Abra o `index.html` no navegador. É HTML e CSS puro: **sem Node, sem build, sem instalação**. ⚡

<details>
<summary><b>Dicas para desenvolver</b></summary>

<br>

🔧 **Live Server.** Abra a pasta no VS Code e use a extensão sobre o `index.html`. Recarrega a cada gravação.

📱 **Responsivo.** Aperte `F12` e depois `Ctrl+Shift+M`. Os pontos de quebra ficam em **1000px**, **900px** e **620px**.

🎨 **Tema.** O sol e a lua no cabeçalho alternam claro e escuro. Sem nenhum dos dois marcado, o site segue a preferência do sistema operacional.

</details>

## 🎨 Decisões de implementação

<details>
<summary>📍 <b>Endereço principal é o primeiro da lista</b></summary>

Trocar o principal é reordenar, não marcar uma opção. Isso elimina o estado inconsistente de dois endereços marcados como principais ao mesmo tempo. O primeiro não tem botão de remover, o que garante o mínimo de um endereço.

</details>

<details>
<summary>👁️ <b>Cada dado sensível tem seu próprio interruptor</b></summary>

CPF/CNPJ, nome fantasia, e-mail, cada telefone, cada WhatsApp, redes sociais, endereço e coordenadas têm checkbox independente. CPF/CNPJ e coordenadas nascem desmarcados, por serem os dados mais sensíveis do cadastro.

</details>

<details>
<summary>🗺️ <b>Endereço oculto continua valendo para a distância</b></summary>

O filtro de raio usa a localização mesmo quando o endereço não aparece na página pública. Quem atende só por encomenda não precisa expor onde mora.

</details>

<details>
<summary>🏷️ <b>Um item pode ter vários tipos</b></summary>

Marcação em checkbox no formato de etiqueta, em vez de select múltiplo, que no celular exige toque com tecla modificadora e trava usuário leigo.

</details>

<details>
<summary>💰 <b>Preço e estoque têm visibilidade independente</b></summary>

Quem trabalha sob encomenda esconde o preço, e a busca passa a mostrar "Preço sob consulta" no lugar do valor.

</details>

<details>
<summary>🇧🇷 <b>Classes e ids em português</b></summary>

`conteiner`, `cartao`, `botao`, `selo`, `lista-enderecos`. O código fala a mesma língua do domínio, o que reduz tradução mental na hora de ler.

</details>

## ♿ Acessibilidade

| Recurso | Como foi feito |
| --- | --- |
| 🏗️ Estrutura | `header`, `main`, `nav`, `section`, `fieldset` e `legend` |
| 🏷️ Formulários | Todo campo com rótulo associado, `autocomplete` e asterisco automático no obrigatório |
| ⌨️ Teclado | Atalho para pular ao conteúdo, foco visível em cor de contraste, `:focus-within` nos cartões |
| 🎨 Contraste | Medido em todos os pares: **AA ou AAA** nos dois temas |
| 👆 Toque | Alvos com 44px de altura mínima |
| 🌓 Temas | Claro e escuro, respeitando a preferência do sistema |
| 🎞️ Movimento | Animações desligadas em `prefers-reduced-motion` |
| 🔆 Alto contraste | Bordas e texto reforçados em `prefers-contrast: more` |

Verificado por script antes de cada entrega: fechamento de tags, âncoras aninhadas, identificadores duplicados, resolução de todos os links internos e ausência de rolagem horizontal em 390px e 1280px. ✅

## 🚧 Fora do escopo desta entrega

| Item | Situação |
| --- | --- |
| ⚙️ **JavaScript** | Subir, Descer, Remover, Adicionar endereço e Usar como capa existem como interface e estado visual, sem comportamento |
| 🔐 **Senha igual à confirmação** | Os dois campos existem, mas HTML não compara um campo com outro. Depende de JS e, obrigatoriamente, do servidor |
| 💾 **Back-end e banco** | Formulários apontam para as telas seguintes, simulando o fluxo |
| 🏢 **Filial** | Adiada. A lista de endereços já abre caminho para ela |
| 🌓 **Lembrar o tema escolhido** | A escolha reinicia a cada página: persistir exige `localStorage` |

## 👨‍💻 Time

<div align="center">

| 🧑‍💻 Desenvolvimento fullstack | 🎓 Mentoria |
| :---: | :---: |
| **Erlan Piovani**<br>**Ângelo Neves** | **Prof. Alex Gonsales** |
| Alunos | Professor orientador |

</div>

<div align="center">

🧶 **Trama Viamão** · IFRS Viamão

*Feito para quem produz perto de você.*

</div>
