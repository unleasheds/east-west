import { useState } from 'react';
import { useStore } from '../store/useStore';
import { UserProfile } from '../types';
import GoogleLoginButton from '../components/ui/GoogleLoginButton';
import { LogOut, User as UserIcon, Luggage, Moon, ClipboardList, Lock, MessageCircle, Zap, ShieldCheck, CheckCircle } from 'lucide-react';

function Completeness({ profile }: { profile: UserProfile }) {
  const fields = [profile.name, profile.phone, profile.email, profile.familySize, profile.budget, profile.preferences];
  const filled = fields.filter(Boolean).length;
  const pct = Math.round((filled / fields.length) * 100);
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink">Profile completeness</p>
        <p className="text-sm font-black text-brand">{pct}%</p>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-soft">
        <div
          className="h-full rounded-full gradient-brand transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-muted">
        {pct === 100
          ? '✓ Your profile is complete — we can personalise your quotes.'
          : `Fill in ${fields.length - filled} more field${fields.length - filled > 1 ? 's' : ''} for faster, personalised quotes.`}
      </p>
    </div>
  );
}

function GoogleAvatar({ name, avatar }: { name?: string; avatar?: string }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name ?? 'You'}
        referrerPolicy="no-referrer"
        className="h-20 w-20 rounded-full object-cover shadow-card ring-2 ring-brand/20"
      />
    );
  }
  const initials = name
    ? name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
    : '?';
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-brand shadow-card">
      <span className="text-2xl font-black text-white">{initials}</span>
    </div>
  );
}

// ── Sign-in screen (not authenticated) ──────────────────────────────────────
function SignInPanel() {
  const PERKS = [
    { Icon: Luggage,       label: 'Saved wishlist syncs', body: 'Your saved packages follow you across devices.' },
    { Icon: Moon,          label: 'Halal preferences',    body: 'We remember your dietary and prayer needs for every booking.' },
    { Icon: ClipboardList, label: 'Trip history',         body: 'All your requests in one place, with status tracking.' },
  ];

  return (
    <div className="page-enter mx-auto max-w-lg px-4 py-16 md:px-8">
      <div className="rounded-3xl bg-white p-8 shadow-card text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-soft">
          <UserIcon className="h-8 w-8 text-muted" />
        </div>
        <h1 className="text-2xl font-black text-ink">Sign in to EastWest</h1>
        <p className="mt-2 text-sm text-muted">
          Use your Google account to save trips, sync your wishlist and get personalised halal travel quotes.
        </p>

        <div className="mt-8 flex justify-center">
          <GoogleLoginButton />
        </div>

        <div className="mt-8 space-y-3 text-left">
          {PERKS.map(({ Icon, label, body }) => (
            <div key={label} className="flex gap-3 rounded-2xl bg-soft p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                <Icon className="h-4 w-4 text-brand" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{label}</p>
                <p className="mt-0.5 text-xs text-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[11px] text-muted">
          By signing in you agree to our privacy policy. Your data is never sold.
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, setProfile, showToast, user, logout } = useStore();
  const [form, setForm] = useState<UserProfile>({ ...profile });

  // If not signed in with Google, show sign-in screen
  if (!user) return <SignInPanel />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfile(form);
    showToast('Profile saved', 'success');
  }

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">

      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">

        {/* ── Left ── */}
        <div className="space-y-5">
          {/* Google account card */}
          <div className="rounded-3xl bg-white p-6 shadow-card">
            <div className="flex items-center gap-4">
              <GoogleAvatar name={user.name} avatar={user.avatar} />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-2xl font-black text-ink">{user.name}</h1>
                {user.email && (
                  <p className="mt-0.5 truncate text-sm text-muted">{user.email}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-halal-light px-3 py-1 text-xs font-bold text-halal">
                    <svg className="h-3 w-3 fill-halal" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Google account
                  </span>
                  {user.isAdmin && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">
                      <Zap className="h-3 w-3" /> Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-semibold text-muted transition hover:border-ink hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>

          {/* Completeness */}
          <Completeness profile={profile} />

          <div className="space-y-3">
            {[
              { Icon: Lock,          label: 'Private & secure', body: 'Your data is stored locally and never sold to third parties.' },
              { Icon: MessageCircle, label: 'Faster quotes',    body: 'Your saved preferences auto-fill every WhatsApp trip request.' },
            ].map(({ Icon, label, body }) => (
              <div key={label} className="flex gap-4 rounded-2xl bg-white p-5 shadow-card">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light">
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <h4 className="font-black text-ink">{label}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-card md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-label">Your details</p>
              <h2 className="mt-1 text-2xl font-black text-ink">Travel preferences</h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-halal-light px-3 py-1.5 text-xs font-bold text-halal">
              <ShieldCheck className="h-3 w-3" /> Private &amp; secure
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {([
              { field: 'name',       placeholder: 'Full name',             label: 'Full name',       type: 'text'  },
              { field: 'phone',      placeholder: '+971 50 000 0000',       label: 'WhatsApp number', type: 'tel'   },
              { field: 'email',      placeholder: 'you@example.com',        label: 'Email address',   type: 'email' },
              { field: 'familySize', placeholder: '2 adults, 2 kids',       label: 'Family size',     type: 'text'  },
              { field: 'budget',     placeholder: '$500–$1,500 per person',  label: 'Budget range',    type: 'text'  },
            ] as const).map(({ field, placeholder, label, type }) => (
              <label key={field} className="flex flex-col gap-1.5">
                <span className="section-label">{label}</span>
                <input
                  type={type}
                  value={form[field]}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  className="input-field"
                  placeholder={placeholder}
                />
              </label>
            ))}

            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className="section-label">Halal requirements &amp; preferences</span>
              <textarea
                value={form.preferences}
                onChange={(e) => setForm((p) => ({ ...p, preferences: e.target.value }))}
                className="input-field min-h-[110px] resize-none"
                placeholder="Dietary needs, prayer requirements, mobility needs, preferred airlines, no alcohol rooms…"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { Icon: Lock,          label: 'Never shared'       },
              { Icon: CheckCircle,   label: 'Saves instantly'    },
              { Icon: MessageCircle, label: 'Pre-fills WhatsApp' },
            ].map(({ Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 text-[11px] font-semibold text-muted">
                <Icon className="h-3 w-3" /> {label}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" className="btn-primary">Save profile</button>
            <p className="text-xs text-muted">Changes are stored locally on this device.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
