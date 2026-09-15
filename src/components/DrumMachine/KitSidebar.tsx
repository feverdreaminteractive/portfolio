import { DRUM_KITS } from './tracks';

interface KitSidebarProps {
  selectedKitId: string;
  onSelectKit: (kitId: string) => void;
  isLoadingKit: boolean;
}

export function KitSidebar({ selectedKitId, onSelectKit, isLoadingKit }: KitSidebarProps) {
  return (
    <div className="w-full sm:w-48 shrink-0">
      <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Kit</h2>
      <div className="flex sm:flex-col gap-2">
        {DRUM_KITS.map((kit) => {
          const isSelected = kit.id === selectedKitId;
          return (
            <button
              key={kit.id}
              type="button"
              onClick={() => onSelectKit(kit.id)}
              className={[
                'text-left rounded-lg px-3 py-2 border transition-colors flex-1 sm:flex-none',
                isSelected
                  ? 'bg-purple-500/20 border-purple-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20',
              ].join(' ')}
            >
              <div className="text-sm font-medium flex items-center gap-2">
                {kit.label}
                {isSelected && isLoadingKit && (
                  <span className="text-[10px] text-gray-400 font-normal">loading…</span>
                )}
              </div>
              <div className="text-xs text-gray-500 hidden sm:block">{kit.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
