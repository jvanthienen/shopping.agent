export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-[3/4] bg-stone-100" />
      <div className="p-3.5 h-[180px] flex flex-col">
        <div className="h-2.5 bg-stone-100 rounded w-16 mb-2" />
        <div className="h-3 bg-stone-100 rounded w-full mb-1.5" />
        <div className="h-3 bg-stone-100 rounded w-3/4" />
        <div className="h-4 bg-stone-100 rounded w-14 mt-auto" />
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-8 bg-stone-50 rounded-full" />
          <div className="flex-1 h-8 bg-stone-100 rounded-full" />
          <div className="flex-1 h-8 bg-stone-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
