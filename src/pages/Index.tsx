import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Target, MessageCircle, Clock } from "lucide-react";
import MasqueradeLogo from "@/components/game/MasqueradeLogo";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-deep flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <MasqueradeLogo />

        <Card className="backdrop-blur border-accent/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Welcome</CardTitle>
            <CardDescription>
              Enter the world of shadows and secrets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/host" className="block">
              <Button className="w-full" size="lg">
                Host Game
              </Button>
            </Link>

            <Link to="/join" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Join Game
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="backdrop-blur border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span>How to Play</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4" />
                    <span>Roles & Objectives</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong>Spy:</strong> Uncover the identities of other
                      players
                    </li>
                    <li>
                      <strong>Guest:</strong> Survive the night without being
                      eliminated
                    </li>
                    <li>
                      <strong>Assassin:</strong> Eliminate a specific target
                    </li>
                    <li>
                      <strong>Watcher:</strong> Prevent eliminations and gather
                      evidence
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold flex items-center space-x-2 mb-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Communication</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      Make <strong>open speeches</strong> to accuse, lie, or
                      mislead
                    </li>
                    <li>
                      Use <strong>limited private chats</strong> per round
                    </li>
                    <li>
                      Receive cryptic <strong>"Echo" messages</strong> each
                      round
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>Round Structure</span>
                  </h4>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-primary">
                        1. Gather Clues
                      </div>
                      <div>Players receive vague hints about others</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-primary">
                        2. Discuss & Accuse
                      </div>
                      <div>Players debate openly and accuse others</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-primary">3. Vote</div>
                      <div>
                        Players vote on someone to be unmasked or eliminated
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">The Echoes Mechanic</h4>
                  <p className="text-sm text-muted-foreground">
                    At the start of each round, all players receive a cryptic
                    "Echo" message. These echoes may contain{" "}
                    <strong>truths, lies, or irrelevant noise</strong>, creating
                    paranoia and uncertainty.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Win Conditions</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-muted/30 rounded">
                  <strong>Spies:</strong> Unmask your target
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <strong>Guests:</strong> Survive until the end
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <strong>Assassins:</strong> Eliminate your target
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <strong>Watchers:</strong> Expose all Assassins and Spies
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
