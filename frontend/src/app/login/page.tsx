'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Use router.replace to prevent going back to login page
        router.replace('/');
      } else {
        const data = await response.json();
        setError(data.error || 'Incorrect password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className='relative'>
      {/* Background */}
      <div className="absolute inset-0 bg-[#F5F5F1]/30"></div>
      <div
        className="h-screen bg-cover bg-center"
        style={{
        backgroundImage: "url('https://s3-tp22.s3.ap-southeast-2.amazonaws.com/login-bg.png')"
        }}
        >
      </div>
      {/* Login Form */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
      <div className='flex flex-col items-center'>
            <img 
              src="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/logo.png" 
              alt="Best Before Logo" 
              className="w-80"
            />
        {/* <div className="max-w-md w-full bg-white/50 p-8 rounded-lg shadow-xl"> */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className=" w-80 rounded-md shadow-sm -space-y-px">
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
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className='flex justify-center'>
              <Button
                type="submit"
                className="flex-1 bg-green text-white py-2 px-4 rounded-lg"
              >
                Sign in
              </Button>
            </div>
          </form>
          </div>
        </div>
      </div>
  );
} 