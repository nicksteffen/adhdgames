import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Palette, Target, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

const availableTests = [
  {
    title: "Stroop Test (Word Match)",
    description: "Focus on reading the word while ignoring the conflicting ink color.",
    duration: "2-3 mins",
    skill: "Selective Attention",
    icon: <Brain className="w-8 h-8 text-primary" />,
    link: "/tests/stroop",
    difficulty: "Medium",
  },
  {
    title: "Stroop Test (Color Match)",
    description: "Focus on identifying the ink color while ignoring the conflicting written word.",
    duration: "2-3 mins",
    skill: "Cognitive Flexibility",
    icon: <Palette className="w-8 h-8 text-primary" />,
    link: "/tests/stroop-color",
    difficulty: "Medium",
  },
  {
    title: "N-Back Challenge",
    description: "Remember and match shapes or letters shown N-steps backward in sequence.",
    duration: "5 mins",
    skill: "Working Memory",
    icon: <Target className="w-8 h-8 text-primary" />,
    link: "/tests/n-back",
    difficulty: "Hard",
  },
];

export default function TestsDashboard() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 sm:py-12">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-border/60">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cognitive Exercises</h1>
          <p className="text-muted-foreground mt-1">
            Choose an exercise below to start your focus training session.
          </p>
        </div>
        
        {/* Quick status summary placeholder */}
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-lg border border-border/40 text-sm">
          <Activity className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-muted-foreground">Ready to record scores</span>
        </div>
      </div>

      {/* Grid of Exercises */}
      <div className="grid gap-6 md:grid-cols-3">
        {availableTests.map((test, index) => (
          <Card key={index} className="flex flex-col justify-between hover:shadow-md transition-shadow border-border/50">
            <CardHeader className="pb-4">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mb-3">
                {test.icon}
              </div>
              <CardTitle className="text-xl font-bold leading-tight">{test.title}</CardTitle>
              <CardDescription className="text-xs font-semibold tracking-wider uppercase text-primary mt-1">
                Trains: {test.skill}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {test.description}
                </p>
                
                {/* Meta details */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pb-4 border-b border-border/40">
                  <div>
                    <span className="font-medium">Time:</span> {test.duration}
                  </div>
                  <div>
                    <span className="font-medium">Level:</span> {test.difficulty}
                  </div>
                </div>
              </div>

              <Link href={test.link} passHref legacyBehavior>
                <Button className="w-full mt-4 group cursor-pointer">
                  Start Training
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}