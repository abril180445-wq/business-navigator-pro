import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Contabilidade from "@/pages/Contabilidade";
import Pedidos from "@/pages/Pedidos";
import ModulePlaceholder from "@/pages/ModulePlaceholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contabilidade" element={<Contabilidade />} />
            <Route path="/contabilidade/*" element={<Contabilidade />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/pedidos/*" element={<Pedidos />} />
            <Route path="/manufatura/*" element={<ModulePlaceholder />} />
            <Route path="/manufatura" element={<ModulePlaceholder />} />
            <Route path="/ativos" element={<ModulePlaceholder />} />
            <Route path="/projetos" element={<ModulePlaceholder />} />
            <Route path="/rh" element={<ModulePlaceholder />} />
            <Route path="/helpdesk" element={<ModulePlaceholder />} />
            <Route path="/pdv" element={<ModulePlaceholder />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
