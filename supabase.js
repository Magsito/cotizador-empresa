import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://gttiruwfsmutjozdqtdh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0dGlydXdmc211dGpvemRxdGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MDQwMzUsImV4cCI6MjA2ODQ4MDAzNX0.b_ck0shm1LaP3LUhG0kkr1uIa8KvM-xRUAhhk6No7GY"; // 👈 Pega tu clave "anon public" completa aquí

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
