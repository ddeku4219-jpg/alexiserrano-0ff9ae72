import { useState, useRef, useCallback, useEffect } from "react";
import { X, ExternalLink, ArrowLeft, ArrowRight, RotateCw, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProxyViewerProps {
  proxyUrl: string;
  targetUrl: string;
  onClose: () => void;
}

const ProxyViewer = ({ proxyUrl, targetUrl, onClose }: ProxyViewerProps) => {
  const [currentProxyUrl, setCurrentProxyUrl] = useState(proxyUrl);
  const [currentTargetUrl, setCurrentTargetUrl] = useState(targetUrl);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigateTo = useCallback(async (url: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("proxy-fetch", {
        body: { url },
      });
      if (error) throw error;
      if (data?.proxyUrl) {
        setCurrentProxyUrl(data.proxyUrl);
        setCurrentTargetUrl(data.targetUrl);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load page");
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-card border-b border-border">
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            if (iframeRef.current) {
              try { iframeRef.current.contentWindow?.history.back(); } catch {}
            }
          }}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            if (iframeRef.current) {
              try { iframeRef.current.contentWindow?.history.forward(); } catch {}
            }
          }}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          title="Forward"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            setIsLoading(true);
            if (iframeRef.current) {
              iframeRef.current.src = currentProxyUrl;
            }
          }}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          title="Reload"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>

        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          title="Home"
        >
          <Home className="w-4 h-4" />
        </button>

        <div className="flex-1 px-3 py-1.5 bg-secondary rounded-md font-mono text-xs text-secondary-foreground truncate mx-1">
          {isLoading ? "Loading..." : currentTargetUrl}
        </div>

        <a
          href={currentTargetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          title="Open in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Loading bar */}
      {isLoading && (
        <div className="h-0.5 w-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary animate-pulse w-2/3" />
        </div>
      )}

      {/* Content - using src instead of srcDoc so JS executes */}
      <iframe
        ref={iframeRef}
        src={currentProxyUrl}
        className="flex-1 w-full bg-white"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-presentation"
        title="Proxied content"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default ProxyViewer;
