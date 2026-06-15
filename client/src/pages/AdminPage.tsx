import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package as PackageIcon, Users, ClipboardList, Plus, Pencil,
  Trash2, ToggleLeft, ToggleRight, ShieldCheck, ShieldOff, Check, X, Settings,
  Star, CheckCircle2, XCircle, Calendar, CreditCard, Clock, Plane,
  Tag, Globe, FileText, AlertCircle, Layers, ChevronUp, ChevronDown,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { adminApi, settingsApi } from '../lib/api';
import { CategoryItem, PICKABLE_ICONS, getIcon, autoIconName } from '../lib/iconRegistry';

// ── Types ────────────────────────────────────────────────────────────────────

interface AdminPackage {
  id: string;
  slug: string;
  title: string;
  type: string;
  destination: string;
  location: string;
  duration: string;
  price: string;
  priceValue: number;
  childPrice?: string;
  description?: string;
  imageGradient?: string;
  highlights?: string[];
  itinerary?: { day: number; title: string; activities: string[] }[];
  included?: string[];
  excluded?: string[];
  isActive: boolean;
  rating: number;
  reviewCount: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  createdAt: string;
}

interface AdminTrip {
  id: string;
  userId: string;
  packageId: string;
  destination: string;
  dates: string;
  travellers: string;
  budget: string;
  needs: string;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: string;
}

// ── Packages Tab ─────────────────────────────────────────────────────────────

