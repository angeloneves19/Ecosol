create or replace function public.cadastrar_empreendimento(dados jsonb)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth    uuid := auth.uid();
  v_email   text := (select email from auth.users where id = v_auth);
  v_usuario int;
  v_empreendimento int;
  v_endereco jsonb;
  v_seq int := 0;
begin
  if v_auth is null then
    raise exception 'Precisa estar autenticado para cadastrar';
  end if;

  select id into v_usuario from usuario where auth_id = v_auth;

  if v_usuario is null then
    insert into usuario (auth_id, id_tipo, id_situacao, email, senha_hash, nome)
    values (v_auth, 2, 1, v_email, 'gerenciado-pelo-supabase-auth', dados->>'usuario_nome')
    returning id into v_usuario;
  end if;

  if exists (select 1 from usuario_empreendimento where id_usuario = v_usuario) then
    raise exception 'Este acesso ja esta vinculado a um empreendimento';
  end if;

  insert into empreendimento (
    id_categoria, id_situacao, nome, nome_fantasia, nome_fantasia_visivel,
    razao_social, descricao, email, email_visivel,
    cpf, cpf_visivel, cnpj, cnpj_visivel,
    telefone1, telefone1_visivel, telefone2, telefone2_visivel, telefone3, telefone3_visivel,
    whatsapp1, whatsapp1_visivel, whatsapp2, whatsapp2_visivel, whatsapp3, whatsapp3_visivel,
    site, site_visivel, facebook, facebook_visivel, instagram, instagram_visivel
  ) values (
    (dados->>'id_categoria')::int, 1, dados->>'nome', nullif(dados->>'nome_fantasia', ''),
    coalesce((dados->>'nome_fantasia_visivel')::boolean, true),
    nullif(dados->>'razao_social', ''), nullif(dados->>'descricao', ''), v_email,
    coalesce((dados->>'email_visivel')::boolean, true),
    nullif(dados->>'cpf', ''), coalesce((dados->>'documento_visivel')::boolean, false),
    nullif(dados->>'cnpj', ''), coalesce((dados->>'documento_visivel')::boolean, false),
    dados->>'telefone1', coalesce((dados->>'telefone1_visivel')::boolean, true),
    nullif(dados->>'telefone2', ''), coalesce((dados->>'telefone2_visivel')::boolean, true),
    nullif(dados->>'telefone3', ''), coalesce((dados->>'telefone3_visivel')::boolean, true),
    nullif(dados->>'whatsapp1', ''), coalesce((dados->>'whatsapp1_visivel')::boolean, true),
    nullif(dados->>'whatsapp2', ''), coalesce((dados->>'whatsapp2_visivel')::boolean, true),
    nullif(dados->>'whatsapp3', ''), coalesce((dados->>'whatsapp3_visivel')::boolean, true),
    nullif(dados->>'site', ''), coalesce((dados->>'site_visivel')::boolean, true),
    nullif(dados->>'facebook', ''), coalesce((dados->>'facebook_visivel')::boolean, true),
    nullif(dados->>'instagram', ''), coalesce((dados->>'instagram_visivel')::boolean, true)
  )
  returning id into v_empreendimento;

  insert into usuario_empreendimento (id_usuario, id_tipo, id_empreendimento)
  values (v_usuario, 2, v_empreendimento);

  for v_endereco in select * from jsonb_array_elements(dados->'enderecos')
  loop
    v_seq := v_seq + 1;
    insert into endereco (
      id_empreendimento, seq, rua, numero, complemento, bairro, cidade, uf, cep,
      latitude, longitude, visivel, coordenadas_visivel
    ) values (
      v_empreendimento, v_seq,
      v_endereco->>'rua', v_endereco->>'numero', nullif(v_endereco->>'complemento', ''),
      nullif(v_endereco->>'bairro', ''), v_endereco->>'cidade', v_endereco->>'uf',
      regexp_replace(v_endereco->>'cep', '\D', '', 'g'),
      (nullif(v_endereco->>'latitude', ''))::decimal,
      (nullif(v_endereco->>'longitude', ''))::decimal,
      coalesce((v_endereco->>'visivel')::boolean, true),
      coalesce((v_endereco->>'coordenadas_visivel')::boolean, false)
    );
  end loop;

  return v_empreendimento;
end;
$$;

revoke all on function public.cadastrar_empreendimento(jsonb) from public;
grant execute on function public.cadastrar_empreendimento(jsonb) to authenticated;
