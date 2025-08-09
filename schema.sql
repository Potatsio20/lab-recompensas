create schema if not exists rewards;
set search_path to rewards, public;

-- Pacientes
create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique check (phone ~ '^[0-9]{10}$'),
  first_name text not null,
  last_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Transacciones
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  folio text,
  subtotal numeric(12,2) not null,
  discount numeric(12,2) default 0,
  total numeric(12,2) generated always as (subtotal - discount) stored,
  source text default 'mostrador',
  created_by uuid,
  created_at timestamptz default now()
);

-- Reglas de acumulación (solo una activa)
create table if not exists accrual_rules (
  id serial primary key,
  name text not null,
  percent numeric(5,2) not null check (percent >= 0),
  is_active boolean default true,
  starts_at timestamptz default now(),
  ends_at timestamptz
);

-- Movimientos de puntos
create table if not exists point_ledger (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  transaction_id uuid references transactions(id) on delete set null,
  type text not null check (type in ('earn','redeem','adjust')),
  points numeric(12,2) not null, -- earn/adjust positivos; redeem negativos
  reason text,
  created_by uuid,
  created_at timestamptz default now()
);

-- Vista de saldos
create or replace view v_patient_points as
select p.id as patient_id,
       p.phone,
       coalesce(sum(
         case when l.type='earn' then l.points
              when l.type='redeem' then -l.points
              when l.type='adjust' then l.points
              else 0 end
       ),0) as balance
from patients p
left join point_ledger l on l.patient_id = p.id
group by p.id, p.phone;

-- Trigger updated_at
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

create or replace trigger trg_patients_updated
before update on patients
for each row execute function set_updated_at();

-- Semilla: regla 10%
insert into accrual_rules (name, percent, is_active)
select 'Regla base 10%', 10, true
where not exists (select 1 from accrual_rules);

-- RLS básico
alter table patients enable row level security;
alter table transactions enable row level security;
alter table accrual_rules enable row level security;
alter table point_ledger enable row level security;

-- Políticas simplificadas para MVP (staff autenticado)
create policy staff_all_patients on patients
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy staff_all_tx on transactions
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy staff_all_rules on accrual_rules
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy staff_all_ledger on point_ledger
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
