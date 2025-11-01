import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const LoadingSpinner = ({ 
  size = 'default', 
  className, 
  message = 'Loading...', 
  showMessage = true,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variants = {
    default: 'border-purple-500',
    white: 'border-white',
    primary: 'border-blue-500'
  };

  return (
    <div 
      className="flex flex-col items-center justify-center space-y-3"
      role="status"
      aria-label={message}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={cn(
          "border-2 border-t-transparent rounded-full",
          sizeClasses[size],
          variants[variant],
          className
        )}
        aria-hidden="true"
      />
      {showMessage && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600 dark:text-gray-300"
        >
          {message}
        </motion.p>
      )}
      <span className="sr-only">{message}</span>
    </div>
  );
};

export { LoadingSpinner };