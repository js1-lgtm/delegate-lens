import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import type { Task } from "@shared/schema";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  "In Progress": {
    icon: Clock,
    variant: "secondary" as const,
  },
  "Done": {
    icon: CheckCircle2,
    variant: "outline" as const,
  },
  "Blocked": {
    icon: AlertCircle,
    variant: "destructive" as const,
  },
};

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const StatusIcon = statusConfig[task.status].icon;
  
  return (
    <Card className="p-6 hover-elevate transition-shadow duration-200" data-testid={`card-task-${task.id}`}>
      <div className="flex flex-col gap-4">
        <div className="flex-1">
          <h3 className="text-base font-medium text-foreground mb-3" data-testid={`text-task-title-${task.id}`}>
            {task.title}
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className="text-xs font-medium"
              data-testid={`badge-assignee-${task.id}`}
            >
              {task.assignee}
            </Badge>
            
            <Badge 
              variant={statusConfig[task.status].variant}
              className="text-xs font-medium"
              data-testid={`badge-status-${task.id}`}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {task.status}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(task)}
            data-testid={`button-edit-${task.id}`}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(task.id)}
            data-testid={`button-delete-${task.id}`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
