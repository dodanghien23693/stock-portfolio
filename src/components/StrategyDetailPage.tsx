"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Target, Book, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StrategyDetail {
  key: string;
  name: string;
  description: string;
  category: string;
  parameters: Record<string, any>;
  methodology: string;
  examples: string[];
  strengths: string[];
  weaknesses: string[];
  conditions: string[];
  risks: string[];
  references: string[];
}

interface StrategyDetailPageProps {
  strategyKey: string;
}

export function StrategyDetailPage({ strategyKey }: StrategyDetailPageProps) {
  const [strategy, setStrategy] = useState<StrategyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStrategyDetail();
  }, [strategyKey]);

  const fetchStrategyDetail = async () => {
    try {
      const response = await fetch(`/api/strategies/${strategyKey}`);
      if (response.ok) {
        const data = await response.json();
        setStrategy(data);
      } else {
        console.error('Strategy not found');
      }
    } catch (error) {
      console.error('Error fetching strategy detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Đang tải thông tin chiến lược...</div>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy chiến lược</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{strategy.name}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                {strategy.category}
              </Badge>
              <span className="text-muted-foreground">#{strategy.key}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <Book className="w-4 h-4 mr-2" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="methodology">
            <BarChart3 className="w-4 h-4 mr-2" />
            Phương pháp
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <Target className="w-4 h-4 mr-2" />
            Phân tích
          </TabsTrigger>
          <TabsTrigger value="risks">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Rủi ro
          </TabsTrigger>
          <TabsTrigger value="references">
            <Book className="w-4 h-4 mr-2" />
            Tham khảo
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mô tả chiến lược</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {strategy.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tham số mặc định</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {Object.entries(strategy.parameters).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="font-medium">{key}</span>
                    <Badge variant="outline">{typeof value === 'boolean' ? (value ? 'Có' : 'Không') : value}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Methodology Tab */}
        <TabsContent value="methodology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phương pháp thực hiện</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: strategy.methodology }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ví dụ minh họa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategy.examples.map((example, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: example }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Điểm mạnh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategy.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <TrendingDown className="w-5 h-5 mr-2" />
                  Điểm yếu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategy.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Điều kiện áp dụng</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {strategy.conditions.map((condition, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Cảnh báo rủi ro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategy.risks.map((risk, index) => (
                  <div key={index} className="p-4 border-l-4 border-orange-500 bg-orange-50">
                    <p className="text-orange-800">{risk}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* References Tab */}
        <TabsContent value="references" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu tham khảo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strategy.references.map((reference, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: reference }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