// Reusable tag-list builder (highlights, included, excluded)
function ListBuilder({
  label,
  hint,
  placeholder,
  icon,
  iconBg,
  items,
  onChange,
}: {
  label: string;
  hint?: string;
  placeholder: string;
  icon: React.ReactNode;
  iconBg: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  function add() {
    const val = draft.trim();
    if (!val) return;
    onChange([...items, val]);
    setDraft('');
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function update(i: number, val: string) {
    const next = [...items];
    next[i] = val;
    onChange(next);
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${iconBg}`}>{icon}</span>
        <div>
          <p className="text-sm font-black text-ink">{label}</p>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${iconBg}`}>{icon}</span>
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              className="flex-1 rounded-xl border border-border px-3 py-2 text-sm text-ink outline-none focus:border-brand bg-soft/30"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-red-50 hover:text-red-500 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-dashed border-border px-3 py-2 text-sm text-ink outline-none focus:border-brand placeholder:text-muted/50"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-soft px-4 py-2 text-xs font-bold text-ink hover:bg-border transition disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </div>
  );
}

// Itinerary day builder
function ItineraryBuilder({
  itinerary,
  onChange,
}: {
  itinerary: { day: number; title: string; activities: string[] }[];
  onChange: (it: { day: number; title: string; activities: string[] }[]) => void;
}) {
  const [openDay, setOpenDay] = useState<number | null>(itinerary.length > 0 ? itinerary[0].day : null);

  function addDay() {
    const nextDay = itinerary.length + 1;
    const updated = [...itinerary, { day: nextDay, title: '', activities: [''] }];
    onChange(updated);
    setOpenDay(nextDay);
  }

  function removeDay(idx: number) {
    const updated = itinerary
      .filter((_, i) => i !== idx)
      .map((d, i) => ({ ...d, day: i + 1 }));
    onChange(updated);
    if (openDay === itinerary[idx].day) setOpenDay(null);
  }

  function updateDayTitle(idx: number, title: string) {
    const updated = [...itinerary];
    updated[idx] = { ...updated[idx], title };
    onChange(updated);
  }

  function addActivity(dayIdx: number) {
    const updated = [...itinerary];
    updated[dayIdx] = { ...updated[dayIdx], activities: [...updated[dayIdx].activities, ''] };
    onChange(updated);
  }

  function updateActivity(dayIdx: number, actIdx: number, val: string) {
    const updated = [...itinerary];
    const acts = [...updated[dayIdx].activities];
    acts[actIdx] = val;
    updated[dayIdx] = { ...updated[dayIdx], activities: acts };
    onChange(updated);
  }

  function removeActivity(dayIdx: number, actIdx: number) {
    const updated = [...itinerary];
    const acts = updated[dayIdx].activities.filter((_, i) => i !== actIdx);
    updated[dayIdx] = { ...updated[dayIdx], activities: acts.length ? acts : [''] };
    onChange(updated);
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
            <Calendar className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-black text-ink">Day-by-Day Itinerary</p>
            <p className="text-xs text-muted">Add each day with its activities</p>
          </div>
        </div>
        <button
          type="button"
          onClick={addDay}
          className="flex items-center gap-1.5 rounded-xl bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand/20 transition"
        >
          <Plus className="h-3.5 w-3.5" /> Add Day {itinerary.length + 1}
        </button>
      </div>

      {itinerary.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-soft/30 py-8 text-center">
          <p className="text-sm text-muted">No days yet — click "Add Day 1" to start building</p>
        </div>
      )}

      <div className="space-y-2">
        {itinerary.map((day, dayIdx) => {
          const isOpen = openDay === day.day;
          return (
            <div key={day.day} className="overflow-hidden rounded-xl border border-border">
              {/* Day header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-soft/40 transition"
                onClick={() => setOpenDay(isOpen ? null : day.day)}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white text-xs font-black">
                  {day.day}
                </span>
                <input
                  value={day.title}
                  onChange={(e) => { e.stopPropagation(); updateDayTitle(dayIdx, e.target.value); }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={`Day ${day.day} title  e.g. "Arrival & City Tour"`}
                  className="flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-muted/50"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-muted">{day.activities.filter(Boolean).length} activities</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeDay(dayIdx); }}
                    className="ml-2 flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-red-50 hover:text-red-500 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <svg viewBox="0 0 20 20" className={`h-4 w-4 text-muted transition-transform ml-1 ${isOpen ? 'rotate-180' : ''}`} fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Activities */}
              {isOpen && (
                <div className="border-t border-border bg-soft/30 px-4 py-4 space-y-2">
                  {day.activities.map((act, actIdx) => (
                    <div key={actIdx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand/60 mt-0.5" />
                      <input
                        value={act}
                        onChange={(e) => updateActivity(dayIdx, actIdx, e.target.value)}
                        placeholder={`Activity ${actIdx + 1}  e.g. "Airport pickup by guide"`}
                        className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-brand"
                      />
                      <button
                        type="button"
                        onClick={() => removeActivity(dayIdx, actIdx)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted hover:bg-red-50 hover:text-red-500 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addActivity(dayIdx)}
                    className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand/80 transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add activity
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Main package form
function PackageForm({
  initial,
  onSave,
  onCancel,
  packageTypes,
  destinations,
}: {
  initial?: Partial<AdminPackage>;
  onSave: (data: object) => void;
  onCancel: () => void;
  packageTypes: string[];
  destinations: string[];
}) {
  const [step, setStep] = useState(0);

  const [basics, setBasics] = useState({
    slug: initial?.slug ?? '',
    title: initial?.title ?? '',
    type: initial?.type ?? 'Family',
    destination: initial?.destination ?? '',
    location: initial?.location ?? '',
    duration: initial?.duration ?? '',
    price: initial?.price ?? '',
    priceValue: initial?.priceValue ?? 0,
    childPrice: initial?.childPrice ?? '',
    description: initial?.description ?? '',
    imageGradient: initial?.imageGradient ?? 'linear-gradient(135deg,#8fcfce,#65b7bd)',
  });

  const [highlights, setHighlights] = useState<string[]>(initial?.highlights ?? []);
  const [itinerary, setItinerary] = useState<{ day: number; title: string; activities: string[] }[]>(
    initial?.itinerary ?? []
  );
  const [included, setIncluded] = useState<string[]>(initial?.included ?? []);
  const [excluded, setExcluded] = useState<string[]>(initial?.excluded ?? []);

  function setB(k: string, v: string | number) {
    setBasics((p) => ({ ...p, [k]: v }));
  }

  function handleSave() {
    onSave({
      ...basics,
      childPrice: basics.childPrice || null,
      priceValue: Number(basics.priceValue),
      highlights,
      itinerary: itinerary.map((d) => ({
        ...d,
        activities: d.activities.filter(Boolean),
      })),
      included,
      excluded,
    });
  }

  const STEPS: { label: string; Icon: React.ElementType }[] = [
    { label: 'Basic Info', Icon: FileText      },
    { label: 'Highlights', Icon: Star          },
    { label: 'Itinerary',  Icon: Calendar      },
    { label: 'Includes',   Icon: CheckCircle2  },
  ];

  return (
    <div className="rounded-2xl border border-border bg-white shadow-card overflow-hidden">
      {/* Step indicator */}
      <div className="flex border-b border-border bg-soft/40">
        {STEPS.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-bold transition border-b-2 ${
              step === i
                ? 'border-brand text-brand bg-white'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <s.Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 space-y-5">

        {/* ── Step 0: Basic Info ── */}
        {step === 0 && (
          <>
            <div>
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand" />
                <p className="text-base font-black text-ink">Basic Information</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="col-span-2 flex flex-col gap-1">
                  <span className="text-xs font-bold text-muted">Package Title <span className="text-red-400">*</span></span>
                  <input
                    value={basics.title}
                    onChange={(e) => setB('title', e.target.value)}
                    placeholder="e.g. 7 Days Halal Malaysia Family Tour"
                    className="rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-muted">URL Slug <span className="text-red-400">*</span></span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted/60">/package/</span>
                    <input
                      value={basics.slug}
                      onChange={(e) => setB('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                      placeholder="malaysia-family-7d"
                      className="w-full rounded-xl border border-border pl-[68px] pr-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
                    />
                  </div>
                  <span className="text-[11px] text-muted/60">Auto-formatted: letters, numbers, hyphens only</span>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-muted">Package Type</span>
                  <select
                    value={basics.type}
                    onChange={(e) => setB('type', e.target.value)}
                    className="rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
                  >
                    {packageTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-muted">Destination Country</span>
                  <select
                    value={basics.destination}
                    onChange={(e) => setB('destination', e.target.value)}
                    className="rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
                  >
                    <option value="">— Select destination —</option>
                    {destinations.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-muted">Specific Locations</span>
                  <input
                    value={basics.location}
                    onChange={(e) => setB('location', e.target.value)}
                    placeholder="e.g. Kuala Lumpur · Putrajaya · Genting"
                    className="rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-muted">Duration</span>
                  <input
                    value={basics.duration}
                    onChange={(e) => setB('duration', e.target.value)}
                    placeholder="e.g. 7 Days / 6 Nights"
                    className="rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-muted">Price (display label)</span>
                  <input
                    value={basics.price}
                    onChange={(e) => setB('price', e.target.value)}
                    placeholder="e.g. From $1,190"
                    className="rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-muted">Price per Person ($)</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">$</span>
                    <input
                      type="number"
                      min={0}
                      value={basics.priceValue}
                      onChange={(e) => setB('priceValue', e.target.value)}
                      className="w-full rounded-xl border border-border pl-7 pr-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-muted">Child Price <span className="font-normal text-muted/60">(optional)</span></span>
                  <input
                    value={basics.childPrice}
                    onChange={(e) => setB('childPrice', e.target.value)}
                    placeholder="e.g. Free or From $195"
                    className="rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
                  />
                </label>

                <label className="col-span-2 flex flex-col gap-1">
                  <span className="text-xs font-bold text-muted">Description</span>
                  <textarea
                    value={basics.description}
                    onChange={(e) => setB('description', e.target.value)}
                    rows={4}
                    placeholder="Describe the package experience for travellers…"
                    className="rounded-xl border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-brand resize-none"
                  />
                </label>

                <label className="col-span-2 flex flex-col gap-1">
                  <span className="text-xs font-bold text-muted">Card Background Gradient <span className="font-normal text-muted/60">(CSS)</span></span>
                  <div className="flex gap-3">
                    <input
                      value={basics.imageGradient}
                      onChange={(e) => setB('imageGradient', e.target.value)}
                      className="flex-1 rounded-xl border border-border px-3 py-2.5 text-xs text-ink outline-none focus:border-brand font-mono"
                    />
                    <div className="h-10 w-16 shrink-0 rounded-xl border border-border" style={{ background: basics.imageGradient }} />
                  </div>
                </label>
              </div>
            </div>
          </>
        )}

        {/* ── Step 1: Highlights ── */}
        {step === 1 && (
          <ListBuilder
            label="Trip Highlights"
            hint="Key selling points shown on the package page (aim for 5–8)"
            placeholder='e.g. "Private halal-certified hotel" or "Cable car to Genting"'
            icon={<Star className="h-3.5 w-3.5" />}
            iconBg="bg-amber-100 text-amber-600"
            items={highlights}
            onChange={setHighlights}
          />
        )}

        {/* ── Step 2: Itinerary ── */}
        {step === 2 && (
          <ItineraryBuilder itinerary={itinerary} onChange={setItinerary} />
        )}

        {/* ── Step 3: Includes / Excludes ── */}
        {step === 3 && (
          <div className="space-y-5">
            <ListBuilder
              label="Package Includes"
              hint="What's covered in the price"
              placeholder='e.g. "6 nights accommodation with daily breakfast"'
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              iconBg="bg-halal-light text-halal"
              items={included}
              onChange={setIncluded}
            />
            <ListBuilder
              label="Not Included"
              hint="What guests need to arrange or pay separately"
              placeholder='e.g. "International airfare" or "Travel insurance"'
              icon={<XCircle className="h-3.5 w-3.5" />}
              iconBg="bg-red-50 text-red-400"
              items={excluded}
              onChange={setExcluded}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-soft/30 px-6 py-4">
        <div className="flex gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-muted hover:text-ink transition"
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-muted hover:text-ink transition"
          >
            Cancel
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Step dots */}
          <div className="hidden sm:flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${i === step ? 'bg-brand w-4' : i < step ? 'bg-halal' : 'bg-border'}`}
              />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="rounded-full gradient-brand px-6 py-2 text-sm font-bold text-white shadow transition hover:opacity-90"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-full gradient-brand px-6 py-2 text-sm font-bold text-white shadow transition hover:opacity-90"
            >
              <Check className="h-4 w-4" /> Save Package
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PackagesTab({ packageTypes, destinations }: { packageTypes: string[]; destinations: string[] }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminPackage | null>(null);

  const { data: packages = [], isLoading } = useQuery<AdminPackage[]>({
    queryKey: ['admin-packages'],
    queryFn: () => adminApi.getAllPackages(),
  });

  const createMut = useMutation({
    mutationFn: (data: object) => adminApi.createPackage(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-packages'] }); setShowForm(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => adminApi.updatePackage(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-packages'] }); setEditing(null); },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.updatePackage(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-packages'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deletePackage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-packages'] }),
  });

  if (isLoading) return <p className="py-8 text-center text-sm text-muted">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{packages.length} packages total</p>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="flex items-center gap-2 rounded-full gradient-brand px-4 py-2 text-sm font-bold text-white shadow transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add package
        </button>
      </div>

      {(showForm && !editing) && (
        <PackageForm
          onSave={(data) => createMut.mutate(data)}
          onCancel={() => setShowForm(false)}
          packageTypes={packageTypes}
          destinations={destinations}
        />
      )}

      {editing && (
        <PackageForm
          initial={editing}
          onSave={(data) => updateMut.mutate({ id: editing.id, data })}
          onCancel={() => setEditing(null)}
          packageTypes={packageTypes}
          destinations={destinations}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-soft/60">
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted">Package</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted">Type</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted">Destination</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted">Price</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted">Status</th>
              <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wider text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-soft/40 transition">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{pkg.title}</p>
                  <p className="text-xs text-muted">{pkg.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted">{pkg.type}</td>
                <td className="px-4 py-3 text-muted">{pkg.destination}</td>
                <td className="px-4 py-3 font-semibold text-ink">{pkg.price}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${pkg.isActive ? 'bg-halal-light text-halal' : 'bg-soft text-muted'}`}>
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleMut.mutate({ id: pkg.id, isActive: !pkg.isActive })}
                      title={pkg.isActive ? 'Deactivate' : 'Activate'}
                      className="rounded-lg p-1.5 text-muted transition hover:bg-soft hover:text-ink"
                    >
                      {pkg.isActive ? <ToggleRight className="h-4 w-4 text-halal" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setEditing(pkg)}
                      className="rounded-lg p-1.5 text-muted transition hover:bg-soft hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Delete this package?')) deleteMut.mutate(pkg.id); }}
                      className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
  const qc = useQueryClient();
  const { user: me } = useStore();

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getAllUsers(),
  });

  const toggleAdminMut = useMutation({
    mutationFn: ({ id, isAdmin }: { id: string; isAdmin: boolean }) =>
      adminApi.setAdmin(id, isAdmin),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (isLoading) return <p className="py-8 text-center text-sm text-muted">Loading…</p>;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-soft/60">
            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted">User</th>
            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted">Email</th>
            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted">Joined</th>
            <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wider text-muted">Admin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-soft/40 transition">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {u.avatar ? (
                    <img src={u.avatar} referrerPolicy="no-referrer" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-soft text-xs font-bold text-muted">
                      {u.name?.[0] ?? '?'}
                    </div>
                  )}
                  <span className="font-semibold text-ink">{u.name ?? '—'}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted">{u.email}</td>
              <td className="px-4 py-3 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-right">
                <button
                  disabled={u.id === me?.id}
                  onClick={() => toggleAdminMut.mutate({ id: u.id, isAdmin: !u.isAdmin })}
                  title={u.isAdmin ? 'Revoke admin' : 'Grant admin'}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed
                    hover:opacity-80"
                  style={{ background: u.isAdmin ? '#26252C' : '#f0f0f0', color: u.isAdmin ? '#fff' : '#555' }}
                >
                  {u.isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
                  {u.isAdmin ? 'Admin' : 'User'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Trips Tab ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-halal-light text-halal',
  completed: 'bg-soft text-muted',
};

function TripsTab() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: trips = [], isLoading } = useQuery<AdminTrip[]>({
    queryKey: ['admin-trips'],
    queryFn: () => fetch('/api/trips').then((r) => r.json()),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateTripStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-trips'] }),
  });

  if (isLoading) return <p className="py-8 text-center text-sm text-muted">Loading…</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">{trips.length} trip request{trips.length !== 1 ? 's' : ''}</p>
      {trips.length === 0 && (
        <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-card">
          <Plane className="mx-auto h-10 w-10 text-muted/40" />
          <p className="mt-3 font-bold text-ink">No trip requests yet</p>
          <p className="mt-1 text-sm text-muted">Trips submitted by users will appear here.</p>
        </div>
      )}
      {trips.map((trip) => (
        <div key={trip.id} className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          {/* Main row */}
          <div className="flex flex-wrap items-start gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="font-black text-ink truncate">{trip.destination || 'Destination not set'}</p>
              <p className="mt-0.5 text-xs text-muted font-mono">{trip.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {[
                { Icon: Calendar,    label: trip.dates || '—' },
                { Icon: Users,        label: trip.travellers || '—' },
                { Icon: CreditCard,   label: trip.budget || '—' },
                { Icon: Clock,        label: new Date(trip.createdAt).toLocaleDateString() },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1 text-muted">
                  <item.Icon className="h-3.5 w-3.5 shrink-0" /> {item.label}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <select
                value={trip.status}
                onChange={(e) => statusMut.mutate({ id: trip.id, status: e.target.value })}
                className={`rounded-full px-3 py-1.5 text-xs font-bold border-0 outline-none cursor-pointer ${STATUS_COLORS[trip.status]}`}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>
              <button
                onClick={() => setExpanded(expanded === trip.id ? null : trip.id)}
                className="text-xs font-semibold text-brand hover:underline"
              >
                {expanded === trip.id ? 'Less ▲' : 'Details ▼'}
              </button>
            </div>
          </div>

          {/* Expanded details */}
          {expanded === trip.id && (
            <div className="border-t border-border bg-soft/40 px-5 py-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Destination',  value: trip.destination },
                  { label: 'Travel Dates', value: trip.dates },
                  { label: 'Travellers',   value: trip.travellers },
                  { label: 'Budget',       value: trip.budget },
                  { label: 'User ID',      value: trip.userId },
                  { label: 'Package ID',   value: trip.packageId },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-ink truncate">{value || '—'}</p>
                  </div>
                ))}
              </div>
              {trip.needs && (
                <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Special Requests / Needs</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink whitespace-pre-wrap">{trip.needs}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Icon Picker ───────────────────────────────────────────────────────────────

function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">Pick an icon</p>
      <div className="grid grid-cols-9 gap-1 rounded-xl border border-border bg-soft/40 p-2 sm:grid-cols-12 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-19">
        {PICKABLE_ICONS.map(({ name, Icon, label }) => (
          <button
            key={name}
            type="button"
            title={label}
            onClick={() => onChange(name)}
            className={`flex items-center justify-center rounded-lg p-2 transition ${
              value === name
                ? 'bg-brand text-white shadow-sm ring-2 ring-brand ring-offset-1'
                : 'text-muted hover:bg-white hover:text-ink hover:shadow-sm'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Category CRUD ─────────────────────────────────────────────────────────────

function CategoryList() {
  const qc = useQueryClient();

  const { data: settings } = useQuery<Record<string, any[]>>({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll(),
  });

  const raw: any[] = settings?.categories ?? [];
  const items: CategoryItem[] = raw.map((item) =>
    typeof item === 'string'
      ? { label: item, iconName: autoIconName(item) }
      : { label: item.label ?? '', iconName: item.iconName ?? 'Globe' }
  );

  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editIcon, setEditIcon] = useState('Globe');
  const [addLabel, setAddLabel] = useState('');
  const [addIcon, setAddIcon] = useState('Globe');
  const [showAddPicker, setShowAddPicker] = useState(false);

  const saveMut = useMutation({
    mutationFn: (next: CategoryItem[]) => settingsApi.setList('categories', next),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });

  function saveItems(next: CategoryItem[]) { saveMut.mutate(next); }

  function addItem() {
    if (!addLabel.trim()) return;
    saveItems([...items, { label: addLabel.trim(), iconName: addIcon }]);
    setAddLabel('');
    setAddIcon('Globe');
    setShowAddPicker(false);
  }

  function removeItem(idx: number) {
    if (!confirm(`Remove "${items[idx].label}"?`)) return;
    saveItems(items.filter((_, i) => i !== idx));
  }

  function startEdit(idx: number) {
    setEditingIdx(idx);
    setEditLabel(items[idx].label);
    setEditIcon(items[idx].iconName);
  }

  function saveEdit() {
    if (editingIdx === null || !editLabel.trim()) return;
    saveItems(items.map((item, i) => i === editingIdx ? { label: editLabel.trim(), iconName: editIcon } : item));
    setEditingIdx(null);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    saveItems(next);
  }

  function moveDown(idx: number) {
    if (idx === items.length - 1) return;
    const next = [...items];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    saveItems(next);
  }

  return (
    <div className="col-span-full rounded-2xl border border-border bg-white overflow-hidden shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-soft/30">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <p className="font-black text-ink">Explore Categories</p>
            <p className="text-xs text-muted">
              Filter chips on the explore page — each has a label and icon. Order matters.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-muted">
          {items.length} chips
        </span>
      </div>

      {/* Items grid */}
      <div className="p-5">
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted">
            No categories yet — add one below
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const Icon = getIcon(item.iconName);
            const isEditing = editingIdx === idx;

            return (
              <div
                key={idx}
                className={`rounded-2xl border transition ${isEditing ? 'border-brand bg-white shadow-md' : 'border-border bg-soft/30 hover:bg-white hover:shadow-sm'}`}
              >
                {isEditing ? (
                  <div className="p-4 space-y-3">
                    <input
                      autoFocus
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingIdx(null); }}
                      className="w-full rounded-xl border border-border px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-brand"
                      placeholder="Category name"
                    />
                    <IconPicker value={editIcon} onChange={setEditIcon} />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={saveEdit}
                        disabled={!editLabel.trim()}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl gradient-brand py-2 text-xs font-bold text-white shadow transition hover:opacity-90 disabled:opacity-40"
                      >
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditingIdx(null)}
                        className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted hover:text-ink transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3">
                    {/* Preview chip */}
                    <div className="flex flex-col items-center gap-1 rounded-xl bg-white px-3 py-2 shadow-sm border border-border min-w-[56px]">
                      <Icon className="h-5 w-5 text-ink" strokeWidth={1.8} />
                      <span className="text-[10px] font-semibold text-ink whitespace-nowrap">{item.label}</span>
                    </div>

                    <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                      <p className="text-sm font-bold text-ink truncate">{item.label}</p>
                      <p className="text-xs text-muted">{item.iconName}</p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-1">
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => moveUp(idx)}
                          disabled={idx === 0}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink transition disabled:opacity-25"
                          title="Move up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveDown(idx)}
                          disabled={idx === items.length - 1}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink transition disabled:opacity-25"
                          title="Move down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => startEdit(idx)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink transition"
                          title="Edit"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeItem(idx)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-500 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add new */}
      <div className="border-t border-border bg-soft/20 px-5 py-5 space-y-3">
        <div className="flex items-center gap-3">
          <input
            value={addLabel}
            onChange={(e) => setAddLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
            placeholder="New category name  e.g. Honeymoon"
            className="flex-1 rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
          {/* Preview of selected icon */}
          <button
            type="button"
            onClick={() => setShowAddPicker((v) => !v)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
              showAddPicker ? 'border-brand bg-brand/5 text-brand' : 'border-border bg-white text-muted hover:text-ink'
            }`}
            title="Choose icon"
          >
            {(() => { const I = getIcon(addIcon); return <I className="h-5 w-5" />; })()}
          </button>
          <button
            onClick={addItem}
            disabled={!addLabel.trim()}
            className="flex items-center gap-1.5 rounded-xl gradient-brand px-4 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        {showAddPicker && <IconPicker value={addIcon} onChange={(n) => { setAddIcon(n); }} />}
      </div>
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsList({
  settingKey,
  label,
  description,
  icon,
  iconBg,
  badge,
}: {
  settingKey: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  badge: string;
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const { data: settings } = useQuery<Record<string, string[]>>({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll(),
  });
  const items = settings?.[settingKey] ?? [];

  const addMut = useMutation({
    mutationFn: (value: string) => settingsApi.addItem(settingKey, value),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); setDraft(''); },
  });

  const removeMut = useMutation({
    mutationFn: (item: string) => settingsApi.removeItem(settingKey, item),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });

  const renameMut = useMutation({
    mutationFn: ({ old: o, next: n }: { old: string; next: string }) =>
      settingsApi.renameItem(settingKey, o, n),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); setEditingItem(null); },
  });

  function startEdit(item: string) {
    setEditingItem(item);
    setEditDraft(item);
  }

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-soft/30">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>{icon}</span>
          <div>
            <p className="font-black text-ink">{label}</p>
            <p className="text-xs text-muted">{description}</p>
          </div>
        </div>
        <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-muted">
          {items.length} {badge}
        </span>
      </div>

      {/* Items list */}
      <div className="divide-y divide-border">
        {items.length === 0 && (
          <div className="py-8 text-center text-sm text-muted">
            No {badge} yet — add one below
          </div>
        )}
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3 px-6 py-3">
            {editingItem === item ? (
              <>
                <input
                  autoFocus
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') renameMut.mutate({ old: item, next: editDraft });
                    if (e.key === 'Escape') setEditingItem(null);
                  }}
                  className="flex-1 rounded-xl border border-brand px-3 py-1.5 text-sm text-ink outline-none"
                />
                <button
                  onClick={() => renameMut.mutate({ old: item, next: editDraft })}
                  disabled={!editDraft.trim() || editDraft === item}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-halal-light text-halal hover:bg-halal hover:text-white transition disabled:opacity-40"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-soft text-muted hover:bg-border transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${iconBg}`}>{icon}</span>
                <span className="flex-1 text-sm font-semibold text-ink">{item}</span>
                <button
                  onClick={() => startEdit(item)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-soft hover:text-ink transition"
                  title="Rename"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove "${item}"? Existing packages using it won't be changed.`))
                      removeMut.mutate(item);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-red-50 hover:text-red-500 transition"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex gap-2 border-t border-border bg-soft/20 px-6 py-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (draft.trim()) addMut.mutate(draft); } }}
          placeholder={`Add new ${label.toLowerCase()}…`}
          className="flex-1 rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand placeholder:text-muted/50"
        />
        <button
          onClick={() => { if (draft.trim()) addMut.mutate(draft); }}
          disabled={!draft.trim()}
          className="flex items-center gap-1.5 rounded-xl gradient-brand px-4 py-2 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <p className="text-sm font-semibold text-amber-800">
            Changes here affect all package creation and filter dropdowns sitewide. Existing packages keep their current values until edited.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsList
          settingKey="package_types"
          label="Package Types"
          description="Used in the package type dropdown when adding or editing packages"
          icon={<Tag className="h-4 w-4" />}
          iconBg="bg-purple-100 text-purple-600"
          badge="types"
        />
        <SettingsList
          settingKey="destinations"
          label="Destination Countries"
          description="Used in the destination dropdown and explore page filters"
          icon={<Globe className="h-4 w-4" />}
          iconBg="bg-blue-100 text-blue-600"
          badge="destinations"
        />
        <CategoryList />
      </div>
    </div>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────

type Tab = 'packages' | 'users' | 'trips' | 'settings';

const TABS: { key: Tab; label: string; Icon: React.ElementType }[] = [
  { key: 'packages', label: 'Packages',      Icon: PackageIcon   },
  { key: 'users',    label: 'Users',         Icon: Users         },
  { key: 'trips',    label: 'Trip Requests', Icon: ClipboardList },
  { key: 'settings', label: 'Settings',      Icon: Settings      },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [tab, setTab] = useState<Tab>('packages');

  const { data: allSettings } = useQuery<Record<string, string[]>>({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll(),
  });
  const packageTypes = allSettings?.package_types ?? ['Family', 'Private', 'Honeymoon', 'Ramadan', 'Island', 'City'];
  const destinations = allSettings?.destinations ?? ['Maldives', 'Malaysia', 'Indonesia', 'Dubai', 'Turkey', 'Morocco'];

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-bold text-ink">Sign in required</p>
          <button onClick={() => navigate('/profile')} className="mt-4 btn-primary">Go to profile</button>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-bold text-ink">Access denied</p>
          <p className="mt-1 text-sm text-muted">This page is for admins only.</p>
          <button onClick={() => navigate('/')} className="mt-4 btn-primary">Go home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink">
          <Check className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-ink">Admin Panel</h1>
          <p className="text-sm text-muted">Manage packages, users & trip requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-2xl border border-border bg-soft/50 p-1 w-fit">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              tab === key ? 'bg-white shadow-card text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'packages' && <PackagesTab packageTypes={packageTypes} destinations={destinations} />}
      {tab === 'users'    && <UsersTab />}
      {tab === 'trips'    && <TripsTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  );
}
