import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateTask: () => void;
}

export default function EmptyState({ onCreateTask }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center" data-testid="empty-state">
      <div className="rounded-full bg-muted p-6 mb-6">
        <ClipboardList className="w-12 h-12 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-2">
        No tasks yet
      </h3>
      
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Get started by creating your first task to track delegation between executive and assistant.
      </p>
      
      <Button onClick={onCreateTask} data-testid="button-create-first-task">
        Create Your First Task
      </Button>
    </div>
  );
}
