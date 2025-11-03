import { motion } from 'framer-motion';
import ServiceCard from '../components/ServiceCard';

const ServicesPage = () => {
  const services = [
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      title: 'AI Chatbot Integration',
      description: 'Deploy intelligent chatbots that handle customer inquiries 24/7, integrated seamlessly with WhatsApp, your website, and social media platforms.',
      features: [
        'WhatsApp Business API integration',
        'Website live chat widget',
        'Natural language understanding',
        'Multi-language support (English & Swahili)',
        'Custom training on your business data',
        'Appointment booking & scheduling',
        'Product recommendations',
        'Order status tracking',
      ],
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Business Automation',
      description: 'Streamline your operations with intelligent automation. From invoicing to inventory management, automate repetitive tasks and focus on growth.',
      features: [
        'Automated invoice generation',
        'Inventory tracking & alerts',
        'Email & SMS notifications',
        'Payment reminders',
        'Report generation',
        'Data synchronization',
        'Workflow automation',
        'Integration with existing systems',
      ],
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Data Analytics & BI Dashboards',
      description: 'Transform your data into actionable insights. Beautiful, real-time dashboards that help you make informed business decisions.',
      features: [
        'Real-time data visualization',
        'Sales performance tracking',
        'Customer behavior analysis',
        'Inventory analytics',
        'Revenue forecasting',
        'Custom reports',
        'Mobile-responsive dashboards',
        'Export to Excel/PDF',
      ],
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: 'Business Websites',
      description: 'Professional, modern websites that showcase your brand and drive conversions. Fast, mobile-friendly, and SEO-optimized.',
      features: [
        'Responsive design (mobile, tablet, desktop)',
        'Fast loading speeds',
        'SEO optimization',
        'Contact forms',
        'Google Maps integration',
        'Social media integration',
        'Content management system',
        'Free SSL certificate',
      ],
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'E-commerce Solutions',
      description: 'Launch your online store with powerful e-commerce features. Accept payments, manage inventory, and sell across Kenya.',
      features: [
        'Product catalog management',
        'Shopping cart & checkout',
        'M-Pesa integration',
        'Order management system',
        'Customer accounts',
        'Inventory tracking',
        'Discount codes & promotions',
        'Shipping & delivery options',
      ],
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: 'Custom Web Applications',
      description: 'Need something unique? We build custom web applications tailored to your specific business needs and workflows.',
      features: [
        'Custom features & functionality',
        'User authentication & roles',
        'Database design & management',
        'API development & integration',
        'Cloud hosting setup',
        'Security & data protection',
        'Scalable architecture',
        'Maintenance & updates',
      ],
    },
  ];

  const process = [
    {
      step: '1',
      title: 'Discovery Call',
      description: 'We start with a free consultation to understand your business needs, goals, and challenges.',
    },
    {
      step: '2',
      title: 'Proposal & Quote',
      description: 'Receive a detailed proposal with project scope, timeline, and transparent pricing within 24 hours.',
    },
    {
      step: '3',
      title: 'Design & Development',
      description: 'Our team designs and builds your solution with regular updates and opportunities for feedback.',
    },
    {
      step: '4',
      title: 'Testing & Launch',
      description: 'Thorough testing ensures everything works perfectly before we launch your solution.',
    },
    {
      step: '5',
      title: 'Training & Support',
      description: 'We train your team and provide ongoing support to ensure success.',
    },
  ];

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
            <h1 className="heading-1 mb-6">Our Services</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive AI and web solutions designed for Kenyan businesses.
              From chatbots to e-commerce, we have everything you need to grow digitally.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                {...service}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section bg-black/20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="heading-2 mb-4">Our Process</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              A simple, transparent process from idea to launch
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {process.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 mb-8 last:mb-0"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-2xl font-bold text-white">
                    {item.step}
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-12 text-center"
          >
            <h2 className="heading-2 mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Let us know what you need, and we will create a custom solution for your business.
            </p>
            <motion.a
              href="/quote"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary text-lg px-8 py-4 inline-block"
            >
              Request a Quote
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
