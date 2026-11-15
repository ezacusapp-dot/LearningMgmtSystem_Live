'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  Inbox,
  AlertCircle,
  Loader2,
  BookOpen,
  User,
  Mail,
  Phone,
  GraduationCap,
  CalendarDays,
  MapPin,
  Home,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type Edition = 'LEARN' | 'DISCOVER' | 'CREATE' | 'INNOVATE';
type Payment = 'UNPAID' | 'PAID';

interface Row {
  id: string;
  orderNumber: string;
  parentName: string;
  email: string;
  mobile: string;
  edition: Edition;
  durationMonths: number;
  deliveryPin: string | null;
  deliveryAddress: string | null;
  consent: boolean;
  consentAt: string;
  paymentStatus: Payment;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const API = '/api/code-scoop';

const EDITION_META: Record<Edition, { name: string; grades: string; chip: string }> = {
  LEARN: { name: 'Learn', grades: 'Grades 1–2', chip: 'border-amber-500/30 bg-amber-500/15 text-amber-300' },
  DISCOVER: { name: 'Discover', grades: 'Grades 3–4', chip: 'border-orange-500/30 bg-orange-500/15 text-orange-300' },
  CREATE: { name: 'Create', grades: 'Grades 5–6', chip: 'border-rose-500/30 bg-rose-500/15 text-rose-300' },
  INNOVATE: { name: 'Innovate', grades: 'Grades 7–8', chip: 'border-sky-500/30 bg-sky-500/15 text-sky-300' },
};

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

// Cookies are sent automatically (same origin).
const adminFetch = (url: string, init: RequestInit = {}) =>
  fetch(url, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });

// ─── Small pieces ────────────────────────────────────────────────────────────
function PaymentBadge({ status }: { status: Payment }) {
  const paid = status === 'PAID';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        paid ? 'border-lime-500/30 bg-lime-500/15 text-lime-400' : 'border-amber-500/30 bg-amber-500/15 text-amber-400'
      }`}
    >
      {paid ? <CheckCircle2 size={13} /> : <Clock size={13} />}
      {paid ? 'Paid' : 'Unpaid'}
    </span>
  );
}

function EditionChip({ edition }: { edition: Edition }) {
  const m = EDITION_META[edition];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${m.chip}`}>
      <BookOpen size={12} />
      {m.name}
      <span className="font-normal opacity-80">· {m.grades}</span>
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-lime-700/20 text-xs font-bold text-lime-400">
      {initials(name)}
    </span>
  );
}

