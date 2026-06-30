interface ErrorScreenProps {
  error: string | null;
  onRetry: () => void;
}

export default function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <div className="text-center">
      <p className="text-red-600">{error ?? "Something went wrong"}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Retry
      </button>
    </div>
  );
}
