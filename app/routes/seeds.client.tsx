"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { useToast } from "../components/toast.client";

export function ExportButton({
  exportAction,
  label,
}: {
  exportAction: () => Promise<{ csv: string; filename: string }>;
  label: string;
}) {
  const [exporting, setExporting] = React.useState(false);
  const { addToast } = useToast();

  async function handleExport() {
    setExporting(true);
    try {
      const { csv, filename } = await exportAction();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      addToast("Export downloaded!", "success");
    } catch {
      addToast("Export failed.", "error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-earth-50 dark:hover:bg-gray-700 transition disabled:opacity-50 cursor-pointer"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {exporting ? "..." : label}
    </button>
  );
}

type Seed = {
  id: number;
  plantId: number | null;
  plantName: string | null;
  variety: string | null;
  brand: string | null;
  purchaseDate: string | null;
  expirationDate: string | null;
  quantityRemaining: number | null;
  quantityUnit: string | null;
  lotNumber: string | null;
  notes: string | null;
  isExpiring: boolean;
};

type Plant = { id: number; name: string };

export function SeedInventoryList({
  seeds,
  plants,
  addAction,
  deleteAction,
}: {
  seeds: Seed[];
  plants: Plant[];
  addAction: (formData: FormData) => Promise<{ success: boolean }>;
  deleteAction: (formData: FormData) => Promise<{ success: boolean }>;
}) {
  const [showAdd, setShowAdd] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const { addToast } = useToast();

  const filtered = seeds.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (s.plantName && s.plantName.toLowerCase().includes(q)) ||
      (s.variety && s.variety.toLowerCase().includes(q)) ||
      (s.brand && s.brand.toLowerCase().includes(q))
    );
  });

  const expiring = filtered.filter((s) => s.isExpiring);
  const good = filtered.filter((s) => !s.isExpiring);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search seeds..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-garden-600 text-white hover:bg-garden-700 transition cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Seed
        </button>
      </div>

      {showAdd && (
        <form
          className="bg-earth-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3"
          action={async (formData) => {
            const result = await addAction(formData);
            if (result.success) {
              setShowAdd(false);
              addToast("Seed added!", "success");
            }
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <select
              name="plantId"
              className="rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
            >
              <option value="">Select plant</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              name="variety"
              type="text"
              placeholder="Variety"
              className="rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition placeholder:text-gray-400"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              name="brand"
              type="text"
              placeholder="Brand"
              className="rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition placeholder:text-gray-400"
            />
            <input
              name="quantityRemaining"
              type="number"
              placeholder="Qty"
              min="0"
              step="0.5"
              className="rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition placeholder:text-gray-400"
            />
            <select
              name="quantityUnit"
              className="rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
            >
              <option value="packets">Packets</option>
              <option value="grams">Grams</option>
              <option value="ounces">Ounces</option>
              <option value="seeds">Seeds</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Purchase Date</label>
              <input name="purchaseDate" type="date" className="w-full rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Expiration Date</label>
              <input name="expirationDate" type="date" className="w-full rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition" />
            </div>
          </div>
          <div className="flex gap-2">
            <AddButton />
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {expiring.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            Expiring Soon ({expiring.length})
          </h3>
          {expiring.map((seed) => (
            <SeedCard key={seed.id} seed={seed} deleteAction={deleteAction} />
          ))}
        </div>
      )}

      <div className="space-y-2">
        {expiring.length > 0 && good.length > 0 && (
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Good ({good.length})
          </h3>
        )}
        {good.map((seed) => (
          <SeedCard key={seed.id} seed={seed} deleteAction={deleteAction} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">No seeds in inventory. Add your first packet above.</p>
        </div>
      )}
    </div>
  );
}

function SeedCard({
  seed,
  deleteAction,
}: {
  seed: Seed;
  deleteAction: (formData: FormData) => Promise<{ success: boolean }>;
}) {
  const { addToast } = useToast();

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${
      seed.isExpiring
        ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
        : "bg-white dark:bg-gray-800 border border-earth-200 dark:border-gray-700"
    }`}>
      <div className="w-8 h-8 rounded-lg bg-garden-50 dark:bg-garden-900/30 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-garden-600 dark:text-garden-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 20h10" />
          <path d="M10 20c5.5-2.5.8-6.4 3-10" />
          <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {seed.plantName ?? "Unknown"}{seed.variety ? ` - ${seed.variety}` : ""}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {seed.brand && `${seed.brand} \u00b7 `}
          {seed.quantityRemaining != null && `${seed.quantityRemaining} ${seed.quantityUnit ?? "packets"}`}
          {seed.expirationDate && ` \u00b7 Exp: ${new Date(seed.expirationDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
        </p>
      </div>
      {seed.isExpiring && (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          Expiring
        </span>
      )}
      <form
        action={async (formData) => {
          await deleteAction(formData);
          addToast("Seed removed", "success");
        }}
      >
        <input type="hidden" name="id" value={seed.id} />
        <button
          type="submit"
          className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer transition"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </form>
    </div>
  );
}

function AddButton() {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      className="inline-flex items-center gap-2 rounded-lg bg-garden-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-garden-700 disabled:opacity-50 transition-colors cursor-pointer"
    >
      {status.pending ? "Adding..." : "Add Seed"}
    </button>
  );
}
