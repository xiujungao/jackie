'use client';
 
import { useEffect } from 'react';
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);
 
  const message = error?.message ?? String(error);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">{message}</h2>
      {error?.digest && (
        <p className="mt-2 text-sm text-gray-500">
          Error ID: {error.digest}
        </p>
      )}
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={
          // Attempt to recover by trying to re-render the invoices route
          () => reset()
        }
      >
        Try again
      </button>
    </main>
  );
}