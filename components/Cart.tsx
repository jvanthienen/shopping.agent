"use client";

import { Product } from "@/lib/types";

interface Props {
  items: Product[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

export default function Cart({ items, onRemove, onClose }: Props) {
  const openAllInZara = () => {
    items.forEach((item) => {
      if (item.productUrl) window.open(item.productUrl, "_blank");
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-xl flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-xl text-stone-800">Saved ({items.length})</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-stone-300 text-sm">
            Nothing saved yet
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-gray-50">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-4">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-20 object-cover rounded-lg bg-gray-50" />
                  ) : (
                    <div className="w-16 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">👗</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 leading-snug">{item.name}</p>
                    {item.color && <p className="text-xs text-stone-400 mt-0.5">{item.color}</p>}
                    <p className="text-sm font-semibold text-stone-700 mt-1">{item.price}</p>
                    <a
                      href={item.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-stone-400 underline mt-1 inline-block hover:text-stone-600"
                    >
                      View on Zara →
                    </a>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-stone-300 hover:text-stone-500 text-sm self-start pt-0.5"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-100">
              <button
                onClick={openAllInZara}
                className="w-full py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-colors"
              >
                Open all in Zara →
              </button>
              <p className="text-xs text-stone-400 text-center mt-2">Opens each item in a new tab</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