function Detail({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-slate-800 text-lime-400">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-slate-400">{label}</dt>
        <dd className="mt-0.5 break-words text-sm font-medium text-white">{children}</dd>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CodeScoopAdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [edition, setEdition] = useState<'' | Edition>('');
  const [payment, setPayment] = useState<'' | Payment>('');

  const [selected, setSelected] = useState<Row | null>(null);
  const [busyId, setBusyId] = useState('');
  const [actionError, setActionError] = useState('');

  const reqId = useRef(0);

  // Wait until the person stops typing before searching
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    const id = ++reqId.current; // ignore answers from older requests
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) qs.set('search', search);
      if (edition) qs.set('edition', edition);
      if (payment) qs.set('paymentStatus', payment);

      const res = await adminFetch(`${API}?${qs.toString()}`);
      const json = await res.json().catch(() => null);
      if (id !== reqId.current) return;

      if (!res.ok || !json?.success) {
        setRows([]);
        setMeta(null);
        setError(res.status === 401 ? 'You are not authorised to view these Enquiry.' : json?.message || 'Could not load Enquiry.');
        return;
      }
      setRows(json.data);
      setMeta(json.meta);
    } catch {
      if (id === reqId.current) setError('Could not reach the server. Check your connection and try again.');
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [page, limit, search, edition, payment]);

  useEffect(() => {
    load();
  }, [load]);

  // Close the side panel with Escape
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const open = (r: Row) => {
    setActionError('');
    setSelected(r);
  };

  const changePayment = async (row: Row, status: Payment) => {
    setBusyId(row.id);
    setActionError('');
    try {
      const res = await adminFetch(`${API}/${row.id}`, { method: 'PATCH', body: JSON.stringify({ paymentStatus: status }) });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setActionError(json?.message || 'Could not update the payment status.');
        return;
      }
      setRows((rs) => rs.map((r) => (r.id === row.id ? json.data : r)));
      setSelected((s) => (s && s.id === row.id ? json.data : s));
    } catch {
      setActionError('Could not reach the server.');
    } finally {
      setBusyId('');
    }
  };

  const remove = async (row: Row) => {
    if (!window.confirm(`Delete order ${row.orderNumber} for ${row.parentName}? This cannot be undone.`)) return;
    setBusyId(row.id);
    setActionError('');
    try {
      const res = await adminFetch(`${API}/${row.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setActionError(json?.message || 'Could not delete the order.');
        return;
      }
      setSelected(null);
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch {
      setActionError('Could not reach the server.');
    } finally {
      setBusyId('');
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setEdition('');
    setPayment('');
    setPage(1);
  };

  const hasFilters = !!(search || edition || payment);

  const control =
    'rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-lime-500';

  return (
    <div className="space-y-5 p-4 text-slate-200 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-700/20 text-lime-400">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">Code Scoop Enquiry</h1>
            <p className="text-sm text-slate-400">
              {meta ? `${meta.total} subscription ${meta.total === 1 ? 'request' : 'requests'}` : 'Subscription requests from the website form'}
            </p>
          </div>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, mobile, order no."
            aria-label="Search Enquiry"
            className={`${control} w-full pl-10 placeholder:text-slate-500`}
          />
        </div>

        <select
          value={edition}
          onChange={(e) => {
            setEdition(e.target.value as '' | Edition);
            setPage(1);
          }}
          aria-label="Filter by grade"
          style={{ colorScheme: 'dark' }}
          className={control}
        >
          <option value="">All grades</option>
          {(Object.keys(EDITION_META) as Edition[]).map((k) => (
            <option key={k} value={k}>
              {EDITION_META[k].name} · {EDITION_META[k].grades}
            </option>
          ))}
        </select>

        <select
          value={payment}
          onChange={(e) => {
            setPayment(e.target.value as '' | Payment);
            setPage(1);
          }}
          aria-label="Filter by payment status"
          style={{ colorScheme: 'dark' }}
          className={control}
        >
          <option value="">All payments</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
        </select>

        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-sm font-medium text-lime-400 hover:text-lime-300">
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      {actionError && !selected && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-medium text-red-300">
          <AlertCircle size={16} className="flex-none" />
          {actionError}
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
        {error ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <AlertCircle size={32} className="text-red-400" />
            <p className="max-w-md text-sm font-medium text-slate-300">{error}</p>
            <button onClick={load} className="rounded-xl bg-lime-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-lime-600">
              Try again
            </button>
          </div>
        ) : loading && rows.length === 0 ? (
          <div className="divide-y divide-slate-800">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-slate-800/40" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
              <Inbox size={22} />
            </div>
            <p className="font-semibold text-white">{hasFilters ? 'No Enquiry match these filters' : 'No Enquiry yet'}</p>
            <p className="text-sm text-slate-400">
              {hasFilters ? 'Try a different search or clear the filters.' : 'New subscription requests from the website will appear here.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className={`hidden overflow-x-auto md:block ${loading ? 'opacity-60' : ''}`}>
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-700 bg-slate-800/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">Enquiry</th>
                    <th className="px-5 py-3.5">Parent / guardian</th>
                    <th className="px-5 py-3.5">Mobile</th>
                    <th className="px-5 py-3.5">Grade</th>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5">Delivery</th>
                    <th className="px-5 py-3.5">Payment</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {rows.map((r) => (
                    <tr key={r.id} className="transition hover:bg-slate-800/40">
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-lime-400">{r.orderNumber}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.parentName} />
                          <div className="min-w-0">
                            <div className="font-semibold text-white">{r.parentName}</div>
                            <div className="text-xs text-slate-400">{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-200">{r.mobile}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <EditionChip edition={r.edition} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-200">{r.durationMonths} months</td>
                      <td className="max-w-[220px] px-5 py-4">
                        <div className="font-medium text-slate-200">{r.deliveryPin || '—'}</div>
                        <div className="truncate text-xs text-slate-400" title={r.deliveryAddress || ''}>
                          {r.deliveryAddress || ''}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <PaymentBadge status={r.paymentStatus} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400">{fmtDate(r.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => open(r)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-lime-500 hover:text-lime-400"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className={`divide-y divide-slate-800 md:hidden ${loading ? 'opacity-60' : ''}`}>
              {rows.map((r) => (
                <li key={r.id}>
                  <button onClick={() => open(r)} className="block w-full p-4 text-left transition hover:bg-slate-800/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={r.parentName} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{r.parentName}</p>
                          <p className="font-mono text-xs text-lime-400">{r.orderNumber}</p>
                        </div>
                      </div>
                      <PaymentBadge status={r.paymentStatus} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <EditionChip edition={r.edition} />
                      <span className="text-xs text-slate-400">{r.durationMonths} months</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {r.mobile} · {fmtDate(r.createdAt)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              aria-label="Rows per page"
              style={{ colorScheme: 'dark' }}
              className={control}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span>
              Page <span className="font-semibold text-white">{meta.page}</span> of {Math.max(meta.totalPages, 1)}
            </span>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              aria-label="Previous page"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.totalPages || loading}
              aria-label="Next page"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Details panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.aside
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              role="dialog"
              aria-modal="true"
              aria-label={`Enquiry ${selected.orderNumber}`}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-full max-w-md flex-col border-l border-slate-700 bg-slate-900 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-700 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.parentName} />
                  <div>
                    <p className="font-mono text-sm font-bold text-lime-400">{selected.orderNumber}</p>
                    <div className="mt-1">
                      <PaymentBadge status={selected.paymentStatus} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <dl className="flex-1 space-y-5 overflow-y-auto p-6">
                <Detail icon={User} label="Parent / guardian">
                  {selected.parentName}
                </Detail>
                <Detail icon={Mail} label="Email">
                  <a href={`mailto:${selected.email}`} className="text-lime-400 hover:underline">
                    {selected.email}
                  </a>
                </Detail>
                <Detail icon={Phone} label="Mobile">
                  <a href={`tel:${selected.mobile}`} className="text-lime-400 hover:underline">
                    {selected.mobile}
                  </a>
                </Detail>

                <div className="border-t border-slate-800" />

                <Detail icon={GraduationCap} label="Grade">
                  <EditionChip edition={selected.edition} />
                </Detail>
                <Detail icon={CalendarDays} label="Duration">
                  {selected.durationMonths} months
                </Detail>

                <div className="border-t border-slate-800" />

                <Detail icon={MapPin} label="Delivery PIN code">
                  {selected.deliveryPin || '—'}
                </Detail>
                <Detail icon={Home} label="Delivery address">
                  <span className="whitespace-pre-line">{selected.deliveryAddress || '—'}</span>
                </Detail>

                <div className="border-t border-slate-800" />

                <Detail icon={ShieldCheck} label="Consent given">
                  {selected.consent ? `Yes · ${fmtDate(selected.consentAt)}` : 'No'}
                </Detail>
                <Detail icon={Clock} label="Requested on">
                  {fmtDate(selected.createdAt)}
                </Detail>
                <Detail icon={Wallet} label="Paid on">
                  {fmtDate(selected.paidAt)}
                </Detail>
              </dl>

              {/* Footer */}
              <div className="space-y-2.5 border-t border-slate-700 px-6 py-4">
                {actionError && (
                  <p role="alert" className="flex items-center gap-2 text-sm font-medium text-red-300">
                    <AlertCircle size={15} className="flex-none" />
                    {actionError}
                  </p>
                )}

                {selected.paymentStatus === 'UNPAID' ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => changePayment(selected, 'PAID')}
                    disabled={busyId === selected.id}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-lime-600 disabled:opacity-60"
                  >
                    {busyId === selected.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Mark as paid
                  </motion.button>
                ) : (
                  <button
                    onClick={() => changePayment(selected, 'UNPAID')}
                    disabled={busyId === selected.id}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {busyId === selected.id ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                    Mark as unpaid
                  </button>
                )}

                <button
                  onClick={() => remove(selected)}
                  disabled={busyId === selected.id}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                >
                  <Trash2 size={16} /> Delete Enquiry
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
