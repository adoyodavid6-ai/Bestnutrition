-- =============================================================================
-- NourishWell — PostgreSQL schema (Supabase-compatible)
--
-- Status: designed and reviewed, NOT yet connected to the app. The current release
-- keeps personal data on-device (see docs/ARCHITECTURE.md). Apply this schema when
-- accounts are introduced, then swap the storage adapter in src/lib/storage.ts.
--
-- Principles:
--   * Row Level Security on every table holding user or unpublished data.
--   * Health information is sensitive: minimal collection, owner-only access,
--     never exposed via public views, URLs or analytics.
--   * Editorial content keeps author, reviewer, review dates, references and history.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------- Enums ----------
create type content_status as enum ('draft', 'in_review', 'approved', 'published', 'needs_update', 'archived');
create type user_role as enum ('member', 'editor', 'clinical_reviewer', 'moderator', 'admin');
create type allergen as enum ('gluten', 'dairy', 'egg', 'fish', 'shellfish', 'peanut', 'tree_nut', 'soy', 'sesame');
create type meal_slot as enum ('breakfast', 'lunch', 'dinner', 'supper', 'snack');
create type verification_status as enum ('unverified', 'pending', 'verified', 'suspended');
create type listing_tier as enum ('basic', 'premium');
create type nutrition_data_status as enum ('estimate', 'proxy_estimate', 'verified_measurement');

-- ---------- Helpers ----------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- Users ----------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  role user_role not null default 'member',
  region text not null default 'GLOBAL',        -- ISO 3166-1 alpha-2 or GLOBAL
  locale text not null default 'en',
  currency char(3) not null default 'USD',
  units text not null default 'metric' check (units in ('metric', 'us')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function is_staff(roles user_role[]) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = any(roles));
$$;

-- Planner preferences. Health-related fields are optional and owner-only.
create table user_preferences (
  user_id uuid primary key references profiles (id) on delete cascade,
  household_size smallint not null default 2 check (household_size between 1 and 12),
  diet text not null default 'any' check (diet in ('any', 'vegetarian', 'vegan', 'pescatarian')),
  avoid_allergens allergen[] not null default '{}',
  disliked_ingredient_ids text[] not null default '{}',
  pantry_ingredient_ids text[] not null default '{}',
  max_minutes smallint not null default 60,
  budget_level smallint not null default 2 check (budget_level between 1 and 3),
  preferred_regions text[] not null default '{}',
  goals text[] not null default '{}',
  notify_plan_reminders boolean not null default false,
  updated_at timestamptz not null default now()
);

create table consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade,
  purpose text not null check (purpose in ('analytics', 'newsletter', 'marketing', 'terms', 'privacy_policy')),
  granted boolean not null,
  policy_version text not null,
  created_at timestamptz not null default now()
);
create index on consent_records (user_id, purpose, created_at desc);

-- ---------- Evidence & editorial ----------
create table evidence_references (
  id text primary key,                          -- e.g. 'who-healthy-diet'
  title text not null,
  publisher text not null,
  url text not null check (url ~ '^https://'),
  published_or_updated text,
  kind text not null,
  last_checked_at date,
  created_at timestamptz not null default now()
);

create table content_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('recipe', 'nutrition_article', 'condition_guide', 'supplement_guide', 'fitness_guide')),
  slug text not null,
  title text not null,
  summary text not null,
  body jsonb not null,                          -- structured sections, validated in the app layer
  status content_status not null default 'draft',
  requires_clinical_review boolean not null default false,
  author_id uuid references profiles (id),
  seo_title text,
  seo_description text check (char_length(seo_description) <= 170),
  tags text[] not null default '{}',
  published_at timestamptz,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, slug)
);
create index on content_items (kind, status);
create trigger content_items_updated before update on content_items for each row execute function set_updated_at();

create table content_references (
  content_id uuid references content_items (id) on delete cascade,
  reference_id text references evidence_references (id),
  claim text,                                   -- the statement the source supports
  primary key (content_id, reference_id)
);

-- A review can only be recorded by a user with the clinical_reviewer role.
create table content_reviews (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references content_items (id) on delete cascade,
  reviewer_id uuid not null references profiles (id),
  reviewer_credential text not null,
  outcome text not null check (outcome in ('approved', 'changes_requested', 'rejected')),
  notes text,
  reviewed_at timestamptz not null default now()
);
create index on content_reviews (content_id, reviewed_at desc);

