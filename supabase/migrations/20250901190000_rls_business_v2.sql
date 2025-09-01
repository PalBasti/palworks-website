-- Restrictive, tenant-aware RLS for business v2

-- Helper: extract email from JWT
create or replace function public.jwt_email() returns text
language sql stable as $$
  select coalesce((current_setting('request.jwt.claims', true)::jsonb ->> 'email'),'');
$$;

-- Helper: detect service_role
create or replace function public.is_service_role() returns boolean
language sql stable as $$
  select coalesce((current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role', false);
$$;

-- Helper: check membership for a company_id
create or replace function public.is_company_member(target_company_id uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from public.company_users cu
    where cu.company_id = target_company_id
      and lower(cu.email) = lower(public.jwt_email())
  );
$$;

-- Ensure RLS is enabled
alter table public.companies enable row level security;
alter table public.business_contracts enable row level security;
alter table public.contract_templates enable row level security;
alter table public.company_users enable row level security;
alter table public.bulk_orders enable row level security;

-- Drop permissive bootstrap policies if they exist
do $$ begin
  execute 'drop policy if exists "Service role can manage companies" on public.companies';
  execute 'drop policy if exists "Service role can manage business_contracts" on public.business_contracts';
  execute 'drop policy if exists "Service role can manage contract_templates" on public.contract_templates';
  execute 'drop policy if exists "Service role can manage company_users" on public.company_users';
  execute 'drop policy if exists "Service role can manage bulk_orders" on public.bulk_orders';
end $$;

-- Companies
create policy "companies_select"
  on public.companies
  for select
  using (
    public.is_service_role() or public.is_company_member(id)
  );

create policy "companies_update"
  on public.companies
  for update
  using (
    public.is_service_role() or public.is_company_member(id)
  ) with check (
    public.is_service_role() or public.is_company_member(id)
  );

create policy "companies_delete"
  on public.companies
  for delete
  using (
    public.is_service_role() or public.is_company_member(id)
  );

-- Only service role can insert new companies by default
create policy "companies_insert_service"
  on public.companies
  for insert
  with check (public.is_service_role());

-- Company Users
create policy "company_users_select"
  on public.company_users
  for select
  using (
    public.is_service_role() or public.is_company_member(company_id)
  );

-- Manage company_users via service role only (admins could be added later)
create policy "company_users_modify_service"
  on public.company_users
  for all
  using (public.is_service_role()) with check (public.is_service_role());

-- Business Contracts
create policy "business_contracts_select"
  on public.business_contracts
  for select
  using (
    public.is_service_role() or public.is_company_member(company_id)
  );

create policy "business_contracts_modify"
  on public.business_contracts
  for all
  using (
    public.is_service_role() or public.is_company_member(company_id)
  ) with check (
    public.is_service_role() or public.is_company_member(company_id)
  );

-- Contract Templates: anyone can read active templates; modify via service role
create policy "contract_templates_select_active"
  on public.contract_templates
  for select
  using (
    public.is_service_role() or (is_active = true)
  );

create policy "contract_templates_modify_service"
  on public.contract_templates
  for all
  using (public.is_service_role()) with check (public.is_service_role());

-- Bulk Orders
create policy "bulk_orders_select"
  on public.bulk_orders
  for select
  using (
    public.is_service_role() or public.is_company_member(company_id)
  );

create policy "bulk_orders_modify"
  on public.bulk_orders
  for all
  using (
    public.is_service_role() or public.is_company_member(company_id)
  ) with check (
    public.is_service_role() or public.is_company_member(company_id)
  );
