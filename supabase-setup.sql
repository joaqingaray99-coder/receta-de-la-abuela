-- =========================================================
-- Ejecutar esto en Supabase: Project > SQL Editor > New query
-- Crea la tabla donde se guardan los accesos de compradores
-- =========================================================

create table compradores (
  email text primary key,
  password_hash text not null,
  created_at timestamp with time zone default now()
);

alter table compradores enable row level security;

-- Permite que la app (con la clave pública/anon) pueda
-- registrar nuevos compradores y verificar el login.
create policy "Permitir insertar/actualizar compradores"
  on compradores for insert
  with check (true);

create policy "Permitir actualizar compradores"
  on compradores for update
  using (true);

create policy "Permitir leer compradores para el login"
  on compradores for select
  using (true);

-- =========================================================
-- Tabla de favoritos: cada usuario puede guardar remedios
-- =========================================================

create table favoritos (
  email text not null,
  item_name text not null,
  created_at timestamp with time zone default now(),
  primary key (email, item_name)
);

alter table favoritos enable row level security;

create policy "Permitir gestionar favoritos"
  on favoritos for all
  using (true)
  with check (true);
