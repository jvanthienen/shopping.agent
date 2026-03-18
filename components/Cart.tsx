"use client";

import { Product } from "@/lib/types";

interface Props {
  items: Product[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

export default function Cart({ items, onRemove, onClose }: Props) {
  const openAllItems = () => {
    items.forEach((item) => {
      if (item.productUrl) window.open(item.productUrl, "_blank");
    });
  };

  const total = items
    .reduce((sum, i) => sum + parseFloat(i.price.replace("$", "") || "0"), 0)
    .toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-5 py-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl text-stone-900">Saved</h2>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {items.length} {items.length === 1 ? "item" : "items"}
              {items.length > 0 && <span className="text-stone-300"> &middot; </span>}
              {items.length > 0 && <span className="font-medium text-stone-500">${total}</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8">
            <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <p className="text-stone-400 text-sm text-center">
              Nothing saved yet.<br />
              <span className="text-stone-300">Tap Save on pieces you love.</span>
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-stone-50">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-4 group/cart hover:bg-stone-50/50 transition-colors">
                  <a
                    href={item.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-20 object-cover rounded-lg bg-stone-50"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-stone-100 rounded-lg flex items-center justify-center text-stone-300 text-lg">?</div>
                    )}
                  </a>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 leading-snug line-clamp-2">{item.name}</p>
                    {(item.color || item.selectedSize) && (
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {item.color}
                        {item.color && item.selectedSize && " · "}
                        {item.selectedSize && <span className="font-medium">Size {item.selectedSize}</span>}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-stone-900 mt-1">{item.price}</p>
                    <a
                      href={item.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-stone-400 hover:text-stone-600 mt-1 inline-block transition-colors"
                    >
                      View on {item.brand ?? "store"} &rarr;
                    </a>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="opacity-0 group-hover/cart:opacity-100 transition-opacity text-stone-300 hover:text-stone-500 self-start pt-0.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-stone-100 p-5 space-y-3">
              <button
                onClick={openAllItems}
                className="w-full py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-all active:scale-[0.98]"
              >
                Open all in store
              </button>
              <p className="text-[11px] text-stone-400 text-center">Opens each item in a new tab</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
