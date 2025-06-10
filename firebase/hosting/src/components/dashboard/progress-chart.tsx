
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
import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressChartProps {
  sessions: FetchedStroopSession[];
}

interface ChartRoundDetail {
    keyPrefix: string;
    title: string;
    scoreDataKey: string;
    avgTimeDataKey: string;
}

// Dynamically determine available rounds and their titles from the first session
const getAvailableRoundDetails = (sessions: FetchedStroopSession[]): ChartRoundDetail[] => {
    const details: ChartRoundDetail[] = [];
    if (sessions.length === 0) return details;

    const firstSession = sessions[0];
    
    // Check for Round 1
    if (firstSession.round1Id !== undefined && firstSession.round1Score !== undefined) {
        details.push({
            keyPrefix: "round1",
            title: firstSession.round1Title || "Round 1",
            scoreDataKey: "round1Score",
            avgTimeDataKey: "round1AverageResponseTimeSeconds",
        });
    }
    // Check for Round 2
    if (firstSession.round2Id !== undefined && firstSession.round2Score !== undefined) {
         details.push({
            keyPrefix: "round2",
            title: firstSession.round2Title || "Round 2",
            scoreDataKey: "round2Score",
            avgTimeDataKey: "round2AverageResponseTimeSeconds",
        });
    }
    // Add more rounds if necessary, e.g. round3Id, round3Score etc.
    return details;
};


export default function ProgressChart({ sessions }: ProgressChartProps) {
  const availableRoundDetails = useMemo(() => getAvailableRoundDetails(sessions), [sessions]);

  const chartData = useMemo(() => {
    return sessions
      .map(session => {
        const baseData: { date: string; [key: string]: any } = {
          date: session.timestamp ? format(session.timestamp.toDate(), 'MMM d') : 'Unknown Date',
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
      .sort((a, b) => { // Ensure chronological order
        try {
            // Assuming date is like "MMM d" or can be parsed. For full dates, parseISO might be better.
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        } catch {
            return 0; // Fallback if date parsing fails
        }
      });
  }, [sessions, availableRoundDetails]);

  if (!sessions || sessions.length < 2) { 
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Progress Over Time</CardTitle>
                <CardDescription>Not enough data to display progress charts. Complete at least two sessions.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Awaiting more session data...</p>
            </CardContent>
        </Card>
    );
  }
  if (availableRoundDetails.length === 0 && sessions.length >=2) {
     return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Progress Over Time</CardTitle>
                <CardDescription>Session data is present but round details could not be determined for charts.</CardDescription>
            </CardHeader>
             <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Check session data structure.</p>
            </CardContent>
        </Card>
    );
  }

  const scoreColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-3))', 'hsl(var(--chart-5))']; 
  const timeColors = ['hsl(var(--chart-2))', 'hsl(var(--chart-4))', 'hsl(var(--chart-1))']; 

  return (
    <div className="space-y-8">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Scores Over Time</CardTitle>
          <CardDescription>Your scores for each round across sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))', paddingTop: '10px' }} />
              {availableRoundDetails.map((rDetail, index) => (
                 <Line 
                    key={`${rDetail.keyPrefix}-score`}
                    type="monotone" 
                    dataKey={rDetail.scoreDataKey} 
                    name={`${rDetail.title} Score`}
                    stroke={scoreColors[index % scoreColors.length]} 
                    strokeWidth={2}
                    activeDot={{ r: 7, style: { fill: scoreColors[index % scoreColors.length], stroke: 'hsl(var(--card))' } }} 
                    dot={{ r:3, fill: scoreColors[index % scoreColors.length] }}
                 />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-lg">
         <CardHeader>
          <CardTitle className="text-xl font-semibold">Average Response Time (s)</CardTitle>
          <CardDescription>Your average response speed per round across sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 0.1', 'dataMax + 0.1']} allowDecimals={true} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 'bold' }}
                formatter={(value: number) => typeof value === 'number' ? value.toFixed(2) + 's' : 'N/A'}
              />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))', paddingTop: '10px' }} />
              {availableRoundDetails.map((rDetail, index) => (
                <Line 
                    key={`${rDetail.keyPrefix}-avgTime`}
                    type="monotone" 
                    dataKey={rDetail.avgTimeDataKey} 
                    name={`${rDetail.title} Avg. Time`}
                    stroke={timeColors[index % timeColors.length]} 
                    strokeWidth={2}
                    activeDot={{ r: 7, style: { fill: timeColors[index % timeColors.length], stroke: 'hsl(var(--card))' } }}
                    dot={{ r:3, fill: timeColors[index % timeColors.length] }}
                 />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
