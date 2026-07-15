"use client";

import { Heart, Shield, Star, Users } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex-1 min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-5 relative overflow-hidden">
      {/* Subtle Background matrimonial decoration grids */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#be123c 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Decorative top soft rose light glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="relative z-10 flex items-center justify-center gap-2.5 pt-4">
        <div className="w-10 h-10 bg-gradient-to-tr from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(225,29,72,0.25)]">
          <Heart className="w-5 h-5 text-white fill-current" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-lg tracking-tight">
            Thirumana <span className="text-rose-600">Matrimony</span>
          </h1>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider -mt-0.5">
            Connecting Hearts • Tamil Nadu
          </p>
        </div>
      </div>

      {/* Middle Welcome Graphic Card */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center space-y-5 max-w-sm mx-auto w-full">
        {/* Photo Container */}
        <div className="relative w-full h-52 rounded-3xl overflow-hidden shadow-sm border-2 border-white bg-slate-100">
          <img
            src="https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Indian marriage"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent z-10" />
        </div>

        <div className="space-y-2 px-2">
          <h2 className="text-xl font-display font-extrabold leading-tight text-slate-900">
            Find Your Perfect <br />
            <span className="text-rose-600">Life Partner Today</span>
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto font-medium">
            India's most trusted matrimonial platform for Tamil families.
            Register today and browse verified matches.
          </p>
        </div>

        {/* Small stats badges */}
        <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
          <div className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-col items-center shadow-sm">
            <Users className="w-4 h-4 text-rose-500 mb-1" />
            <span className="text-[10px] font-bold text-slate-700">
              50K+ Couples
            </span>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-col items-center shadow-sm">
            <Shield className="w-4 h-4 text-emerald-500 mb-1" />
            <span className="text-[10px] font-bold text-slate-700">
              100% Verified
            </span>
          </div>
        </div>
      </div>

      {/* Footer CTAs */}
      <div className="relative z-10 space-y-3 pb-6 max-w-sm mx-auto w-full">
        <Link
          href="/signup"
          className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold py-3.5 rounded-2xl shadow-md hover:shadow-rose-100 text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
        >
          REGISTER FREE
        </Link>

        <Link
          href="/login"
          className="w-full bg-white hover:bg-slate-50 border border-rose-200 text-rose-600 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-sm"
        >
          LOGIN TO ACCOUNT
        </Link>

        <p className="text-[9px] text-slate-400 text-center font-medium pt-3 flex items-center justify-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          Safe, Secure & Trusted Matrimonial App
        </p>
      </div>
    </div>
  );
}
