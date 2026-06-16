-- Alter table to update status constraint
alter table public.orders drop constraint if exists orders_status_check;

alter table public.orders add constraint orders_status_check 
  check (status in ('pending', 'confirmed', 'completed', 'cancelled'));

-- Function to restore stock when an order is cancelled
create or replace function public.restore_stock_on_cancel()
returns trigger as $$
declare
  v_item record;
begin
  -- Only act if status changes to 'cancelled' and the previous status wasn't 'cancelled'
  if (new.status = 'cancelled' and (old.status is null or old.status <> 'cancelled')) then
    for v_item in 
      select product_id, quantity 
      from public.order_items 
      where order_id = new.id
    loop
      if v_item.product_id is not null then
        update public.products
        set stock = stock + v_item.quantity
        where id = v_item.product_id;
      end if;
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute the function on order status update
drop trigger if exists on_order_cancelled on public.orders;
create trigger on_order_cancelled
  after update of status on public.orders
  for each row
  execute function public.restore_stock_on_cancel();
