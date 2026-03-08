import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeSQL(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) {
    return `ARRAY[${val.map(v => `'${String(v).replace(/'/g, "''")}'`).join(",")}]::text[]`;
  }
  if (typeof val === "object") {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

function generateTableSQL(tableName: string, rows: any[]): string {
  if (!rows || rows.length === 0) return `-- Table ${tableName}: no data\n`;
  const columns = Object.keys(rows[0]);
  const lines: string[] = [];
  lines.push(`-- Table: public.${tableName} (${rows.length} rows)`);
  for (const row of rows) {
    const vals = columns.map(col => escapeSQL(row[col]));
    lines.push(
      `INSERT INTO public.${tableName} (${columns.join(", ")}) VALUES (${vals.join(", ")}) ON CONFLICT (id) DO UPDATE SET ${columns.filter(c => c !== "id").map(c => `${c} = EXCLUDED.${c}`).join(", ")};`
    );
  }
  lines.push(``);
  return lines.join("\n");
}

// Tables grouped by scope
const SYSTEM_TABLES = ["profiles", "user_roles"];
const DATA_TABLES = ["metas", "acoes_meta", "meta_checkins", "relatorios_gerados"];

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
      const { data: profiles } = await adminClient.from("profiles").select("*");
      const { data: userRoles } = await adminClient.from("user_roles").select("*");
      const { data: metas } = await adminClient.from("metas").select("*");
      const { data: acoesMeta } = await adminClient.from("acoes_meta").select("*");
      const { data: metaCheckins } = await adminClient.from("meta_checkins").select("*");
      const { data: relatoriosGerados } = await adminClient.from("relatorios_gerados").select("*");
      const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });

      const sqlParts: string[] = [];
      sqlParts.push(`-- SAN REMO ERP — Database Backup (SQL)`);
      sqlParts.push(`-- Generated: ${new Date().toISOString()}`);
      sqlParts.push(`-- By: ${caller.email}`);
      sqlParts.push(`BEGIN;`);
      sqlParts.push(generateTableSQL("profiles", profiles || []));
      sqlParts.push(generateTableSQL("user_roles", userRoles || []));
      sqlParts.push(generateTableSQL("metas", metas || []));
      sqlParts.push(generateTableSQL("acoes_meta", acoesMeta || []));
      sqlParts.push(generateTableSQL("meta_checkins", metaCheckins || []));
      sqlParts.push(generateTableSQL("relatorios_gerados", relatoriosGerados || []));
      sqlParts.push(`COMMIT;`);

      const backup = {
        version: "3.0",
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
            id: u.id, email: u.email, user_metadata: u.user_metadata, created_at: u.created_at,
          })) || [],
        },
        sql_dump: sqlParts.join("\n"),
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
      });

    } else if (action === "import") {
      const backupData = body.backup;
      if (!backupData?.data) throw new Error("Invalid backup format");

      // scope: "system" | "database" | "all" (default "all")
      const scope: string = body.scope || "all";

      const restored: Record<string, number> = {};

      const upsertTable = async (name: string, rows: any[]) => {
        if (!rows || rows.length === 0) return;
        restored[name] = 0;
        for (const row of rows) {
          await adminClient.from(name).upsert(row, { onConflict: "id" });
          restored[name]++;
        }
      };

      // System tables: profiles + user_roles
      if (scope === "system" || scope === "all") {
        await upsertTable("profiles", backupData.data.profiles);
        await upsertTable("user_roles", backupData.data.user_roles);
      }

      // Data tables: metas, acoes_meta, meta_checkins, relatorios_gerados
      if (scope === "database" || scope === "all") {
        await upsertTable("metas", backupData.data.metas);
        await upsertTable("acoes_meta", backupData.data.acoes_meta);
        await upsertTable("meta_checkins", backupData.data.meta_checkins);
        await upsertTable("relatorios_gerados", backupData.data.relatorios_gerados);
      }

      return new Response(JSON.stringify({ success: true, scope, restored }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
