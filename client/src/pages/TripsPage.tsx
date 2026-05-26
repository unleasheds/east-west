import { useState } from 'react';
import { useStore } from '../store/useStore';
import { TripRequest } from '../types';
import { WHATSAPP_NUMBER } from '../data/packages';

const STATUS_STYLES: Record<TripRequest['status'], string> = {
  pending:   'bg-brand-light text-brand',
  confirmed: 'bg-halal-light text-halal',
  completed: 'bg-soft text-muted',
};

function TripCard({ trip, onSelect }: { trip: TripRequest; onSelect: () => void }) {
  const date = new Date(trip.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  return (
    <button
      onClick={onSelect}
      className="w-full rounded-2xl bg-white p-5 shadow-card text-left transition hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate font-black text-ink">{trip.destination || 'Custom trip'}</h4>
          <p className="mt-0.5 text-sm text-muted">
            {trip.travellers ? `${trip.travellers} traveller(s)` : 'Travellers not set'}
            {trip.dates ? ` · ${trip.dates}` : ''}
          </p>
          {trip.budget && <p className="mt-0.5 text-sm font-semibold text-ink">{trip.budget}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[trip.status]}`}>
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </span>
          <span className="text-[10px] text-muted">{date}</span>
        </div>
      </div>
      {trip.needs && (
        <p className="mt-3 line-clamp-2 rounded-xl bg-soft px-3 py-2 text-xs text-muted">
          {trip.needs}
        </p>
      )}
    </button>
  );
}

function TripDetailPanel({ trip, onClose }: { trip: TripRequest; onClose: () => void }) {
  const date = new Date(trip.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const waMsg = encodeURIComponent(
    `Hi EastWest Halal Travel, I'm following up on my trip request:\n\nDestination: ${trip.destination}\nDates: ${trip.dates}\nTravellers: ${trip.travellers}\nBudget: ${trip.budget}\nNeeds: ${trip.needs}\nReference: ${trip.id}`
  );

  return (
    <div className="rounded-3xl bg-white shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Trip request</p>
          <h3 className="mt-1 text-xl font-black text-ink">{trip.destination || 'Custom trip'}</h3>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-soft text-muted hover:text-ink"
        >
          ✕
        </button>
      </div>

      {/* Details grid */}
      <div className="grid gap-3 p-6 sm:grid-cols-2">
        {[
          { label: 'Destination', value: trip.destination, icon: '✈️' },
          { label: 'Travel dates', value: trip.dates || 'Not specified', icon: '📅' },
          { label: 'Travellers', value: trip.travellers || 'Not specified', icon: '👥' },
          { label: 'Budget', value: trip.budget || 'Not specified', icon: '💳' },
          { label: 'Submitted', value: date, icon: '🕐' },
          {
            label: 'Status',
            value: trip.status.charAt(0).toUpperCase() + trip.status.slice(1),
            icon: trip.status === 'confirmed' ? '✅' : trip.status === 'completed' ? '🎉' : '⏳',
          },
        ].map((row) => (
          <div key={row.label} className="rounded-2xl bg-soft px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{row.label}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <span>{row.icon}</span> {row.value}
            </p>
          </div>
        ))}
      </div>

      {/* Special needs */}
      {trip.needs && (
        <div className="px-6 pb-4">
          <div className="rounded-2xl bg-soft px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Special requests</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">{trip.needs}</p>
          </div>
        </div>
      )}

      {/* Ref */}
      <div className="px-6 pb-4">
        <p className="text-[11px] text-muted">
          Reference: <span className="font-mono">{trip.id.slice(0, 8).toUpperCase()}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="border-t border-border px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-full bg-halal py-3.5 text-center text-sm font-bold text-white transition hover:bg-halal-dark"
          >
            💬 Follow up on WhatsApp
          </a>
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-border bg-white py-3.5 text-sm font-semibold text-muted hover:text-ink"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TripsPage() {
  const { trips, addTrip, showToast } = useStore();
  const [selected, setSelected] = useState<TripRequest | null>(null);
  const [form, setForm] = useState({
    destination: '',
    dates: '',
    travellers: '',
    budget: '',
    needs: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addTrip(form);
    const msg = encodeURIComponent(
      `Hi EastWest Halal Travel, I want a halal travel plan.\n\nDestination: ${form.destination}\nDates: ${form.dates}\nTravellers: ${form.travellers}\nBudget: ${form.budget}\nSpecial needs: ${form.needs}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    setForm({ destination: '', dates: '', travellers: '', budget: '', needs: '' });
    showToast('Trip request sent!', 'success');
  }

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-ink md:text-6xl">My Trips</h1>
        <p className="mt-2 text-muted">
          Request a free halal travel plan and track your bookings.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">

        {/* Left — trip list + detail */}
        <div className="space-y-4">
          {selected ? (
            <TripDetailPanel trip={selected} onClose={() => setSelected(null)} />
          ) : trips.length > 0 ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                {trips.length} request{trips.length > 1 ? 's' : ''}
              </p>
              {trips.map((t) => (
                <TripCard key={t.id} trip={t} onSelect={() => setSelected(t)} />
              ))}
            </>
          ) : (
            <div className="rounded-3xl bg-white py-16 text-center shadow-card">
              <p className="text-5xl">✈️</p>
              <h3 className="mt-4 text-xl font-black text-ink">No trip requests yet</h3>
              <p className="mt-2 text-sm text-muted">
                Fill in the form to send your first free halal trip plan.
              </p>
            </div>
          )}
        </div>

        {/* Right — request form */}
        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-card md:p-8">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-halal-light px-3 py-1.5 text-xs font-bold text-halal">
            ✓ Free trip planning
          </div>
          <h2 className="mt-2 text-2xl font-black text-ink">Plan your halal trip</h2>
          <p className="mt-1 text-sm text-muted">
            Tell us about your trip and we'll send a personalised halal quote within hours.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {([
              { key: 'destination', placeholder: 'e.g. Maldives, Malaysia, Dubai',   label: 'Destination'   },
              { key: 'dates',       placeholder: 'e.g. July 2026, 2 weeks in August', label: 'Travel dates'  },
              { key: 'travellers',  placeholder: 'e.g. 2 adults, 2 children',         label: 'Travellers'    },
              { key: 'budget',      placeholder: 'e.g. $1,000–$2,000 per person',     label: 'Budget range'  },
            ] as const).map(({ key, placeholder, label }) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  {label}
                </span>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="rounded-xl bg-soft px-4 py-3.5 text-sm font-semibold text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-brand"
                  placeholder={placeholder}
                />
              </label>
            ))}

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Special needs
              </span>
              <textarea
                value={form.needs}
                onChange={(e) => setForm((p) => ({ ...p, needs: e.target.value }))}
                className="min-h-[100px] resize-none rounded-xl bg-soft px-4 py-3.5 text-sm font-semibold text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-brand"
                placeholder="Halal food only, private tour, baby seat, prayer-friendly hotels, mobility needs…"
              />
            </label>
          </div>

          {/* Trust badges */}
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted">
            {['🍽️ Halal-verified', '🕌 Prayer-friendly', '💬 Reply within 2 hrs', '🔒 No card needed'].map((b) => (
              <span key={b} className="rounded-full bg-soft px-3 py-1.5 font-semibold">{b}</span>
            ))}
          </div>

          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-halal py-4 text-sm font-bold text-white transition hover:bg-halal-dark"
          >
            💬 Send to WhatsApp &amp; save request
          </button>
        </form>
      </div>
    </div>
  );
}
