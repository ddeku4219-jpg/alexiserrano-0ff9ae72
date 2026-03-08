import { Play, BookOpen, MessageCircle, Gamepad2, Newspaper, Music } from "lucide-react";

interface QuickLinksProps {
  onNavigate: (url: string) => void;
  isLoading: boolean;
}

const sites = [
  { name: "YouTube", url: "https://www.youtube.com", icon: Play, color: "text-red-400" },
  { name: "Wikipedia", url: "https://www.wikipedia.org", icon: BookOpen, color: "text-blue-400" },
  { name: "Reddit", url: "https://old.reddit.com", icon: MessageCircle, color: "text-orange-400" },
  { name: "CoolMathGames", url: "https://www.coolmathgames.com", icon: Gamepad2, color: "text-yellow-400" },
  { name: "CNN", url: "https://lite.cnn.com", icon: Newspaper, color: "text-sky-400" },
  { name: "SoundCloud", url: "https://soundcloud.com", icon: Music, color: "text-pink-400" },
];

const QuickLinks = ({ onNavigate, isLoading }: QuickLinksProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 max-w-lg mx-auto">
      {sites.map((site) => {
        const Icon = site.icon;
        return (
          <button
            key={site.name}
            onClick={() => onNavigate(site.url)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-all duration-200 font-mono text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 group"
          >
            <Icon className={`w-3.5 h-3.5 ${site.color} group-hover:scale-110 transition-transform`} />
            {site.name}
          </button>
        );
      })}
    </div>
  );
};

export default QuickLinks;
