import { createClient } from "@supabase/supabase-js";

// Estos dos valores se configuran como variables de entorno en Vercel
// (Project Settings > Environment Variables), no se escriben acá directamente.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Convierte la contraseña en un hash (no se guarda nunca en texto plano).
export async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
