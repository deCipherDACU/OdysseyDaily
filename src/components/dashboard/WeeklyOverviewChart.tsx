'use client';

import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { LiquidGlass } from '../ui/LiquidGlass';

const sankeyData = {
    nodes: [
        { name: 'Education' },
        { name: 'Health' },
        { name: 'Career' },
        { name: 'Hobbies' },
        { name: 'Total XP' },
    ],
    links: [
        { source: 0, target: 4, value: 120 },
        { source: 1, target: 4, value: 80 },
        { source: 2, target: 4, value: 200 },
        { source: 3, target: 4, value: 50 },
    ],
};

const nodeColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--primary))',
];

const WeeklyOverviewChart = () => {
  return (
    <LiquidGlass variant='heavy' className="p-6 col-span-1 lg:col-span-2">
      <h3 className="font-headline font-semibold text-white">Weekly XP Flow</h3>
      <p className="text-sm text-muted-foreground">XP earned from different quest categories this week.</p>
      <div className="mt-4">
        <ChartContainer config={{}} className="min-h-[250px] w-full" key="weekly-overview-chart">
            <ResponsiveContainer width="100%" height={250}>
                <Sankey
                    data={sankeyData}
                    nodePadding={50}
                    margin={{
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10,
                    }}
                    node={({ x, y, width, height, index, payload }) => (
                        <g>
                            <rect x={x} y={y} width={width} height={height} fill={nodeColors[index % nodeColors.length]} rx="2" ry="2" />
                            <text
                                x={x < 100 ? x + width + 6 : x - 6}
                                y={y + height / 2}
                                textAnchor={x < 100 ? "start" : "end"}
                                dominantBaseline="middle"
                                className="fill-foreground font-semibold"
                            >
                                {payload.name}
                            </text>
                        </g>
                    )}
                    link={{ stroke: 'hsl(var(--border))', strokeOpacity: 0.5, strokeWidth: 15 }}
                >
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                </Sankey>
            </ResponsiveContainer>
        </ChartContainer>
      </div>
    </LiquidGlass>
  );
};

export default WeeklyOverviewChart;
