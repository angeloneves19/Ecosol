alter table empreendimento add column if not exists descricao varchar(1000);
alter table empreendimento add column if not exists nome_fantasia_visivel boolean not null default true;
alter table empreendimento add column if not exists telefone2_visivel boolean not null default true;
alter table empreendimento add column if not exists telefone3_visivel boolean not null default true;
alter table empreendimento add column if not exists whatsapp1_visivel boolean not null default true;
alter table empreendimento add column if not exists whatsapp2_visivel boolean not null default true;
alter table empreendimento add column if not exists whatsapp3_visivel boolean not null default true;
alter table empreendimento add column if not exists site_visivel boolean not null default true;
alter table empreendimento add column if not exists facebook_visivel boolean not null default true;
alter table empreendimento add column if not exists instagram_visivel boolean not null default true;
alter table empreendimento add column if not exists motivo_situacao varchar(500);
alter table empreendimento add column if not exists criado_em timestamptz not null default now();

alter table categoria_de_empreendimento add column if not exists descricao varchar(200);

alter table endereco add column if not exists coordenadas_visivel boolean not null default false;
alter table endereco alter column numero type varchar(20);
alter table endereco alter column cep set not null;

alter table item add column if not exists motivo_situacao varchar(500);
alter table item add column if not exists criado_em timestamptz not null default now();
alter table item alter column descricao set not null;

alter table usuario add column if not exists auth_id uuid unique references auth.users(id) on delete cascade;
alter table usuario alter column senha_hash set default 'gerenciado-pelo-supabase-auth';

create table if not exists foto_empreendimento (
  id                int generated always as identity primary key,
  id_empreendimento int not null,
  seq               int not null,
  descricao         varchar(500),
  url_imagem        varchar(255) not null,
  constraint fk_foto_empreendimento foreign key (id_empreendimento) references empreendimento(id) on delete cascade,
  constraint uq_foto_empreendimento_seq unique (id_empreendimento, seq)
);

do $$
declare t record;
begin
  for t in select tabela from (values
      ('categoria_de_empreendimento'), ('empreendimento'), ('endereco'),
      ('tipo_de_item'), ('item'), ('foto_item'), ('usuario')
    ) as v(tabela)
  loop
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t.tabela
        and column_name = 'id' and is_identity = 'YES'
    ) then
      execute format('alter table %I alter column id add generated always as identity', t.tabela);
    end if;
  end loop;
end $$;

create unique index if not exists uq_empreendimento_email on empreendimento (lower(email));
create unique index if not exists uq_usuario_email on usuario (lower(email));
create unique index if not exists uq_endereco_seq on endereco (id_empreendimento, seq);
create index if not exists idx_item_empreendimento on item (id_empreendimento);
create index if not exists idx_item_situacao on item (id_situacao);
create index if not exists idx_endereco_empreendimento on endereco (id_empreendimento);
