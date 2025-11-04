import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://planmorph-tech-backend-ays3m.ondigitalocean.app/api';

const CareersPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    role: 'developer',
    specialization: '',
    experience_level: 'intermediate',
    years_of_experience: '',
    portfolio_url: '',
    github_url: '',
    linkedin_url: '',
    behance_url: '',
    dribbble_url: '',
    skills: [],
    technologies: [],
    notable_projects: [],
    previous_companies: '',
    why_join: '',
    availability: 'flexible',
    expected_salary_range: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [projectInput, setProjectInput] = useState({ title: '', description: '', url: '', technologies: '', role: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({ ...formData, technologies: [...formData.technologies, techInput.trim()] });
      setTechInput('');
    }
  };

  const removeTechnology = (tech) => {
    setFormData({ ...formData, technologies: formData.technologies.filter(t => t !== tech) });
  };

  const addProject = () => {
    if (projectInput.title.trim()) {
      const project = {
        ...projectInput,
        technologies: projectInput.technologies.split(',').map(t => t.trim())
      };
      setFormData({ ...formData, notable_projects: [...formData.notable_projects, project] });
      setProjectInput({ title: '', description: '', url: '', technologies: '', role: '' });
    }
  };

  const removeProject = (index) => {
    setFormData({
      ...formData,
      notable_projects: formData.notable_projects.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/talent/apply`, formData);
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 max-w-md text-center"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="heading-3 mb-4">Application Submitted!</h2>
          <p className="text-gray-300 mb-4">
            Thank you for your interest in joining PlanMorph Tech. We've received your application and will review it within 3-5 business days.
          </p>
          <p className="text-sm text-gray-400">
            Redirecting to homepage...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="heading-1 mb-4 text-3xl sm:text-4xl md:text-5xl">Join Our Team</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We're looking for talented developers and designers to help us build amazing solutions.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-6 sm:p-8 space-y-8"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className="heading-3 mb-4 text-xl">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="heading-3 mb-4 text-xl">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input w-full"
                  required
                >
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="both">Both (Full Stack/Product Designer)</option>
                </select>
              </div>
              <div>
                <label className="label">Specialization *</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g., Frontend React, UI/UX Design"
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="label">Experience Level *</label>
                <select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                  className="input w-full"
                  required
                >
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (2-4 years)</option>
                  <option value="advanced">Advanced (5-7 years)</option>
                  <option value="expert">Expert (8+ years)</option>
                </select>
              </div>
              <div>
                <label className="label">Years of Experience</label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleChange}
                  min="0"
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Portfolio & Links */}
          <div>
            <h3 className="heading-3 mb-4 text-xl">Portfolio & Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Portfolio URL</label>
                <input
                  type="url"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">GitHub URL</label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Behance URL (Designers)</label>
                <input
                  type="url"
                  name="behance_url"
                  value={formData.behance_url}
                  onChange={handleChange}
                  placeholder="https://behance.net/username"
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="heading-3 mb-4 text-xl">Skills *</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill (e.g., React, Figma)"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={addSkill}
                className="btn-primary px-6"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="glass px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {formData.skills.length === 0 && (
              <p className="text-sm text-gray-400 mt-2">Add at least one skill</p>
            )}
          </div>

          {/* Technologies */}
          <div>
            <h3 className="heading-3 mb-4 text-xl">Technologies & Tools</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                placeholder="Add technology (e.g., Node.js, Photoshop)"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={addTechnology}
                className="btn-primary px-6"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="glass px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechnology(tech)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notable Projects */}
          <div>
            <h3 className="heading-3 mb-4 text-xl">Notable Projects</h3>
            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={projectInput.title}
                onChange={(e) => setProjectInput({ ...projectInput, title: e.target.value })}
                placeholder="Project Title"
                className="input w-full"
              />
              <textarea
                value={projectInput.description}
                onChange={(e) => setProjectInput({ ...projectInput, description: e.target.value })}
                placeholder="Project Description"
                className="textarea w-full"
                rows="3"
              />
              <input
                type="url"
                value={projectInput.url}
                onChange={(e) => setProjectInput({ ...projectInput, url: e.target.value })}
                placeholder="Project URL (GitHub, Live Demo, etc.)"
                className="input w-full"
              />
              <input
                type="text"
                value={projectInput.technologies}
                onChange={(e) => setProjectInput({ ...projectInput, technologies: e.target.value })}
                placeholder="Technologies used (comma-separated)"
                className="input w-full"
              />
              <input
                type="text"
                value={projectInput.role}
                onChange={(e) => setProjectInput({ ...projectInput, role: e.target.value })}
                placeholder="Your role in this project"
                className="input w-full"
              />
              <button
                type="button"
                onClick={addProject}
                className="btn-primary w-full"
              >
                Add Project
              </button>
            </div>
            {formData.notable_projects.map((project, index) => (
              <div key={index} className="glass-dark p-4 rounded-lg mb-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{project.title}</h4>
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-sm text-gray-300 mb-2">{project.description}</p>
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-primary-400 text-sm hover:underline block mb-2">
                    View Project →
                  </a>
                )}
                <p className="text-xs text-gray-400">Role: {project.role}</p>
              </div>
            ))}
          </div>

          {/* Application Details */}
          <div>
            <h3 className="heading-3 mb-4 text-xl">Application Details</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Why do you want to join PlanMorph Tech? *</label>
                <textarea
                  name="why_join"
                  value={formData.why_join}
                  onChange={handleChange}
                  className="textarea w-full"
                  rows="5"
                  placeholder="Tell us what excites you about this opportunity..."
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Availability *</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="input w-full"
                    required
                  >
                    <option value="immediate">Immediate</option>
                    <option value="two_weeks">2 Weeks Notice</option>
                    <option value="one_month">1 Month Notice</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Expected Salary Range (Optional)</label>
                <p className="text-sm text-gray-400 mt-1 mb-2">
                  Final compensation will be determined by admins based on project requirements and team size.
                </p>
                <input
                  type="text"
                  name="expected_salary_range"
                  value={formData.expected_salary_range}
                  onChange={handleChange}
                  placeholder="e.g., $50k-$70k or KES 500k-700k"
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.skills.length === 0}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default CareersPage;
