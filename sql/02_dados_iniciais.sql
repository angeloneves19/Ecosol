insert into situacao_empreendimento (id, nome) values
  (1, 'pendente'), (2, 'ativo'), (3, 'pausado'), (4, 'suspenso'), (5, 'recusado'), (6, 'excluido')
on conflict (id) do nothing;

insert into situacao_item (id, nome) values
  (1, 'pendente'), (2, 'disponivel'), (3, 'indisponivel'), (4, 'descontinuado'), (5, 'recusado')
on conflict (id) do nothing;

insert into tipo_usuario (id, nome, descricao) values
  (1, 'administrador', 'Equipe da plataforma'),
  (2, 'empreendimento', 'Pessoa ligada a um empreendimento')
on conflict (id) do nothing;

insert into situacao_usuario (id, nome) values
  (1, 'ativo'), (2, 'inativo')
on conflict (id) do nothing;

insert into natureza_de_item (id, nome) values
  (1, 'produto'), (2, 'servico')
on conflict (id) do nothing;

insert into categoria_de_empreendimento (nome, descricao)
select * from (values
  ('Autônomo', 'Pessoa que trabalha por conta própria'),
  ('Pessoa física', 'Cadastro no CPF'),
  ('Pessoa jurídica', 'Cadastro no CNPJ'),
  ('Microempresa', 'ME ou MEI'),
  ('Egresso IFRS', 'Formado pelo IFRS Viamão'),
  ('Cooperativa', 'Grupo organizado em cooperativa'),
  ('Informal', 'Grupo sem registro formal')
) as novas(nome, descricao)
where not exists (select 1 from categoria_de_empreendimento c where c.nome = novas.nome);

insert into tipo_de_item (id_natureza, nome)
select * from (values
  (1, 'Alimento'), (1, 'Bebida'), (1, 'Comida'), (1, 'Roupa'),
  (1, 'Ferramenta'), (1, 'Artesanato'), (1, 'Higiene e limpeza'),
  (2, 'Avulso'), (2, 'Locação'), (2, 'Assinatura'), (2, 'Reserva'),
  (2, 'Agendamento'), (2, 'Instalação'), (2, 'Licença'), (2, 'Consultoria'), (2, 'Aula')
) as novos(id_natureza, nome)
where not exists (
  select 1 from tipo_de_item t where t.id_natureza = novos.id_natureza and t.nome = novos.nome
);
