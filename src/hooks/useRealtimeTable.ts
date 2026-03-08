import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type RealtimeCallback = () => void;

export function useRealtimeTable(table: string, callback: RealtimeCallback) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback]);
}
