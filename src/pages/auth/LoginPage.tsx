import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const loginSchema = z.object({
    identifier: z.string().min(1, 'Email or Phone is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response = await authService.login(data.identifier, data.password);
            login(response.data.tokens.accessToken, response.data.tokens.refreshToken, response.data.user);
            navigate('/dashboard');
        } catch (error: any) {
            console.error(error);
            setError('root', {
                message: error.response?.data?.message || 'Invalid credentials'
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-primary-100 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-secondary-100 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 z-10 relative">
                <div className="flex flex-col items-center mb-8">
                    <Logo className="mb-4" />
                    <p className="text-slate-500 text-sm">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email or Phone</label>
                        <input
                            {...register('identifier')}
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all placeholder:text-slate-400"
                            placeholder="Enter your identifier"
                            autoComplete="username"
                        />
                        {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                {...register('password')}
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all placeholder:text-slate-400 pr-10"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        <div className="flex justify-end mt-1">
                            <a href="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">Forgot password?</a>
                        </div>
                    </div>

                    {errors.root && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                            {errors.root.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-slate-400">
                    &copy; 2026 TangaCare System. All rights reserved.
                </div>
            </div>
        </div>
    );
}
