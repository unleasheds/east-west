import { useStore } from '../../store/useStore';

const ICONS: Record<string, string> = {
  default: 'ℹ️',
  success: '✓',
  error:   '✕',
};

const COLOURS: Record<string, string> = {
  default: 'bg-ink text-white',
  success: 'bg-halal text-white',
  error:   'bg-red-500 text-white',
};

export default function Toast() {
  const { toast } = useStore();

  if (!toast.visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-1/2 top-5 z-[100] flex -translate-x-1/2 items-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold shadow-modal ${COLOURS[toast.type]}`}
      style={{ animation: 'fadeSlideIn 180ms cubic-bezier(.4,0,.2,1)' }}
    >
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
        toast.type === 'success' ? 'bg-white/25' : 'bg-white/15'
      }`}>
        {ICONS[toast.type]}
      </span>
      {toast.message}
    </div>
  );
}
