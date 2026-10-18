-- Apply after 001_initial.sql. Only the API service account may access OTP and session tables.
BEGIN;

CREATE TABLE otp_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164 text NOT NULL,
  code_hmac text NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX otp_challenges_phone_time_idx ON otp_challenges(phone_e164, created_at DESC);
CREATE INDEX otp_challenges_expiration_idx ON otp_challenges(expires_at);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_account_idx ON sessions(account_id, expires_at);
CREATE INDEX sessions_active_idx ON sessions(token_hash) WHERE revoked_at IS NULL;

COMMIT;
