-- 카페 -> 카페&베이커리. 같은 범위(유형/연결/소유자)에 있는 '베이커리', '빵집' 카테고리도 함께 합친다.
-- 순서: 각 옛 이름마다 (1) 같은 범위에 새 이름이 있으면 거래를 옮기고 옛 행 삭제, (2) 없으면 옛 행 이름을 바꾼다.
do $$
declare
  old_name text;
begin
  foreach old_name in array array['카페', '베이커리', '빵집'] loop
    update public.transactions t
    set category_id = keep.id
    from public.categories old, public.categories keep
    where t.category_id = old.id
      and old.name = old_name
      and keep.name = '카페&베이커리'
      and keep.id <> old.id
      and keep.type = old.type
      and keep.connection_id is not distinct from old.connection_id
      and keep.owner_id is not distinct from old.owner_id;

    delete from public.categories old
    using public.categories keep
    where old.name = old_name
      and keep.name = '카페&베이커리'
      and keep.id <> old.id
      and keep.type = old.type
      and keep.connection_id is not distinct from old.connection_id
      and keep.owner_id is not distinct from old.owner_id;

    update public.categories set name = '카페&베이커리' where name = old_name;
  end loop;
end $$;
