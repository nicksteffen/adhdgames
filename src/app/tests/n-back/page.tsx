import { NBackTest } from '@/components/tests/NBackTest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NBackTestPage() {
  return (
    <div className="py-8 flex flex-col items-center">
        <Card className="w-full max-w-4xl">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">N-Back Challenge</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4"/>
                    <span>Test your working memory and fluid intelligence.</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <NBackTest />
            </CardContent>
        </Card>
    </div>
  );
}