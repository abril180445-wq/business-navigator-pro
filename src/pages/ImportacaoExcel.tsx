import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface ImportedRow {
  [key: string]: string | number;
}

export default function ImportacaoExcel() {
  const { toast } = useToast();
  const [data, setData] = useState<ImportedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast({ title: "Formato inválido", description: "Use arquivos .xlsx, .xls ou .csv", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ImportedRow>(sheet);

        if (jsonData.length === 0) {
          toast({ title: "Planilha vazia", description: "Nenhum dado encontrado.", variant: "destructive" });
          return;
        }

        const cols = Object.keys(jsonData[0]);
        setHeaders(cols);
        setData(jsonData);
        setFileName(file.name);
        toast({ title: "Arquivo importado!", description: `${jsonData.length} registros de "${file.name}"` });
      } catch {
        toast({ title: "Erro ao ler arquivo", description: "Verifique se o arquivo é válido.", variant: "destructive" });
      }
    };
    reader.readAsBinaryString(file);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const clearData = () => {
    setData([]);
    setHeaders([]);
    setFileName("");
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Data", "Categoria", "Descrição", "Valor", "Responsável"],
      ["01/01/2025", "Vendas", "Exemplo de venda", 10000, "João"],
      ["02/01/2025", "Compras", "Exemplo de compra", -5000, "Maria"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");
    XLSX.writeFile(wb, "modelo_importacao_sanremo.xlsx");
    toast({ title: "Modelo baixado!", description: "Preencha e importe o arquivo." });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Importação de Dados</h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">Importe dados de planilhas Excel ou CSV</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate} className="font-sans">
          <Download className="w-4 h-4 mr-2" /> Baixar Modelo
        </Button>
      </div>

      {/* Upload area */}
      {data.length === 0 ? (
        <Card className="erp-card-shadow">
          <CardContent className="p-0">
            <label
              className={`flex flex-col items-center justify-center p-12 cursor-pointer border-2 border-dashed rounded-lg transition-colors ${
                dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="p-4 rounded-full bg-accent/10 mb-4">
                <Upload className="w-8 h-8 text-accent" />
              </div>
              <p className="text-base font-semibold text-foreground font-sans">
                Arraste sua planilha aqui
              </p>
              <p className="text-sm text-muted-foreground mt-1 font-sans">
                ou clique para selecionar um arquivo .xlsx, .xls ou .csv
              </p>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileInput} className="hidden" />
            </label>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* File info */}
          <Card className="erp-card-shadow border-l-4 border-l-success">
            <CardContent className="p-4 flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-success shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground font-sans truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground font-sans">
                  {data.length} registros · {headers.length} colunas
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearData} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Data preview */}
          <Card className="erp-card-shadow">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" /> Dados Importados
              </CardTitle>
              <Button className="bg-accent text-accent-foreground hover:bg-gold-dark font-sans font-semibold">
                Salvar no Sistema
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">#</th>
                      {headers.map((h) => (
                        <th key={h} className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 50).map((row, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-3 text-muted-foreground text-xs">{i + 1}</td>
                        {headers.map((h) => (
                          <td key={h} className="py-2 px-3 text-foreground text-xs max-w-[200px] truncate">
                            {String(row[h] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 50 && (
                  <div className="py-3 text-center">
                    <p className="text-xs text-muted-foreground font-sans flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Exibindo 50 de {data.length} registros
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
