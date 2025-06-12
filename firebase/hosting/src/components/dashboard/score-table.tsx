
"use client";

import type { FetchedStroopSession } from '@/lib/firebase/firestore-service';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface ScoreTableProps {
  sessions: FetchedStroopSession[];
}

interface TableRoundDetail {
    num: number;
    idKey: string;
    titleKey: string;
    scoreKey: string;
    trialsKey: string;
    avgTimeKey: string;
    displayTitle: string;
}

const getAvailableRoundDetailsForTable = (sessions: FetchedStroopSession[]): TableRoundDetail[] => {
    const details: TableRoundDetail[] = [];
    if (sessions.length === 0) return details; // Safety check

    const firstSession = sessions[0];
    const potentialRounds = [
        { num: 1, idKey: 'round1Id', titleKey: 'round1Title', scoreKey: 'round1Score', trialsKey: 'round1Trials', avgTimeKey: 'round1AverageResponseTimeSeconds' },
        { num: 2, idKey: 'round2Id', titleKey: 'round2Title', scoreKey: 'round2Score', trialsKey: 'round2Trials', avgTimeKey: 'round2AverageResponseTimeSeconds' },
    ];

    potentialRounds.forEach(rKey => {
        // Check if any session has data for this round's score key
        if (sessions.some(session => session[rKey.scoreKey as keyof FetchedStroopSession] !== undefined)) {
            details.push({
                ...rKey,
                displayTitle: (firstSession[rKey.titleKey as keyof FetchedStroopSession] as string) || `Round ${rKey.num}`
            });
        }
    });
    return details;
};


export default function ScoreTable({ sessions }: ScoreTableProps) {
  const availableRoundDetails = useMemo(() => getAvailableRoundDetailsForTable(sessions), [sessions]);

  if (!sessions || sessions.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Session History</CardTitle>
                <CardDescription>No session data available to display.</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Play a game to see your history.</p>
            </CardContent>
        </Card>
    );
  }

  if (availableRoundDetails.length === 0 && sessions.length > 0) {
     return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Session History</CardTitle>
                <CardDescription>Session data is present but round details could not be determined for the table.</CardDescription>
            </CardHeader>
             <CardContent className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Check session data structure.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Session History</CardTitle>
        <CardDescription>A detailed list of your past Stroop Test sessions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableCaption className="mt-4">A list of your recent Stroop Test sessions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] whitespace-nowrap font-semibold">Date & Time</TableHead>
                {availableRoundDetails.map(rDetail => (
                  <TableHead key={`header-${rDetail.idKey}-score`} className="text-center whitespace-nowrap font-semibold">
                    {rDetail.displayTitle} Score
                  </TableHead>
                ))}
                {availableRoundDetails.map(rDetail => (
                  <TableHead key={`header-${rDetail.idKey}-avgtime`} className="text-center whitespace-nowrap font-semibold">
                    {rDetail.displayTitle} Avg. Time (s)
                  </TableHead>
                ))}
                {availableRoundDetails.map(rDetail => (
                  <TableHead key={`header-${rDetail.idKey}-trials`} className="text-center whitespace-nowrap font-semibold">
                    {rDetail.displayTitle} Trials
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium whitespace-nowrap">
                    {/* Convert ISO string back to Date for formatting */}
                    {session.timestamp ? format(new Date(session.timestamp), 'MMM d, yyyy HH:mm') : 'N/A'}
                  </TableCell>
                  {availableRoundDetails.map(rDetail => (
                    <TableCell key={`${session.id}-${rDetail.idKey}-score`} className="text-center">
                      {session[rDetail.scoreKey as keyof FetchedStroopSession] ?? 'N/A'}
                    </TableCell>
                  ))}
                  {availableRoundDetails.map(rDetail => (
                      <TableCell key={`${session.id}-${rDetail.idKey}-avgtime`} className="text-center">
                      {typeof session[rDetail.avgTimeKey as keyof FetchedStroopSession] === 'number' ? (session[rDetail.avgTimeKey as keyof FetchedStroopSession] as number).toFixed(2) : 'N/A'}
                      </TableCell>
                  ))}
                  {availableRoundDetails.map(rDetail => (
                      <TableCell key={`${session.id}-${rDetail.idKey}-trials`} className="text-center">
                      {session[rDetail.trialsKey as keyof FetchedStroopSession] ?? 'N/A'}
                      </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
