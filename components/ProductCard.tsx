"use client";

import { Product } from "@/lib/types";

interface Props {
  product: Product;
  onLike: (product: Product) => void;
  onSkip: (product: Product) => void;
}

export default function ProductCard({ product, onLike, onSkip }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Image — clickable to Zara */}
      <a
        href={product.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative aspect-[3/4] bg-gray-50 overflow-hidden block"
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            👗
          </div>
        )}
      </a>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wider">{product.category}</p>
          <h3 className="font-medium text-stone-800 leading-snug mt-0.5">{product.name}</h3>
          {product.color && (
            <p className="text-xs text-stone-400 mt-0.5">{product.color}</p>
          )}
        </div>

        <p className="text-stone-700 font-semibold">{product.price}</p>

        {product.matchReason && (
          <p className="text-xs text-stone-400 italic leading-relaxed">{product.matchReason}</p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto pt-2">
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 rounded-xl bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 transition-colors text-center block"
          >
            Get it
          </a>
          <div className="flex gap-2">
            <button
              onClick={() => onSkip(product)}
              className="flex-1 py-1.5 rounded-xl border border-stone-200 text-stone-400 text-xs font-medium hover:bg-stone-50 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => onLike(product)}
              className="flex-1 py-1.5 rounded-xl border border-stone-800 text-stone-800 text-xs font-medium hover:bg-stone-50 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
