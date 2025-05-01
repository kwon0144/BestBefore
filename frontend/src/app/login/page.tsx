/**
 * LoginPage Component
 * 
 * This component provides a secure and animated login interface.
 * Features include:
 * - Password-based authentication
 * - Animated transitions and effects
 * - Error handling and display
 * - Rotating text animation on successful login
 * - Responsive design with background image
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import RotatingText from '../(components)/RotatingTextRef';
import { config } from '@/config';

/**
 * Main component for the login page
 * 
 * @returns {JSX.Element} Rendered login interface with animations and authentication
 */
export default function LoginPage() {
  /** Password input state */
  const [password, setPassword] = useState('');
  /** Error message state */
  const [error, setError] = useState('');
  /** State for form exit animation */
  const [isExiting, setIsExiting] = useState(false);
  /** State for rotating text display */
  const [showText, setShowText] = useState(false);
  /** State for final exit animation */
  const [finalExit, setFinalExit] = useState(false);
  const router = useRouter();

  /**
   * Handles form submission and authentication
   * 
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>} Promise that resolves when authentication is complete
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsExiting(true);
        // Show rotating text after form exits
        setTimeout(() => setShowText(true), 300);
        // Start final exit animation after text rotation
        setTimeout(() => setShowText(false), 6000);
        // Trigger final animations
        setTimeout(() => setFinalExit(true), 7300);
        // Finally route to home
        setTimeout(() => {
          router.replace('/');
        }, 8000);
      } else {
        const data = await response.json();
        setError(data.error || 'Incorrect password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className='relative'>
      {/* Background */}
      <motion.div 
        className="absolute inset-0 bg-[#F5F5F1]/30"
        animate={finalExit ? { opacity: 0 } : {}}
        transition={{ duration: 2 }}
      />
      <motion.div
        className="h-screen bg-cover bg-center"
        style={{
          backgroundImage: "url('https://s3-tp22.s3.ap-southeast-2.amazonaws.com/login-bg.png')"
        }}
        animate={finalExit ? { 
          scale: 1.2,
          opacity: 0
        } : {}}
        transition={{ duration: 1 }}
      />
      {/* Login Form */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className='flex flex-col items-center'>
          <motion.img 
            initial={{ y: -20, opacity: 0 }}
            animate={finalExit ? 
              { scale: 1.5, y: 0, opacity: 0 } : 
              { y: 0, opacity: 1 }
            }
            transition={finalExit ? 
              { duration: 1, ease: "easeInOut" } :
              { duration: 1, ease: "easeOut" }
            }
            src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/logo.png" 
            alt="Best Before Logo" 
            className="w-80"
          />
          <AnimatePresence>
            {!isExiting && (
              <motion.form 
                className="space-y-6" 
                onSubmit={handleSubmit}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <motion.div 
                  className="w-80 rounded-md shadow-sm -space-y-px"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </motion.div>

                {error && (
                  <motion.div 
                    className="text-red-500 text-sm text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                <div className='flex justify-center'>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      className="w-80 bg-green text-white py-2 px-4 rounded-lg"
                    >
                      Sign in
                    </Button>
                  </motion.div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showText && (
              <motion.div 
                className='flex flex-col md:flex-row items-center'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <p className='text-center text-2xl font-bold text-darkgreen'>Together for a</p>
                <RotatingText
                  texts={['Sustainable', 'Cost Effective', 'Zero Waste']}
                  mainClassName="px-2 sm:px-2 md:px-3 text-green font-bold text-3xl overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
                <p className='text-center text-2xl font-bold text-darkgreen'>Kitchen</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 