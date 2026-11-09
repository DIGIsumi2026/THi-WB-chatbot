-- THi catalog schema. Backend service credentials only; no anonymous access.
CREATE TABLE IF NOT EXISTS public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_item_no integer UNIQUE NOT NULL CHECK (catalog_item_no > 0),
    brand text NOT NULL,
    category text NOT NULL,
    name text NOT NULL,
    model text,
    product_code text,
    specifications text NOT NULL DEFAULT '',
    tags text[] NOT NULL DEFAULT '{}',
    search_text text NOT NULL DEFAULT '',
    source_page integer,
    image_url text,
    price_lkr numeric(12,2) CHECK (price_lkr IS NULL OR price_lkr >= 0),
    price_verified_at timestamptz,
    availability_status text NOT NULL DEFAULT 'unverified'
      CHECK (availability_status IN ('unverified','in_stock','limited','out_of_stock')),
    stock_quantity integer CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_thi_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_thi_products_model ON public.products (lower(model));
CREATE INDEX IF NOT EXISTS idx_thi_products_search ON public.products USING gin (to_tsvector('simple', search_text));
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.products FROM anon, authenticated;

-- Returns a ranked list for natural terms such as 'bluetooth speaker' or exact models such as 'D220'.
CREATE OR REPLACE FUNCTION public.search_catalog(
  query_text text,
  result_limit integer DEFAULT 5,
  result_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid, catalog_item_no integer, name text, brand text, category text,
  model text, product_code text, specifications text, image_url text,
  price_lkr numeric, price_verified_at timestamptz,
  availability_status text, source_page integer
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH query_input AS (
    SELECT lower(btrim(coalesce(query_text,''))) AS q,
           websearch_to_tsquery('simple', btrim(coalesce(query_text,''))) AS tsq
  ), ranked AS (
    SELECT p.*,
      CASE WHEN lower(coalesce(p.model,'')) = q.q THEN 1000 ELSE 0 END +
      CASE WHEN lower(coalesce(p.product_code,'')) = q.q THEN 900 ELSE 0 END +
      CASE WHEN lower(p.name) = q.q THEN 200 ELSE 0 END +
      CASE WHEN lower(p.name) LIKE '%' || q.q || '%' THEN 90 ELSE 0 END +
      CASE WHEN lower(p.category) LIKE '%' || q.q || '%' THEN 40 ELSE 0 END +
      10 * ts_rank(to_tsvector('simple', p.search_text), q.tsq) AS relevance
    FROM public.products p CROSS JOIN query_input q
    WHERE p.is_active AND length(q.q) > 1 AND (
      to_tsvector('simple', p.search_text) @@ q.tsq OR
      lower(coalesce(p.model,'')) = q.q OR
      lower(coalesce(p.product_code,'')) = q.q OR
      lower(p.name) LIKE '%' || q.q || '%'
    )
  )
  SELECT p.id, p.catalog_item_no, p.name, p.brand, p.category,
         p.model, p.product_code, p.specifications, p.image_url,
         p.price_lkr, p.price_verified_at, p.availability_status, p.source_page
  FROM ranked p
  ORDER BY p.relevance DESC, p.catalog_item_no ASC
  LIMIT least(greatest(coalesce(result_limit,5),1),10)
  OFFSET least(greatest(coalesce(result_offset,0),0),500);
$$;
REVOKE ALL ON FUNCTION public.search_catalog(text,integer,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_catalog(text,integer,integer) TO service_role;

-- After import check: SELECT count(*) FROM public.products;  -- expect 86 on a new project
