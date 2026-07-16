import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Activity, BarChart2, Lock } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: <BrainCircuit className="w-10 h-10 text-primary" />,
    title: "2-Phase Stroop Test",
    description: "Our core exercise. Complete both Word Match and Color Match back-to-back to measure your processing speed and cognitive interference score.",
    link: "/tests/stroop",
    badge: "Active",
  },
  {
    icon: <BarChart2 className="w-10 h-10 text-primary" />,
    title: "Track Your Progress",
    description: "Create a free account to log your daily reaction times, calculate your personal Stroop index, and monitor your focus trends over time.",
    link: "/sign-up",
    badge: "Ready",
  },
  {
    icon: <Lock className="w-10 h-10 text-muted-foreground" />,
    title: "N-Back Memory Challenge",
    description: "A highly demanding exercise designed to train active working memory by matching letters N-steps backward in sequence.",
    link: "#",
    badge: "Coming Soon",
    disabled: true,
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 text-center">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col justify-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mx-auto border border-primary/20">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Scientifically-Backed Focus Exercises
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-balance">
              Train Your Brain, Sharpen Your Focus
            </h1>
            <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl text-pretty">
              CogniTrain helps you measure and build selective attention through a clean, low-stress, ADHD-friendly environment.
            </p>
            <div className="pt-4">
              <Link href="/tests/stroop" passHref legacyBehavior>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 cursor-pointer">
                  Start Stroop Session
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Exercise Flow */}
      <section className="w-full py-12 md:py-24 bg-muted/30 border-y border-border/40">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why Cognitive Exercises?</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mt-4 text-pretty">
              Consistent training helps strengthen the prefrontal cortex—the part of the brain responsible for impulse control and resisting distractions. No intrusive ads, no stressful timers. Just focus.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className={`flex flex-col text-center items-center p-6 bg-card transition-all border border-border/50 ${feature.disabled ? 'opacity-65' : 'hover:shadow-lg'}`}>
                <CardHeader className="p-0 flex flex-col items-center w-full relative">
                  <div className="absolute top-0 right-0">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      feature.badge === "Active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      feature.badge === "Ready" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                      "bg-muted text-muted-foreground border-border"
                    }`}>
                      {feature.badge}
                    </span>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl mb-2 mt-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg font-bold mt-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4 flex flex-1 flex-col justify-between w-full">
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  
                  {!feature.disabled ? (
                    <Link href={feature.link} passHref legacyBehavior>
                      <Button variant="link" className="mt-4 text-primary font-medium hover:no-underline cursor-pointer">
                        Get Started →
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="link" disabled className="mt-4 text-muted-foreground/60 cursor-not-allowed">
                      Locked
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}