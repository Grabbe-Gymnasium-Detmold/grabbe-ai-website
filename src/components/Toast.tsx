import React, { useState, useEffect } from 'react';

// Definiere Typen für Toasts
// src/components/Toast.tsx
export type ToastType = "success" | "info" | "warning" | "error"; // Stelle sicher, dass "error" enthalten ist

// Toast-Interface
interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

// Definiere den Typ für das CustomEvent
interface AddToastEvent extends CustomEvent {
  detail: Toast;  // Die Detaildaten des CustomEvent sind vom Typ Toast
}

// Der ToastContainer, der Toasts anzeigt
const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [removingToastId, setRemovingToastId] = useState<number | null>(null);

  // Funktion zum Hinzufügen eines Toasts
  const addToast = (message: string, type: ToastType, duration: number = 3) => {
    const id = new Date().getTime();
    const newToast = { id, message, type, duration };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Entferne Toast nach der angegebenen Dauer
    setTimeout(() => {
      setRemovingToastId(id); // Markiere den Toast zum Entfernen
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id)); // Entferne den Toast nach der Animation
      }, 500); // Warten, bis die Fade-Out-Animation abgeschlossen ist
    }, duration * 1000); // Dauer in Millisekunden
  };

  // Effekthook zum Hören von Toast-Events
  useEffect(() => {
    const handleAddToast = (event: AddToastEvent) => {
      const { message, type, duration } = event.detail;
      addToast(message, type, duration);
    };

    // Typen für den Event-Listener angeben
    window.addEventListener('add-toast', handleAddToast as EventListener);

    return () => {
      window.removeEventListener('add-toast', handleAddToast as EventListener);
    };
  }, []);

  // Funktion zum Schließen eines Toasts
  const closeToast = (id: number) => {
    setRemovingToastId(id); // Markiere den Toast zum Entfernen
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id)); // Entferne den Toast nach der Animation
    }, 500); // Warten, bis die Fade-Out-Animation abgeschlossen ist
  };

  return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        {toasts.map((toast) => (
            <div
                key={toast.id}
                className={`flex items-center p-4 mb-2 rounded-xl text-white shadow-lg transition-all duration-500 ease-out transform ${
                    toast.type === 'success'
                        ? 'bg-green-500'
                        : toast.type === 'warning'
                            ? 'bg-yellow-500'
                            : toast.type === 'danger'
                                ? 'bg-red-500'
                                : 'bg-blue-500' // info
                } ${removingToastId === toast.id ? 'animate-fade-out' : 'animate-fly-up'}`}
            >
              <span className="flex-grow">{toast.message}</span>
              <button
                  onClick={() => closeToast(toast.id)}
                  className="ml-4 text-white hover:text-gray-200 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
        ))}
      </div>
  );
};

// Exportiere eine Funktion zum Hinzufügen von Toasts
let toastId = 0;

const useToast = () => {
  const addToast = (message: string, type: ToastType = 'info', duration: number = 3) => {
    toastId += 1;
    const toast = { id: toastId, message, type, duration };
    // Sende ein Custom Event an die Window-Instanz
    window.dispatchEvent(new CustomEvent('add-toast', { detail: toast }));
  };

  return { addToast };
};

export { ToastContainer, useToast };
