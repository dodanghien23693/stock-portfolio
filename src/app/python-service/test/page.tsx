"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/lib/toast";

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
}

export default function PythonServiceTestPage() {
  const [serviceUrl, setServiceUrl] = useState("http://localhost:8001");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState("/health");
  const [customBody, setCustomBody] = useState("");
  const [customMethod, setCustomMethod] = useState("GET");
  const [stockSymbol, setStockSymbol] = useState("VCB");
  const [period, setPeriod] = useState("1Y");

  // Test cases
  const testCases = [
    {
      name: "Health Check",
      endpoint: "/health",
      method: "GET",
    },
    {
      name: "Stock Price",
      endpoint: `/stocks/${stockSymbol}/price`,
      method: "GET",
    },
    {
      name: "Stock Info", 
      endpoint: `/stocks/${stockSymbol}/info`,
      method: "GET",
    },
    {
      name: "Stock History",
      endpoint: `/stocks/${stockSymbol}/history?period=${period}`,
      method: "GET",
    },
    {
      name: "Market Indices",
      endpoint: "/market/indices",
      method: "GET",
    },
    {
      name: "Search Stocks",
      endpoint: `/stocks/search?q=${stockSymbol}`,
      method: "GET",
    },
    {
      name: "Sync Stocks",
      endpoint: "/sync/stocks",
      method: "POST",
      body: {
        symbols: [stockSymbol],
        period: period,
      },
    },
    {
      name: "Sync Tracked",
      endpoint: "/sync/tracked-stocks", 
      method: "POST",
    },
    {
      name: "List Tracked Stocks",
      endpoint: "/stocks/tracked",
      method: "GET",
    },
  ];

  const runSingleTest = async (testCase: any): Promise<TestResult> => {
    const startTime = Date.now();
    const url = `${serviceUrl}${testCase.endpoint}`;

    try {
      const options: RequestInit = {
        method: testCase.method,
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      };

      if (testCase.body && testCase.method !== "GET") {
        options.body = JSON.stringify(testCase.body);
      }

      const response = await fetch(url, options);
      const duration = Date.now() - startTime;
      
      let data;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      return {
        endpoint: testCase.endpoint,
        method: testCase.method,
        status: response.status,
        success: response.ok,
        data,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        endpoint: testCase.endpoint,
        method: testCase.method,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      };
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);

    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      const result = await runSingleTest(testCase);
      results.push(result);
      setTestResults([...results]); // Update UI incrementally
    }

    setLoading(false);
  };

  const runCustomTest = async () => {
    setLoading(true);
    
    const testCase = {
      endpoint: customEndpoint,
      method: customMethod,
      body: customBody ? JSON.parse(customBody) : undefined,
    };

    try {
      const result = await runSingleTest(testCase);
      setTestResults([result, ...testResults]);
    } catch (error) {
      showToast.error(`Test failed: ${error}`, "Custom Test Failed");
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusBadge = (result: TestResult) => {
    if (result.success) {
      return <Badge className="bg-green-500">✓ {result.status}</Badge>;
    } else if (result.status > 0) {
      return <Badge className="bg-red-500">✗ {result.status}</Badge>;
    } else {
      return <Badge className="bg-gray-500">✗ Error</Badge>;
    }
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  // Quick test for service availability
  const quickHealthCheck = async () => {
    setLoading(true);
    const result = await runSingleTest({ endpoint: "/health", method: "GET" });
    setTestResults([result]);
    setLoading(false);
  };

  useEffect(() => {
    quickHealthCheck();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Python Service API Tester</h1>
        <div className="flex gap-2">
          <Button onClick={quickHealthCheck} variant="outline" disabled={loading}>
            Quick Health Check
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>
      </div>

      {/* Service Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Service Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceUrl">Service URL</Label>
              <Input
                id="serviceUrl"
                value={serviceUrl}
                onChange={(e) => setServiceUrl(e.target.value)}
                placeholder="http://localhost:8001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockSymbol">Test Stock Symbol</Label>
              <Input
                id="stockSymbol"
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                placeholder="VCB"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Test Period</Label>
              <select
                id="period"
                className="w-full px-3 py-2 border rounded-md"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="1M">1 Month</option>
                <option value="3M">3 Months</option>
                <option value="6M">6 Months</option>
                <option value="1Y">1 Year</option>
                <option value="2Y">2 Years</option>
                <option value="5Y">5 Years</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automated Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Automated API Tests</span>
            <Button onClick={runAllTests} disabled={loading}>
              {loading ? "Running Tests..." : "Run All Tests"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
            {testCases.map((testCase, index) => (
              <div key={index} className="p-2 border rounded text-sm">
                <div className="font-medium">{testCase.name}</div>
                <div className="text-gray-500 text-xs">
                  {testCase.method} {testCase.endpoint}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            <p>📝 Tests will run sequentially to avoid overwhelming the service</p>
            <p>⏱️ Each test has a 10-second timeout</p>
            <p>🔄 Results update in real-time as tests complete</p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Test */}
      <Card>
        <CardHeader>
          <CardTitle>Custom API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customMethod">Method</Label>
              <select
                id="customMethod"
                className="w-full px-3 py-2 border rounded-md"
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customEndpoint">Endpoint</Label>
              <Input
                id="customEndpoint"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="/health"
              />
            </div>
          </div>
          
          {customMethod !== "GET" && (
            <div className="space-y-2">
              <Label htmlFor="customBody">Request Body (JSON)</Label>
              <Textarea
                id="customBody"
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                placeholder='{"symbols": ["VCB"], "period": "1Y"}'
                rows={4}
              />
            </div>
          )}

          <Button onClick={runCustomTest} disabled={loading}>
            {loading ? "Testing..." : "Run Custom Test"}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results ({testResults.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet. Run some tests to see results here.</p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {result.method} {result.endpoint}
                      </span>
                      {getStatusBadge(result)}
                    </div>
                    <span className="text-sm text-gray-500">{result.duration}ms</span>
                  </div>
                  
                  {result.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                      <span className="text-red-700 text-sm">❌ {result.error}</span>
                    </div>
                  )}
                  
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium mb-2">
                        📄 Response Data
                      </summary>
                      <pre className="bg-gray-50 border rounded p-2 text-xs overflow-auto max-h-60">
                        {formatJson(result.data)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Status Summary */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filter(r => r.success).length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filter(r => !r.success).length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {testResults.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {Math.round(testResults.reduce((acc, r) => acc + r.duration, 0) / testResults.length)}ms
                </div>
                <div className="text-sm text-gray-600">Avg. Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
