'use client';

import { useEffect, useState } from 'react';
import { Shield, CheckCircle, Crown, Lock, Sparkles, Zap, CreditCard, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSubscription } from '@/store/slices/subscriptionSlice';
import type { PlanType } from '@/types';

const FREE_FEATURES = [
  'Browse unlimited profiles',
  'Send unlimited interest requests',
  'Use the chat feature',
  'View profile photos and details',
  'Receive interest notifications',
];

const PREMIUM_FEATURES = [
  'Everything in Free',
  'View full mobile numbers',
  'View complete email addresses',
  'Access to all current & future premium features',
  'Priority customer support',
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function SubscriptionPage() {
  const dispatch = useAppDispatch();
  const { subscription, loading } = useAppSelector((s) => s.subscription);
  const [upgrading, setUpgrading] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchSubscription());
  }, [dispatch]);

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/subscriptions/payment-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Failed to create payment order');
        setUpgrading(false);
        return;
      }

      if (data.is_mock) {
        // Open simulated sandbox checkout modal
        setMockPaymentData(data);
        setShowMockModal(true);
        setUpgrading(false);
      } else {
        // Load Razorpay dynamically and open Checkout
        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded) {
          toast.error('Failed to load Razorpay SDK. Please check your connection.');
          setUpgrading(false);
          return;
        }

        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: data.currency,
          name: 'Thirumana Matrimony',
          description: 'Premium Membership Upgrade',
          order_id: data.order_id,
          handler: async function (response: any) {
            setUpgrading(true);
            try {
              const verifyRes = await fetch('/api/subscriptions/verify-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                toast.success(verifyData.message || '🎉 Congratulations! Your Premium Membership has been activated successfully.');
                dispatch(fetchSubscription());
                const { fetchProfile } = await import('@/store/slices/userSlice');
                dispatch(fetchProfile());
              } else {
                toast.error(verifyData.error || 'Payment was unsuccessful. Please try again.');
              }
            } catch (err) {
              toast.error('Payment was unsuccessful. Please try again.');
            } finally {
              setUpgrading(false);
            }
          },
          prefill: {
            name: '',
            email: '',
          },
          theme: {
            color: '#E11D48', // rose-600
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setUpgrading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred. Please try again.');
      setUpgrading(false);
    }
  }

  async function handleSimulateSuccess() {
    setShowMockModal(false);
    setUpgrading(true);
    try {
      const token = localStorage.getItem('token');
      const verifyRes = await fetch('/api/subscriptions/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
          razorpay_order_id: mockPaymentData.order_id,
          razorpay_signature: 'mock_signature_verified_by_sandbox',
        }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        toast.success(verifyData.message || '🎉 Congratulations! Your Premium Membership has been activated successfully.');
        dispatch(fetchSubscription());
        const { fetchProfile } = await import('@/store/slices/userSlice');
        dispatch(fetchProfile());
      } else {
        toast.error(verifyData.error || 'Payment was unsuccessful. Please try again.');
      }
    } catch (err) {
      toast.error('Payment was unsuccessful. Please try again.');
    } finally {
      setUpgrading(false);
    }
  }

  function handleSimulateFailure() {
    setShowMockModal(false);
    toast.error('Payment was unsuccessful. Please try again.');
  }

  const currentPlan = subscription?.plan_type || 'free';
  const isPremium = ['premium', 'standard', 'pro', 'elite'].includes(currentPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-full border border-amber-300 mb-5">
            <Crown className="w-4 h-4" />
            Membership Plans
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 font-display">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Browse for free. Upgrade to Premium for ₹2999 to unlock complete contact details and connect directly.
          </p>
        </div>

        {/* Current Plan Banner */}
        {isPremium && (
          <div className="mb-8 max-w-lg mx-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg transition-all duration-300">
            <Crown className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg">🎉 Congratulations! Your Premium Membership is active.</p>
              <p className="text-white/80 text-sm">
                Full contact access active · Expires{' '}
                {subscription?.expiry_date
                  ? new Date(subscription.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-3xl mx-auto">

          {/* Free Plan */}
          <div className={`relative rounded-2xl border-2 p-8 bg-white transition-all duration-300 ${
            !isPremium ? 'border-green-400 ring-2 ring-green-300 ring-offset-2' : 'border-gray-200'
          }`}>
            {!isPremium && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                  CURRENT PLAN
                </span>
              </div>
            )}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🆓</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900">Free</h3>
              <div className="mt-3">
                <span className="text-4xl font-extrabold text-gray-400">₹0</span>
                <span className="text-gray-400 text-sm ml-1">/ forever</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Lock className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                <span>Contact details masked</span>
              </li>
            </ul>
            <button
              disabled
              className="w-full py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              {!isPremium ? 'Current Plan' : 'Free Plan'}
            </button>
          </div>

          {/* Premium Plan */}
          <div className={`relative rounded-2xl border-2 p-8 bg-gradient-to-br from-amber-50 to-orange-50 transition-all duration-300 hover:-translate-y-1 ${
            isPremium ? 'border-amber-400 ring-2 ring-amber-300 ring-offset-2' : 'border-amber-300'
          }`}>
            {!isPremium && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                  RECOMMENDED
                </span>
              </div>
            )}
            {isPremium && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                  CURRENT PLAN
                </span>
              </div>
            )}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900">Premium</h3>
              <div className="mt-3">
                <span className="text-4xl font-extrabold text-gray-900">₹2999</span>
                <span className="text-gray-500 text-sm ml-1">/ month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={isPremium || loading || upgrading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                isPremium
                  ? 'bg-amber-100 text-amber-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-orange-300'
              }`}
            >
              {upgrading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : isPremium ? (
                <>
                  <Crown className="w-4 h-4" />
                  Active Plan
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  Upgrade to Premium — ₹2999
                </>
              )}
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-3xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-center text-gray-900 mb-8">
            Why Upgrade to Premium?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, color: 'bg-blue-50 text-blue-600', title: 'Privacy Protected', desc: 'Contact details only visible to verified Premium members.' },
              { icon: Zap, color: 'bg-amber-50 text-amber-600', title: 'Instant Access', desc: 'Upgrade and instantly view full contact details of any profile.' },
              { icon: Crown, color: 'bg-rose-50 text-rose-600', title: 'Connect Directly', desc: 'Reach out directly via phone or email — no middlemen.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="text-center">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Simulated Sandbox Checkout Modal */}
      {showMockModal && mockPaymentData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-[#1F2937] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-500" />
                <span className="font-semibold font-display tracking-wide">Razorpay Checkout</span>
                <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">Sandbox</span>
              </div>
              <button 
                onClick={handleSimulateFailure}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Merchant Details */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h4 className="font-bold text-gray-900 text-base">Thirumana Matrimony</h4>
                <p className="text-xs text-gray-500 mt-0.5">Premium Membership Upgrade</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Amount</p>
                <p className="text-2xl font-extrabold text-rose-600">₹2999.00</p>
              </div>
            </div>

            {/* Simulated Payment actions */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                Choose a simulation option below to test the upgrade flow. Security signature verification is mock-validated on the backend.
              </p>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleSimulateSuccess}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-emerald-200 transition-all duration-150 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Simulate Success Payment
                </button>

                <button
                  onClick={handleSimulateFailure}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-red-200 transition-all duration-150 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Simulate Failed / Cancelled
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center text-xs text-gray-400 border-t border-gray-100">
              <span>Order: {mockPaymentData.order_id}</span>
              <span>Secure Connection</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}