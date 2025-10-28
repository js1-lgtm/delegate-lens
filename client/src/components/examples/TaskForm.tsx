import { useState } from 'react';
import TaskForm from '../TaskForm';
import { Button } from '@/components/ui/button';

export default function TaskFormExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>Open Task Form</Button>
      
      <TaskForm
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(task) => {
          console.log('Task submitted:', task);
          setOpen(false);
        }}
      />
    </div>
  );
}
