/// <reference types="vite/client" />
import { useState } from 'react';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { BookingOrder } from '../../types';
import { paymentsApi } from '../../lib/api';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_placeholder'
);

const STRIPE_ELEMENT_STYLE = {
  style: {
    base: {
      fontSize: '14px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#222222',
      '::placeholder': { color: '#aaaaaa' },
    },
    invalid: { color: '#ef4444' },
  },
};

// ─── Inner form (needs Elements context) ───────────────────────────────────
interface FormProps {
  order: BookingOrder;
  onSuccess: (payload: { paymentIntentId?: string }) => void;
  onClose: () => void;
}

function CheckoutForm({ order, onSuccess, onClose }: FormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardholderName, setCardholderName] = useState(order.name || '');
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);

  const canPay =
    Boolean(stripe) &&
    !loading &&
    cardholderName.trim().length > 0 &&
    cardNumberComplete &&
    cardExpiryComplete &&
    cardCvcComplete;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!cardholderName.trim()) {
      setError('Cardholder name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create PaymentIntent via our NestJS API.
      // Must go through the shared client: in production the API lives on a
      // separate origin, and a relative '/api' path hits the static frontend
      // server instead — which never reaches Stripe.
      const { clientSecret } = await paymentsApi.createIntent({
        amount: order.totalAmount,
        currency: 'usd',
        description: `${order.packageTitle} — ${order.travellers} traveller(s)`,
        metadata: {
          packageId: order.packageId,
          customerName: order.name,
          customerEmail: order.email,
        },
      });

      // 2. Confirm card payment
      const cardNumber = elements.getElement(CardNumberElement);
      if (!cardNumber) throw new Error('Card element not found');

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: { name: cardholderName.trim(), email: order.email },
        },
      });

      if (result.error) {
        setError(result.error.message ?? 'Payment failed');
      } else if (result.paymentIntent?.status === 'succeeded') {
        onSuccess({ paymentIntentId: result.paymentIntent.id });
      }
    } catch (err: unknown) {
      // Axios reports non-2xx as "Request failed with status code 400"; the
      // reason the customer needs is in the API's response body.
      const apiMessage = (err as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message;
      setError(
        (Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage) ??
          (err instanceof Error ? err.message : 'Something went wrong'),
      );
    } finally {
      setLoading(false);
    }
  }

  const total = (order.totalAmount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Order summary */}
      <div className="rounded-2xl bg-soft p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Booking</p>
            <p className="mt-1 font-black text-ink">{order.packageTitle}</p>
            <p className="text-sm text-muted">{order.travellers} traveller(s)</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Total</p>
            <p className="text-xl font-black text-ink">{total}</p>
          </div>
        </div>
      </div>

      {/* Customer details */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Full name
          </label>
          <div className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-ink">
            {order.name || <span className="text-muted">Not provided</span>}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Email
          </label>
          <div className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-ink">
            {order.email || <span className="text-muted">Not provided</span>}
          </div>
        </div>
      </div>

      {/* Card fields */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
          Cardholder name
        </label>
        <input
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Name on card"
          className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-1 focus:ring-brand"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
          Card number
        </label>
        <div className="rounded-xl border border-border bg-white px-4 py-3.5">
          <CardNumberElement
            options={STRIPE_ELEMENT_STYLE}
            onChange={(event) => {
              setCardNumberComplete(event.complete);
              if (event.error) setError(event.error.message ?? 'Card number is invalid');
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Expiry
          </label>
          <div className="rounded-xl border border-border bg-white px-4 py-3.5">
            <CardExpiryElement
              options={STRIPE_ELEMENT_STYLE}
              onChange={(event) => {
                setCardExpiryComplete(event.complete);
                if (event.error) setError(event.error.message ?? 'Expiry date is invalid');
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
            CVC
          </label>
          <div className="rounded-xl border border-border bg-white px-4 py-3.5">
            <CardCvcElement
              options={STRIPE_ELEMENT_STYLE}
              onChange={(event) => {
                setCardCvcComplete(event.complete);
                if (event.error) setError(event.error.message ?? 'CVC is invalid');
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <button
          type="submit"
          disabled={!canPay}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand py-4 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              Processing…
            </>
          ) : (
            <>🔒 Pay {total}</>
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-border bg-white px-6 py-4 text-sm font-semibold text-muted transition hover:text-ink"
        >
          Cancel
        </button>
      </div>

      <p className="text-center text-xs text-muted">
        Secured by Stripe · Your card details are never stored
      </p>
    </form>
  );
}

// ─── Success screen ────────────────────────────────────────────────────────
function SuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-halal-light text-3xl">
        ✓
      </div>
      <h3 className="mt-5 text-2xl font-black text-ink">Booking confirmed!</h3>
      <p className="mt-2 text-sm text-muted">
        We'll send your confirmation details via WhatsApp and email shortly.
      </p>
      <button
        onClick={onClose}
        className="mt-6 rounded-full bg-brand px-8 py-3.5 text-sm font-bold text-white hover:bg-brand-dark"
      >
        Done
      </button>
    </div>
  );
}

// ─── Public modal wrapper ──────────────────────────────────────────────────
interface Props {
  order: BookingOrder;
  onClose: () => void;
  onSuccess?: (payload: { paymentIntentId?: string }) => void | Promise<void>;
}

export default function CheckoutModal({ order, onClose, onSuccess }: Props) {
  const [paid, setPaid] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-white p-6 shadow-modal sm:rounded-3xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-ink">
            {paid ? 'Payment successful' : 'Complete your booking'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-soft text-muted hover:text-ink"
          >
            ✕
          </button>
        </div>

        {paid ? (
          <SuccessScreen onClose={onClose} />
        ) : (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              order={order}
              onSuccess={(payload) => {
                setPaid(true);
                void onSuccess?.(payload);
              }}
              onClose={onClose}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
