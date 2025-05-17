import { useState } from 'react';

interface PasswordProtectionProps {
  onAuthenticated: () => void;
}

export function PasswordProtection({ onAuthenticated }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/.netlify/functions/verify-password', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      
      if (response.ok) {
        onAuthenticated();
        // Store in sessionStorage so refresh doesn't log out
        sessionStorage.setItem('isAuthenticated', 'true');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Error verifying password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl mb-4">Enter Password</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Password"
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}