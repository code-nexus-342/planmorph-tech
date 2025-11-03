import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { requestsAPI } from '../../utils/api';
import RequestDetailsModal from './RequestDetailsModal';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await requestsAPI.getAll();
      setRequests(response.data.requests);
      setFilteredRequests(response.data.requests);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
      
      // If unauthorized, redirect to login
      if (err.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter requests based on status and search query
  useEffect(() => {
    let filtered = requests;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((req) => req.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.client_name.toLowerCase().includes(query) ||
          req.client_email.toLowerCase().includes(query) ||
          req.project_type.toLowerCase().includes(query) ||
          req.company_name?.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  }, [filterStatus, searchQuery, requests]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const handleQuoteSent = () => {
    // Refresh requests after quote is sent
    fetchRequests();
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      Approved: 'bg-green-500/20 text-green-400 border-green-500/50',
      Rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
      Quoted: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  const getStatusCounts = () => {
    return {
      all: requests.length,
      Pending: requests.filter((r) => r.status === 'Pending').length,
      Quoted: requests.filter((r) => r.status === 'Quoted').length,
      Approved: requests.filter((r) => r.status === 'Approved').length,
      Rejected: requests.filter((r) => r.status === 'Rejected').length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-dark border-b border-white/10">
        <div className="container-custom px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm">Manage project requests and quotes</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', count: statusCounts.all, status: 'all' },
            { label: 'Pending', count: statusCounts.Pending, status: 'Pending' },
            { label: 'Quoted', count: statusCounts.Quoted, status: 'Quoted' },
            { label: 'Approved', count: statusCounts.Approved, status: 'Approved' },
            { label: 'Rejected', count: statusCounts.Rejected, status: 'Rejected' },
          ].map((stat) => (
            <motion.div
              key={stat.status}
              whileHover={{ scale: 1.02 }}
              onClick={() => setFilterStatus(stat.status)}
              className={`card cursor-pointer ${
                filterStatus === stat.status ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
              <div className="text-3xl font-bold text-white">{stat.count}</div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="glass rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or project type..."
                className="input w-full"
              />
            </div>
            <button
              onClick={fetchRequests}
              className="btn btn-secondary whitespace-nowrap"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="spinner"></div>
          </div>
        )}

        {/* Requests Table */}
        {!isLoading && (
          <>
            {filteredRequests.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-400 text-lg">No requests found</p>
              </div>
            ) : (
              <div className="glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Project Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Budget
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredRequests.map((request) => (
                        <motion.tr
                          key={request.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-white font-medium">{request.client_name}</div>
                              <div className="text-gray-400 text-sm">{request.client_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-white">{request.project_type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-300 text-sm">
                              {request.budget_range || 'Not specified'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                            {new Date(request.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="text-primary-400 hover:text-primary-300 font-medium text-sm"
                            >
                              View Details →
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onQuoteSent={handleQuoteSent}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
