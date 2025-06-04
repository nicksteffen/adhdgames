
import StroopTestGame from '@/components/stroop-test-game';
import AuthButton from '@/components/auth-button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8">
        <AuthButton />
      </div>
      <div className="flex flex-col items-center justify-center flex-grow">
        <StroopTestGame />
      </div>
    </main>
  );
}
