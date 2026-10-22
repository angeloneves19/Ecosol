create table categoria_de_empreendimento (
  id int not null primary key,
  nome varchar(50) not null
);

create table situacao_empreendimento (
  id int not null primary key,
  nome varchar(20) not null
);

create table empreendimento (
  id int not null primary key,
  id_categoria  int not null,
  nome          varchar(150) not null,
  nome_fantasia varchar(150),
  razao_social  varchar(150),
  email         varchar(254) not null,
  email_visivel boolean not null,
  cpf           char(11),
  cpf_visivel   boolean not null,
  cnpj          char(14),
  cnpj_visivel  boolean not null,
  telefone1         varchar(15) not null,
  telefone1_visivel boolean not null,
  telefone2 varchar(15),
  telefone3 varchar(15),
  whatsapp1 varchar(15),
  whatsapp2 varchar(15),
  whatsapp3 varchar(15),
  site      varchar(255),
  facebook  varchar(255),
  instagram varchar(255),
  id_situacao int not null,
  constraint fk_empreendimento_categoria foreign key(id_categoria) references categoria_de_empreendimento(id),
  constraint fk_empreendimento_situacao  foreign key(id_situacao)  references situacao_empreendimento(id)
);

create table endereco (
  id                int not null primary key,
  id_empreendimento int not null,
  seq         int not null,
  rua         varchar(150) not null,
  numero      int not null,
  complemento varchar(100),
  bairro      varchar(100),
  cidade      varchar(100) not null,
  uf          char(2) not null,
  cep         char(9),
  latitude    decimal(9,6),
  longitude   decimal(9,6),
  visivel     boolean not null,
  constraint fk_endereco_empreendimento foreign key(id_empreendimento) references empreendimento(id)
);

/*produto e servico*/
create table natureza_de_item (
  id        int not null primary key,
  nome      varchar(20)
);

create table tipo_de_item (
  id          int not null primary key,
  id_natureza int not null,
  nome        varchar(50),
  constraint fk_tipo_de_item_natureza foreign key(id_natureza) references natureza_de_item(id),
  unique (id, id_natureza)
);

create table situacao_item (
  id int not null primary key,
  nome varchar(20) not null
);

create table item (
  id                int not null primary key,
  id_empreendimento int not null,
  id_natureza int not null,
  nome        varchar(100) not null,
  descricao   varchar(500),
  preco_atual decimal(10,2) not null,
  preco_atual_visivel boolean not null,
  estoque     decimal(10,2) not null,
  estoque_visivel boolean not null,
  unidade     varchar(10) not null,
  id_situacao int not null,
  unique     (id, id_natureza),
  constraint fk_item_empreendimento foreign key(id_empreendimento) references empreendimento(id),
  constraint fk_item_natureza       foreign key(id_natureza)       references natureza_de_item(id),
  constraint fk_item_situacao       foreign key(id_situacao)       references situacao_item(id)
);

/* restrição: id_tipo->id_natureza == id_item->id_natureza. */
create table item_tipo_de_item (
  id_item     int not null,
  id_tipo     int not null,
  id_natureza int not null,
  primary key (id_item, id_tipo),
  constraint fk_item_tipo_de_item_item_natureza foreign key (id_item, id_natureza) references item (id, id_natureza),
  constraint fk_item_tipo_de_item_tipo          foreign key (id_tipo, id_natureza) references tipo_de_item(id, id_natureza)
);

create table foto_item (
  id        int not null primary key,
  id_item   int not null,
  descricao varchar(500),
  seq       int not null,
  url_imagem varchar(255) not null,
  constraint fk_foto_item_item foreign key (id_item) references item (id)
);

/*1=adm, 2=emp*/
create table tipo_usuario(
  id   int not null primary key,
  nome varchar(20) not null,
  descricao varchar(200)
);

create table situacao_usuario (
  id   int not null primary key,
  nome varchar(50)
);

create table usuario (
  id          int not null primary key,
  id_tipo     int not null,
  id_situacao int not null,
  email       varchar(255) not null,
  senha_hash  varchar(255) not null,
  nome        varchar(100) not null,
  unique      (id, id_tipo),
  constraint  fk_usuario_tipo     foreign key (id_tipo)     references tipo_usuario(id),
  constraint  fk_usuario_situacao foreign key (id_situacao) references situacao_usuario(id)
);

create table administrador (
  id_usuario int not null primary key,
  id_tipo    int not null default 1,
  fone       varchar(20),
  constraint chk_administrador_tipo CHECK (id_tipo = 1),
  constraint fk_administrador_usuario_tipo foreign key (id_usuario, id_tipo) references usuario(id, id_tipo)
);

create table usuario_empreendimento (
  id_usuario        int not null,
  id_tipo           int not null default 2,
  id_empreendimento int not null,
  primary key (id_usuario, id_empreendimento),
  constraint chk_usuario_empreendimento_tipo CHECK (id_tipo = 2),
  constraint fk_usuario_empreendimento_usu_tipo       foreign key (id_usuario, id_tipo) references usuario(id, id_tipo),
  constraint fk_usuario_empreendimento_empreendimento foreign key (id_empreendimento)   references empreendimento(id)
);