create table content_revisions (
  id bigserial primary key,
  content_id uuid not null references content_items (id) on delete cascade,
  editor_id uuid references profiles (id),
  change_summary text not null,
  is_correction boolean not null default false,  -- shown publicly as a correction note
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------- Ingredients, recipes & nutrition ----------
create table ingredients (
  id text primary key,                          -- e.g. 'maize-flour'
  name text not null,
  alt_names text[] not null default '{}',
  category text not null,
  allergens allergen[] not null default '{}',
  animal_origin text,
  cost_level smallint not null check (cost_level between 1 and 3),
  created_at timestamptz not null default now()
);

create table ingredient_nutrients (
  ingredient_id text primary key references ingredients (id) on delete cascade,
  kcal numeric(7,2) not null, protein_g numeric(7,2) not null, carbs_g numeric(7,2) not null,
  fat_g numeric(7,2) not null, sat_fat_g numeric(7,2) not null, fiber_g numeric(7,2) not null, sodium_mg numeric(9,2) not null,
  source_database text not null,                -- e.g. 'USDA FoodData Central'
  source_description text not null,
  source_id text,                               -- e.g. FDC ID
  proxy_note text,
  data_status nutrition_data_status not null default 'estimate',
  verified_at date
);

create table recipes (
  content_id uuid primary key references content_items (id) on delete cascade,
  cuisine text not null,
  region text not null,
  prep_min smallint not null, cook_min smallint not null, rest_min smallint,
  difficulty text not null check (difficulty in ('easy', 'moderate', 'involved')),
  servings smallint not null check (servings > 0),
  categories text[] not null,
  methods text[] not null default '{}',
  equipment text[] not null default '{}',
  steps text[] not null check (cardinality(steps) > 0),
  storage text not null,
  food_safety text,
  photo_url text, photo_alt text, photo_credit text,
  kitchen_tested_at date
);

create table recipe_ingredients (
  recipe_id uuid references recipes (content_id) on delete cascade,
  position smallint not null,
  ingredient_id text not null references ingredients (id),
  qty numeric(8,2) not null check (qty > 0),
  unit text not null,
  grams numeric(8,2) not null check (grams >= 0),
  note text,
  optional boolean not null default false,
  primary key (recipe_id, position)
);
create index on recipe_ingredients (ingredient_id);

create table recipe_substitutions (
  recipe_id uuid references recipes (content_id) on delete cascade,
  swap text not null, replacement text not null, note text
);

-- ---------- Saved items, plans & shopping ----------
create table saved_items (
  user_id uuid references profiles (id) on delete cascade,
  content_id uuid references content_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create table meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null check (char_length(name) <= 60),
  week_start date,
  is_template boolean not null default false,
  prefs_snapshot jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on meal_plans (user_id, created_at desc);
create trigger meal_plans_updated before update on meal_plans for each row execute function set_updated_at();

create table meal_entries (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references meal_plans (id) on delete cascade,
  day_index smallint not null check (day_index between 0 and 6),
  slot meal_slot not null,
  recipe_id uuid references recipes (content_id) on delete set null,
  custom_title text check (char_length(custom_title) <= 80),
  servings smallint not null check (servings between 1 and 24),
  prepared boolean not null default false,
  check (recipe_id is not null or custom_title is not null)
);
create index on meal_entries (plan_id, day_index);

create table shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  plan_id uuid references meal_plans (id) on delete set null,
  currency char(3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table shopping_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references shopping_lists (id) on delete cascade,
  ingredient_id text references ingredients (id),
  name text not null,
  qty numeric(10,2) not null check (qty >= 0),
  unit text not null,
  category text not null,
  checked boolean not null default false,
  custom boolean not null default false,
  user_price numeric(12,2) check (user_price >= 0),   -- user-entered only; never pre-filled
  source_recipes text[] not null default '{}'
);
create index on shopping_items (list_id);

-- ---------- Professionals & businesses ----------
create table professionals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles (id),
  slug text unique not null,
  name text not null,
  profession text not null,
  bio text not null,
  specialties text[] not null default '{}',
  languages text[] not null default '{}',
  locations jsonb not null default '[]',
  remote boolean not null default false,
  website text, booking_url text,
  verification verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table professional_credentials (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals (id) on delete cascade,
  issuing_body text not null,
  registration_number text not null,
  verified_by uuid references profiles (id),
  verified_at timestamptz,
  expires_at date
);

create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles (id),
  slug text unique not null,
  name text not null,
  category text not null,
  description text not null,
  services text[] not null default '{}',
  service_areas text[] not null default '{}',
  languages text[] not null default '{}',
  price_info text,
  website text,
  social jsonb not null default '[]',
  contact_email text,
  logo_url text,
  verification verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table listings (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references professionals (id) on delete cascade,
  business_id uuid references businesses (id) on delete cascade,
  tier listing_tier not null default 'basic',
  promoted boolean not null default false,       -- must be labelled "Promoted" wherever shown
  starts_at timestamptz, ends_at timestamptz,
  check ((professional_id is null) <> (business_id is null))
);

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  from_user_id uuid references profiles (id) on delete set null,
  name text not null, email text not null,
  message text not null check (char_length(message) <= 3000),
  preferred_times text,
  status text not null default 'new' check (status in ('new', 'responded', 'closed', 'spam')),
  created_at timestamptz not null default now()
);

create table listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings (id) on delete cascade,
  content_id uuid references content_items (id) on delete cascade,
  reporter_email text,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  created_at timestamptz not null default now()
);

