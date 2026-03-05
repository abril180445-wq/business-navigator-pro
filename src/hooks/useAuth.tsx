import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshAuth: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadAuthState(session: Session | null) {
  const user = session?.user ?? null;

  if (!user) {
    return {
      user: null,
      session,
      profile: null,
      isAdmin: false,
    };
  }

  const [{ data: profile }, { data: isAdmin, error: roleError }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
  ]);

  if (roleError) {
    throw roleError;
  }

  return {
    user,
    session,
    profile: profile ?? null,
    isAdmin: Boolean(isAdmin),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const authState = await loadAuthState(data.session);
    setSession(authState.session);
    setUser(authState.user);
    setProfile(authState.profile);
    setIsAdmin(authState.isAdmin);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      loadAuthState(nextSession)
        .then((authState) => {
          if (!mounted) return;
          setSession(authState.session);
          setUser(authState.user);
          setProfile(authState.profile);
          setIsAdmin(authState.isAdmin);
          setLoading(false);
        })
        .catch(() => {
          if (!mounted) return;
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
        });
    });

    supabase.auth.getSession().then(({ data }) => {
      loadAuthState(data.session)
        .then((authState) => {
          if (!mounted) return;
          setSession(authState.session);
          setUser(authState.user);
          setProfile(authState.profile);
          setIsAdmin(authState.isAdmin);
          setLoading(false);
        })
        .catch(() => {
          if (!mounted) return;
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
        });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      isAdmin,
      loading,
      refreshAuth,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [user, session, profile, isAdmin, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
