import { Loader } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="flex items-center space-x-4">
        <Loader className="animate-spin h-8 w-8 text-primary" />
        <span className="text-xl font-semibold">Signing in and fetching your emails...</span>
      </div>
      <p className="mt-4 text-muted-foreground">Please wait a moment.</p>
    </div>
  );
}
