import { motion } from 'framer-motion';

const ServiceCard = ({ icon, title, description, features, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="card group cursor-pointer h-full"
    >
      {/* Icon */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-primary-500/50 transition-shadow"
      >
        {icon}
      </motion.div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-white mb-3 group-hover:gradient-text transition-all">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-300 mb-6 leading-relaxed">
        {description}
      </p>

      {/* Features */}
      {features && features.length > 0 && (
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: delay + 0.1 * index }}
              className="flex items-start gap-2 text-sm text-gray-400"
            >
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
            </motion.li>
          ))}
        </ul>
      )}

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all pointer-events-none" />
    </motion.div>
  );
};

export default ServiceCard;
