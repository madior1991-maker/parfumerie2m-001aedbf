DROP POLICY IF EXISTS "Product images are publicly viewable" ON storage.objects;

CREATE POLICY "Public product images are viewable"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = 'public'
);