import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { quotesAPI, requestsAPI } from '../../utils/api';

const RequestDetailsModal = ({ request, onClose, onQuoteSent }) => {
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [quoteData, setQuoteData] = useState({
    total_cost: '',
    timeline_weeks: '',
    cost_breakdown: {
      design: '',
      development: '',
      testing: '',
      deployment: '',
    },
    notes: '',
    recurring_cost: '',
    recurring_period: 'monthly',
    recurring_description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formatPhoneForWhatsApp = (phone) => {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    
    // If doesn't start with 254, add it
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  };

  const handleQuoteChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('breakdown_')) {
      const key = name.replace('breakdown_', '');
      setQuoteData((prev) => ({
        ...prev,
        cost_breakdown: {
          ...prev.cost_breakdown,
          [key]: value,
        },
      }));
    } else {
      setQuoteData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    setIsCreatingQuote(true);
    setError('');
    setSuccess('');

    try {
      // Filter out empty breakdown items
      const filteredBreakdown = Object.entries(quoteData.cost_breakdown)
        .filter(([_, value]) => value && parseFloat(value) > 0)
        .reduce((acc, [key, value]) => {
          acc[key] = parseFloat(value);
          return acc;
        }, {});

      const payload = {
        request_id: request.id,
        total_cost: parseFloat(quoteData.total_cost),
        timeline_weeks: parseInt(quoteData.timeline_weeks),
        cost_breakdown: Object.keys(filteredBreakdown).length > 0 ? filteredBreakdown : null,
        notes: quoteData.notes || null,
        recurring_cost: quoteData.recurring_cost ? parseFloat(quoteData.recurring_cost) : 0,
        recurring_period: quoteData.recurring_period || 'none',
        recurring_description: quoteData.recurring_description || null,
      };

      await quotesAPI.create(payload);
      
      setSuccess('Quote created and sent successfully!');
      
      // Call parent callback after 2 seconds
      setTimeout(() => {
        onQuoteSent();
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to create quote. Please try again.');
    } finally {
      setIsCreatingQuote(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdatingStatus(true);
    setError('');
    setSuccess('');

    try {
      await requestsAPI.update(request.id, { status: newStatus });
      setSuccess(`Request status updated to ${newStatus}`);
      
      // Refresh the list after 1.5 seconds
      setTimeout(() => {
        onQuoteSent(); // This refreshes the parent list
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statusColors = {
    Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    Approved: 'bg-green-500/20 text-green-400 border-green-500/50',
    Rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
    Quoted: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Request Details</h2>
              <p className="text-gray-400 text-sm">ID: #{request.id}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full glass hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
            {/* Status Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6">
                <p className="text-green-100 text-sm">{success}</p>
              </div>
            )}

            {/* Client Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-dark rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Name</div>
                  <div className="text-white font-medium">{request.client_name}</div>
                </div>
                <div className="glass-dark rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Company</div>
                  <div className="text-white font-medium">{request.company_name || 'N/A'}</div>
                </div>
                <div className="glass-dark rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Email</div>
                  <a
                    href={`mailto:${request.client_email}`}
                    className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-2"
                  >
                    {request.client_email}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <div className="glass-dark rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Phone</div>
                  <a
                    href={`tel:${request.client_phone}`}
                    className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-2"
                  >
                    {request.client_phone}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(request.client_phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary text-sm"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`mailto:${request.client_email}`}
                  className="btn btn-secondary text-sm"
                >
                  Email Client
                </a>
              </div>
            </div>

            {/* Project Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Project Details</h3>
              <div className="space-y-4">
                <div className="glass-dark rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Project Type</div>
                  <div className="text-white font-medium">{request.project_type}</div>
                </div>
                <div className="glass-dark rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Budget Range</div>
                  <div className="text-white font-medium">{request.budget_range || 'Not specified'}</div>
                </div>
                <div className="glass-dark rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Status</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[request.status]}`}>
                    {request.status}
                  </span>
                </div>
                <div className="glass-dark rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">Requirements</div>
                  <div className="text-white whitespace-pre-wrap">{request.requirements}</div>
                </div>
                <div className="glass-dark rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Submitted</div>
                  <div className="text-white">{new Date(request.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Status Update Actions */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Update Status</h3>
              <div className="glass-dark rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-4">
                  Change the status of this request based on client feedback or project progress.
                </p>
                <div className="flex flex-wrap gap-3">
                  {request.status !== 'Approved' && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate('Approved')}
                      disabled={isUpdatingStatus}
                      className="px-6 py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mark as Approved
                    </button>
                  )}
                  
                  {request.status !== 'Rejected' && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate('Rejected')}
                      disabled={isUpdatingStatus}
                      className="px-6 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mark as Rejected
                    </button>
                  )}
                  
                  {(request.status === 'Approved' || request.status === 'Rejected') && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate('Pending')}
                      disabled={isUpdatingStatus}
                      className="px-6 py-3 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Reset to Pending
                    </button>
                  )}
                </div>
                
                {request.status === 'Approved' && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">
                      ✓ This request has been approved. The client has accepted the quotation.
                    </p>
                  </div>
                )}
                
                {request.status === 'Rejected' && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">
                      ✗ This request has been rejected. The client declined the quotation or the project was cancelled.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Create Quote Form */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Create Quotation</h3>
              <form onSubmit={handleSubmitQuote} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="total_cost" className="label">
                      Total Cost (KES) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      id="total_cost"
                      name="total_cost"
                      value={quoteData.total_cost}
                      onChange={handleQuoteChange}
                      required
                      min="0"
                      step="0.01"
                      className="input w-full"
                      placeholder="150000"
                    />
                  </div>
                  <div>
                    <label htmlFor="timeline_weeks" className="label">
                      Timeline (Weeks) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      id="timeline_weeks"
                      name="timeline_weeks"
                      value={quoteData.timeline_weeks}
                      onChange={handleQuoteChange}
                      required
                      min="1"
                      max="104"
                      className="input w-full"
                      placeholder="4"
                    />
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div>
                  <label className="label mb-2">Cost Breakdown (Optional)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="number"
                      name="breakdown_design"
                      value={quoteData.cost_breakdown.design}
                      onChange={handleQuoteChange}
                      min="0"
                      step="0.01"
                      className="input w-full"
                      placeholder="Design (KES)"
                    />
                    <input
                      type="number"
                      name="breakdown_development"
                      value={quoteData.cost_breakdown.development}
                      onChange={handleQuoteChange}
                      min="0"
                      step="0.01"
                      className="input w-full"
                      placeholder="Development (KES)"
                    />
                    <input
                      type="number"
                      name="breakdown_testing"
                      value={quoteData.cost_breakdown.testing}
                      onChange={handleQuoteChange}
                      min="0"
                      step="0.01"
                      className="input w-full"
                      placeholder="Testing (KES)"
                    />
                    <input
                      type="number"
                      name="breakdown_deployment"
                      value={quoteData.cost_breakdown.deployment}
                      onChange={handleQuoteChange}
                      min="0"
                      step="0.01"
                      className="input w-full"
                      placeholder="Deployment (KES)"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="label">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={quoteData.notes}
                    onChange={handleQuoteChange}
                    rows={4}
                    className="textarea w-full"
                    placeholder="Any additional information for the client..."
                    maxLength={2000}
                  />
                </div>

                {/* Recurring Charges Section */}
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recurring Charges (Optional)
                  </h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Add recurring charges for hosting, maintenance, or support services
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="recurring_cost" className="label">
                        Recurring Amount (KES)
                      </label>
                      <input
                        type="number"
                        id="recurring_cost"
                        name="recurring_cost"
                        value={quoteData.recurring_cost}
                        onChange={handleQuoteChange}
                        min="0"
                        step="0.01"
                        className="input w-full"
                        placeholder="e.g., 5000"
                      />
                    </div>

                    <div>
                      <label htmlFor="recurring_period" className="label">
                        Billing Period
                      </label>
                      <select
                        id="recurring_period"
                        name="recurring_period"
                        value={quoteData.recurring_period}
                        onChange={handleQuoteChange}
                        className="input w-full"
                      >
                        <option value="none">None</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="recurring_description" className="label">
                      What's Included (Optional)
                    </label>
                    <textarea
                      id="recurring_description"
                      name="recurring_description"
                      value={quoteData.recurring_description}
                      onChange={handleQuoteChange}
                      rows={2}
                      className="textarea w-full"
                      placeholder="e.g., Includes hosting, maintenance, security updates, and technical support"
                      maxLength={500}
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isCreatingQuote}
                  whileHover={{ scale: isCreatingQuote ? 1 : 1.02 }}
                  whileTap={{ scale: isCreatingQuote ? 1 : 0.98 }}
                  className="btn btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingQuote ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="spinner w-5 h-5"></div>
                      Sending Quote...
                    </span>
                  ) : (
                    'Create & Send Quotation'
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RequestDetailsModal;
