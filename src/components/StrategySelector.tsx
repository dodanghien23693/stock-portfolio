"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

interface Strategy {
  key: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  category: string;
}

interface StrategyCategories {
  [key: string]: string[];
}

interface StrategySelection {
  strategyKey: string;
  parameters: Record<string, any>;
  allocation?: number;
}

interface StrategySelectProps {
  onStrategySelect: (selection: StrategySelection | StrategySelection[]) => void;
  mode: 'single' | 'multi';
  selectedStrategies?: StrategySelection[];
}

export function StrategySelector({ onStrategySelect, mode = 'single', selectedStrategies = [] }: StrategySelectProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [categories, setCategories] = useState<StrategyCategories>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentSelection, setCurrentSelection] = useState<StrategySelection[]>(selectedStrategies);
  const [showParameters, setShowParameters] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await fetch('/api/strategies');
      const data = await response.json();
      setStrategies(data.strategies);
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStrategies = selectedCategory === 'all' 
    ? strategies 
    : strategies.filter(s => s.category === selectedCategory);

  const handleStrategyToggle = (strategy: Strategy) => {
    if (mode === 'single') {
      const selection: StrategySelection = {
        strategyKey: strategy.key,
        parameters: strategy.parameters
      };
      setCurrentSelection([selection]);
      onStrategySelect(selection);
    } else {
      const existing = currentSelection.find(s => s.strategyKey === strategy.key);
      let newSelection: StrategySelection[];
      
      if (existing) {
        newSelection = currentSelection.filter(s => s.strategyKey !== strategy.key);
      } else {
        const allocation = currentSelection.length === 0 ? 100 : 
          Math.max(0, 100 - currentSelection.reduce((sum, s) => sum + (s.allocation || 0), 0));
        
        newSelection = [...currentSelection, {
          strategyKey: strategy.key,
          parameters: strategy.parameters,
          allocation: Math.min(allocation, 25) // Default to 25% or remaining
        }];
      }
      
      setCurrentSelection(newSelection);
      onStrategySelect(newSelection);
    }
  };

  const handleParameterChange = (strategyKey: string, paramKey: string, value: any) => {
    const newSelection = currentSelection.map(s => 
      s.strategyKey === strategyKey 
        ? { ...s, parameters: { ...s.parameters, [paramKey]: value } }
        : s
    );
    setCurrentSelection(newSelection);
    onStrategySelect(mode === 'single' ? newSelection[0] : newSelection);
  };

  const handleAllocationChange = (strategyKey: string, allocation: number) => {
    const newSelection = currentSelection.map(s => 
      s.strategyKey === strategyKey ? { ...s, allocation } : s
    );
    setCurrentSelection(newSelection);
    onStrategySelect(newSelection);
  };

  const totalAllocation = currentSelection.reduce((sum, s) => sum + (s.allocation || 0), 0);

  if (loading) {
    return <div className="flex justify-center p-8">Loading strategies...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {mode === 'single' ? 'Chọn chiến lược giao dịch' : 'Danh mục đa chiến lược'}
          </h3>
          {mode === 'multi' && (
            <Badge variant={totalAllocation === 100 ? "default" : "destructive"}>
              Tổng phân bổ: {totalAllocation.toFixed(1)}%
            </Badge>
          )}
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {Object.keys(categories).map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStrategies.map((strategy) => {
          const isSelected = currentSelection.some(s => s.strategyKey === strategy.key);
          const selection = currentSelection.find(s => s.strategyKey === strategy.key);
          
          return (
            <Card 
              key={strategy.key} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleStrategyToggle(strategy)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">{strategy.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {strategy.category}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/strategies/${strategy.key}`);
                      }}
                      title="Xem chi tiết"
                    >
                      📖
                    </Button>
                    {isSelected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowParameters(showParameters === strategy.key ? null : strategy.key);
                        }}
                        title="Cài đặt tham số"
                      >
                        ⚙️
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs mb-3">
                  {strategy.description}
                </CardDescription>
                
                {mode === 'multi' && isSelected && selection && (
                  <div className="space-y-2 mt-3 pt-3 border-t">
                    <Label className="text-xs">Phân bổ: {selection.allocation?.toFixed(1)}%</Label>
                    <Slider
                      value={[selection.allocation || 0]}
                      onValueChange={([value]: number[]) => handleAllocationChange(strategy.key, value)}
                      max={100}
                      step={1}
                      className="w-full"
                      onClick={(e: any) => e.stopPropagation()}
                    />
                  </div>
                )}

                {showParameters === strategy.key && isSelected && (
                  <div className="mt-3 pt-3 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
                    <Label className="text-xs font-medium">Tham số</Label>
                    {Object.entries(strategy.parameters).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs text-gray-600">{key}</Label>
                        {typeof value === 'number' ? (
                          <Input
                            type="number"
                            value={selection?.parameters[key] || value}
                            onChange={(e) => handleParameterChange(
                              strategy.key, 
                              key, 
                              Number(e.target.value)
                            )}
                            className="h-7 text-xs"
                          />
                        ) : typeof value === 'boolean' ? (
                          <Switch
                            checked={selection?.parameters[key] ?? value}
                            onCheckedChange={(checked: boolean) => handleParameterChange(
                              strategy.key, 
                              key, 
                              checked
                            )}
                          />
                        ) : (
                          <Input
                            value={selection?.parameters[key] || value}
                            onChange={(e) => handleParameterChange(
                              strategy.key, 
                              key, 
                              e.target.value
                            )}
                            className="h-7 text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {mode === 'multi' && currentSelection.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Chiến lược đã chọn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentSelection.map((selection) => {
                const strategy = strategies.find(s => s.key === selection.strategyKey);
                return (
                  <div key={selection.strategyKey} className="flex items-center justify-between py-1">
                    <span className="text-sm">{strategy?.name}</span>
                    <Badge variant="outline">{selection.allocation?.toFixed(1)}%</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
