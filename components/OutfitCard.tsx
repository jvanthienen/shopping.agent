"use client";

import { Outfit, Product } from "@/lib/types";

interface Props {
  outfit: Outfit;
  onSaveOutfit: (outfit: Outfit) => void;
  onSwapItem: (outfitId: string, itemToReplace: Product) => void;
}

export default function OutfitCard({ outfit, onSaveOutfit, onSwapItem }: Props) {
  const openAllItems = () => {
    outfit.items.forEach((item) => {
      if (item.productUrl) window.open(item.productUrl, "_blank");
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h3 className="font-serif text-xl text-stone-900 leading-tight">{outfit.name}</h3>
        <p className="text-xs text-stone-400 mt-1 tracking-wide">{outfit.vibe}</p>
      </div>

      {/* Product images */}
      <div className="flex mx-5 rounded-xl overflow-hidden">
        {outfit.items.map((item) => (
          <div key={item.id + item.name} className="flex-1 relative group/item">
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-[3/4] bg-stone-50 overflow-hidden block"
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-200 text-2xl">
                  ?
                </div>
              )}
            </a>
            {/* Swap button */}
            <button
              onClick={() => onSwapItem(outfit.id, item)}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-stone-600 text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm border border-stone-200 hover:bg-stone-900 hover:text-white hover:border-stone-900"
            >
              Swap
            </button>
          </div>
        ))}
      </div>

      {/* Item details */}
      <div className="px-5 pt-3 pb-5 space-y-1">
        {outfit.items.map((item) => (
          <div
            key={item.id + item.name}
            className="flex items-center justify-between text-sm hover:bg-stone-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
          >
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1"
            >
              <p className="text-stone-700 truncate text-[13px]">{item.name}</p>
              <p className="text-[11px] text-stone-400">{[item.color, item.selectedSize ? `Size ${item.selectedSize}` : null, item.brand].filter(Boolean).join(" · ")}</p>
            </a>
            <div className="flex items-center gap-2.5 ml-3 shrink-0">
              <p className="text-stone-800 font-semibold text-[13px]">{item.price}</p>
              <button
                onClick={() => onSwapItem(outfit.id, item)}
                className="text-stone-300 hover:text-stone-600 text-xs transition-colors"
                title="Swap this piece"
              >
                ↻
              </button>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-3 mt-2 border-t border-stone-100">
          <p className="text-stone-900 font-semibold">{outfit.totalPrice}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onSaveOutfit(outfit)}
              className="px-4 py-2 rounded-full border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50 transition-colors"
            >
              Save all
            </button>
            <button
              onClick={openAllItems}
              className="px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
            >
              Get all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
