import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export function HeroBanner() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Main hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 p-6 sm:p-8">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Zap size={12} />
            Limited time
          </span>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            GET UP TO
            <br />
            <span className="text-yellow-200">50% OFF</span>
          </h2>
          <p className="mt-2 text-sm text-white/80">
            On selected footwear & accessories
          </p>
          <Link
            href="/?category=Footwear"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-900 shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
          >
            Get Discount
            <ArrowRight size={14} />
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
      </div>

      {/* Secondary hero */}
      <div className="relative overflow-hidden rounded-2xl bg-yellow-400 p-6 sm:p-8">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-800">
            New Collection
          </p>
          <h2 className="mt-2 text-2xl font-black text-gray-900">
            Winter&apos;s Weekend
          </h2>
          <p className="mt-1 text-sm text-gray-700">Keep it casual</p>
          <Link
            href="/?category=Clothing"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-gray-700 active:scale-95"
          >
            Shop Now
            <ArrowRight size={14} />
          </Link>
        </div>
        {/* Decorative */}
        <div className="absolute -right-6 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-yellow-300/60" />
      </div>
    </div>
  );
}
