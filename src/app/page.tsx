
import StroopTestGame from '@/components/stroop-test-game';
// AuthButton is now in the GlobalNavBar, so it's not directly needed here unless for a specific reason.
// If it was just for global access, it's now handled by the NavBar.
// import AuthButton from '@/components/auth-button';

export default function HomePage() {
  return (
    // Removed absolute positioning for AuthButton from here
    // The main content will now naturally flow below the GlobalNavBar
    <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* AuthButton is now part of GlobalNavBar 
          If you need another AuthButton specifically on this page for a different purpose, you can re-add it.
          Otherwise, the one in the GlobalNavBar provides the main auth interaction point.
      */}
      {/* <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8">
        <AuthButton />
      </div> */}
      <div className="flex flex-col items-center justify-center">
        {/* Title and description are now part of the StroopTestGame or a separate Hero component if needed.
            For this quick nav bar setup, I'm keeping the page focused on the game itself. 
            You can add back a specific hero section here if you prefer.
        */}
        <StroopTestGame />
      </div>
    </main>
  );
}
