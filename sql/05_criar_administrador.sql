/*
  Antes de rodar:
  1. No painel do Supabase, va em Authentication > Users > Add user
  2. Crie o usuario com o e-mail do administrador e marque "Auto Confirm User"
  3. Troque o e-mail abaixo pelo que voce criou e rode este arquivo
*/

do $$
declare
  v_email text := 'admin@tramaviamao.com';
  v_nome  text := 'Equipe Trama Viamao';
  v_auth  uuid;
  v_usuario int;
begin
  select id into v_auth from auth.users where email = v_email;

  if v_auth is null then
    raise exception 'Nao achei % em auth.users. Crie o usuario em Authentication > Users primeiro.', v_email;
  end if;

  select id into v_usuario from usuario where auth_id = v_auth;

  if v_usuario is null then
    insert into usuario (auth_id, id_tipo, id_situacao, email, senha_hash, nome)
    values (v_auth, 1, 1, v_email, 'gerenciado-pelo-supabase-auth', v_nome)
    returning id into v_usuario;
  else
    update usuario set id_tipo = 1 where id = v_usuario;
  end if;

  insert into administrador (id_usuario, id_tipo, fone)
  values (v_usuario, 1, null)
  on conflict (id_usuario) do nothing;

  raise notice 'Administrador pronto: usuario %', v_usuario;
end $$;
