import { useState } from 'react';
import { motion } from 'framer-motion';
import { requestsAPI } from '../utils/api';

const QuoteRequestPage = () => {
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    company_name: '',
    project_type: '',
    requirements: '',
    budget_range: '',
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectTypes = [
    'Business Website',
    'E-commerce Website',
    'Web Application',
    'AI Chatbot Integration',
    'Business Automation',
    'Data Analytics Dashboard',
    'Custom Solution',
    'Other',
  ];

  const budgetRanges = [
    'Under KES 50,000',
    'KES 50,000 - 100,000',
    'KES 100,000 - 250,000',
    'KES 250,000 - 500,000',
    'Above KES 500,000',
    'Not Sure',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await requestsAPI.create(formData);

      setStatus({
        type: 'success',
        message: 'Thank you! Your request has been submitted successfully. We will review it and get back to you within 24 hours via email.',
      });

      // Reset form
      setFormData({
        client_name: '',
        client_email: '',
        client_phone: '',
        company_name: '',
        project_type: '',
        requirements: '',
        budget_range: '',
      });

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'An error occurred. Please try again or contact us directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container-custom max-w-4xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="heading-1 mb-6">Get Your Free Quote</h1>
          <p className="text-xl text-gray-300">
            Tell us about your project and we will send you a detailed quote within 24 hours.
            No commitments, no hidden fees.
          </p>
        </motion.div>

        {/* Status Messages */}
        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-xl p-6 mb-8 ${
              status.type === 'success'
                ? 'border border-green-500/50 bg-green-500/10'
                : 'border border-red-500/50 bg-red-500/10'
            }`}
          >
            <div className="flex items-start gap-3">
              {status.type === 'success' ? (
                <svg
                  className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <p className={status.type === 'success' ? 'text-green-100' : 'text-red-100'}>
                {status.message}
              </p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="glass rounded-2xl p-8 md:p-12"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="client_name" className="label">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="client_name"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  required
                  className="input w-full"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="client_email" className="label">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="client_email"
                  name="client_email"
                  value={formData.client_email}
                  onChange={handleChange}
                  required
                  className="input w-full"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="client_phone" className="label">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  id="client_phone"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleChange}
                  required
                  className="input w-full"
                  placeholder="0712345678 or +254712345678"
                />
              </div>

              <div>
                <label htmlFor="company_name" className="label">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Your Company Ltd"
                />
              </div>
            </div>

            {/* Project Details */}
            <div>
              <label htmlFor="project_type" className="label">
                Project Type <span className="text-red-400">*</span>
              </label>
              <select
                id="project_type"
                name="project_type"
                value={formData.project_type}
                onChange={handleChange}
                required
                className="input w-full"
              >
                <option value="">Select a project type</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="budget_range" className="label">
                Budget Range (Optional)
              </label>
              <select
                id="budget_range"
                name="budget_range"
                value={formData.budget_range}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="">Select your budget range</option>
                {budgetRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="requirements" className="label">
                Project Requirements <span className="text-red-400">*</span>
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                required
                rows={6}
                className="textarea w-full"
                placeholder="Tell us about your project... What features do you need? Who is your target audience? Any specific design preferences?"
                minLength={20}
              />
              <p className="text-sm text-gray-400 mt-2">
                Please provide as much detail as possible (minimum 20 characters)
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="btn btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner w-5 h-5"></div>
                  Submitting...
                </span>
              ) : (
                'Submit Request'
              )}
            </motion.button>

            <p className="text-center text-sm text-gray-400">
              By submitting this form, you agree to our Privacy Policy. We will never share your information.
            </p>
          </form>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">24-Hour Response</h3>
            <p className="text-gray-400 text-sm">
              We review all requests and send detailed quotes within 24 hours
            </p>
          </div>

          <div className="glass rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Commitment</h3>
            <p className="text-gray-400 text-sm">
              Getting a quote is completely free with no obligations
            </p>
          </div>

          <div className="glass rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Transparent Pricing</h3>
            <p className="text-gray-400 text-sm">
              Clear breakdown of costs with no hidden fees
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuoteRequestPage;
