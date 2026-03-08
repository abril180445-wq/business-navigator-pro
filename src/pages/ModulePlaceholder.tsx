import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

const moduleNames: Record<string, string> = {
  "/manufatura": "Engenharia",
  "/ativos": "Patrimônio",
  "/projetos": "Projetos de Obra",
  "/rh": "Recursos Humanos",
  "/helpdesk": "Suporte",
  "/pdv": "Logística",
};

export default function ModulePlaceholder() {
  const location = useLocation();
  const basePath = "/" + location.pathname.split("/")[1];
  const name = moduleNames[basePath] || "Módulo";

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="pbi-tile max-w-md w-full text-center p-10">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "hsl(var(--pbi-yellow) / 0.1)" }}>
          <Construction className="w-7 h-7" style={{ color: "hsl(var(--pbi-yellow))" }} />
        </div>
        <h2 className="text-lg font-bold text-foreground">{name}</h2>
        <p className="text-[12px] mt-2 text-muted-foreground">
          Este módulo está em desenvolvimento. Em breve você terá acesso completo a todas as funcionalidades.
        </p>
        <div className="mt-4 h-1.5 rounded-full overflow-hidden bg-secondary">
          <div className="h-full rounded-full w-1/3" style={{ background: "hsl(var(--pbi-yellow))" }} />
        </div>
        <p className="text-[10px] mt-2 text-muted-foreground">Em progresso...</p>
      </div>
    </div>
  );
}