-- ---------- Subscriptions ----------
create table subscription_plans (
  id text primary key,                           -- 'free' | 'premium'
  name text not null,
  active boolean not null default false
);

create table plan_prices (
  plan_id text references subscription_plans (id),
  currency char(3) not null,
  interval text not null check (interval in ('month', 'year')),
  amount_minor integer not null check (amount_minor >= 0),
  provider_price_id text,
  primary key (plan_id, currency, interval)
);

create table plan_entitlements (
  plan_id text references subscription_plans (id) on delete cascade,
  feature text not null,
  limit_value integer,
  primary key (plan_id, feature)
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  plan_id text not null references subscription_plans (id),
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  provider text, provider_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now()
);
create index on subscriptions (user_id, status);

create table payment_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete set null,
  subscription_id uuid references subscriptions (id) on delete set null,
  provider text not null, provider_payment_id text unique not null,
  amount_minor integer not null, currency char(3) not null,
  status text not null, receipt_url text,
  created_at timestamptz not null default now()
);

-- Server-side entitlement check: use from route handlers / RPC, never trust the client.
create or replace function has_entitlement(feature_name text) returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from plan_entitlements e
    where e.feature = feature_name
      and e.plan_id = coalesce(
        (select s.plan_id from subscriptions s where s.user_id = auth.uid() and s.status in ('active', 'trialing') order by s.created_at desc limit 1),
        'free')
  );
$$;

-- ---------- Audit ----------
create table audit_logs (
  id bigserial primary key,
  actor_id uuid references profiles (id) on delete set null,
  action text not null,                          -- e.g. 'content.publish', 'listing.verify'
  entity text not null, entity_id text not null,
  details jsonb not null default '{}',           -- never store health data here
  created_at timestamptz not null default now()
);
create index on audit_logs (entity, entity_id, created_at desc);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table profiles enable row level security;
alter table user_preferences enable row level security;
alter table consent_records enable row level security;
alter table saved_items enable row level security;
alter table meal_plans enable row level security;
alter table meal_entries enable row level security;
alter table shopping_lists enable row level security;
alter table shopping_items enable row level security;
alter table subscriptions enable row level security;
alter table payment_records enable row level security;
alter table content_items enable row level security;
alter table content_reviews enable row level security;
alter table content_revisions enable row level security;
alter table professionals enable row level security;
alter table professional_credentials enable row level security;
alter table businesses enable row level security;
alter table listings enable row level security;
alter table inquiries enable row level security;
alter table listing_reports enable row level security;
alter table audit_logs enable row level security;

-- Owner-only personal data
create policy "own profile" on profiles for all using (id = auth.uid()) with check (id = auth.uid() and role = 'member');
create policy "staff read profiles" on profiles for select using (is_staff(array['admin']::user_role[]));
create policy "own prefs" on user_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own consents" on consent_records for select using (user_id = auth.uid());
create policy "insert own consents" on consent_records for insert with check (user_id = auth.uid());
create policy "own saved" on saved_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own plans" on meal_plans for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own entries" on meal_entries for all
  using (exists (select 1 from meal_plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from meal_plans p where p.id = plan_id and p.user_id = auth.uid()));
create policy "own lists" on shopping_lists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own items" on shopping_items for all
  using (exists (select 1 from shopping_lists l where l.id = list_id and l.user_id = auth.uid()))
  with check (exists (select 1 from shopping_lists l where l.id = list_id and l.user_id = auth.uid()));
