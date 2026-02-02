import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building } from 'lucide-react';

export const Login = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (token === 'demo-token') {
      login(token);
    } else {
      setError('Invalid token. Please use: demo-token');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Building className="text-primary" size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Referral Management System</h1>
          <p className="text-gray-600 mt-2">Healthcare Provider Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError('');
              }}
              placeholder="Enter your access token"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-700 transition font-medium"
          >
            Login
          </button>

          <p className="text-sm text-gray-500 text-center">
            Demo token: <code className="bg-gray-100 px-2 py-1 rounded">demo-token</code>
          </p>
        </form>
      </div>
    </div>
  );
};