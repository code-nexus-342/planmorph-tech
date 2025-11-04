import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  const pricingTiers = [
    {
      name: 'Starter Website',
      originalPrice: '50,000',
      price: '25,000',
      period: 'one-time',
      description: 'Perfect for small businesses getting online',
      features: [
        '5-page responsive website',
        'Mobile-friendly design',
        'Contact form',
        'Google Maps integration',
        'Basic SEO optimization',
        '3 months free hosting',
        '2 rounds of revisions',
        'Free SSL certificate',
      ],
      popular: false,
    },
    {
      name: 'Business Pro',
      originalPrice: '150,000',
      price: '75,000',
      period: 'one-time',
      description: 'Complete online presence for growing businesses',
      features: [
        'Up to 15-page website',
        'Custom design',
        'Content management system',
        'Blog functionality',
        'Advanced SEO',
        '6 months free hosting',
        'Email integration',
        'Social media links',
        'Analytics dashboard',
        'Unlimited revisions',
      ],
      popular: true,
    },
    {
      name: 'E-commerce',
      originalPrice: '250,000',
      price: '125,000',
      period: 'one-time',
      description: 'Full-featured online store',
      features: [
        'Unlimited products',
        'Shopping cart & checkout',
        'M-Pesa integration',
        'Inventory management',
        'Order tracking',
        'Customer accounts',
        'Discount codes',
        '1 year free hosting',
        'Product analytics',
        'Priority support',
      ],
      popular: false,
    },
  ];

  const aiSolutions = [
    {
      name: 'AI Chatbot',
      originalPrice: '100,000',
      price: '50,000',
      period: 'setup + monthly',
      monthly: '5,000',
      monthlyOriginal: '10,000',
      description: '24/7 intelligent customer service',
      features: [
        'WhatsApp integration',
        'Website chat widget',
        'Custom training',
        'Multi-language support',
        'Analytics dashboard',
        'Unlimited conversations',
        'Monthly optimization',
        'Priority support',
      ],
    },
    {
      name: 'Business Automation',
      originalPrice: '200,000',
      price: '100,000',
      period: 'one-time',
      description: 'Automate your workflows',
      features: [
        'Invoice automation',
        'Inventory tracking',
        'Email notifications',
        'SMS alerts',
        'Report generation',
        'Custom workflows',
        '6 months support',
        'Training included',
      ],
    },
    {
      name: 'Analytics Dashboard',
      originalPrice: '150,000',
      price: '75,000',
      period: 'one-time',
      description: 'Real-time business insights',
      features: [
        'Custom dashboard',
        'Real-time data',
        'Sales analytics',
        'Customer insights',
        'Mobile responsive',
        'Export reports',
        'API integrations',
        '1 year support',
      ],
    },
  ];

  const PricingCard = ({ tier, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`relative card h-full flex flex-col ${
        tier.popular ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}

      <div className="flex-grow">
        <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
        <p className="text-gray-400 mb-6">{tier.description}</p>

        <div className="mb-6">
          {tier.originalPrice && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl text-gray-500 line-through">KES {tier.originalPrice}</span>
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                SAVE 50%
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">KES {tier.price}</span>
          </div>
          <div className="text-gray-400 text-sm">{tier.period}</div>
          {tier.monthly && (
            <div className="flex items-center gap-2 mt-2">
              {tier.monthlyOriginal && (
                <span className="text-sm text-gray-500 line-through">
                  KES {tier.monthlyOriginal}/mo
                </span>
              )}
              <span className="text-sm text-primary-400">
                + KES {tier.monthly}/month maintenance
              </span>
            </div>
          )}
        </div>

        <ul className="space-y-3 mb-8">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-300">
              <svg
                className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link to="/quote" className="mt-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            tier.popular
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
              : 'glass hover:bg-white/20 text-white'
          }`}
        >
          Get Started
        </motion.button>
      </Link>
    </motion.div>
  );

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="section">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="heading-1 mb-6">
              Fair & Transparent
              <br />
              <span className="gradient-text">Pricing</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              No hidden fees. No surprises. Just honest, transparent pricing for your business.
            </p>
            <div className="glass inline-block px-6 py-3 rounded-full">
              <span className="text-primary-400 font-semibold">💡 Custom solutions available - </span>
              <Link to="/quote" className="text-white hover:underline">
                Request a quote
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Web Solutions Pricing */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="heading-2 mb-4">Website Packages</h2>
            <p className="text-xl text-gray-300">
              Professional websites at prices you can afford
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {pricingTiers.map((tier, index) => (
              <PricingCard key={index} tier={tier} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Solutions Pricing */}
      <section className="section bg-black/20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="heading-2 mb-4">AI & Automation Solutions</h2>
            <p className="text-xl text-gray-300">
              Smart solutions that save time and money
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiSolutions.map((tier, index) => (
              <PricingCard key={index} tier={tier} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="heading-2 mb-4">Why We Are More Affordable</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We believe in fair pricing. Here is how we compare to other agencies worldwide.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto glass rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-gray-400 mb-2">Typical Agency</div>
                <div className="text-3xl font-bold text-gray-500 line-through">KES 300K+</div>
                <div className="text-sm text-gray-500 mt-2">Business Website</div>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-primary-400 font-semibold mb-2">PlanMorph Tech</div>
                <div className="text-4xl font-bold gradient-text">KES 150K</div>
                <div className="text-sm text-green-400 mt-2">Save 50%</div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-white font-semibold mb-3">What You Get:</div>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span> Same quality
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span> Faster delivery
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span> Better support
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="text-white font-semibold mb-3">What You Save:</div>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span> 50% lower costs
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span> No hidden fees
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span> Transparent pricing
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-black/20">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="heading-2 mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: 'Do you offer payment plans?',
                a: 'Yes! We offer flexible payment plans. Pay 50% upfront and 50% on completion, or spread payments over 3 months.',
              },
              {
                q: 'What is included in maintenance?',
                a: 'Monthly maintenance includes hosting, security updates, bug fixes, and minor content updates. Major changes are quoted separately.',
              },
              {
                q: 'Can I upgrade later?',
                a: 'Absolutely! You can start with a basic package and upgrade anytime. We will credit your initial investment.',
              },
              {
                q: 'How long does it take?',
                a: 'Most websites are delivered in 2-4 weeks. E-commerce and custom solutions take 4-8 weeks depending on complexity.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-3">{faq.q}</h3>
                <p className="text-gray-300">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-2 mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get a free, personalized quote for your project. No commitments required.
            </p>
            <Link to="/quote">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary text-lg px-8 py-4"
              >
                Request Your Free Quote
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
