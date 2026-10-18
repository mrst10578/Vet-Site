-- PetCare phase 1 relational foundation for PostgreSQL 16+.
-- Run with an isolated migration role. Never expose database credentials to the browser.
BEGIN;

CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 120),
  phone_e164 text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE species_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name text NOT NULL UNIQUE,
  scientific_name text,
  is_reference_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- No closed species enum: users may create pets of any species, and the
-- verified catalogue can expand independently of schema migrations.

CREATE TABLE pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_owner_id uuid NOT NULL REFERENCES accounts(id),
  species_id uuid REFERENCES species_catalog(id),
  species_label text NOT NULL CHECK (char_length(species_label) BETWEEN 2 AND 80),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  breed text,
  sex text NOT NULL DEFAULT 'unknown' CHECK (sex IN ('female','male','unknown')),
  birth_date date,
  microchip_identifier text,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
CREATE INDEX pets_owner_idx ON pets(primary_owner_id);

CREATE TABLE clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name text NOT NULL,
  license_reference text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE clinic_memberships (
  clinic_id uuid NOT NULL REFERENCES clinics(id),
  account_id uuid NOT NULL REFERENCES accounts(id),
  role text NOT NULL CHECK (role IN ('clinic_admin','veterinarian','reception')),
  verified_at timestamptz,
  PRIMARY KEY (clinic_id, account_id)
);

CREATE TABLE pet_guardians (
  pet_id uuid NOT NULL REFERENCES pets(id),
  account_id uuid NOT NULL REFERENCES accounts(id),
  role text NOT NULL CHECK (role IN ('co_owner','family','sitter')),
  access_expires_at timestamptz,
  revoked_at timestamptz,
  PRIMARY KEY (pet_id, account_id)
);

CREATE TABLE clinic_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id),
  clinic_id uuid NOT NULL REFERENCES clinics(id),
  granted_by_account_id uuid NOT NULL REFERENCES accounts(id),
  scope text NOT NULL CHECK (scope IN ('read_summary','read_records','treatment')),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX clinic_grants_active_idx ON clinic_access_grants(pet_id, clinic_id) WHERE revoked_at IS NULL;

CREATE TABLE encounters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id),
  clinic_id uuid NOT NULL REFERENCES clinics(id),
  veterinarian_id uuid NOT NULL REFERENCES accounts(id),
  occurred_at timestamptz NOT NULL,
  chief_complaint text,
  clinical_notes text,
  assessment text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX encounters_pet_time_idx ON encounters(pet_id, occurred_at DESC);

CREATE TABLE medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  form text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id uuid NOT NULL REFERENCES encounters(id),
  medication_id uuid NOT NULL REFERENCES medications(id),
  dose_amount numeric(12, 4) NOT NULL CHECK (dose_amount > 0),
  dose_unit text NOT NULL,
  route text,
  administration_instructions text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_at IS NULL OR end_at > start_at)
);
CREATE TABLE medication_doses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES prescriptions(id),
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','taken','skipped','delayed')),
  recorded_by_account_id uuid REFERENCES accounts(id),
  recorded_at timestamptz,
  UNIQUE (prescription_id, scheduled_for)
);
CREATE INDEX medication_doses_due_idx ON medication_doses(scheduled_for) WHERE status = 'scheduled';

CREATE TABLE vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id),
  clinic_id uuid REFERENCES clinics(id),
  recorded_by_account_id uuid NOT NULL REFERENCES accounts(id),
  vaccine_name text NOT NULL,
  administered_at date,
  next_due_at date,
  batch_number text,
  certificate_object_key text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vaccinations_pet_idx ON vaccinations(pet_id, next_due_at);

CREATE TABLE care_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id),
  author_account_id uuid NOT NULL REFERENCES accounts(id),
  clinic_id uuid REFERENCES clinics(id),
  title text NOT NULL,
  instructions text,
  starts_on date NOT NULL,
  ends_on date,
  CHECK (ends_on IS NULL OR ends_on >= starts_on)
);
CREATE TABLE care_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id uuid NOT NULL REFERENCES care_plans(id),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('feeding','exercise','hygiene','follow_up','other')),
  due_at timestamptz NOT NULL,
  completed_at timestamptz,
  completed_by_account_id uuid REFERENCES accounts(id)
);
CREATE INDEX care_tasks_due_idx ON care_tasks(due_at) WHERE completed_at IS NULL;

CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id),
  author_account_id uuid NOT NULL REFERENCES accounts(id),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  appetite text,
  energy text,
  water_intake_note text,
  elimination_note text,
  symptom_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX journal_pet_time_idx ON journal_entries(pet_id, occurred_at DESC);

CREATE TABLE medical_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id),
  encounter_id uuid REFERENCES encounters(id),
  uploaded_by_account_id uuid NOT NULL REFERENCES accounts(id),
  object_key text NOT NULL UNIQUE,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  original_filename text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id bigserial PRIMARY KEY,
  actor_account_id uuid REFERENCES accounts(id),
  event_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_resource_idx ON audit_events(resource_type, resource_id, occurred_at DESC);

COMMIT;

-- Security requirement (not implemented by this schema alone):
-- Backend services must verify owner/guardian/clinic grants on every read/write,
-- verify clinician membership on clinical writes, and use short-lived file URLs.
-- Add RLS policies or a strictly isolated backend database role before production.
-- Protect audit log against modification and use encrypted backups/retention policy.
