/*
  Reforço de segurança — complementa o 03_politicas.sql.

  O que estava faltando:
  - DELETE em empreendimento, usuario_empreendimento e usuario
  - INSERT direto nas tabelas críticas (a função cadastrar_empreendimento usa
    SECURITY DEFINER e bypassa o RLS, então bloquear INSERT direto não afeta
    o fluxo de cadastro)
  - Políticas completas em foto_empreendimento, foto_item e administrador
  - UPDATE em usuario (troca de nome próprio)
*/

-- empreendimento -------------------------------------------------------

drop policy if exists empreendimento_insert_direto on empreendimento;
create policy empreendimento_insert_direto on empreendimento
  for insert with check (false);
  -- A função cadastrar_empreendimento usa SECURITY DEFINER: bypassa essa política.
  -- Bloqueia qualquer insert direto pela chave anon ou authenticated.

drop policy if exists empreendimento_delete on empreendimento;
create policy empreendimento_delete on empreendimento
  for delete using (e_administrador());
  -- Exclusão real pela API só pelo admin. O empreendimento muda situacao para 6 (excluído).

-- usuario --------------------------------------------------------------

drop policy if exists usuario_insert_direto on usuario;
create policy usuario_insert_direto on usuario
  for insert with check (false);

drop policy if exists usuario_update on usuario;
create policy usuario_update on usuario
  for update
  using  (auth_id = auth.uid() or e_administrador())
  with check (auth_id = auth.uid() or e_administrador());

drop policy if exists usuario_delete on usuario;
create policy usuario_delete on usuario
  for delete using (e_administrador());

-- usuario_empreendimento -----------------------------------------------

drop policy if exists vinculo_insert_direto on usuario_empreendimento;
create policy vinculo_insert_direto on usuario_empreendimento
  for insert with check (false);
  -- Vínculo só via cadastrar_empreendimento (SECURITY DEFINER).
  -- Impede que alguém se associe a outro empreendimento pela API.

drop policy if exists vinculo_delete on usuario_empreendimento;
create policy vinculo_delete on usuario_empreendimento
  for delete using (e_administrador());

-- administrador --------------------------------------------------------

drop policy if exists admin_select on administrador;
create policy admin_select on administrador
  for select using (id_usuario = meu_usuario() or e_administrador());

drop policy if exists admin_insert_direto on administrador;
create policy admin_insert_direto on administrador
  for insert with check (false);
  -- Admin só via 05_criar_administrador.sql (SECURITY DEFINER implícito via psql).

drop policy if exists admin_update on administrador;
create policy admin_update on administrador
  for update using (e_administrador()) with check (e_administrador());

drop policy if exists admin_delete on administrador;
create policy admin_delete on administrador
  for delete using (e_administrador());

-- foto_empreendimento --------------------------------------------------

drop policy if exists foto_emp_select on foto_empreendimento;
create policy foto_emp_select on foto_empreendimento
  for select using (
    meu_empreendimento(id_empreendimento)
    or e_administrador()
    or exists (
      select 1 from empreendimento e
      where e.id = id_empreendimento and e.id_situacao = 2
    )
  );

drop policy if exists foto_emp_insert on foto_empreendimento;
create policy foto_emp_insert on foto_empreendimento
  for insert with check (meu_empreendimento(id_empreendimento));

drop policy if exists foto_emp_update on foto_empreendimento;
create policy foto_emp_update on foto_empreendimento
  for update
  using  (meu_empreendimento(id_empreendimento))
  with check (meu_empreendimento(id_empreendimento));

drop policy if exists foto_emp_delete on foto_empreendimento;
create policy foto_emp_delete on foto_empreendimento
  for delete using (
    meu_empreendimento(id_empreendimento) or e_administrador()
  );

-- foto_item ------------------------------------------------------------

drop policy if exists foto_item_select on foto_item;
create policy foto_item_select on foto_item
  for select using (
    exists (
      select 1 from item i
      where i.id = id_item
        and (
          i.id_situacao in (2, 3)
          or meu_empreendimento(i.id_empreendimento)
          or e_administrador()
        )
    )
  );

drop policy if exists foto_item_insert on foto_item;
create policy foto_item_insert on foto_item
  for insert with check (
    exists (
      select 1 from item i
      where i.id = id_item and meu_empreendimento(i.id_empreendimento)
    )
  );

drop policy if exists foto_item_update on foto_item;
create policy foto_item_update on foto_item
  for update using (
    exists (
      select 1 from item i
      where i.id = id_item and meu_empreendimento(i.id_empreendimento)
    )
  );

drop policy if exists foto_item_delete on foto_item;
create policy foto_item_delete on foto_item
  for delete using (
    exists (
      select 1 from item i
      where i.id = id_item
        and (
          meu_empreendimento(i.id_empreendimento)
          or e_administrador()
        )
    )
  );

-- item_tipo_de_item ----------------------------------------------------

drop policy if exists item_tipo_select on item_tipo_de_item;
create policy item_tipo_select on item_tipo_de_item
  for select using (
    exists (
      select 1 from item i
      where i.id = id_item
        and (
          i.id_situacao in (2, 3)
          or meu_empreendimento(i.id_empreendimento)
          or e_administrador()
        )
    )
  );

drop policy if exists item_tipo_insert on item_tipo_de_item;
create policy item_tipo_insert on item_tipo_de_item
  for insert with check (
    exists (
      select 1 from item i
      where i.id = id_item and meu_empreendimento(i.id_empreendimento)
    )
  );

drop policy if exists item_tipo_delete on item_tipo_de_item;
create policy item_tipo_delete on item_tipo_de_item
  for delete using (
    exists (
      select 1 from item i
      where i.id = id_item and meu_empreendimento(i.id_empreendimento)
    )
  );