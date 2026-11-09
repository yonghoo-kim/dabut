-- 수입 고정 카테고리에 상여금 추가 (전역 기본값).
insert into public.categories (type, name, connection_id)
select 'income', '상여금', null
where not exists (
  select 1 from public.categories c
  where c.type = 'income' and c.name = '상여금' and c.connection_id is null and c.owner_id is null
);
