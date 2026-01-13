import logo from '@/assets/tanga-logo.png';
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    variant?: 'full' | 'icon';
}

export function Logo({ className, variant = 'full' }: LogoProps) {
    if (variant === 'icon') {
        return (
            <img
                src={logo}
                alt="TangaCare"
                className={cn("h-8 w-auto object-contain", className)}
            />
        );
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <img
                src={logo}
                alt="TangaCare Logo"
                className="h-10 w-auto object-contain"
            />
            <span className="font-bold text-xl text-slate-800">TangaCare</span>
        </div>
    );
}
