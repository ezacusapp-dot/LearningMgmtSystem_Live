"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Gamepad2,
    Zap,
    Trophy,
    Target,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function SignInPage() {
    type FormData = {
        email: string;
        password: string;
    };

    type FormErrors = Partial<Record<keyof FormData, string>>;

    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const login = useAuthStore((s) => s.login);

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
console.log(process.env.NEXT_PUBLIC_API_URL);
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                },
            );

            const data = await res.json();

            if (res.ok) {
                login({
                    token: data.token,
                    role: data.role,
                   name: data.name,
                   email: data.email
                });

                toast.success(data.message || "Login successful!");

                router.push("/admin/dashboard");
            } else {
                toast.error(data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name as keyof FormData;
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const features = [
        {
            icon: <Trophy className="w-5 h-5" />,
            text: "500+ Active Venues",
        },
        {
            icon: <Zap className="w-5 h-5" />,
            text: "50K+ Monthly Bookings",
        },
        {
            icon: <Target className="w-5 h-5" />,
            text: "100K+ Happy Gamers",
        },
    ];

    return (
        <div className="min-h-screen bg-[var(--surface-primary)] text-[var(--text-primary)] transition-colors duration-300">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="gaming-grid absolute inset-0" />
            </div>

            {/* Main Content */}
            <main className="relative flex items-start sm:items-center justify-center px-4 pt-16 pb-12 sm:px-6 lg:px-8 sm:pt-12 sm:pb-12 min-h-screen">
                <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Branding */}
                    <div className="hidden lg:block">
                        <div className="space-y-8">
                            {/* Logo/Icon */}
                            <div className="inline-flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                                    <Gamepad2 className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-2xl font-bold gradient-text">
                                    LMS
                                </span>
                            </div>

                            <div>
                                <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
                                    Welcome Back to{" "}
                                    <span className="gradient-text">
                                        Learning Management System
                                    </span>
                                </h1>
                                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                                    Sign in to manage with our powerful platform.
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="space-y-4">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 text-[var(--text-secondary)]"
                                    >
                                        <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500/10 to-pink-500/10 text-indigo-500">
                                            {feature.icon}
                                        </div>
                                        <span className="font-medium">
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="w-full max-w-md mx-auto lg:mx-0">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold mb-2">
                                Sign In to Your{" "}
                                <span className="gradient-text">Account</span>
                            </h2>
                            <p className="text-[var(--text-secondary)]">
                                Enter your credentials to access your dashboard
                            </p>
                        </div>

                        {/* Form Card */}
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-20" />
                            <div className="relative glass p-8 rounded-2xl border border-[var(--border-primary)]">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    {/* Email Field */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-3 bg-[var(--surface-secondary)] border ${
                                                    errors.email
                                                        ? "border-red-500"
                                                        : "border-[var(--border-primary)] focus:border-indigo-500"
                                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)]`}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-[var(--text-primary)]">
                                                Password
                                            </label>
                                            <a
                                                href="/forgot-password"
                                                className="text-sm font-medium bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent hover:from-indigo-400 hover:to-pink-400 transition-all"
                                            >
                                                Forgot Password?
                                            </a>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-12 py-3 bg-[var(--surface-secondary)] border ${
                                                    errors.password
                                                        ? "border-red-500"
                                                        : "border-[var(--border-primary)] focus:border-indigo-500"
                                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)]`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-indigo-500 transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`group w-full py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
                                            loading
                                                ? "bg-[var(--surface-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
                                                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]"
                                        }`}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Signing In...
                                                </>
                                            ) : (
                                                <>
                                                    Sign In
                                                    <Zap className="w-5 h-5 group-hover:animate-pulse" />
                                                </>
                                            )}
                                        </span>
                                    </button>
                                    {/* Register Link */}
                                    <div className="text-center pt-2">
                                        <p className="text-[var(--text-secondary)]">
                                            Don&apos;t have an account?{" "}
                                            <a
                                                href="/signup"
                                                className="font-semibold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent hover:from-indigo-400 hover:to-pink-400 transition-all"
                                            >
                                                Create Account
                                            </a>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}