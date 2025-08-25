import { useMemo, useState } from "react";
import { Player } from "@/types/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ActionPanelProps {
  players: Player[];
  currentPlayer: Player;
  actions?: Record<
    string,
    { type: "watch" | "assassinate" | "extract"; targetId?: string }
  >;
  onSubmitAction: (
    type: "watch" | "assassinate" | "extract",
    targetId?: string
  ) => void;
}

const ActionPanel = ({
  players,
  currentPlayer,
  actions,
  onSubmitAction,
}: ActionPanelProps) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | undefined>(
    undefined
  );

  const canAct = useMemo(() => {
    return (
      !currentPlayer.isRevealed &&
      (currentPlayer.role === "Watcher" || currentPlayer.role === "Assassin")
    );
  }, [currentPlayer]);

  const alreadySubmitted = !!actions && !!actions[currentPlayer.id];

  const eligibleTargets = useMemo(() => {
    return players.filter((p) => p.id !== currentPlayer.id && !p.isRevealed);
  }, [players, currentPlayer.id]);

  const label = useMemo(() => {
    switch (currentPlayer.role) {
      case "Watcher":
        return "Select someone to watch";
      case "Assassin":
        return "Select a target to assassinate";
      case "Spy":
        return "Select a target to extract";
      default:
        return "No action available";
    }
  }, [currentPlayer.role]);

  const submitLabel = useMemo(() => {
    switch (currentPlayer.role) {
      case "Watcher":
        return "Watch";
      case "Assassin":
        return "Assassinate";
      case "Spy":
        return "Extract";
      default:
        return "Submit";
    }
  }, [currentPlayer.role]);

  const actionType = useMemo(() => {
    if (currentPlayer.role === "Watcher") return "watch" as const;
    if (currentPlayer.role === "Assassin") return "assassinate" as const;
    if (currentPlayer.role === "Spy") return "extract" as const;
    return undefined;
  }, [currentPlayer.role]);

  const handleSubmit = () => {
    if (!actionType) return;
    onSubmitAction(actionType, selectedTargetId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Phase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canAct && (
          <div className="text-sm text-muted-foreground">
            Your role has no action this phase.
          </div>
        )}
        {canAct && (
          <>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {eligibleTargets.map((p) => {
                const isSelected = p.id === selectedTargetId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedTargetId(p.id)}
                    className={`flex items-center justify-between p-2 rounded border text-left ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-transparent bg-muted/20"
                    }`}
                    disabled={alreadySubmitted}
                  >
                    <span>{p.fakeName}</span>
                  </button>
                );
              })}
            </div>
            <div className="pt-2">
              <Button
                onClick={handleSubmit}
                disabled={!actionType || !selectedTargetId || alreadySubmitted}
                className="w-full"
              >
                {alreadySubmitted ? "Submitted" : submitLabel}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionPanel;
