import { useState } from 'react';
import { useStore } from '../store/useStore';
import { UserProfile } from '../types';

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

function Avatar({ name }: { name: string }) {
  const initials = name
    ? name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
    : '?';
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-brand shadow-card">
      <span className="text-2xl font-black text-white">{initials}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, setProfile, showToast } = useStore();
  const [form, setForm] = useState<UserProfile>({ ...profile });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfile(form);
    showToast('Profile saved', 'success');
  }

  const PERKS = [
    { icon: '🧳', label: 'Quick quotes', body: 'Your details auto-fill trip requests so you never retype.' },
    { icon: '🕌', label: 'Halal preferences', body: 'We remember your dietary and prayer needs for every booking.' },
    { icon: '👨‍👩‍👧', label: 'Family profile', body: 'Family size helps us recommend perfectly-sized packages.' },
  ];

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">

      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">

        {/* ── Left ── */}
        <div className="space-y-5">
          {/* Avatar card */}
          <div className="rounded-3xl bg-white p-6 shadow-card">
            <div className="flex items-center gap-4">
              <Avatar name={form.name} />
              <div>
                <h1 className="text-2xl font-black text-ink">
                  {form.name || 'Your name'}
                </h1>
                {form.email && (
                  <p className="mt-0.5 text-sm text-muted">{form.email}</p>
                )}
                {form.phone && (
                  <p className="mt-0.5 text-xs text-muted">{form.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Completeness */}
          <Completeness profile={profile} />

          {/* Perks */}
          <div className="space-y-3">
            {PERKS.map((i) => (
              <div key={i.label} className="flex gap-4 rounded-2xl bg-white p-5 shadow-card">
                <span className="text-2xl">{i.icon}</span>
                <div>
                  <h4 className="font-black text-ink">{i.label}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{i.body}</p>
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
            <span className="rounded-full bg-halal-light px-3 py-1.5 text-xs font-bold text-halal">
              ✓ Private &amp; secure
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {([
              { field: 'name',       placeholder: 'Full name',             label: 'Full name',      type: 'text'  },
              { field: 'phone',      placeholder: '+971 50 000 0000',       label: 'WhatsApp number',type: 'tel'   },
              { field: 'email',      placeholder: 'you@example.com',        label: 'Email address',  type: 'email' },
              { field: 'familySize', placeholder: '2 adults, 2 kids',       label: 'Family size',    type: 'text'  },
              { field: 'budget',     placeholder: '$500–$1,500 per person',  label: 'Budget range',   type: 'text'  },
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

          {/* Trust line */}
          <div className="mt-5 flex flex-wrap gap-2">
            {['🔒 Never shared', '✓ Saves instantly', '💬 Pre-fills WhatsApp'].map((b) => (
              <span key={b} className="rounded-full bg-soft px-3 py-1.5 text-[11px] font-semibold text-muted">{b}</span>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" className="btn-primary">
              Save profile
            </button>
            <p className="text-xs text-muted">Changes are stored locally on this device.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
