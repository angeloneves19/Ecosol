# Banco de dados

A base roda na conta do Supabase do Ângelo. O esquema de partida é o SQL do
professor, preservado sem nenhuma alteração em `00_esquema_professor.sql`.
Os arquivos seguintes só acrescentam: colunas, índices, políticas e funções.

## Ordem no SQL Editor

1. `00_esquema_professor.sql` — tabelas originais, como ele enviou
2. `01_ajustes.sql` — colunas que a especificação pede e o esquema não tinha, autoincremento nos ids
3. `02_dados_iniciais.sql` — situações, tipos de usuário, naturezas, categorias e tipos de item
4. `03_politicas.sql` — Row Level Security
5. `04_funcao_cadastro.sql` — função `cadastrar_empreendimento`

Do `01` ao `04` podem ser rodados mais de uma vez sem quebrar nada.

## Recomeçar do zero

```sql
drop schema public cascade;
create schema public;
grant usage on schema public to anon, authenticated, service_role;
```

Depois rode os cinco arquivos de novo, na ordem. Apague também os usuários em
Authentication → Users, senão o e-mail fica preso.

## Configurar o acesso

Em `assets/js/supabase.js`, troque `SUPABASE_URL` e `SUPABASE_ANON_KEY` pelos
valores do projeto (Project Settings → API). Em Authentication → Providers →
Email, desligue "Confirm email" enquanto testa.

## O que o 01 acrescenta, e por quê

- `telefone2_visivel`, `telefone3_visivel`, os três `whatsapp*_visivel`,
  `site_visivel`, `facebook_visivel`, `instagram_visivel` e
  `nome_fantasia_visivel`: a especificação marca todos com `#` e as telas têm o
  checkbox, mas não havia onde gravar
- `motivo_situacao` em `empreendimento` e `item`: as telas mostram o motivo da
  recusa e da suspensão
- `descricao` do empreendimento e `criado_em`
- tabela `foto_empreendimento`: só existia `foto_item`, e a especificação pede
  foto de capa do grupo
- `generated always as identity` nos ids: sem isso o id teria que ser inventado
  a cada insert
- `endereco.numero` de `int` para `varchar(20)`, porque existe "120A" e "s/n"
- `usuario.auth_id` apontando para `auth.users`: a senha fica com o Supabase
  Auth, e `senha_hash` recebe um texto fixo indicando isso

Vale mostrar essa lista para o professor. São lacunas reais do modelo, não
preferência de implementação.
