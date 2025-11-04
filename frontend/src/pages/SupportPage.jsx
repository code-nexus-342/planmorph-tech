import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://planmorph-tech-backend-ays3m.ondigitalocean.app/api';

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'check'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Submit ticket form state
  const [ticketForm, setTicketForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    subject: '',
    description: '',
    category: 'technical_issue',
  });

  // Check ticket form state
  const [checkForm, setCheckForm] = useState({
    ticket_number: '',
    email: '',
  });

  const [ticketData, setTicketData] = useState(null);

  const categories = [
    { value: 'bug', label: 'Bug Report', icon: '🐛' },
    { value: 'feature_request', label: 'Feature Request', icon: '💡' },
    { value: 'technical_issue', label: 'Technical Issue', icon: '⚙️' },
    { value: 'billing', label: 'Billing Question', icon: '💳' },
    { value: 'general', label: 'General Inquiry', icon: '❓' },
  ];

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_URL}/support/submit`, ticketForm);
      setSuccess({
        message: 'Support ticket created successfully!',
        ticketNumber: response.data.ticket.ticketNumber,
        slaHours: response.data.ticket.slaHours,
      });
      setTicketForm({
        full_name: '',
        email: '',
        phone: '',
        company_name: '',
        subject: '',
        description: '',
        category: 'technical_issue',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create support ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTicketData(null);

    try {
      const response = await axios.get(
        `${API_URL}/support/ticket/${checkForm.ticket_number}?email=${encodeURIComponent(checkForm.email)}`
      );
      setTicketData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ticket not found or email does not match');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      waiting_client: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      resolved: 'bg-green-500/20 text-green-400 border-green-500/50',
      closed: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      urgent: 'text-red-400',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Support Center
          </h1>
          <p className="text-xl text-gray-400">
            Get help with your project or check the status of your ticket
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 glass p-2 rounded-xl inline-flex mx-auto w-full max-w-md">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'submit'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Submit Ticket
          </button>
          <button
            onClick={() => setActiveTab('check')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'check'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Check Status
          </button>
        </div>

        {/* Submit Ticket Form */}
        {activeTab === 'submit' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-6">Submit a Support Ticket</h2>

            {success && (
              <div className="mb-6 p-6 bg-green-500/20 border border-green-500/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="text-green-400 font-semibold text-lg mb-2">
                      {success.message}
                    </h3>
                    <p className="text-gray-300 mb-2">
                      <strong>Ticket Number:</strong> {success.ticketNumber}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Our team will respond within <strong>{success.slaHours} hours</strong>. Save your ticket number to check status later.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleTicketSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    value={ticketForm.full_name}
                    onChange={(e) => setTicketForm({ ...ticketForm, full_name: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={ticketForm.phone}
                    onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="label">Company Name (Optional)</label>
                  <input
                    type="text"
                    value={ticketForm.company_name}
                    onChange={(e) => setTicketForm({ ...ticketForm, company_name: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="label">Category *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setTicketForm({ ...ticketForm, category: cat.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        ticketForm.category === cat.value
                          ? 'border-primary-500 bg-primary-500/20'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-2">{cat.icon}</div>
                      <div className="text-sm font-medium">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Issue Details */}
              <div>
                <label className="label">Subject *</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="input w-full"
                  placeholder="Brief summary of your issue"
                  required
                />
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="input w-full min-h-[150px]"
                  placeholder="Please provide as much detail as possible..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Check Ticket Status */}
        {activeTab === 'check' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-6">Check Ticket Status</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleCheckTicket} className="space-y-6 mb-8">
              <div>
                <label className="label">Ticket Number</label>
                <input
                  type="text"
                  value={checkForm.ticket_number}
                  onChange={(e) => setCheckForm({ ...checkForm, ticket_number: e.target.value.toUpperCase() })}
                  className="input w-full"
                  placeholder="ST-00001"
                  required
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={checkForm.email}
                  onChange={(e) => setCheckForm({ ...checkForm, email: e.target.value })}
                  className="input w-full"
                  placeholder="Your email address"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Checking...' : 'Check Status'}
              </button>
            </form>

            {/* Ticket Details */}
            {ticketData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Ticket Header */}
                <div className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 p-6 rounded-xl border border-primary-500/30">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h3 className="text-2xl font-bold">
                      {ticketData.ticket.ticket_number}
                    </h3>
                    <div className="flex gap-3">
                      <span className={`px-4 py-2 rounded-lg border text-sm font-semibold ${getStatusColor(ticketData.ticket.status)}`}>
                        {ticketData.ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getPriorityColor(ticketData.ticket.priority)}`}>
                        {ticketData.ticket.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                  <h4 className="text-xl mb-2">{ticketData.ticket.subject}</h4>
                  <p className="text-gray-400 text-sm">
                    Created: {new Date(ticketData.ticket.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Original Message */}
                <div className="bg-white/5 p-6 rounded-xl">
                  <h4 className="font-semibold mb-3 text-primary-400">Original Request</h4>
                  <p className="text-gray-300 whitespace-pre-wrap">{ticketData.ticket.description}</p>
                </div>

                {/* Messages/Responses */}
                {ticketData.messages.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Conversation</h4>
                    {ticketData.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-xl ${
                          msg.sender_type === 'admin'
                            ? 'bg-primary-500/10 border border-primary-500/30'
                            : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">
                            {msg.sender_type === 'admin' ? '🛠️ Support Team' : '👤 You'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resolution Notes */}
                {ticketData.ticket.resolution_notes && (
                  <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl">
                    <h4 className="font-semibold mb-3 text-green-400">✅ Resolution</h4>
                    <p className="text-gray-300 whitespace-pre-wrap">{ticketData.ticket.resolution_notes}</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;
