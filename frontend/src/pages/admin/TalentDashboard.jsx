import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { talentAPI } from '../../utils/api';

const TalentDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const navigate = useNavigate();

  const fetchApplications = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await talentAPI.getAll();
      setApplications(response.data);
      setFilteredApplications(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
      
      if (err.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    let filtered = applications;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((app) => app.status === filterStatus);
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter((app) => app.role === filterRole);
    }

    setFilteredApplications(filtered);
  }, [filterStatus, filterRole, applications]);

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    under_review: applications.filter((a) => a.status === 'under_review').length,
    interview_scheduled: applications.filter((a) => a.status === 'interview_scheduled').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-400',
      under_review: 'text-blue-400',
      assessment_assigned: 'text-purple-400',
      assessment_submitted: 'text-indigo-400',
      interview_scheduled: 'text-cyan-400',
      accepted: 'text-green-400',
      rejected: 'text-red-400',
      withdrawn: 'text-gray-400',
    };
    return colors[status] || 'text-gray-400';
  };

  const getRoleIcon = (role) => {
    if (role === 'developer') return '💻';
    if (role === 'designer') return '🎨';
    return '🚀';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="glass-dark border-b border-white/10">
        <div className="container-custom px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Talent Management</h1>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="btn-secondary text-sm"
            >
              ← Back to Requests
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="btn-outline text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="container-custom px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total', count: statusCounts.all, status: 'all' },
            { label: 'Pending', count: statusCounts.pending, status: 'pending' },
            { label: 'Under Review', count: statusCounts.under_review, status: 'under_review' },
            { label: 'Interview', count: statusCounts.interview_scheduled, status: 'interview_scheduled' },
            { label: 'Accepted', count: statusCounts.accepted, status: 'accepted' },
            { label: 'Rejected', count: statusCounts.rejected, status: 'rejected' },
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

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6 flex flex-wrap gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input"
            >
              <option value="all">All Roles</option>
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterRole('all');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-300 mb-6">
            {error}
          </div>
        )}

        {/* Applications Table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((application) => (
                    <motion.tr
                      key={application.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">{application.full_name}</div>
                          <div className="text-gray-400 text-sm">{application.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getRoleIcon(application.role)}</span>
                          <div>
                            <div className="text-white capitalize">{application.role}</div>
                            <div className="text-gray-400 text-sm">{application.specialization}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white capitalize">{application.experience_level}</div>
                        {application.years_of_experience && (
                          <div className="text-gray-400 text-sm">{application.years_of_experience} years</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${getStatusColor(application.status)} capitalize`}>
                          {application.status.replace('_', ' ')}
                        </span>
                        {application.needs_assessment && (
                          <div className="text-yellow-400 text-xs mt-1">📝 Assessment Required</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(application.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="text-primary-400 hover:text-primary-300 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onUpdate={fetchApplications}
        />
      )}
    </div>
  );
};

// Application Details Modal Component
const ApplicationDetailsModal = ({ application, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [statusUpdate, setStatusUpdate] = useState({ status: application.status, admin_notes: '' });
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      await talentAPI.updateStatus(application.id, statusUpdate);
      alert('Status updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      alert('Failed to update status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 glass-dark border-b border-white/10 p-6 flex justify-between items-start">
          <div>
            <h2 className="heading-3 mb-2">{application.full_name}</h2>
            <p className="text-gray-400">{application.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-6">
          {['details', 'portfolio', 'status'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium capitalize ${
                activeTab === tab
                  ? 'text-white border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Professional Info</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 text-sm">Role:</span>
                    <p className="text-white capitalize">{application.role}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Specialization:</span>
                    <p className="text-white">{application.specialization}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Experience Level:</span>
                    <p className="text-white capitalize">{application.experience_level}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Years of Experience:</span>
                    <p className="text-white">{application.years_of_experience || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Availability:</span>
                    <p className="text-white capitalize">{application.availability?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Work Type:</span>
                    <p className="text-white capitalize">{application.work_type?.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {application.skills?.map((skill, index) => (
                    <span key={index} className="glass px-3 py-1 rounded-full text-sm text-white">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {application.technologies && application.technologies.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {application.technologies.map((tech, index) => (
                      <span key={index} className="glass-dark px-3 py-1 rounded-full text-sm text-primary-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-white font-semibold mb-3">Why Join PlanMorph Tech?</h4>
                <p className="text-gray-300 leading-relaxed">{application.why_join}</p>
              </div>

              {application.expected_salary_range && (
                <div>
                  <span className="text-gray-400 text-sm">Expected Salary Range:</span>
                  <p className="text-white">{application.expected_salary_range}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Links</h4>
                <div className="space-y-2">
                  {application.portfolio_url && (
                    <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer" className="block text-primary-400 hover:underline">
                      🌐 Portfolio →
                    </a>
                  )}
                  {application.github_url && (
                    <a href={application.github_url} target="_blank" rel="noopener noreferrer" className="block text-primary-400 hover:underline">
                      💻 GitHub →
                    </a>
                  )}
                  {application.linkedin_url && (
                    <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" className="block text-primary-400 hover:underline">
                      💼 LinkedIn →
                    </a>
                  )}
                  {application.behance_url && (
                    <a href={application.behance_url} target="_blank" rel="noopener noreferrer" className="block text-primary-400 hover:underline">
                      🎨 Behance →
                    </a>
                  )}
                </div>
              </div>

              {application.notable_projects && application.notable_projects.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Notable Projects</h4>
                  <div className="space-y-4">
                    {application.notable_projects.map((project, index) => (
                      <div key={index} className="glass-dark p-4 rounded-lg">
                        <h5 className="text-white font-medium mb-2">{project.title}</h5>
                        <p className="text-gray-300 text-sm mb-2">{project.description}</p>
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-primary-400 text-sm hover:underline block mb-2">
                            View Project →
                          </a>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.technologies?.map((tech, i) => (
                            <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                              {tech}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Role: {project.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-6">
              <div>
                <label className="label">Update Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  className="input w-full"
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="assessment_assigned">Assessment Assigned</option>
                  <option value="assessment_submitted">Assessment Submitted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>

              <div>
                <label className="label">Admin Notes</label>
                <textarea
                  value={statusUpdate.admin_notes}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, admin_notes: e.target.value })}
                  className="textarea w-full"
                  rows="4"
                  placeholder="Add notes about this applicant..."
                />
              </div>

              {application.admin_notes && (
                <div>
                  <label className="label">Previous Notes</label>
                  <p className="text-gray-300 glass-dark p-4 rounded-lg">{application.admin_notes}</p>
                </div>
              )}

              <button
                onClick={handleStatusUpdate}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TalentDashboard;
