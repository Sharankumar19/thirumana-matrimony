'use client';

import { Check, Crown, Zap } from 'lucide-react';
import type { PlanDetails, PlanType } from '@/types';

interface PlanCardProps {
  plan: PlanDetails;
  currentPlan?: PlanType;
  onSelect: (planType: PlanType) => void;
  loading?: boolean;
}

const planIcons: Record<PlanType, React.ReactNode> = {
  free: <span className="text-2xl">🆓</span>,
  premium: <Crown className="w-6 h-6 text-amber-500 fill-amber-500" />,
  standard: <Zap className="w-6 h-6" />,
  pro: <Crown className="w-6 h-6" />,
  elite: <span className="text-2xl">💎</span>,
};

const planColors: Record<PlanType, string> = {
  free: 'border-gray-200 bg-white',
  premium: 'border-amber-300 bg-amber-50/30',
  standard: 'border-blue-200 bg-blue-50/30',
  pro: 'border-rose-300 bg-rose-50/30',
  elite: 'border-purple-300 bg-purple-50/30',
};

const planButtonColors: Record<PlanType, string> = {
  free: 'bg-gray-200 text-gray-600 cursor-not-allowed',
  premium: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white',
  standard: 'bg-blue-600 hover:bg-blue-700 text-white',
  pro: 'bg-premium-gradient text-white shadow-button hover:shadow-lg',
  elite: 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white',
};

export default function PlanCard({ plan, currentPlan, onSelect, loading }: PlanCardProps) {
  const isCurrent = currentPlan === plan.type;
  const isFree = plan.type === 'free';

  return (
    <div className={`relative rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-1
      ${planColors[plan.type]}
      ${plan.popular ? 'ring-2 ring-rose-400 ring-offset-2' : ''}
      ${isCurrent ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}
    >
      {plan.popular && !isCurrent && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-premium-gradient text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
            MOST POPULAR
          </span>
        </div>
      )}
      {isCurrent && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
            CURRENT PLAN
          </span>
        </div>
      )}

      <div className="text-center mb-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3
          ${plan.type === 'elite' ? 'bg-amber-100 text-amber-600' :
            plan.type === 'pro' ? 'bg-rose-100 text-rose-600' :
            plan.type === 'standard' ? 'bg-blue-100 text-blue-600' :
            'bg-gray-100 text-gray-500'}`}
        >
          {planIcons[plan.type]}
        </div>
        <h3 className="font-display font-bold text-xl text-gray-900">{plan.name}</h3>
        <div className="mt-2">
          {plan.price === 0 ? (
            <span className="text-3xl font-bold text-gray-400">Free</span>
          ) : (
            <>
              <span className="text-3xl font-bold text-gray-900">₹{plan.price.toLocaleString()}</span>
              <span className="text-gray-500 text-sm">/{plan.duration}</span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {plan.contacts === 0 ? 'Browse only' : `${plan.contacts} contact views`}
        </p>
      </div>

      <ul className="space-y-2.5 mb-6">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={() => !isFree && !isCurrent && onSelect(plan.type)}
        disabled={isFree || isCurrent || loading}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
          ${isCurrent ? 'bg-green-100 text-green-700 cursor-not-allowed' :
            isFree ? planButtonColors.free :
            planButtonColors[plan.type]}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Processing...
          </span>
        ) : isCurrent ? 'Active Plan' :
          isFree ? 'Default Plan' :
          `Get ${plan.name}`}
      </button>
    </div>
  );
}
