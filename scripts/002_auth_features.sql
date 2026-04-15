-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS has_password BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS two_factor_recovery_codes TEXT[],
ADD COLUMN IF NOT EXISTS last_password_reset TIMESTAMPTZ;

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create two_factor_sessions table
CREATE TABLE IF NOT EXISTS public.two_factor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on password_reset_tokens
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "password_reset_tokens_self_insert" ON public.password_reset_tokens
  FOR INSERT WITH CHECK (true);

CREATE POLICY "password_reset_tokens_self_select" ON public.password_reset_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Enable RLS on two_factor_sessions
ALTER TABLE public.two_factor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "two_factor_sessions_self_insert" ON public.two_factor_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "two_factor_sessions_self_select" ON public.two_factor_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_two_factor_sessions_user_id ON public.two_factor_sessions(user_id);
