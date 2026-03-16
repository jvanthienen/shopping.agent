"use client";

import { Outfit, Product } from "@/lib/types";

interface Props {
  outfit: Outfit;
  onSaveAll: (items: Product[]) => void;
}

export default function OutfitCard({ outfit, onSaveAll }: Props) {
  const openAllOnZara = () => {
    outfit.items.forEach((item) => {
      if (item.productUrl) window.open(item.productUrl, "_blank");
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Outfit header */}
      <div className="p-4 border-b border-gray-50">
        <h3 className="font-serif text-lg text-stone-800">{outfit.name}</h3>
        <p className="text-xs text-stone-400 mt-1">{outfit.vibe}</p>
      </div>

      {/* Product images in a row */}
      <div className="flex">
        {outfit.items.map((item) => (
          <a
            key={item.id + item.name}
            href={item.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 aspect-[3/4] bg-gray-50 overflow-hidden relative block"
          >
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                👗
              </div>
            )}
          </a>
        ))}
      </div>

      {/* Item details */}
      <div className="p-4 space-y-2">
        {outfit.items.map((item) => (
          <a
            key={item.id + item.name}
            href={item.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm hover:bg-stone-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-stone-700 truncate">{item.name}</p>
              <p className="text-xs text-stone-400">{item.color}</p>
            </div>
            <p className="text-stone-600 font-medium ml-3 shrink-0">{item.price}</p>
          </a>
        ))}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <p className="text-stone-800 font-semibold">Total: {outfit.totalPrice}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onSaveAll(outfit.items)}
              className="px-3 py-2 rounded-xl border border-stone-800 text-stone-800 text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              Save
            </button>
            <button
              onClick={openAllOnZara}
              className="px-3 py-2 rounded-xl bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              Buy on Zara
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
