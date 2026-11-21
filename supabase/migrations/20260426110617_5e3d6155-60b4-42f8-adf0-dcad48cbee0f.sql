UPDATE public.products
SET price = 25000,
    updated_at = now()
WHERE collection = 'takeoff'
  AND price IS DISTINCT FROM 25000;