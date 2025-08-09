import { StrategyDetailPage } from "@/components/StrategyDetailPage";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function StrategyPage({ params }: PageProps) {
  return <StrategyDetailPage strategyKey={params.slug} />;
}

export async function generateStaticParams() {
  // Danh sách tất cả strategy keys để pre-render
  const strategyKeys = [
    'smaStrategy',
    'buyAndHold',
    'rsiStrategy',
    'macdStrategy',
    'tripleMA',
    'momentumContinuation',
    'bollingerBands',
    'contrarian',
    'breakoutStrategy',
    'volatilityBreakout',
    'multiFactorStrategy',
    'defensiveValue'
  ];

  return strategyKeys.map((key) => ({
    slug: key,
  }));
}
