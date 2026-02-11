"use client";

import React from "react";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn>(async () => false);

export function useConfirm() {
  return React.useContext(ConfirmContext);
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = React.useState<
    (ConfirmOptions & { resolve: (value: boolean) => void }) | null
  >(null);

  const confirm = React.useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setDialog({ ...options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    dialog?.resolve(true);
    setDialog(null);
  };

  const handleCancel = () => {
    dialog?.resolve(false);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 animate-[fadeIn_0.15s_ease-out]"
            onClick={handleCancel}
          />
          <div className="relative bg-white rounded-xl shadow-xl border border-earth-200 w-96 max-w-[90vw] p-6 animate-[scaleIn_0.15s_ease-out]">
            <h3 className="text-base font-semibold text-gray-900 mb-2">{dialog.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{dialog.message}</p>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                className="rounded-lg border border-earth-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition cursor-pointer ${
                  dialog.destructive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-garden-600 hover:bg-garden-700"
                }`}
                onClick={handleConfirm}
                autoFocus
              >
                {dialog.confirmLabel ?? (dialog.destructive ? "Delete" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
