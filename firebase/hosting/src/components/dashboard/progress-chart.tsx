
"use client";

import type { FetchedStroopSession } from '@/lib/firebase/firestore-service';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressChartProps {
  sessions: FetchedStroopSession[];
}

interface ChartRoundDetail {
    keyPrefix: string; // e.g., "round1" or "round2"
    title: string;
    scoreDataKey: string; // e.g., "round1Score"
    avgTimeDataKey: string; // e.g., "round1AvgTime"
}

// Dynamically determine available rounds and their titles from the first session
const getAvailableRoundDetails = (sessions: FetchedStroopSession[]): ChartRoundDetail[] => {
    const details: ChartRoundDetail[] = [];
    if (sessions.length === 0) return details;

    const firstSession = sessions[0];
    
    // Check for Round 1
    if (firstSession.round1Id !== undefined) {
        details.push({
            keyPrefix: "round1",
            title: firstSession.round1Title || "Round 1",
            scoreDataKey: "round1Score",
            avgTimeDataKey: "round1AvgTime",
        });
    }
    // Check for Round 2
    if (firstSession.round2Id !== undefined) {
         details.push({
            keyPrefix: "round2",
            title: firstSession.round2Title || "Round 2",
            scoreDataKey: "round2Score",
            avgTimeDataKey: "round2AvgTime",
        });
    }
    // Add checks for more rounds if necessary
    return details;
};


export default function ProgressChart({ sessions }: ProgressChartProps) {
  const availableRoundDetails = useMemo(() => getAvailableRoundDetails(sessions), [sessions]);

  const chartData = useMemo(() => {
    return sessions
      .map(session => {
        const baseData: { date: string; [key: string]: any } = {
          date: session.timestamp ? format(session.timestamp.toDate(), 'MMM d') : 'Unknown',
        };
        availableRoundDetails.forEach(rDetail => {
            if (session[rDetail.scoreDataKey] !== undefined) {
                baseData[rDetail.scoreDataKey] = session[rDetail.scoreDataKey];
            }
            if (session[rDetail.avgTimeDataKey] !== undefined) {
                baseData[rDetail.avgTimeDataKey] = session[rDetail.avgTimeDataKey];
            }
        });
        return baseData;
      })
      .reverse(); // Show oldest data first for line charts
  }, [sessions, availableRoundDetails]);

  if (!sessions || sessions.length < 2) { // Need at least 2 data points for a meaningful line chart
    return (
        <div className="text-center py-8">
            <p className="text-muted-foreground">
            Not enough data to display progress charts. Complete at least two sessions.
            </p>
        </div>
    );
  }
  if (availableRoundDetails.length === 0 && sessions.length >=2) {
     return (
        <div className="text-center py-8">
            <p className="text-muted-foreground">
            Session data is present but round details could not be determined for charts.
            </p>
        </div>
    );
  }


  const scoreColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))']; 
  const timeColors = ['hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--chart-1))']; 

  return (
    <div className="space-y-8">
      <Card className="shadow-inner bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl">Score per Round Over Time</CardTitle>
          <CardDescription>How your scores have changed across sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
              {availableRoundDetails.map((rDetail, index) => (
                 <Line 
                    key={`${rDetail.keyPrefix}-score`}
                    type="monotone" 
                    dataKey={rDetail.scoreDataKey} 
                    name={`${rDetail.title} Score`}
                    stroke={scoreColors[index % scoreColors.length]} 
                    activeDot={{ r: 6 }} 
                 />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-inner bg-card/80">
         <CardHeader>
          <CardTitle className="text-xl">Average Response Time (s) per Round</CardTitle>
          <CardDescription>How your average response speed has changed.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 0.1', 'dataMax + 0.1']} allowDecimals={true} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                formatter={(value: number) => typeof value === 'number' ? value.toFixed(2) + 's' : 'N/A'}
              />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
              {availableRoundDetails.map((rDetail, index) => (
                <Line 
                    key={`${rDetail.keyPrefix}-avgTime`}
                    type="monotone" 
                    dataKey={rDetail.avgTimeDataKey} 
                    name={`${rDetail.title} Avg. Time`}
                    stroke={timeColors[index % timeColors.length]} 
                    activeDot={{ r: 6 }} 
                 />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
