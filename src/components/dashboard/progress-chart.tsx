
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

// Determine which rounds have data based on the first session
const getAvailableRoundKeys = (sessions: FetchedStroopSession[]) => {
    const availableKeys = [];
    if (sessions.length > 0) {
        const firstSession = sessions[0];
        if (firstSession.round1Score !== undefined) availableKeys.push(1);
        if (firstSession.round2Score !== undefined) availableKeys.push(2);
        // Add more rounds if necessary
    }
    return availableKeys;
};


export default function ProgressChart({ sessions }: ProgressChartProps) {
  const availableRoundNumbers = useMemo(() => getAvailableRoundKeys(sessions), [sessions]);

  const chartData = useMemo(() => {
    return sessions
      .map(session => {
        const baseData: { date: string; [key: string]: any } = {
          date: session.timestamp ? format(session.timestamp.toDate(), 'MMM d') : 'Unknown',
        };
        if (session.round1Score !== undefined) {
            baseData.round1Score = session.round1Score;
            baseData.round1AvgTime = session.round1AverageResponseTimeSeconds;
        }
        if (session.round2Score !== undefined) {
            baseData.round2Score = session.round2Score;
            baseData.round2AvgTime = session.round2AverageResponseTimeSeconds;
        }
        // Add more rounds if necessary
        return baseData;
      })
      .reverse(); // Show oldest data first for line charts
  }, [sessions]);

  if (!sessions || sessions.length < 2) { // Need at least 2 data points for a meaningful line chart
    return (
        <div className="text-center py-8">
            <p className="text-muted-foreground">
            Not enough data to display progress charts. Complete at least two sessions.
            </p>
        </div>
    );
  }

  const scoreColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))']; // from globals.css
  const timeColors = ['hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--chart-1))']; // different set for variety

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
              {availableRoundNumbers.includes(1) && (
                 <Line type="monotone" dataKey="round1Score" name={sessions[0]?.round1Title || "Round 1 Score"} stroke={scoreColors[0]} activeDot={{ r: 6 }} />
              )}
              {availableRoundNumbers.includes(2) && (
                <Line type="monotone" dataKey="round2Score" name={sessions[0]?.round2Title || "Round 2 Score"} stroke={scoreColors[1]} activeDot={{ r: 6 }} />
              )}
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
                formatter={(value: number) => value.toFixed(2) + 's'}
              />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
              {availableRoundNumbers.includes(1) && (
                <Line type="monotone" dataKey="round1AvgTime" name={sessions[0]?.round1Title || "Round 1 Avg. Time"} stroke={timeColors[0]} activeDot={{ r: 6 }} />
              )}
               {availableRoundNumbers.includes(2) && (
                <Line type="monotone" dataKey="round2AvgTime" name={sessions[0]?.round2Title || "Round 2 Avg. Time"} stroke={timeColors[1]} activeDot={{ r: 6 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
