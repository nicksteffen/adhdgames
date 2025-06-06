
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
        <div className="text-center mb-10">
          <h1 
            className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl md:text-7xl"
            style={{ backgroundColor: 'yellow', padding: '0.5rem' }} 
          >
            Stroop Test Challenge - Updated!
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
            Test your cognitive flexibility!
          </p>
        </div>
        <StroopTestGame />
      </div>
    </main>
  );
}
