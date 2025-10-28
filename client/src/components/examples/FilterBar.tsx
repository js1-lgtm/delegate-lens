import { useState } from 'react';
import FilterBar from '../FilterBar';
import type { TaskAssignee, TaskStatus } from '@shared/schema';

export default function FilterBarExample() {
  const [selectedAssignee, setSelectedAssignee] = useState<TaskAssignee | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "All">("All");

  return (
    <div className="p-6">
      <FilterBar
        selectedAssignee={selectedAssignee}
        selectedStatus={selectedStatus}
        onAssigneeChange={(assignee) => {
          console.log('Assignee filter:', assignee);
          setSelectedAssignee(assignee);
        }}
        onStatusChange={(status) => {
          console.log('Status filter:', status);
          setSelectedStatus(status);
        }}
      />
      
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm">
          <strong>Selected Filters:</strong> {selectedAssignee} / {selectedStatus}
        </p>
      </div>
    </div>
  );
}
