"use client";

import { Product } from "@/lib/types";

interface Props {
  product: Product;
  onLike: (product: Product) => void;
  onSkip: (product: Product) => void;
  skipLabel?: string;
}

export default function ProductCard({ product, onLike, onSkip, skipLabel }: Props) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
      {/* Image */}
      <a
        href={product.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative aspect-[3/4] bg-stone-50 overflow-hidden block"
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-200 text-4xl">
            ?
          </div>
        )}



        {/* Great match badge */}
        {product.isGreatMatch && (
          <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
            Great match
          </span>
        )}

        {/* Brand pill */}
        {product.brand && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold uppercase tracking-wider bg-white/85 backdrop-blur-sm text-stone-600 px-2 py-0.5 rounded-full">
            {product.brand}
          </span>
        )}
      </a>

      {/* Info — fixed height so cards don't resize on swap */}
      <div className="p-3.5 flex flex-col flex-1 h-[180px]">
        <p className="text-[11px] text-stone-400 uppercase tracking-wider">{product.category}</p>
        <h3 className="text-sm font-medium text-stone-800 leading-snug line-clamp-2 mt-1">{product.name}</h3>
        {(product.color || product.selectedSize || product.matchReason) && (
          <div className="mt-0.5 space-y-0.5">
            {(product.color || product.selectedSize) && (
              <p className="text-xs text-stone-400">
                {product.color}
                {product.color && product.selectedSize && " · "}
                {product.selectedSize && (
                  <span className="text-stone-500 font-medium">Size {product.selectedSize}</span>
                )}
                {product.selectedSize &&
                  product.availableSizes &&
                  !product.availableSizes.some(
                    (s) => s.name === product.selectedSize && s.inStock
                  ) && (
                    <span className="text-amber-500 text-[10px] ml-1">(check stock)</span>
                  )}
              </p>
            )}
            {product.matchReason && product.matchReason !== "General wardrobe piece" && (
              <p className="text-[10px] text-emerald-600 leading-tight line-clamp-2">
                {product.matchReason}
              </p>
            )}
          </div>
        )}
        <p className="text-stone-900 font-semibold text-[15px] mt-auto">{product.price}</p>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onSkip(product)}
            className="flex-1 py-2 rounded-full text-stone-400 text-xs font-medium hover:bg-stone-100 transition-colors"
          >
            {skipLabel ?? "Skip"}
          </button>
          <button
            onClick={() => onLike(product)}
            className="flex-1 py-2 rounded-full border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50 transition-colors"
          >
            Save
          </button>
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 rounded-full bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors text-center"
          >
            Get it
          </a>
        </div>
      </div>
    </div>
  );
}