create policy "own subscriptions" on subscriptions for select using (user_id = auth.uid());
create policy "own payments" on payment_records for select using (user_id = auth.uid());
-- subscriptions/payments are written only by the service role from verified provider webhooks.

-- Editorial content: public sees published only; staff manage.
create policy "public published content" on content_items for select using (status = 'published');
create policy "staff read content" on content_items for select using (is_staff(array['editor', 'clinical_reviewer', 'admin']::user_role[]));
create policy "editors write content" on content_items for insert with check (is_staff(array['editor', 'admin']::user_role[]));
create policy "editors update content" on content_items for update using (is_staff(array['editor', 'admin']::user_role[]));
create policy "reviewers record reviews" on content_reviews for insert with check (reviewer_id = auth.uid() and is_staff(array['clinical_reviewer']::user_role[]));
create policy "public read reviews of published" on content_reviews for select using (exists (select 1 from content_items c where c.id = content_id and c.status = 'published'));
create policy "staff revisions" on content_revisions for all using (is_staff(array['editor', 'admin']::user_role[]));

-- Directory: public sees verified only; owners see their own; moderators manage.
create policy "public verified professionals" on professionals for select using (verification = 'verified');
create policy "owner professionals" on professionals for select using (owner_id = auth.uid());
create policy "moderate professionals" on professionals for all using (is_staff(array['moderator', 'admin']::user_role[]));
create policy "public verified credentials" on professional_credentials for select using (exists (select 1 from professionals p where p.id = professional_id and p.verification = 'verified'));
create policy "moderate credentials" on professional_credentials for all using (is_staff(array['moderator', 'admin']::user_role[]));
create policy "public verified businesses" on businesses for select using (verification = 'verified');
create policy "owner businesses" on businesses for select using (owner_id = auth.uid());
create policy "moderate businesses" on businesses for all using (is_staff(array['moderator', 'admin']::user_role[]));
create policy "public listings" on listings for select using (true);
create policy "moderate listings" on listings for all using (is_staff(array['moderator', 'admin']::user_role[]));
create policy "send inquiry" on inquiries for insert with check (true);
create policy "listing owner reads inquiries" on inquiries for select using (
  exists (select 1 from listings l left join professionals p on p.id = l.professional_id left join businesses b on b.id = l.business_id
          where l.id = listing_id and (p.owner_id = auth.uid() or b.owner_id = auth.uid())));
create policy "file report" on listing_reports for insert with check (true);
create policy "moderate reports" on listing_reports for all using (is_staff(array['moderator', 'admin']::user_role[]));
create policy "admin audit" on audit_logs for select using (is_staff(array['admin']::user_role[]));

-- Recipe detail tables inherit visibility from their parent content item.
alter table recipes enable row level security;
alter table recipe_ingredients enable row level security;
alter table recipe_substitutions enable row level security;
alter table content_references enable row level security;
create policy "published recipes" on recipes for select using (exists (select 1 from content_items c where c.id = content_id and (c.status = 'published' or is_staff(array['editor', 'clinical_reviewer', 'admin']::user_role[]))));
create policy "published recipe ingredients" on recipe_ingredients for select using (exists (select 1 from content_items c where c.id = recipe_id and (c.status = 'published' or is_staff(array['editor', 'clinical_reviewer', 'admin']::user_role[]))));
create policy "published substitutions" on recipe_substitutions for select using (exists (select 1 from content_items c where c.id = recipe_id and (c.status = 'published' or is_staff(array['editor', 'clinical_reviewer', 'admin']::user_role[]))));
create policy "published content references" on content_references for select using (exists (select 1 from content_items c where c.id = content_id and (c.status = 'published' or is_staff(array['editor', 'clinical_reviewer', 'admin']::user_role[]))));
create policy "editors manage recipes" on recipes for all using (is_staff(array['editor', 'admin']::user_role[]));
create policy "editors manage recipe ingredients" on recipe_ingredients for all using (is_staff(array['editor', 'admin']::user_role[]));
create policy "editors manage substitutions" on recipe_substitutions for all using (is_staff(array['editor', 'admin']::user_role[]));
create policy "editors manage content references" on content_references for all using (is_staff(array['editor', 'admin']::user_role[]));

-- Pure reference data is public read-only; writes via the service role only.
grant select on evidence_references, ingredients, ingredient_nutrients, subscription_plans, plan_prices, plan_entitlements to anon, authenticated;

-- Retention: delete inactive accounts' plans/lists per policy; audit logs kept 24 months.
-- Implement with scheduled jobs (pg_cron) once retention periods are confirmed by legal review.
