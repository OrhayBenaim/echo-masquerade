import { useState } from "react";
import { Player, PrivateMessage, DEFAULT_GAME_CONFIG } from "@/types/game";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Send, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrivateChatProps {
  messages: PrivateMessage[];
  currentPlayer: Player;
  players: Player[];
  sentMessagesThisRound: number;
  onSendMessage: (message: PrivateMessage) => void;
}

const PrivateChat = ({
  messages,
  currentPlayer,
  players,
  sentMessagesThisRound,
  onSendMessage,
}: PrivateChatProps) => {
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [messageText, setMessageText] = useState("");
  const { toast } = useToast();

  const remainingMessages =
    DEFAULT_GAME_CONFIG.maxPrivateMessagesPerRound - sentMessagesThisRound;
  const otherPlayers = players.filter((p) => p.id !== currentPlayer.id);

  const handleSendMessage = () => {
    if (!selectedRecipient) {
      toast({
        title: "No Recipient",
        description: "Please select someone to send the message to.",
        variant: "destructive",
      });
      return;
    }

    if (!messageText.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }

    if (messageText.length > DEFAULT_GAME_CONFIG.maxMessageLength) {
      toast({
        title: "Message Too Long",
        description: `Messages cannot exceed ${DEFAULT_GAME_CONFIG.maxMessageLength} characters.`,
        variant: "destructive",
      });
      return;
    }

    if (remainingMessages <= 0) {
      toast({
        title: "Message Limit Reached",
        description: `You can only send ${DEFAULT_GAME_CONFIG.maxPrivateMessagesPerRound} messages per round.`,
        variant: "destructive",
      });
      return;
    }

    const message: PrivateMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      fromId: currentPlayer.id,
      toId: selectedRecipient,
      content: messageText.trim(),
      timestamp: Date.now(),
    };

    onSendMessage(message);
    setMessageText("");
    setSelectedRecipient("");

    toast({
      title: "Message Sent",
      description: "Your whisper has been delivered...",
    });
  };

  const getPlayerName = (playerId: string) => {
    return players.find((p) => p.id === playerId)?.fakeName || "Unknown";
  };

  const myMessages = messages.filter(
    (m) => m.fromId === currentPlayer.id || m.toId === currentPlayer.id
  );

  return (
    <div className="space-y-4">
      <Card className="mysterious-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Private Whispers</span>
            </div>
            <Badge variant={remainingMessages > 0 ? "default" : "destructive"}>
              {remainingMessages} remaining
            </Badge>
          </CardTitle>
          <CardDescription>
            Send secret messages to other players (max{" "}
            {DEFAULT_GAME_CONFIG.maxMessageLength} characters)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <Select
                value={selectedRecipient}
                onValueChange={setSelectedRecipient}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {otherPlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>{player.fakeName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex space-x-2">
              <Input
                placeholder="Type your secret message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                maxLength={DEFAULT_GAME_CONFIG.maxMessageLength}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button
                variant="mystical"
                onClick={handleSendMessage}
                disabled={remainingMessages <= 0}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            {messageText.length}/{DEFAULT_GAME_CONFIG.maxMessageLength}
          </div>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card className="mysterious-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Message History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm mt-2">Start whispering secrets...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {myMessages
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((message) => {
                  const isFromMe = message.fromId === currentPlayer.id;
                  const otherPersonName = isFromMe
                    ? getPlayerName(message.toId)
                    : getPlayerName(message.fromId);

                  return (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        isFromMe
                          ? "bg-primary/10 border border-primary/20 ml-8"
                          : "bg-secondary/10 border border-secondary/20 mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge
                          variant={isFromMe ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {isFromMe
                            ? `To ${otherPersonName}`
                            : `From ${otherPersonName}`}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm italic">"{message.content}"</p>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivateChat;
