// "use client";

// import { useState, type ChangeEvent, type FormEvent } from "react";
// import {
//     User,
//     Lock,
//     Eye,
//     EyeOff,
//     GraduationCap,
//     BookOpen,
//     Users,
//     Trophy,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "@/store/authStore";

// interface StudentData {
//     id: number;
//     username: string;
//     firstName: string;
//     middleName: string | null;
//     lastName: string;
//     studentEmail: string | null;
//     studentMobile: string | null;
//     parentMobile: string | null;
//     parentEmail: string | null;
//     standard: number | null;
//     batch: string | null;
//     schoolYear: string | null;
//     address: string | null;
//     status: string;
//     role: string;
//     createdAt: string;
// }

// interface LoginResponse {
//     success: boolean;
//     student: StudentData;
//     token: string;
//     message?: string;
//     detail?: string;
// }

// interface FormData {
//     username: string;
//     password: string;
// }

// interface FormErrors {
//     username?: string;
//     password?: string;
// }

// export default function StudentLoginPage() {
//     const [formData, setFormData] = useState<FormData>({
//         username: "",
//         password: "",
//     });

//     const [errors, setErrors] = useState<FormErrors>({});
//     const [showPassword, setShowPassword] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const router = useRouter();
//     const login = useAuthStore((s) => s.login);

//     const validateForm = (): boolean => {
//         const newErrors: FormErrors = {};

//         if (!formData.username.trim()) {
//             newErrors.username = "Username is required";
//         }

//         if (!formData.password) {
//             newErrors.password = "Password is required";
//         } else if (formData.password.length < 4) {
//             newErrors.password = "Password must be at least 4 characters";
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//         e.preventDefault();

//         if (!validateForm()) return;

//         setLoading(true);
//         try {
//             // ✅ CORRECT ENDPOINT - matches your backend route
//             const res = await fetch("/api/students/login", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Accept: "application/json",
//                 },
//                 body: JSON.stringify({
//                     username: formData.username,
//                     password: formData.password,
//                 }),
//             });

//             const data: LoginResponse = await res.json();

//             if (!res.ok) {
//                 // Handle different error scenarios
//                 if (res.status === 401) {
//                     toast.error(data.message || "Invalid username or password");
//                 } else if (res.status === 403) {
//                     toast.error(data.message || "Account is not active");
//                 } else if (res.status === 500) {
//                     toast.error(data.message || "Server error. Please try again later.");
//                 } else {
//                     toast.error(data.message || "Login failed. Please try again.");
//                 }
//                 return;
//             }

//             // Check if login was successful
//             if (!data.success) {
//                 toast.error(data.message || "Login failed");
//                 return;
//             }

//             // Validate student data
//             if (!data.student || !data.token) {
//                 console.error("Missing student data or token:", data);
//                 toast.error("Invalid server response");
//                 return;
//             }

//             // Store auth state
//             login({
//                 token: data.token,
//                 role: data.student.role || "STUDENT",
//                 name: `${data.student.firstName} ${data.student.lastName}`,
//                 email: data.student.studentEmail || data.student.parentEmail || `${data.student.username}@student.local`,
//                 id: data.student.id.toString(),
//             });

//             // Store additional data in localStorage
//             localStorage.setItem("studentId", data.student.id.toString());
//             localStorage.setItem("studentName", `${data.student.firstName} ${data.student.lastName}`);
//             localStorage.setItem("studentData", JSON.stringify(data.student));
//             localStorage.setItem("token", data.token);
            
//             // Store in sessionStorage for quick checks
//             sessionStorage.setItem("isStudentLoggedIn", "true");

//             toast.success(`Welcome back, ${data.student.firstName}!`);
            
//             // Small delay for toast to show before navigation
//             setTimeout(() => {
//                 router.push("/student/");
//             }, 500);
            
//         } catch (error) {
//             console.error("Login error:", error);
//             toast.error("Network error. Please check your connection.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//         // Clear error when user starts typing
//         if (errors[name as keyof FormErrors]) {
//             setErrors((prev) => ({ ...prev, [name]: "" }));
//         }
//     };

//     const features = [
//         {
//             icon: <BookOpen className="w-5 h-5" />,
//             text: "Access Learning Materials",
//         },
//         {
//             icon: <Users className="w-5 h-5" />,
//             text: "Track Your Progress",
//         },
//         {
//             icon: <Trophy className="w-5 h-5" />,
//             text: "Earn Achievements",
//         },
//     ];

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-gray-800 transition-colors duration-300">
//             {/* Animated Background Elements */}
//             <div className="fixed inset-0 overflow-hidden pointer-events-none">
//                 <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
//                 <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
//                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
//             </div>

//             {/* Main Content */}
//             <main className="relative flex items-start sm:items-center justify-center px-4 pt-16 pb-12 sm:px-6 lg:px-8 sm:pt-12 sm:pb-12 min-h-screen">
//                 <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
//                     {/* Left Side - Branding */}
//                     <div className="hidden lg:block">
//                         <div className="space-y-8">
//                             {/* Logo/Icon */}
//                             <div className="inline-flex items-center gap-3">
//                                 <div className="p-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600">
//                                     <GraduationCap className="w-8 h-8 text-white" />
//                                 </div>
//                                 <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
//                                     Student Portal
//                                 </span>
//                             </div>

