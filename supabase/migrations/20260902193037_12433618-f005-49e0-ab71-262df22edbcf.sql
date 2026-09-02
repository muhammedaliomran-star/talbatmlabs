ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_supplier_id_fkey;
ALTER TABLE public.returns DROP CONSTRAINT IF EXISTS returns_supplier_id_fkey;
ALTER TABLE public.returns DROP CONSTRAINT IF EXISTS returns_order_id_fkey;

ALTER TABLE public.customers ALTER COLUMN id DROP DEFAULT, ALTER COLUMN id TYPE text USING id::text, ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.suppliers ALTER COLUMN id DROP DEFAULT, ALTER COLUMN id TYPE text USING id::text, ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.orders ALTER COLUMN id DROP DEFAULT, ALTER COLUMN id TYPE text USING id::text, ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.returns ALTER COLUMN id DROP DEFAULT, ALTER COLUMN id TYPE text USING id::text, ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.trips ALTER COLUMN id DROP DEFAULT, ALTER COLUMN id TYPE text USING id::text, ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.orders ALTER COLUMN customer_id TYPE text USING customer_id::text;
ALTER TABLE public.orders ALTER COLUMN supplier_id TYPE text USING supplier_id::text;
ALTER TABLE public.returns ALTER COLUMN supplier_id TYPE text USING supplier_id::text;
ALTER TABLE public.returns ALTER COLUMN order_id TYPE text USING order_id::text;