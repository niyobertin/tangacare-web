import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
// Note: For a real production app, use Radix UI or Headless UI Dialog
// This is a custom lightweight implementation for initialization

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = 'md'
}: ModalProps) {

    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidthClass = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    }[maxWidth];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className={cn(
                "relative bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200",
                maxWidthClass
            )}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        {title && <h2 className="text-xl font-semibold text-slate-800">{title}</h2>}
                        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
