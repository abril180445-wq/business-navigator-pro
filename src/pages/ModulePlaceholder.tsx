import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

const moduleNames: Record<string, string> = {
  "/manufatura": "Manufatura",
  "/ativos": "Gestão de Ativos",
  "/projetos": "Projetos",
  "/rh": "Recursos Humanos",
  "/helpdesk": "Helpdesk",
  "/pdv": "Ponto de Venda",
};

export default function ModulePlaceholder() {
  const location = useLocation();
  const basePath = "/" + location.pathname.split("/")[1];
  const name = moduleNames[basePath] || "Módulo";

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="erp-card-shadow max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mx-auto">
            <Construction className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{name}</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Este módulo está em desenvolvimento. Em breve você terá acesso completo a todas as funcionalidades.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
