"use client";

import { useState } from "react";

interface TestResults {
  sync?: any;
  stockData?: any;
  stocksList?: any;
  batchSync?: any;
}

export default function APITestPage() {
  const [results, setResults] = useState<TestResults>({});
  const [loading, setLoading] = useState(false);

  const testSync = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stocks/sync?symbol=VNM");
      const data = await response.json();
      setResults((prev: TestResults) => ({
        ...prev,
        sync: data,
      }));
    } catch (error) {
      setResults((prev: TestResults) => ({
        ...prev,
        sync: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    }
    setLoading(false);
  };

  const testStockData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/stocks/VNM/data?period=1M&refresh=true"
      );
      const data = await response.json();
      setResults((prev: TestResults) => ({
        ...prev,
        stockData: data,
      }));
    } catch (error) {
      setResults((prev: TestResults) => ({
        ...prev,
        stockData: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    }
    setLoading(false);
  };

  const testStocksList = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stocks?refresh=true");
      const data = await response.json();
      setResults((prev: TestResults) => ({
        ...prev,
        stocksList: data,
      }));
    } catch (error) {
      setResults((prev: TestResults) => ({
        ...prev,
        stocksList: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    }
    setLoading(false);
  };

  const testBatchSync = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stocks/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbols: ["VCB", "HPG", "VHM"],
        }),
      });
      const data = await response.json();
      setResults((prev: TestResults) => ({
        ...prev,
        batchSync: data,
      }));
    } catch (error) {
      setResults((prev: TestResults) => ({
        ...prev,
        batchSync: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        VietnamStockAPI Integration Test
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={testSync}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Sync VNM
        </button>

        <button
          onClick={testStockData}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Stock Data
        </button>

        <button
          onClick={testStocksList}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Stocks List
        </button>

        <button
          onClick={testBatchSync}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Batch Sync
        </button>
      </div>

      {loading && (
        <div className="text-center text-gray-600 mb-4">Testing APIs...</div>
      )}

      {results && (
        <div className="space-y-6">
          {results.sync && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Sync API Result:</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(results.sync, null, 2)}
              </pre>
            </div>
          )}

          {results.stockData && (
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Stock Data API Result:
              </h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(results.stockData, null, 2)}
              </pre>
            </div>
          )}

          {results.stocksList && (
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Stocks List API Result:
              </h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(results.stocksList.slice(0, 3), null, 2)}
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                Showing first 3 stocks. Total: {results.stocksList.length}
              </p>
            </div>
          )}

          {results.batchSync && (
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Batch Sync API Result:
              </h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(results.batchSync, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
