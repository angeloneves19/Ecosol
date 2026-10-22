drop policy if exists item_tipo_leitura on item_tipo_de_item;
create policy item_tipo_leitura on item_tipo_de_item
  for select using (
    exists (
      select 1 from item i
      where i.id = id_item
        and (i.id_situacao in (2, 3) or meu_empreendimento(i.id_empreendimento) or e_administrador())
    )
  );

drop policy if exists item_tipo_dono on item_tipo_de_item;
create policy item_tipo_dono on item_tipo_de_item
  for all using (
    exists (select 1 from item i where i.id = id_item and meu_empreendimento(i.id_empreendimento))
  ) with check (
    exists (select 1 from item i where i.id = id_item and meu_empreendimento(i.id_empreendimento))
  );

drop policy if exists foto_item_leitura on foto_item;
create policy foto_item_leitura on foto_item
  for select using (
    exists (
      select 1 from item i
      where i.id = id_item
        and (i.id_situacao in (2, 3) or meu_empreendimento(i.id_empreendimento) or e_administrador())
    )
  );

drop policy if exists foto_item_dono on foto_item;
create policy foto_item_dono on foto_item
  for all using (
    exists (select 1 from item i where i.id = id_item and meu_empreendimento(i.id_empreendimento))
  ) with check (
    exists (select 1 from item i where i.id = id_item and meu_empreendimento(i.id_empreendimento))
  );

drop policy if exists foto_emp_leitura on foto_empreendimento;
create policy foto_emp_leitura on foto_empreendimento
  for select using (
    exists (
      select 1 from empreendimento e
      where e.id = id_empreendimento and (e.id_situacao = 2 or meu_empreendimento(e.id) or e_administrador())
    )
  );

drop policy if exists foto_emp_dono on foto_empreendimento;
create policy foto_emp_dono on foto_empreendimento
  for all using (meu_empreendimento(id_empreendimento))
  with check (meu_empreendimento(id_empreendimento));