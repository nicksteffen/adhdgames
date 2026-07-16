import StroopTestGame from '@/components/stroop-test-game';

export default function StroopTestPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl">
        <StroopTestGame />
      </div>
    </main>
  );
}