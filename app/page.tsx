// app/page.tsx — Public landing page
import Link from 'next/link';
import { Heart, Search, Shield, Star, ArrowRight, CheckCircle } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';

export default function HomePage() {
  const stats = [
    { label: 'Happy Couples', value: '50,000+' },
    { label: 'Active Profiles', value: '2 Lakh+' },
    { label: 'Communities', value: '500+' },
    { label: 'Success Rate', value: '94%' },
  ];

  const HERO_STATS = [
  { value: '5M+', label: 'Registered Profiles' },
  { value: '3L+', label: 'Successful Matches' },
  { value: '25+', label: 'Years of Trust' },
  { value: '4.8★', label: 'App Rating' },
];

  const features = [
    {
      icon: Search,
      title: 'Smart Matching',
      desc: 'Filter by religion, caste, location, age, and profession to find your ideal partner.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Shield,
      title: 'Verified Profiles',
      desc: 'Every profile is reviewed. Phone numbers are hidden until you unlock them.',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: Heart,
      title: 'Express Interest',
      desc: 'Send and receive interests. Get notified when someone likes your profile.',
      color: 'bg-rose-50 text-rose-600',
    },
    {
      icon: Star,
      title: 'Premium Plans',
      desc: 'Upgrade to unlock contact details and get featured at the top of searches.',
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  const testimonials = [
    {
      name: 'Priya & Rahul',
      text: 'We found each other on Thirumana Matrimony and got married within 6 months. The platform made the entire process so easy!',
      religion: 'Hindu • Tamil Nadu',
      avatar: 'P',
    },
    {
      name: 'Aisha & Farhan',
      text: 'The filters helped us find exactly what we were looking for. Highly recommend Thirumana Matrimony to everyone.',
      religion: 'Muslim • Maharashtra',
      avatar: 'A',
    },
    {
      name: 'Gurpreet & Mandeep',
      text: 'Within 2 weeks of creating my profile, I found my life partner. Thank you Thirumana Matrimony!',
      religion: 'Sikh • Punjab',
      avatar: 'G',
    },
  ];

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navbar />

      {/* Hero */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-rose-200">
                <Star className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                India&apos;s Most Trusted Matrimonial Platform
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Find Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-700">
                  Perfect Match
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
                Join millions of families who have found their perfect life partner on Thirumanam Matrimony. Start your journey to a blissful marriage today.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-rose-300 transition-all text-base"
                >
                  Register for Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 hover:border-rose-300 hover:text-rose-700 font-bold px-8 py-4 rounded-xl transition-all text-base bg-white hover:bg-rose-50"
                >
                  <Search className="w-5 h-5" />
                  Browse Profiles
                </Link>
              </div>

              <div className="flex flex-wrap gap-3">
                {['Free to Join', 'Verified Profiles', 'Secure & Private'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Happy couple"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-900/30 to-transparent" />
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-100">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">New Match Today</p>
                    <p className="text-sm font-bold text-gray-900">Swetha & Sharan</p>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Active Members</p>
                  <p className="text-2xl font-extrabold text-rose-600">5M+</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {HERO_STATS.map(({ value, label }) => (
              <div key={label} className="text-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-3xl font-extrabold text-rose-600 mb-1">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-3">Why Choose Thirumana Matrimony?</h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">Everything you need to find your ideal life partner, in one place.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card p-6 text-center hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
       <section className="py-20 bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-gray-500">Real couples, real love, found on Thirumanam Matrimony</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, avatar, text }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-100" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{name}</p>
                    {/* <p className="text-xs text-gray-500">{location}</p> */}
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">&ldquo;{text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
       <section className="py-20 bg-gradient-to-r from-rose-600 to-rose-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <Heart className="w-12 h-12 text-white/60 fill-white/30 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Begin Your Journey Today
          </h2>
          <p className="text-rose-100 mb-8 text-lg">
            Join over 5 million families who trust Thirumanam Matrimony to find their perfect match.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-rose-700 font-bold px-8 py-4 rounded-xl hover:bg-rose-50 transition-colors shadow-lg text-base"
            >
              Create Free Profile
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/subscription"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-base"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-white text-lg font-bold">Thirumana Matrimony</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              India&apos;s trusted matrimonial platform connecting hearts across communities. Find your perfect life partner with confidence.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="hover:text-rose-400 transition-colors">Find Matches</Link></li>
              <li><Link href="/plans" className="hover:text-rose-400 transition-colors">Subscription Plans</Link></li>
              <li><Link href="/signup" className="hover:text-rose-400 transition-colors">Register Free</Link></li>
              <li><Link href="/login" className="hover:text-rose-400 transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-rose-400 cursor-pointer transition-colors">Help Center</span></li>
              <li><span className="hover:text-rose-400 cursor-pointer transition-colors">Privacy Policy</span></li>
              <li><span className="hover:text-rose-400 cursor-pointer transition-colors">Terms of Service</span></li>
              <li><span className="hover:text-rose-400 cursor-pointer transition-colors">Contact Us</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Thirumana Matrimonials. All rights reserved.
          </p>
          <p className="text-xs flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> in India
          </p>
        </div>
      </div>
    </footer>
    </div>
  );
}
