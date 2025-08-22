interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">{message}</span>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-24 h-8 bg-gray-200 rounded ml-4"></div>
      </div>
    </div>
  )
}
