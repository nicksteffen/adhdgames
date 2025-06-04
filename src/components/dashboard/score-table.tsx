
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
];

export default function ScoreTable({ sessions }: ScoreTableProps) {
  if (!sessions || sessions.length === 0) {
    return <p className="text-center text-muted-foreground">No session data available to display.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableCaption>A list of your recent Stroop Test sessions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Date</TableHead>
            {ROUND_KEYS.map(rKey => (
              sessions[0]?.[rKey.titleKey] && ( // Check if round data exists in the first session
                <TableHead key={`header-round${rKey.num}-score`} className="text-center whitespace-nowrap">
                  {sessions[0][rKey.titleKey] || `Round ${rKey.num}`} Score
                </TableHead>
              )
            ))}
             {ROUND_KEYS.map(rKey => (
              sessions[0]?.[rKey.avgTimeKey] && (
                <TableHead key={`header-round${rKey.num}-avgtime`} className="text-center whitespace-nowrap">
                  {sessions[0][rKey.titleKey] || `Round ${rKey.num}`} Avg. Time (s)
                </TableHead>
              )
            ))}
            {ROUND_KEYS.map(rKey => (
                sessions[0]?.[rKey.trialsKey] && (
                <TableHead key={`header-round${rKey.num}-trials`} className="text-center whitespace-nowrap">
                   {sessions[0][rKey.titleKey] || `Round ${rKey.num}`} Trials
                </TableHead>
                )
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell className="font-medium">
                {session.timestamp ? format(session.timestamp.toDate(), 'MMM d, yyyy HH:mm') : 'N/A'}
              </TableCell>
              {ROUND_KEYS.map(rKey => (
                session[rKey.scoreKey] !== undefined && (
                    <TableCell key={`${session.id}-round${rKey.num}-score`} className="text-center">
                    {session[rKey.scoreKey] ?? 'N/A'}
                    </TableCell>
                )
              ))}
              {ROUND_KEYS.map(rKey => (
                 session[rKey.avgTimeKey] !== undefined && (
                    <TableCell key={`${session.id}-round${rKey.num}-avgtime`} className="text-center">
                    {session[rKey.avgTimeKey]?.toFixed(2) ?? 'N/A'}
                    </TableCell>
                 )
              ))}
              {ROUND_KEYS.map(rKey => (
                session[rKey.trialsKey] !== undefined && (
                    <TableCell key={`${session.id}-round${rKey.num}-trials`} className="text-center">
                    {session[rKey.trialsKey] ?? 'N/A'}
                    </TableCell>
                )
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