//                             <div>
//                                 <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
//                                     Welcome Back,{" "}
//                                     <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
//                                         Learner
//                                     </span>
//                                 </h1>
//                                 <p className="text-lg text-gray-600 leading-relaxed">
//                                     Sign in to continue your learning journey and access your courses.
//                                 </p>
//                             </div>

//                             {/* Features */}
//                             <div className="space-y-4">
//                                 {features.map((feature, index) => (
//                                     <div
//                                         key={index}
//                                         className="flex items-center gap-3 text-gray-600"
//                                     >
//                                         <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-teal-500/10 text-green-600">
//                                             {feature.icon}
//                                         </div>
//                                         <span className="font-medium">
//                                             {feature.text}
//                                         </span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Right Side - Form */}
//                     <div className="w-full max-w-md mx-auto lg:mx-0">
//                         <div className="text-center mb-8">
//                             <h2 className="text-3xl font-bold mb-2">
//                                 Student{" "}
//                                 <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
//                                     Sign In
//                                 </span>
//                             </h2>
//                             <p className="text-gray-600">
//                                 Enter your username and password
//                             </p>
//                         </div>

//                         {/* Form Card */}
//                         <div className="relative">
//                             <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl blur opacity-20" />
//                             <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 shadow-xl">
//                                 <form onSubmit={handleSubmit} className="space-y-6">
//                                     {/* Username Field */}
//                                     <div>
//                                         <label className="block text-sm font-medium mb-2 text-gray-700">
//                                             Username
//                                         </label>
//                                         <div className="relative group">
//                                             <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
//                                             <input
//                                                 type="text"
//                                                 name="username"
//                                                 value={formData.username}
//                                                 onChange={handleChange}
//                                                 className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
//                                                     errors.username
//                                                         ? "border-red-500"
//                                                         : "border-gray-200 focus:border-green-500"
//                                                 } rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-gray-800 placeholder:text-gray-400`}
//                                                 placeholder="Enter your username"
//                                                 autoComplete="username"
//                                             />
//                                         </div>
//                                         {errors.username && (
//                                             <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                                                 <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
//                                                 {errors.username}
//                                             </p>
//                                         )}
//                                     </div>

//                                     {/* Password Field */}
//                                     <div>
//                                         <div className="flex items-center justify-between mb-2">
//                                             <label className="block text-sm font-medium text-gray-700">
//                                                 Password
//                                             </label>
//                                             <a
//                                                 href="/forgot-password"
//                                                 className="text-sm font-medium text-green-600 hover:text-green-500 transition"
//                                             >
//                                                 Forgot Password?
//                                             </a>
//                                         </div>
//                                         <div className="relative group">
//                                             <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
//                                             <input
//                                                 type={showPassword ? "text" : "password"}
//                                                 name="password"
//                                                 value={formData.password}
//                                                 onChange={handleChange}
//                                                 className={`w-full pl-10 pr-12 py-3 bg-gray-50 border ${
//                                                     errors.password
//                                                         ? "border-red-500"
//                                                         : "border-gray-200 focus:border-green-500"
//                                                 } rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-gray-800 placeholder:text-gray-400`}
//                                                 placeholder="••••••••"
//                                                 autoComplete="current-password"
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={() => setShowPassword(!showPassword)}
//                                                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
//                                                 aria-label={showPassword ? "Hide password" : "Show password"}
//                                             >
//                                                 {showPassword ? (
//                                                     <EyeOff className="w-5 h-5" />
//                                                 ) : (
//                                                     <Eye className="w-5 h-5" />
//                                                 )}
//                                             </button>
//                                         </div>
//                                         {errors.password && (
//                                             <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                                                 <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
//                                                 {errors.password}
//                                             </p>
//                                         )}
//                                     </div>

//                                     {/* Submit Button */}
//                                     <button
//                                         type="submit"
//                                         disabled={loading}
//                                         className={`group w-full py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
//                                             loading
//                                                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                                                 : "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
//                                         }`}
//                                     >
//                                         <span className="flex items-center justify-center gap-2">
//                                             {loading ? (
//                                                 <>
//                                                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                                                     Signing In...
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     Sign In
//                                                     <BookOpen className="w-5 h-5 group-hover:animate-pulse" />
//                                                 </>
//                                             )}
//                                         </span>
//                                     </button>

//                                     {/* Register Link */}
//                                     <div className="text-center pt-2">
//                                         <p className="text-gray-600">
//                                             Don&apos;t have an account?{" "}
//                                             <a
//                                                 href="/student-register"
//                                                 className="font-semibold text-green-600 hover:text-green-500 transition"
//                                             >
//                                                 Register Now
//                                             </a>
//                                         </p>
//                                     </div>
//                                 </form>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
    User,
    Lock,
    Eye,
    EyeOff,
    GraduationCap,
    BookOpen,
    Users,
    Trophy,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface StudentData {
    id: number;
    username: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    studentEmail: string | null;
    studentMobile: string | null;
    parentMobile: string | null;
    parentEmail: string | null;
    standard: number | null;
    batch: string | null;
    schoolYear: string | null;
    address: string | null;
    status: string;
    role: string;
    createdAt: string;
}

