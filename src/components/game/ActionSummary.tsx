import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Target, UserCheck, UserX } from "lucide-react";

interface ActionResult {
  actorName: string;
  actorFakeName: string;
  action: string;
  targetName?: string;
  targetFakeName?: string;
  result: string;
}

interface ActionSummaryProps {
  actionResults: ActionResult[];
}

const ActionSummary = ({ actionResults }: ActionSummaryProps) => {
  if (!actionResults || actionResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Action Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No actions were performed this phase.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getActionIcon = (action: string) => {
    if (action.includes("watch")) return <Eye className="w-4 h-4" />;
    if (action.includes("assassinate")) return <Target className="w-4 h-4" />;
    if (action.includes("extract")) return <UserCheck className="w-4 h-4" />;
    return <UserX className="w-4 h-4" />;
  };

  const getActionText = (action: string) => {
    if (action.includes("watch")) return "watched";
    if (action.includes("assassinate")) return "assassinated";
    if (action.includes("extract")) return "extracted";
    return action;
  };

  const getResultColor = (result: string) => {
    if (result.includes("successfully") || result.includes("detected"))
      return "text-green-600";
    if (result.includes("caught") || result.includes("eliminated"))
      return "text-red-600";
    if (result.includes("saw nothing")) return "text-yellow-600";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actionResults.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getActionIcon(result.action)}
                <div>
                  <div className="font-medium">
                    {result.targetFakeName && (
                      <span>
                        {result.targetFakeName} was{" "}
                        {getActionText(result.action)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className={getResultColor(result.result)}
              >
                {result.result}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionSummary;
