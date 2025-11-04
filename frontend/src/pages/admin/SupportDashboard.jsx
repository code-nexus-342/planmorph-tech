import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://planmorph-tech-backend-ays3m.ondigitalocean.app/api';

const SupportDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [response, setResponse] = useState('');
  const [filter, setFilter] = useState({ status: '', priority: '', plan: '' });

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.priority) params.append('priority', filter.priority);
      if (filter.plan) params.append('plan', filter.plan);

      const response = await axios.get(`${API_URL}/support/admin/tickets?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/support/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTicketDetails = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/support/admin/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTicket(response.data);
      setShowTicketModal(true);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus, priority = null) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/support/admin/tickets/${ticketId}`,
        { status: newStatus, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTickets();
      fetchTicketDetails(ticketId);
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const sendResponse = async () => {
    if (!response.trim() || !selectedTicket) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/support/admin/tickets/${selectedTicket.ticket.id}/respond`,
        { message: response, is_internal_note: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResponse('');
      fetchTicketDetails(selectedTicket.ticket.id);
      fetchTickets();
    } catch (error) {
      console.error('Error sending response:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-500/20 text-blue-400',
      in_progress: 'bg-yellow-500/20 text-yellow-400',
      waiting_client: 'bg-purple-500/20 text-purple-400',
      resolved: 'bg-green-500/20 text-green-400',
      closed: 'bg-gray-500/20 text-gray-400',
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-500/20 text-green-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-orange-500/20 text-orange-400',
      urgent: 'bg-red-500/20 text-red-400',
    };
    return colors[priority] || colors.medium;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Support Tickets</h1>
            <p className="text-gray-400">Manage client support requests</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              ← Requests
            </button>
            <button
              onClick={() => navigate('/admin/talent')}
              className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              Talent →
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="glass p-4 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">Total</p>
              <p className="text-2xl font-bold">{stats.total_tickets}</p>
            </div>
            <div className="glass p-4 rounded-xl">
              <p className="text-blue-400 text-sm mb-1">Open</p>
              <p className="text-2xl font-bold">{stats.open_tickets}</p>
            </div>
            <div className="glass p-4 rounded-xl">
              <p className="text-yellow-400 text-sm mb-1">In Progress</p>
              <p className="text-2xl font-bold">{stats.in_progress_tickets}</p>
            </div>
            <div className="glass p-4 rounded-xl">
              <p className="text-green-400 text-sm mb-1">Resolved</p>
              <p className="text-2xl font-bold">{stats.resolved_tickets}</p>
            </div>
            <div className="glass p-4 rounded-xl">
              <p className="text-red-400 text-sm mb-1">Urgent</p>
              <p className="text-2xl font-bold">{stats.urgent_tickets}</p>
            </div>
            <div className="glass p-4 rounded-xl">
              <p className="text-purple-400 text-sm mb-1">Last 7 Days</p>
              <p className="text-2xl font-bold">{stats.tickets_last_7_days}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass p-4 rounded-xl mb-6 flex flex-wrap gap-4">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="input"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_client">Waiting Client</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="input"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={filter.plan}
            onChange={(e) => setFilter({ ...filter, plan: e.target.value })}
            className="input"
          >
            <option value="">All Plans</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>

          <button
            onClick={() => setFilter({ status: '', priority: '', plan: '' })}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Tickets Table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ticket #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm">{ticket.ticket_number}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{ticket.client_name}</div>
                        <div className="text-xs text-gray-400">{ticket.client_email}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">{ticket.subject}</td>
                      <td className="px-6 py-4 text-sm capitalize">{ticket.category.replace('_', ' ')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm uppercase">{ticket.client_plan}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => fetchTicketDetails(ticket.id)}
                          className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {showTicketModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedTicket.ticket.ticket_number}</h2>
                  <p className="text-gray-400 mt-1">{selectedTicket.ticket.subject}</p>
                </div>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Ticket Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <select
                      value={selectedTicket.ticket.status}
                      onChange={(e) => updateTicketStatus(selectedTicket.ticket.id, e.target.value)}
                      className="input mt-1"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_client">Waiting Client</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Priority</p>
                    <select
                      value={selectedTicket.ticket.priority}
                      onChange={(e) => updateTicketStatus(selectedTicket.ticket.id, null, e.target.value)}
                      className="input mt-1"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Plan</p>
                    <p className="mt-1 uppercase font-semibold">{selectedTicket.ticket.client_plan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">SLA</p>
                    <p className="mt-1 font-semibold">{selectedTicket.ticket.response_sla_hours}h</p>
                  </div>
                </div>

                {/* Client Info */}
                <div className="glass p-4 rounded-xl">
                  <h3 className="font-semibold mb-2">Client Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-400">Name:</span> {selectedTicket.ticket.client_name}</p>
                    <p><span className="text-gray-400">Email:</span> {selectedTicket.ticket.client_email}</p>
                    {selectedTicket.ticket.client_phone && (
                      <p><span className="text-gray-400">Phone:</span> {selectedTicket.ticket.client_phone}</p>
                    )}
                    <p><span className="text-gray-400">Category:</span> {selectedTicket.ticket.category}</p>
                  </div>
                </div>

                {/* Original Description */}
                <div className="glass p-4 rounded-xl">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedTicket.ticket.description}</p>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Conversation</h3>
                  {selectedTicket.messages.map((msg) => (
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
                          {msg.sender_type === 'admin' ? '🛠️ You' : '👤 ' + msg.sender_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>

                {/* Response Box */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Add Response</h3>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="input w-full min-h-[120px]"
                    placeholder="Type your response here..."
                  />
                  <button
                    onClick={sendResponse}
                    disabled={!response.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Response
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportDashboard;