interface LoginResponse {
    success: boolean;
    student: StudentData;
    token: string;
    message?: string;
    detail?: string;
}

interface FormData {
    username: string;
    password: string;
}

interface FormErrors {
    username?: string;
    password?: string;
}

// Helper function to set cookie for middleware authentication
function setCookie(name: string, value: string, days = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Helper function to delete cookie
function deleteCookie(name: string) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export default function StudentLoginPage() {
    const [formData, setFormData] = useState<FormData>({
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const login = useAuthStore((s) => s.login);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 4) {
            newErrors.password = "Password must be at least 4 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/students/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
            });

            const data: LoginResponse = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error(data.message || "Invalid username or password");
                } else if (res.status === 403) {
                    toast.error(data.message || "Account is not active");
                } else if (res.status === 500) {
                    toast.error(data.message || "Server error. Please try again later.");
                } else {
                    toast.error(data.message || "Login failed. Please try again.");
                }
                return;
            }

            if (!data.success) {
                toast.error(data.message || "Login failed");
                return;
            }

            if (!data.student || !data.token) {
                console.error("Missing student data or token:", data);
                toast.error("Invalid server response");
                return;
            }

            // Store auth state in Zustand store
            login({
                token: data.token,
                role: data.student.role || "STUDENT",
                name: `${data.student.firstName} ${data.student.lastName}`,
                email: data.student.studentEmail || data.student.parentEmail || `${data.student.username}@student.local`,
                id: data.student.id.toString(),
            });

            // IMPORTANT: Set cookie for middleware authentication
            setCookie("token", data.token);

            // Store additional data in localStorage
            localStorage.setItem("studentId", data.student.id.toString());
            localStorage.setItem("studentName", `${data.student.firstName} ${data.student.lastName}`);
            localStorage.setItem("studentData", JSON.stringify(data.student));
            localStorage.setItem("token", data.token);
            
            // Store in sessionStorage for quick checks
            sessionStorage.setItem("isStudentLoggedIn", "true");

            toast.success(`Welcome back, ${data.student.firstName}!`);
            
            // Small delay for toast to show before navigation
            setTimeout(() => {
                router.push("/student/");
            }, 500);
            
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const features = [
        {
            icon: <BookOpen className="w-5 h-5" />,
            text: "Access Learning Materials",
        },
        {
            icon: <Users className="w-5 h-5" />,
            text: "Track Your Progress",
        },
        {
            icon: <Trophy className="w-5 h-5" />,
            text: "Earn Achievements",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-gray-800 transition-colors duration-300">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
            </div>

            {/* Main Content */}
            <main className="relative flex items-start sm:items-center justify-center px-4 pt-16 pb-12 sm:px-6 lg:px-8 sm:pt-12 sm:pb-12 min-h-screen">
                <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Branding */}
                    <div className="hidden lg:block">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                                    Student Portal
                                </span>
                            </div>

                            <div>
                                <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
                                    Welcome Back,{" "}
                                    <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                                        Learner
                                    </span>
                                </h1>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Sign in to continue your learning journey and access your courses.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 text-gray-600"
                                    >
                                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-teal-500/10 text-green-600">
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
                                Student{" "}
                                <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                                    Sign In
                                </span>
                            </h2>
                            <p className="text-gray-600">
                                Enter your username and password
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl blur opacity-20" />
                            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 shadow-xl">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700">
                                            Username
                                        </label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                                                    errors.username
                                                        ? "border-red-500"
                                                        : "border-gray-200 focus:border-green-500"
                                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-gray-800 placeholder:text-gray-400`}
                                                placeholder="Enter your username"
                                                autoComplete="username"
                                            />
                                        </div>
                                        {errors.username && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                                {errors.username}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Password
                                            </label>
                                            <a
                                                href="/forgot-password"
                                                className="text-sm font-medium text-green-600 hover:text-green-500 transition"
                                            >
                                                Forgot Password?
                                            </a>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-12 py-3 bg-gray-50 border ${
                                                    errors.password
                                                        ? "border-red-500"
                                                        : "border-gray-200 focus:border-green-500"
                                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-gray-800 placeholder:text-gray-400`}
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
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

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`group w-full py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
                                            loading
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
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
                                                    <BookOpen className="w-5 h-5 group-hover:animate-pulse" />
                                                </>
                                            )}
                                        </span>
                                    </button>

                                    <div className="text-center pt-2">
                                        <p className="text-gray-600">
                                            Don&apos;t have an account?{" "}
                                            <a
                                                href="/student-register"
                                                className="font-semibold text-green-600 hover:text-green-500 transition"
                                            >
                                                Register Now
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