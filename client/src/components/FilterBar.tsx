import { Button } from "@/components/ui/button";
import type { TaskAssignee, TaskStatus } from "@shared/schema";

interface FilterBarProps {
  selectedAssignee: TaskAssignee | "All";
  selectedStatus: TaskStatus | "All";
  onAssigneeChange: (assignee: TaskAssignee | "All") => void;
  onStatusChange: (status: TaskStatus | "All") => void;
}

export default function FilterBar({
  selectedAssignee,
  selectedStatus,
  onAssigneeChange,
  onStatusChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-2 flex items-center">
          Assignee:
        </span>
        <Button
          size="sm"
          variant={selectedAssignee === "All" ? "default" : "outline"}
          onClick={() => onAssigneeChange("All")}
          data-testid="button-filter-all-assignees"
        >
          All
        </Button>
        <Button
          size="sm"
          variant={selectedAssignee === "Executive" ? "default" : "outline"}
          onClick={() => onAssigneeChange("Executive")}
          data-testid="button-filter-executive"
        >
          Executive
        </Button>
        <Button
          size="sm"
          variant={selectedAssignee === "Assistant" ? "default" : "outline"}
          onClick={() => onAssigneeChange("Assistant")}
          data-testid="button-filter-assistant"
        >
          Assistant
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-2 flex items-center">
          Status:
        </span>
        <Button
          size="sm"
          variant={selectedStatus === "All" ? "default" : "outline"}
          onClick={() => onStatusChange("All")}
          data-testid="button-filter-all-statuses"
        >
          All
        </Button>
        <Button
          size="sm"
          variant={selectedStatus === "In Progress" ? "default" : "outline"}
          onClick={() => onStatusChange("In Progress")}
          data-testid="button-filter-in-progress"
        >
          In Progress
        </Button>
        <Button
          size="sm"
          variant={selectedStatus === "Done" ? "default" : "outline"}
          onClick={() => onStatusChange("Done")}
          data-testid="button-filter-done"
        >
          Done
        </Button>
        <Button
          size="sm"
          variant={selectedStatus === "Blocked" ? "default" : "outline"}
          onClick={() => onStatusChange("Blocked")}
          data-testid="button-filter-blocked"
        >
          Blocked
        </Button>
      </div>
    </div>
  );
}
