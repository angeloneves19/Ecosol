/*
  Antes de rodar este arquivo:
  1. Storage → New bucket → nome: fotos-empreendimento → marque "Public bucket" → Create
  2. Storage → New bucket → nome: fotos-item → marque "Public bucket" → Create

  Bucket público = leitura livre (fotos aparecem no site sem autenticação).
  As políticas abaixo controlam apenas quem pode ENVIAR, SUBSTITUIR e APAGAR.
*/

create policy "emp_enviar_foto_emp"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'fotos-empreendimento'
  and public.meu_empreendimento((storage.foldername(name))[1]::int)
);

create policy "emp_substituir_foto_emp"
on storage.objects for update
to authenticated
using (
  bucket_id = 'fotos-empreendimento'
  and public.meu_empreendimento((storage.foldername(name))[1]::int)
);

create policy "emp_apagar_foto_emp"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'fotos-empreendimento'
  and (
    public.meu_empreendimento((storage.foldername(name))[1]::int)
    or public.e_administrador()
  )
);

create policy "emp_enviar_foto_item"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'fotos-item'
  and public.meu_empreendimento((storage.foldername(name))[1]::int)
);

create policy "emp_substituir_foto_item"
on storage.objects for update
to authenticated
using (
  bucket_id = 'fotos-item'
  and public.meu_empreendimento((storage.foldername(name))[1]::int)
);

create policy "emp_apagar_foto_item"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'fotos-item'
  and (
    public.meu_empreendimento((storage.foldername(name))[1]::int)
    or public.e_administrador()
  )
);