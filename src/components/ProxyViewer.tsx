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
  const [currentTargetUrl, setCurrentTargetUrl] = useState(targetUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<{ proxyUrl: string; targetUrl: string }[]>([{ proxyUrl, targetUrl }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load HTML via fetch (with auth) then write into iframe document
  const loadUrl = useCallback(async (pUrl: string, tUrl: string, addToHistory = true) => {
    setIsLoading(true);
    try {
      // Fetch the proxied page via the proxy URL (GET mode)
      const response = await fetch(pUrl, {
        headers: {
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ""}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();

      if (addToHistory) {
        const newHistory = [...history.slice(0, historyIndex + 1), { proxyUrl: pUrl, targetUrl: tUrl }];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }

      setCurrentTargetUrl(tUrl);

      // Write HTML directly into iframe document so JS executes
      const iframe = iframeRef.current;
      if (iframe) {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load page");
    } finally {
      setIsLoading(false);
    }
  }, [history, historyIndex]);

  // Initial load
  useEffect(() => {
    loadUrl(proxyUrl, targetUrl, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for navigation messages from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "proxy-navigate" && e.data.url) {
        loadUrl(e.data.url, e.data.targetUrl || e.data.url);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [loadUrl]);

  const goBack = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      loadUrl(prev.proxyUrl, prev.targetUrl, false);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      loadUrl(next.proxyUrl, next.targetUrl, false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-card border-b border-border">
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Close">
          <X className="w-4 h-4" />
        </button>
        <button onClick={goBack} disabled={historyIndex <= 0} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30" title="Back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button onClick={goForward} disabled={historyIndex >= history.length - 1} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30" title="Forward">
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={() => loadUrl(history[historyIndex].proxyUrl, history[historyIndex].targetUrl, false)} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Reload">
          <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Home">
          <Home className="w-4 h-4" />
        </button>
        <div className="flex-1 px-3 py-1.5 bg-secondary rounded-md font-mono text-xs text-secondary-foreground truncate mx-1">
          {isLoading ? "Loading..." : currentTargetUrl}
        </div>
        <a href={currentTargetUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Open in new tab">
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Loading bar */}
      {isLoading && (
        <div className="h-0.5 w-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary animate-pulse w-2/3" />
        </div>
      )}

      {/* Content iframe - blank initially, written to via document.write */}
      <iframe
        ref={iframeRef}
        className="flex-1 w-full bg-white"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-presentation"
        title="Proxied content"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default ProxyViewer;
