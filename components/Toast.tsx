interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  return (
    <div
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-toast"
      role="status"
      aria-live="polite"
    >
      <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded font-bold text-sm shadow-lg">
        {message}
      </div>
    </div>
  );
}
