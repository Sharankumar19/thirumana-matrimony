'use client';

import { useEffect, useState } from 'react';
import { Shield, Zap, CheckCircle, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSubscription, upgradePlan } from '@/store/slices/subscriptionSlice';
import PlanCard from '@/components/subscription/PlanCard';
import type { PlanDetails, PlanType } from '@/types';

const PLANS: PlanDetails[] = [
  {
    type: 'free',
    name: 'Free',
    price: 0,
    contacts: 2,
    duration: 'forever',
    features: ['Browse profiles', 'Send interests', 'View limited details'],
  },
  {
    type: 'standard',
    name: 'Standard',
    price: 199,
    contacts: 9,
    duration: 'month',
    features: ['7 contacts', 'Email alerts', 'Priority listing'],
  },
  {
    type: 'pro',
    name: 'Pro',
    price: 499,
    contacts: 15,
    duration: 'month',
    popular: true,
    features: ['15 contacts', 'Advanced filters', 'Featured badge'],
  },
  {
    type: 'elite',
    name: 'Elite',
    price: 999,
    contacts: 30,
    duration: 'month',
    features: ['30 contacts', 'Top ranking', 'Premium support'],
  },
];

export default function SubscriptionPage() {
  const dispatch = useAppDispatch();
  const { subscription, loading } = useAppSelector((s) => s.subscription);

  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState<PlanType | null>(null);

  useEffect(() => {
    dispatch(fetchSubscription());
  }, [dispatch]);

  async function handleSelectPlan(planType: PlanType) {
    const result = await dispatch(upgradePlan(planType));

    if (upgradePlan.fulfilled.match(result)) {
      setSuccess(planType);
      toast.success(`Upgraded to ${planType} plan!`);
      setTimeout(() => setSuccess(null), 4000);
    } else {
      toast.error('Upgrade failed');
    }
  }

  const contactsLeft =
    (subscription?.contact_limit || 0) -
    (subscription?.contacts_used || 0);

  const usage =
    subscription?.contact_limit
      ? (subscription.contacts_used / subscription.contact_limit) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-semibold px-4 py-2 rounded-full border border-amber-200 mb-4">
            <Crown className="w-4 h-4" />
            Membership Plans
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Choose Your Plan
          </h1>

          <p className="text-gray-500 max-w-2xl mx-auto">
            Unlock contact details and connect directly with your matches.
          </p>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="mb-8 max-w-xl mx-auto bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-bold">Upgrade Successful!</p>
              <p className="text-sm">
                You are now on <span className="font-semibold capitalize">{success}</span> plan
              </p>
            </div>
          </div>
        )}

        {/* Current Plan Card */}
        {subscription && (
          <div className="mb-10 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 max-w-xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Plan</p>
                <p className="font-bold text-gray-900 capitalize flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  {subscription.plan_type}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{contactsLeft}</p>
                <p className="text-xs text-gray-500">contacts left</p>
              </div>
            </div>

            {/* Progress */}
            {subscription.contact_limit > 0 && (
              <>
                <div className="flex justify-between text-xs text-gray-400 mt-4">
                  <span>Used: {subscription.contacts_used}</span>
                  <span>Total: {subscription.contact_limit}</span>
                </div>

                <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all"
                    style={{ width: `${usage}%` }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.type}
              plan={plan}
              currentPlan={subscription?.plan_type}
              onSelect={handleSelectPlan}
              loading={loading || upgrading}
            />
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-xl font-bold text-center mb-8">
            Why Choose Premium?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Secure',
                desc: 'Your data is fully protected and private.',
              },
              {
                icon: Zap,
                title: 'Instant Access',
                desc: 'Upgrade and start connecting immediately.',
              },
              {
                icon: CheckCircle,
                title: 'Verified Profiles',
                desc: 'Access trusted and verified matches.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}