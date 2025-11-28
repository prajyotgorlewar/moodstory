import { Search } from "lucide-react";

export const MagnifyingGlassIcon = () => (
  <div className="w-12 h-12 flex items-center justify-center">
    <div className="relative w-10 h-10 animate-magnify-search">
      <Search className="w-full h-full text-purple-500" strokeWidth={1.5} />
      <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden">
        <div className="w-8 h-2 bg-white/50 rotate-45 animate-magnify-glint"></div>
      </div>
    </div>
  </div>
);