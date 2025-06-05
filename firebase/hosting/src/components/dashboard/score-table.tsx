
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
import { format } from 'date-fns';

interface ScoreTableProps {
  sessions: FetchedStroopSession[];
}

// Assuming max 2 rounds for now, can be made dynamic if ROUNDS_CONFIG is available
const ROUND_KEYS = [
    { num: 1, idKey: 'round1Id', titleKey: 'round1Title', scoreKey: 'round1Score', trialsKey: 'round1Trials', avgTimeKey: 'round1AverageResponseTimeSeconds' },
    { num: 2, idKey: 'round2Id', titleKey: 'round2Title', scoreKey: 'round2Score', trialsKey: 'round2Trials', avgTimeKey: 'round2AverageResponseTimeSeconds' },
    // Add more round keys here if game configuration changes
];

export default function ScoreTable({ sessions }: ScoreTableProps) {
  if (!sessions || sessions.length === 0) {
    return <p className="text-center text-muted-foreground">No session data available to display.</p>;
  }

  // Determine which rounds have data to display headers dynamically
  const availableRoundDetails = ROUND_KEYS.filter(rKey => 
    sessions.some(session => session[rKey.scoreKey] !== undefined)
  ).map(rKey => ({
    ...rKey,
    // Use the title from the first session that has this round, or default
    displayTitle: sessions.find(s => s[rKey.titleKey])?.[rKey.titleKey] || `Round ${rKey.num}`
  }));


  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableCaption>A list of your recent Stroop Test sessions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px] whitespace-nowrap">Date</TableHead>
            {availableRoundDetails.map(rDetail => (
              <TableHead key={`header-${rDetail.idKey}-score`} className="text-center whitespace-nowrap">
                {rDetail.displayTitle} Score
              </TableHead>
            ))}
             {availableRoundDetails.map(rDetail => (
              <TableHead key={`header-${rDetail.idKey}-avgtime`} className="text-center whitespace-nowrap">
                {rDetail.displayTitle} Avg. Time (s)
              </TableHead>
            ))}
            {availableRoundDetails.map(rDetail => (
              <TableHead key={`header-${rDetail.idKey}-trials`} className="text-center whitespace-nowrap">
                 {rDetail.displayTitle} Trials
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell className="font-medium whitespace-nowrap">
                {session.timestamp ? format(session.timestamp.toDate(), 'MMM d, yyyy HH:mm') : 'N/A'}
              </TableCell>
              {availableRoundDetails.map(rDetail => (
                <TableCell key={`${session.id}-${rDetail.idKey}-score`} className="text-center">
                  {session[rDetail.scoreKey] ?? 'N/A'}
                </TableCell>
              ))}
              {availableRoundDetails.map(rDetail => (
                  <TableCell key={`${session.id}-${rDetail.idKey}-avgtime`} className="text-center">
                  {session[rDetail.avgTimeKey]?.toFixed(2) ?? 'N/A'}
                  </TableCell>
              ))}
              {availableRoundDetails.map(rDetail => (
                  <TableCell key={`${session.id}-${rDetail.idKey}-trials`} className="text-center">
                  {session[rDetail.trialsKey] ?? 'N/A'}
                  </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
