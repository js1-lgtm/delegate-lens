import EmptyState from '../EmptyState';

export default function EmptyStateExample() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <EmptyState onCreateTask={() => console.log('Create task clicked')} />
    </div>
  );
}
