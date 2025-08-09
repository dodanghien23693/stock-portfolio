"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ApiTestPage() {
  const { data: session } = useSession();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      console.log('Testing API...');
      console.log('Session:', session);
      
      const response = await fetch('/api/backtests');
      console.log('Response:', response);
      console.log('Status:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Data:', data);
        setResult({ success: true, data });
      } else {
        const errorText = await response.text();
        console.log('Error text:', errorText);
        setResult({ success: false, error: errorText, status: response.status });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setResult({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      testAPI();
    }
  }, [session]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Session Status:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">API Test Result:</h2>
          {loading ? (
            <p>Loading...</p>
          ) : result ? (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <p>No result yet</p>
          )}
        </div>

        <button
          onClick={testAPI}
          disabled={!session || loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {loading ? 'Testing...' : 'Test API Again'}
        </button>
      </div>
    </div>
  );
}
