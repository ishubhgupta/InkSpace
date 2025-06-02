import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/database";

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Silently ignore cookie modification errors in contexts where they're not allowed
            console.warn("Cookie modification failed:", error);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch (error) {
            // Silently ignore cookie modification errors in contexts where they're not allowed
            console.warn("Cookie removal failed:", error);
          }
        },
      },
    }
  );
};

// Read-only client that doesn't modify cookies - useful for static pages
export const createReadOnlyClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {
          // No-op for read-only operations
        },
        remove() {
          // No-op for read-only operations
        },
      },
    }
  );
};
