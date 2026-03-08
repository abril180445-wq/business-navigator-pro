import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization")!;
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) throw new Error("Not authenticated");
    const { data: isAdmin } = await callerClient.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    if (!isAdmin) throw new Error("Not authorized — admin only");

    const body = await req.json();
    const action = body.action;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    if (action === "export") {
      // Export ALL tables
      const { data: profiles } = await adminClient.from("profiles").select("*");
      const { data: userRoles } = await adminClient.from("user_roles").select("*");
      const { data: metas } = await adminClient.from("metas").select("*");
      const { data: acoesMeta } = await adminClient.from("acoes_meta").select("*");
      const { data: metaCheckins } = await adminClient.from("meta_checkins").select("*");
      const { data: relatoriosGerados } = await adminClient.from("relatorios_gerados").select("*");

      // Get all users from auth
      const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });

      const backup = {
        version: "2.0",
        created_at: new Date().toISOString(),
        created_by: caller.email,
        data: {
          profiles: profiles || [],
          user_roles: userRoles || [],
          metas: metas || [],
          acoes_meta: acoesMeta || [],
          meta_checkins: metaCheckins || [],
          relatorios_gerados: relatoriosGerados || [],
          auth_users: users?.map(u => ({
            id: u.id,
            email: u.email,
            user_metadata: u.user_metadata,
            created_at: u.created_at,
          })) || [],
        },
        metadata: {
          total_profiles: profiles?.length || 0,
          total_roles: userRoles?.length || 0,
          total_users: users?.length || 0,
          total_metas: metas?.length || 0,
          total_acoes: acoesMeta?.length || 0,
          total_checkins: metaCheckins?.length || 0,
          total_relatorios: relatoriosGerados?.length || 0,
        },
      };

      return new Response(JSON.stringify(backup, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === "import") {
      const backupData = body.backup;
      if (!backupData?.data) throw new Error("Invalid backup format");

      const restored: Record<string, number> = {
        profiles: 0, user_roles: 0, metas: 0, acoes_meta: 0, meta_checkins: 0, relatorios_gerados: 0,
      };

      // Restore in order (respecting foreign keys): profiles → user_roles → metas → acoes_meta → meta_checkins → relatorios_gerados
      if (backupData.data.profiles?.length > 0) {
        for (const row of backupData.data.profiles) {
          await adminClient.from("profiles").upsert(row, { onConflict: "id" });
          restored.profiles++;
        }
      }

      if (backupData.data.user_roles?.length > 0) {
        for (const row of backupData.data.user_roles) {
          await adminClient.from("user_roles").upsert(row, { onConflict: "id" });
          restored.user_roles++;
        }
      }

      if (backupData.data.metas?.length > 0) {
        for (const row of backupData.data.metas) {
          await adminClient.from("metas").upsert(row, { onConflict: "id" });
          restored.metas++;
        }
      }

      if (backupData.data.acoes_meta?.length > 0) {
        for (const row of backupData.data.acoes_meta) {
          await adminClient.from("acoes_meta").upsert(row, { onConflict: "id" });
          restored.acoes_meta++;
        }
      }

      if (backupData.data.meta_checkins?.length > 0) {
        for (const row of backupData.data.meta_checkins) {
          await adminClient.from("meta_checkins").upsert(row, { onConflict: "id" });
          restored.meta_checkins++;
        }
      }

      if (backupData.data.relatorios_gerados?.length > 0) {
        for (const row of backupData.data.relatorios_gerados) {
          await adminClient.from("relatorios_gerados").upsert(row, { onConflict: "id" });
          restored.relatorios_gerados++;
        }
      }

      return new Response(JSON.stringify({ success: true, restored }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else {
      throw new Error("Invalid action. Use 'export' or 'import'.");
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
