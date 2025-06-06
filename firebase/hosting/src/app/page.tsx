
import StroopTestGame from '@/components/stroop-test-game';
import AuthButton from '@/components/auth-button';

export default function HomePage() {
  console.log(">>>> DEBUG: RENDERING ACTUAL HOME PAGE - STROOP TEST CHALLENGE! Version 2 <<<<");
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8">
        <AuthButton />
      </div>
      <div className="flex flex-col items-center justify-center flex-grow">
         <h1 className="text-5xl font-bold text-destructive mb-8 bg-yellow-200 p-4">
          THIS IS THE REAL STROOP APP - DEPLOYMENT TEST V2
        </h1>
        <StroopTestGame />
      </div>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>Unique Footer Test - Stroop App - Version 2</p>
      </footer>
    </main>
  );
}
