import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { subscribeToToasts } from '../utils/toast.js';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const styles = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => subscribeToToasts((item) => {
    setToasts((previous) => [...previous, item]);
    setTimeout(() => setToasts((previous) => previous.filter((toastItem) => toastItem.id !== item.id)), 4000);
  }), []);

  if (!toasts.length) return null;

  return <div className="fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
    {toasts.map((item) => <div key={item.id} className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg animate-slide-up ${styles[item.type] || styles.info}`}>
      {icons[item.type] || icons.info}
      <p className="flex-1 text-sm font-medium">{item.message}</p>
      <button onClick={() => setToasts((previous) => previous.filter((toastItem) => toastItem.id !== item.id))} className="opacity-60 hover:opacity-100" aria-label="Dismiss notification"><X className="h-4 w-4" /></button>
    </div>)}
  </div>;
}
