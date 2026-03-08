import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import Dashboard from "@/pages/Dashboard";
import Metas from "@/pages/Metas";
import CadastroDados from "@/pages/CadastroDados";
import Relatorios from "@/pages/Relatorios";
import ImportacaoExcel from "@/pages/ImportacaoExcel";
import Contabilidade from "@/pages/Contabilidade";
import Pedidos from "@/pages/Pedidos";
import GerenciarUsuarios from "@/pages/GerenciarUsuarios";
import BackupRestore from "@/pages/BackupRestore";
import ManualUsuario from "@/pages/ManualUsuario";
import ManualAdmin from "@/pages/ManualAdmin";

import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedApp = () => (
  <ProtectedRoute>
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/metas" element={<Metas />} />
        <Route path="/cadastro" element={<CadastroDados />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/importacao" element={<ImportacaoExcel />} />
        <Route path="/contabilidade" element={<Contabilidade />} />
        <Route path="/contabilidade/*" element={<Contabilidade />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/pedidos/*" element={<Pedidos />} />
        <Route path="/usuarios" element={<GerenciarUsuarios />} />
        <Route path="/backup" element={<BackupRestore />} />
        <Route path="/manual" element={<ManualUsuario />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/*" element={<ProtectedApp />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
