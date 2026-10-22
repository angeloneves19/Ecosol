alter table empreendimento              enable row level security;
alter table endereco                    enable row level security;
alter table foto_empreendimento         enable row level security;
alter table item                        enable row level security;
alter table item_tipo_de_item           enable row level security;
alter table foto_item                   enable row level security;
alter table usuario                     enable row level security;
alter table administrador               enable row level security;
alter table usuario_empreendimento      enable row level security;
alter table categoria_de_empreendimento enable row level security;
alter table situacao_empreendimento     enable row level security;
alter table situacao_item               enable row level security;
alter table natureza_de_item            enable row level security;
alter table tipo_de_item                enable row level security;
alter table tipo_usuario                enable row level security;
alter table situacao_usuario            enable row level security;

create or replace function public.meu_usuario() returns int
language sql stable security definer set search_path = public as $$
  select id from usuario where auth_id = auth.uid();
$$;

create or replace function public.e_administrador() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from administrador where id_usuario = meu_usuario());
$$;

create or replace function public.meu_empreendimento(p_id int) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from usuario_empreendimento
    where id_usuario = meu_usuario() and id_empreendimento = p_id
  );
$$;

drop policy if exists leitura_categoria on categoria_de_empreendimento;
create policy leitura_categoria on categoria_de_empreendimento for select using (true);
drop policy if exists leitura_sit_emp on situacao_empreendimento;
create policy leitura_sit_emp on situacao_empreendimento for select using (true);
drop policy if exists leitura_sit_item on situacao_item;
create policy leitura_sit_item on situacao_item for select using (true);
drop policy if exists leitura_natureza on natureza_de_item;
create policy leitura_natureza on natureza_de_item for select using (true);
drop policy if exists leitura_tipo on tipo_de_item;
create policy leitura_tipo on tipo_de_item for select using (true);

drop policy if exists empreendimento_leitura on empreendimento;
create policy empreendimento_leitura on empreendimento
  for select using (id_situacao = 2 or meu_empreendimento(id) or e_administrador());

drop policy if exists empreendimento_dono on empreendimento;
create policy empreendimento_dono on empreendimento
  for update using (meu_empreendimento(id)) with check (meu_empreendimento(id));

drop policy if exists empreendimento_admin on empreendimento;
create policy empreendimento_admin on empreendimento
  for update using (e_administrador()) with check (e_administrador());

drop policy if exists endereco_leitura on endereco;
create policy endereco_leitura on endereco
  for select using (
    meu_empreendimento(id_empreendimento) or e_administrador()
    or exists (select 1 from empreendimento e where e.id = id_empreendimento and e.id_situacao = 2)
  );

drop policy if exists endereco_dono on endereco;
create policy endereco_dono on endereco
  for all using (meu_empreendimento(id_empreendimento)) with check (meu_empreendimento(id_empreendimento));

drop policy if exists item_leitura on item;
create policy item_leitura on item
  for select using (id_situacao in (2, 3) or meu_empreendimento(id_empreendimento) or e_administrador());

drop policy if exists item_dono on item;
create policy item_dono on item
  for all using (meu_empreendimento(id_empreendimento)) with check (meu_empreendimento(id_empreendimento));

drop policy if exists item_admin on item;
create policy item_admin on item
  for update using (e_administrador()) with check (e_administrador());

drop policy if exists usuario_proprio on usuario;
create policy usuario_proprio on usuario
  for select using (auth_id = auth.uid() or e_administrador());

drop policy if exists vinculo_proprio on usuario_empreendimento;
create policy vinculo_proprio on usuario_empreendimento
  for select using (id_usuario = meu_usuario() or e_administrador());