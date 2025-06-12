
import LoginPageClient from "./LoginPage";
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";

function LoginPageLoadingFallback() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <Skeleton className="h-4 w-3/4" />
        </CardFooter>
      </Card>
    </main>
  );
}

export default function LoginPageContainer() {
    return (
        <Suspense fallback={<LoginPageLoadingFallback />}>
            <LoginPageClient />
        </Suspense>
    );
}

