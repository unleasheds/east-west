import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallAppButton() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => setPrompt(null);

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (!prompt || dismissed) return null;

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  return (
    <div className="fixed bottom-24 left-1/2 z-[65] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl bg-brand p-3 text-white shadow-modal md:bottom-6 md:left-auto md:right-6 md:translate-x-0">
      <img src="/icon-192.png?v=4" alt="" className="h-11 w-11 rounded-xl bg-white object-cover" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black">Install EastWest</p>
        <p className="text-[11px] text-white/65">Quick access from your home screen</p>
      </div>
      <button
        onClick={install}
        className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-bold text-brand"
      >
        <Download className="h-3.5 w-3.5" />
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss install prompt"
        className="text-white/50 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
