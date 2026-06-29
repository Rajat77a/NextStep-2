-- Fix Supabase security lints
-- 1. Fix function_search_path_mutable — lock search_path on SECURITY DEFINER function
-- 2. Fix anon/authenticated SECURITY DEFINER warnings — revoke EXECUTE from public roles
-- 3. Leaked password protection must be enabled in Dashboard: Authentication → Settings → Security → Enable leaked password protection

-- Fix 1 & 2: Recreate function with locked search_path, then revoke public execute
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
