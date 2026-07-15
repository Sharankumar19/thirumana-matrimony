/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN', // Clickjacking protection
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff', // MIME Sniffing protection
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block', // Browser XSS protection
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin', // Referrer data privacy
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload', // HSTS Force HTTPS
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://images.pexels.com blob: https://www.google-analytics.com https://analytics.google.com; connect-src 'self' wss: ws: https://api.razorpay.com https://www.google-analytics.com https://analytics.google.com; font-src 'self' data: https://fonts.gstatic.com; frame-src 'self' https://api.razorpay.com; object-src 'none';", // Content security controls
  }
];

const nextConfig = {
  serverExternalPackages: ['sequelize', 'mysql2', 'bcryptjs'],
  images: {
    domains: ['localhost', 'images.pexels.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
