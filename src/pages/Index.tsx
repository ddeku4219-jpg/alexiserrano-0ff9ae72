import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ProxyInput from "@/components/ProxyInput";
import ProxyViewer from "@/components/ProxyViewer";
import MatrixRain from "@/components/MatrixRain";
import QuickLinks from "@/components/QuickLinks";
import { Shield } from "lucide-react";

const Index = () => {
  const [proxyResult, setProxyResult] = useState<{ html: string; url: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigateTo = useCallback(async (url: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("proxy-fetch", {
        body: { url },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else if (data?.html) {
        setProxyResult({ html: data.html, url: data.finalUrl });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <MatrixRain />
      <div className="fixed inset-0 scanline pointer-events-none z-10" />

      <div className="relative z-20 w-full max-w-3xl text-center space-y-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2.5 rounded-lg border border-border bg-card neon-border">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight neon-text text-primary">
            PHANTOM<span className="text-foreground">PROXY</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm md:text-base max-w-md mx-auto">
            Browse anything. From anywhere. Undetected.
          </p>
        </div>

        <ProxyInput
          onResult={(html, url) => setProxyResult({ html, url })}
        />

        <QuickLinks onNavigate={navigateTo} isLoading={isLoading} />

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4">
          {[
            { label: "Uptime", value: "99.9%" },
            { label: "Servers", value: "50+" },
            { label: "Latency", value: "<50ms" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-display font-bold text-primary neon-text">
                {stat.value}
              </div>
              <div className="text-xs font-mono text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground/50 font-mono pt-8">
          // no logs · no tracking · no limits
        </p>
      </div>

      {proxyResult && (
        <ProxyViewer
          html={proxyResult.html}
          url={proxyResult.url}
          onClose={() => setProxyResult(null)}
        />
      )}
    </div>
  );
};

export default Index;
