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

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) throw new Error("Not authenticated");
    const { data: isAdmin } = await callerClient.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    if (!isAdmin) throw new Error("Not authorized — admin only");

    const body = await req.json();
    const action = body.action; // "export" or "import"

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    if (action === "export") {
      // Export all tables
      const { data: profiles } = await adminClient.from("profiles").select("*");
      const { data: userRoles } = await adminClient.from("user_roles").select("*");

      // Get all users from auth
      const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });

      const backup = {
        version: "1.0",
        created_at: new Date().toISOString(),
        created_by: caller.email,
        data: {
          profiles: profiles || [],
          user_roles: userRoles || [],
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
        },
      };

      return new Response(JSON.stringify(backup, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === "import") {
      const backupData = body.backup;
      if (!backupData?.data) throw new Error("Invalid backup format");

      let restored = { profiles: 0, user_roles: 0 };

      // Restore profiles
      if (backupData.data.profiles?.length > 0) {
        for (const profile of backupData.data.profiles) {
          await adminClient.from("profiles").upsert(profile, { onConflict: "id" });
          restored.profiles++;
        }
      }

      // Restore user_roles
      if (backupData.data.user_roles?.length > 0) {
        for (const role of backupData.data.user_roles) {
          await adminClient.from("user_roles").upsert(role, { onConflict: "id" });
          restored.user_roles++;
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
