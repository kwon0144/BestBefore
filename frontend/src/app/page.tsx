'use client';

import { useEffect, useState } from 'react';
import { config } from '@/config';

interface User {
  id: number;
  name: string;
  age: number;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [temperature, setTemperature] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!mounted) return;
      
      try {
        console.log('Attempting to fetch users...');
        const response = await fetch(`${config.apiUrl}/api/users/`, {
          method: 'GET',
          headers: {
            'X-API-Key': config.apiKey,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch users: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Raw API response:', data);
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [mounted]);

  useEffect(() => {
    const fetchTemperature = async () => {
      if (!mounted) return;
      
      try {
        console.log('Attempting to fetch temperature...');
        const response = await fetch(`${config.apiUrl}/api/temperature/`, {
          method: 'GET',
          headers: {
            'X-API-Key': config.apiKey,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Temperature response status:', response.status);
        console.log('Temperature response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Temperature error response:', errorText);
          throw new Error(`Failed to fetch temperature: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Raw temperature response:', data);
        if (data.status === 'success' && data.data && data.data.length > 0) {
          setTemperature(data.data[0].temperature);
        } else {
          setTemperature(0);
        }
      } catch (err) {
        console.error('Error fetching temperature:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching temperature');
      }
    };

    fetchTemperature();
  }, [mounted]);

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Users List</h1>
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Current Temperature</h2>
        <p className="text-2xl">{temperature}°C</p>
      </div>
      {users.length === 0 ? (
        <div className="text-xl text-gray-500">No users found</div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">Age: {user.age}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
