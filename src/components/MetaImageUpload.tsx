import { useState, useRef } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MetaImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
}

export default function MetaImageUpload({ images, onChange, maxImages = 3, folder = "uploads" }: MetaImageUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast({ title: `Máximo de ${maxImages} imagens`, variant: "destructive" });
      return;
    }

    const toUpload = files.slice(0, remaining);
    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || "anon";
      const newUrls: string[] = [];

      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) {
          toast({ title: "Apenas imagens são aceitas", variant: "destructive" });
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast({ title: "Imagem muito grande (máx 5MB)", variant: "destructive" });
          continue;
        }

        const ext = file.name.split(".").pop() || "jpg";
        const path = `${userId}/${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error } = await supabase.storage.from("meta-images").upload(path, file);
        if (error) {
          toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
          continue;
        }

        const { data: urlData } = supabase.storage.from("meta-images").getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
      }

      onChange([...images, ...newUrls]);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {images.map((url, i) => (
          <div key={i} className="relative group w-16 h-16 rounded overflow-hidden" style={{ border: "1px solid hsl(var(--pbi-border))" }}>
            <img src={url} alt={`Imagem ${i + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(i)}
              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "hsl(0, 72%, 51%)", color: "white" }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-16 h-16 rounded flex flex-col items-center justify-center gap-0.5 transition-colors"
            style={{
              border: "2px dashed hsl(var(--pbi-border))",
              color: "hsl(var(--pbi-text-secondary))",
              background: "hsl(var(--pbi-dark))",
            }}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-4 h-4" />
                <span className="text-[8px]">Imagem</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />

      <p className="text-[9px]" style={{ color: "hsl(var(--pbi-text-secondary))" }}>
        {images.length}/{maxImages} imagens (máx 5MB cada)
      </p>
    </div>
  );
}
