import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/title";
import { Plus, Send } from "lucide-react";

interface NotificationsHeaderProps {
  onCompose: () => void;
  onBulkSend: () => void;
}

export function NotificationsHeader({ onCompose, onBulkSend }: NotificationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <Title>Notifications</Title>
        <p className="mt-1 text-sm text-muted-foreground">
          Send, track, and manage notification alerts and updates sent to customers.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onCompose} variant="outline" className="cursor-pointer shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Send Notification
        </Button>
        <Button onClick={onBulkSend} className="cursor-pointer shrink-0">
          <Send className="w-4 h-4 mr-2" />
          Bulk Send
        </Button>
      </div>
    </div>
  );
}
