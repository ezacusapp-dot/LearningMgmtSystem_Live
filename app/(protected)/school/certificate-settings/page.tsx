// "use client";

// import { useState, useRef } from "react";

// export default function CertificateCustomization() {
//   const [logoPreview, setLogoPreview] = useState(null);
//   const [signaturePreview, setSignaturePreview] = useState(null);
//   const [sealPreview, setSealPreview] = useState(null);

//   const logoRef = useRef();
//   const signatureRef = useRef();
//   const sealRef = useRef();

//   const [form, setForm] = useState({
//     schoolName: "Lincoln High School",
//     schoolAddress: "Sector 10, Dwarka, New Delhi - 110075",
//     contactNumber: "+91-11-2345-6789",
//     emailAddress: "info@dpsdwarka.edu.in",
//     website: "www.dpsdwarka.edu.in",
//     authorizedBy: "CBSE Board",
//     affiliationNumber: "CBSE/AFF/2100123",
//     officialPersonName: "Dr. Rajesh Kumar",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleFileChange = (e, previewSetter) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => previewSetter(reader.result);
//       reader.readAsDataURL(file);
//     }
//   };

//   const UploadBox = ({ label, hint, inputRef, preview, onChange, required }) => (
//     <div className="space-y-2">
//       <label className="block text-sm font-semibold text-gray-200">
//         {label} {required && <span className="text-pink-400">*</span>}
//       </label>
//       <div
//         onClick={() => inputRef.current.click()}
//         className="cursor-pointer border-2 border-dashed border-purple-700 hover:border-purple-400 bg-[#161b27] hover:bg-[#1f1540] transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-2 min-h-[90px] group"
//       >
//         {preview ? (
//           <img src={preview} alt="preview" className="max-h-16 object-contain rounded" />
//         ) : (
//           <>
//             <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
//             </svg>
//             <span className="text-purple-300 text-sm font-medium">{label}</span>
//           </>
//         )}
//       </div>
//       <p className="text-xs text-gray-500">{hint}</p>
//       <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
//     </div>
//   );

//   const InputField = ({ label, name, required, icon, multiline }) => (
//     <div className="space-y-1.5">
//       <label className="block text-sm font-semibold text-gray-200">
//         {label} {required && <span className="text-pink-400">*</span>}
//       </label>
//       <div className="relative flex items-start">
//         {icon && <span className="absolute left-3 top-3 text-gray-500">{icon}</span>}
//         {multiline ? (
//           <textarea
//             name={name}
//             value={form[name]}
//             onChange={handleChange}
//             rows={3}
//             className={`w-full bg-[#161b27] border border-[#2e1f55] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none rounded-xl px-4 py-3 text-gray-100 text-sm resize-none transition-all ${icon ? "pl-9" : ""}`}
//           />
//         ) : (
//           <input
//             type="text"
//             name={name}
//             value={form[name]}
//             onChange={handleChange}
//             className={`w-full bg-[#161b27] border border-[#2e1f55] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none rounded-xl px-4 py-3 text-gray-100 text-sm transition-all ${icon ? "pl-9" : ""}`}
//           />
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#0f1117] text-white">
//       {/* Top Nav */}
//       <nav className="bg-[#161b27] border-b border-[#2a1a50] px-6 py-3 flex items-center justify-between sticky top-0 z-10">
//         <div className="flex items-center gap-3">
//           <button className="text-purple-400 hover:text-purple-300 transition">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
//             </svg>
//           </button>
//           <div>
//             <h1 className="font-bold text-white text-base leading-tight">Lincoln High School</h1>
//             <p className="text-xs text-white-300">School Admin Dashboard</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-3 cursor-pointer">
//           <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
//             PM
//           </div>
//           <div className="hidden sm:block">
//             <p className="text-sm font-semibold leading-tight">Priya Mehta</p>
//             <p className="text-xs text-white-300">School Admin</p>
//           </div>
//           <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//           </svg>
//         </div>
//       </nav>

//       <div className="max-w-6xl mx-auto px-5 py-8 space-y-7">
//         {/* Page Header */}
//         <div className="flex items-center gap-4">
//           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
//             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7 7h10M7 12h4m-4 5h10" />
//             </svg>
//           </div>
//           <div>
//             <h2 className="text-2xl font-bold tracking-tight">Certificate Customization</h2>
//             <p className="text-sm text-gray-400 mt-0.5">Configure school-specific information for certificates</p>
//           </div>
//         </div>

//         {/* Info Banner */}
//         <div className="bg-[#161b27] border border-[#161b27] rounded-2xl p-5">
//           <div className="flex gap-4">
//             <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/40 flex items-center justify-center flex-shrink-0 mt-0.5">
//               <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
//               </svg>
//             </div>
//             <div className="flex-1">
//               <h3 className="font-bold text-white mb-1">How Certificate Customization Works</h3>
//               <p className="text-sm text-gray-400 leading-relaxed">
//                 Super Admin creates the base certificate template with design, colors, and grade thresholds. You customize it with your school&apos;s branding, logo, and official signatures. When certificates are issued, both are merged automatically.
//               </p>
//               <div className="mt-4 grid grid-cols-3 gap-3">
//                 {[
//                   { title: "Super Admin", sub: "Base template design" },
//                   { title: "Your Customization", sub: "School branding" },
//                   { title: "Final Certificate", sub: "Auto-merged result", active: true },
//                 ].map((item) => (
//                   <div key={item.title} className={`rounded-xl px-4 py-3 ${item.active ? "bg-[#161b27] border border-purple-700/50" : "bg-[#161b27]"}`}>
//                     <p className="text-xs font-bold text-white">{item.title}</p>
//                     <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Two-Column Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* LEFT: School Information */}
//           <div className="bg-[#161b27] border border-[#2a1a50] rounded-2xl p-6 space-y-5">
//             <div className="flex items-center gap-2">
//               <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7a2 2 0 012-2h4V3h6v2h4a2 2 0 012 2v14M9 21v-6h6v6" />
//               </svg>
//               <h3 className="text-lg font-bold">School Information</h3>
//             </div>

//             <UploadBox
//               label="Upload Logo"
//               required
//               hint="Recommended: 500x500px, PNG with transparent background"
//               inputRef={logoRef}
//               preview={logoPreview}
//               onChange={(e) => handleFileChange(e, setLogoPreview)}
//             />

//             <InputField label="School Name" name="schoolName" required />
//             <InputField label="School Address" name="schoolAddress" required multiline />

//             {/* Contact with phone icon */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-semibold text-gray-200">Contact Number</label>
//               <div className="relative">
//                 <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                 </svg>
//                 <input type="text" name="contactNumber" value={form.contactNumber} onChange={handleChange}
//                   className="w-full bg-[#161b27] border border-[#2e1f55] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none rounded-xl pl-9 pr-4 py-3 text-gray-100 text-sm transition-all" />
//               </div>
//             </div>

//             <InputField label="Email Address" name="emailAddress" />
//             <InputField label="Website" name="website" />
//             <InputField label="Authorized By" name="authorizedBy" />
//             <InputField label="Affiliation Number" name="affiliationNumber" />
//           </div>

//           {/* RIGHT: Signature + Seal + Preview */}
//           <div className="space-y-6">
//             {/* Official Signature */}
//             <div className="bg-[#161b27] border border-[#2a1a50] rounded-2xl p-6 space-y-5">
//               <div className="flex items-center gap-2">
//                 <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14.5H8v-2a2 2 0 01.586-1.414z" />
//                 </svg>
//                 <h3 className="text-lg font-bold">Official Signature</h3>
//               </div>

//               {/* Official Person Name */}
//               <div className="space-y-1.5">
//                 <label className="block text-sm font-semibold text-gray-200">
//                   Official Person Name <span className="text-pink-400">*</span>
//                 </label>
//                 <div className="relative">
//                   <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                   </svg>
//                   <input type="text" name="officialPersonName" value={form.officialPersonName} onChange={handleChange}
//                     className="w-full bg-[#161b27] border border-[#161b27] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none rounded-xl pl-9 pr-4 py-3 text-gray-100 text-sm transition-all" />
//                 </div>
//               </div>

//               <UploadBox
//                 label="Upload Signature"
//                 required
//                 hint="Recommended: Transparent PNG, signature in black ink"
//                 inputRef={signatureRef}
//                 preview={signaturePreview}
//                 onChange={(e) => handleFileChange(e, setSignaturePreview)}
//               />
//             </div>

//             {/* School Seal */}
//             <div className="bg-[#161b27] border border-[#161b27] rounded-2xl p-6 space-y-4">
//               <div className="flex items-center gap-2">
//                 <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                 </svg>
//                 <h3 className="text-lg font-bold">
//                   School Seal{" "}
//                   <span className="text-gray-500 text-sm font-normal">(Optional)</span>
//                 </h3>
//               </div>
//               <UploadBox
//                 label="Upload School Seal"
//                 hint="Recommended: Round seal, PNG with transparent background"
//                 inputRef={sealRef}
//                 preview={sealPreview}
//                 onChange={(e) => handleFileChange(e, setSealPreview)}
//               />
//             </div>

//             {/* Certificate Preview */}
//             <div className="bg-[#161b27] border border-[#161b27] rounded-2xl p-6 space-y-3">
//               <div className="flex items-center gap-2">
//                 <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                 </svg>
//                 <h3 className="text-lg font-bold">Certificate Preview</h3>
//               </div>
//               <p className="text-sm text-gray-400 leading-relaxed">
//                 Your customization will be applied to all certificate templates created by Super Admin. Preview will be available after saving.
//               </p>
//               <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2e1f55] hover:bg-[#1f1540] text-sm font-medium text-gray-200 transition-all">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                 </svg>
//                 Preview Certificate
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Action Bar */}
//         <div className="flex justify-center items-center gap-3 pb-8">
//           {/* <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1a1035] border border-[#2e1f55] hover:bg-[#1f1540] text-white font-semibold text-sm transition-all">
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14z" />
//             </svg>
//             School Admin
//           </button> */}
//           <button
//             onClick={() => alert("Settings saved!")}
//             className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3b6d11] border border-[#2e1f55] hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-900/40"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//             </svg>
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
  
//********************************************************************* */

// "use client";

// import { useState, useRef, RefObject, ChangeEvent } from "react";

// // Define types
// interface FormData {
//   schoolName: string;
//   schoolAddress: string;
//   contactNumber: string;
//   emailAddress: string;
//   website: string;
//   authorizedBy: string;
//   affiliationNumber: string;
//   officialPersonName: string;
// }

// interface UploadBoxProps {
//   label: string;
//   hint: string;
//   inputRef: RefObject<HTMLInputElement | null>;
//   preview: string | null;
//   onChange: (e: ChangeEvent<HTMLInputElement>) => void;
//   required?: boolean;
// }

// interface InputFieldProps {
//   label: string;
//   name: keyof FormData;
//   required?: boolean;
//   icon?: React.ReactNode;
//   multiline?: boolean;
// }

// export default function CertificateCustomization() {
//   const [logoPreview, setLogoPreview] = useState<string | null>(null);
//   const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
//   const [sealPreview, setSealPreview] = useState<string | null>(null);

//   const logoRef = useRef<HTMLInputElement>(null);
//   const signatureRef = useRef<HTMLInputElement>(null);
//   const sealRef = useRef<HTMLInputElement>(null);

//   const [form, setForm] = useState<FormData>({
//     schoolName: "Lincoln High School",
//     schoolAddress: "Sector 10, Dwarka, New Delhi - 110075",
//     contactNumber: "+91-11-2345-6789",
//     emailAddress: "info@dpsdwarka.edu.in",
//     website: "www.dpsdwarka.edu.in",
//     authorizedBy: "CBSE Board",
//     affiliationNumber: "CBSE/AFF/2100123",
//     officialPersonName: "Dr. Rajesh Kumar",
//   });

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>, previewSetter: (value: string | null) => void) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => previewSetter(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const UploadBox = ({ label, hint, inputRef, preview, onChange, required }: UploadBoxProps) => (
//     <div className="space-y-2">
//       <label className="block text-sm font-semibold text-gray-200">
//         {label} {required && <span className="text-pink-400">*</span>}
//       </label>
//       <div
//         onClick={() => inputRef.current?.click()}
//         className="cursor-pointer border-2 border-dashed border-purple-700 hover:border-purple-400 bg-[#161b27] hover:bg-[#1f1540] transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-2 min-h-[90px] group"
//       >
//         {preview ? (
//           <img src={preview} alt="preview" className="max-h-16 object-contain rounded" />
//         ) : (
//           <>
//             <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
//             </svg>
//             <span className="text-purple-300 text-sm font-medium">{label}</span>
//           </>
//         )}
//       </div>
//       <p className="text-xs text-gray-500">{hint}</p>
//       <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
//     </div>
//   );

//   const InputField = ({ label, name, required, icon, multiline }: InputFieldProps) => (
//     <div className="space-y-1.5">
//       <label className="block text-sm font-semibold text-gray-200">
//         {label} {required && <span className="text-pink-400">*</span>}
//       </label>
//       <div className="relative flex items-start">
//         {icon && <span className="absolute left-3 top-3 text-gray-500">{icon}</span>}
//         {multiline ? (
//           <textarea
//             name={name}
//             value={form[name]}
//             onChange={handleChange}
//             rows={3}
//             className={`w-full bg-[#161b27] border border-[#2e1f55] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none rounded-xl px-4 py-3 text-gray-100 text-sm resize-none transition-all ${icon ? "pl-9" : ""}`}
//           />
//         ) : (
//           <input
//             type="text"
//             name={name}
//             value={form[name]}
//             onChange={handleChange}
//             className={`w-full bg-[#161b27] border border-[#2e1f55] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none rounded-xl px-4 py-3 text-gray-100 text-sm transition-all ${icon ? "pl-9" : ""}`}
//           />
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#0f1117] text-white">
//       {/* Top Nav */}
//      <nav className="bg-[#161b27] border-b border-[#2a1a50] px-6 py-3 flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <button className="text-purple-400 hover:text-purple-300 transition">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
//             </svg>
//           </button>
//           <div>
//             <h1 className="font-bold text-white text-base leading-tight">Lincoln High School</h1>
//             <p className="text-xs text-white-300">School Admin Dashboard</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-3 cursor-pointer">
//           <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
//             PM
//           </div>
//           <div className="hidden sm:block">
//             <p className="text-sm font-semibold leading-tight">Priya Mehta</p>
//             <p className="text-xs text-white-300">School Admin</p>
//           </div>
//           <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//           </svg>
//         </div>
//       </nav>

//       <div className="max-w-6xl mx-auto px-5 py-8 space-y-7">

//         {/* Page Header */}
//         <div className="flex items-center gap-4">
//           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
//             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7 7h10M7 12h4m-4 5h10" />
//             </svg>
//           </div>
//           <div>
//             <h2 className="text-2xl font-bold tracking-tight">Certificate Customization</h2>
//             <p className="text-sm text-gray-400 mt-0.5">Configure school-specific information for certificates</p>
//           </div>
//         </div>

//         {/* Info Banner */}
//         <div className="bg-[#161b27] border border-[#161b27] rounded-2xl p-5">
//           <div className="flex gap-4">
//             <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/40 flex items-center justify-center flex-shrink-0 mt-0.5">
//               <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
//               </svg>
//             </div>
//             <div className="flex-1">
//               <h3 className="font-bold text-white mb-1">How Certificate Customization Works</h3>
//               <p className="text-sm text-gray-400 leading-relaxed">
//                 Super Admin creates the base certificate template with design, colors, and grade thresholds. You customize it with your school&apos;s branding, logo, and official signatures. When certificates are issued, both are merged automatically.
//               </p>
//               <div className="mt-4 grid grid-cols-3 gap-3">
//                 {[
//                   { title: "Super Admin", sub: "Base template design" },
//                   { title: "Your Customization", sub: "School branding" },
//                   { title: "Final Certificate", sub: "Auto-merged result", active: true },
//                 ].map((item) => (
//                   <div key={item.title} className={`rounded-xl px-4 py-3 ${item.active ? "bg-[#161b27] border border-purple-700/50" : "bg-[#161b27]"}`}>
//                     <p className="text-xs font-bold text-white">{item.title}</p>
//                     <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Two-Column Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* LEFT: School Information */}
//           <div className="bg-[#161b27] border border-[#2a1a50] rounded-2xl p-6 space-y-5">
//             <div className="flex items-center gap-2">
//               <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7a2 2 0 012-2h4V3h6v2h4a2 2 0 012 2v14M9 21v-6h6v6" />
//               </svg>
//               <h3 className="text-lg font-bold">School Information</h3>
//             </div>

//             <UploadBox
//               label="Upload Logo"
//               required
//               hint="Recommended: 500x500px, PNG with transparent background"
//               inputRef={logoRef}
//               preview={logoPreview}
//               onChange={(e) => handleFileChange(e, setLogoPreview)}
//             />

//             <InputField label="School Name" name="schoolName" required />
//             <InputField label="School Address" name="schoolAddress" required multiline />

//             {/* Contact with phone icon */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-semibold text-gray-200">Contact Number</label>
//               <div className="relative">
//                 <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                 </svg>
//                 <input type="text" name="contactNumber" value={form.contactNumber} onChange={handleChange}
//                   className="w-full bg-[#161b27] border border-[#2e1f55] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none rounded-xl pl-9 pr-4 py-3 text-gray-100 text-sm transition-all" />
//               </div>
//             </div>

//             <InputField label="Email Address" name="emailAddress" />
//             <InputField label="Website" name="website" />
//             <InputField label="Authorized By" name="authorizedBy" />
//             <InputField label="Affiliation Number" name="affiliationNumber" />
//           </div>

//           {/* RIGHT: Signature + Seal + Preview */}
//           <div className="space-y-6">
//             {/* Official Signature */}
//             <div className="bg-[#161b27] border border-[#2a1a50] rounded-2xl p-6 space-y-5">
//               <div className="flex items-center gap-2">
//                 <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14.5H8v-2a2 2 0 01.586-1.414z" />
//                 </svg>
//                 <h3 className="text-lg font-bold">Official Signature</h3>
//               </div>

//               {/* Official Person Name */}
//               <div className="space-y-1.5">
//                 <label className="block text-sm font-semibold text-gray-200">
//                   Official Person Name <span className="text-pink-400">*</span>
//                 </label>
//                 <div className="relative">
//                   <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                   </svg>
//                   <input type="text" name="officialPersonName" value={form.officialPersonName} onChange={handleChange}
//                     className="w-full bg-[#161b27] border border-[#161b27] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none rounded-xl pl-9 pr-4 py-3 text-gray-100 text-sm transition-all" />
//                 </div>
//               </div>

//               <UploadBox
//                 label="Upload Signature"
//                 required
//                 hint="Recommended: Transparent PNG, signature in black ink"
//                 inputRef={signatureRef}
//                 preview={signaturePreview}
//                 onChange={(e) => handleFileChange(e, setSignaturePreview)}
//               />
//             </div>

//             {/* School Seal */}
//             <div className="bg-[#161b27] border border-[#161b27] rounded-2xl p-6 space-y-4">
//               <div className="flex items-center gap-2">
//                 <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                 </svg>
//                 <h3 className="text-lg font-bold">
//                   School Seal{" "}
//                   <span className="text-gray-500 text-sm font-normal">(Optional)</span>
//                 </h3>
//               </div>
//               <UploadBox
//                 label="Upload School Seal"
//                 hint="Recommended: Round seal, PNG with transparent background"
//                 inputRef={sealRef}
//                 preview={sealPreview}
//                 onChange={(e) => handleFileChange(e, setSealPreview)}
//               />
//             </div>

//             {/* Certificate Preview */}
//             <div className="bg-[#161b27] border border-[#161b27] rounded-2xl p-6 space-y-3">
//               <div className="flex items-center gap-2">
//                 <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                 </svg>
//                 <h3 className="text-lg font-bold">Certificate Preview</h3>
//               </div>
//               <p className="text-sm text-gray-400 leading-relaxed">
//                 Your customization will be applied to all certificate templates created by Super Admin. Preview will be available after saving.
//               </p>
//               <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2e1f55] hover:bg-[#1f1540] text-sm font-medium text-gray-200 transition-all">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                 </svg>
//                 Preview Certificate
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Action Bar */}
//         <div className="flex justify-center items-center gap-3 pb-8">
//           <button
//             onClick={() => alert("Settings saved!")}
//             className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3b6d11] border border-[#2e1f55] hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-900/40"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//             </svg>
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

//********************************************************* */
"use client";

import { useState, useRef, RefObject, ChangeEvent } from "react";

// Define types
interface FormData {
  schoolName: string;
  schoolAddress: string;
  contactNumber: string;
  emailAddress: string;
  website: string;
  authorizedBy: string;
  affiliationNumber: string;
  officialPersonName: string;
}

interface UploadBoxProps {
  label: string;
  hint: string;
  inputRef: RefObject<HTMLInputElement | null>;
  preview: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

interface InputFieldProps {
  label: string;
  name: keyof FormData;
  required?: boolean;
  icon?: React.ReactNode;
  multiline?: boolean;
}

export default function CertificateCustomization() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [sealPreview, setSealPreview] = useState<string | null>(null);

  const logoRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLInputElement>(null);
  const sealRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    schoolName: "Lincoln High School",
    schoolAddress: "Sector 10, Dwarka, New Delhi - 110075",
    contactNumber: "+91-11-2345-6789",
    emailAddress: "info@dpsdwarka.edu.in",
    website: "www.dpsdwarka.edu.in",
    authorizedBy: "CBSE Board",
    affiliationNumber: "CBSE/AFF/2100123",
    officialPersonName: "Dr. Rajesh Kumar",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, previewSetter: (value: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => previewSetter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const UploadBox = ({ label, hint, inputRef, preview, onChange, required }: UploadBoxProps) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-200">
        {label} {required && <span className="text-pink-400">*</span>}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer border-2 border-dashed border-purple-700 hover:border-purple-400 bg-[#161b27] hover:bg-[#1f1540] transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-2 min-h-[90px] group"
      >
        {preview ? (
          <img src={preview} alt="preview" className="max-h-16 object-contain rounded" />
        ) : (
          <>
            <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
            </svg>
            <span className="text-purple-300 text-sm font-medium">{label}</span>
          </>
        )}
      </div>
      <p className="text-xs text-gray-500">{hint}</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </div>
  );

  const InputField = ({ label, name, required, icon, multiline }: InputFieldProps) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-200">
        {label} {required && <span className="text-pink-400">*</span>}
      </label>
      <div className="relative flex items-start">
        {icon && <span className="absolute left-3 top-3 text-gray-500">{icon}</span>}
        {multiline ? (
          <textarea
            name={name}
            value={form[name]}
            onChange={handleChange}
            rows={3}
            className={`w-full bg-[#161b27] border border-[#2e1f55] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none rounded-xl px-4 py-3 text-gray-100 text-sm resize-none transition-all ${icon ? "pl-9" : ""}`}
          />
        ) : (
          <input
            type="text"
            name={name}
            value={form[name]}
            onChange={handleChange}
            className={`w-full bg-[#161b27] border border-[#2e1f55] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none rounded-xl px-4 py-3 text-gray-100 text-sm transition-all ${icon ? "pl-9" : ""}`}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Top Nav */}
      <nav className="bg-[#161b27] border-b border-[#2a1a50] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="text-purple-400 hover:text-purple-300 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Lincoln High School</h1>
            <p className="text-xs text-gray-400">School Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
            PM
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight">Priya Mehta</p>
            <p className="text-xs text-gray-400">School Admin</p>
          </div>
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-5 py-8 space-y-7">

        {/* Page Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7 7h10M7 12h4m-4 5h10" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Certificate Customization</h2>
            <p className="text-sm text-gray-400 mt-0.5">Configure school-specific information for certificates</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-[#0f1117] border border-[#2a1a50] rounded-2xl p-5">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">How Certificate Customization Works</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Super Admin creates the base certificate template with design, colors, and grade thresholds. You customize it with your school&apos;s branding, logo, and official signatures. When certificates are issued, both are merged automatically.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { title: "Super Admin", sub: "Base template design" },
                  { title: "Your Customization", sub: "School branding" },
                  { title: "Final Certificate", sub: "Auto-merged result", active: true },
                ].map((item) => (
                  <div key={item.title} className={`rounded-xl px-4 py-3 ${item.active ? "bg-[#161b27] border border-purple-700/50" : "bg-[#0f1117]"}`}>
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: School Information */}
          <div className="bg-[#161b27] border border-[#2a1a50] rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7a2 2 0 012-2h4V3h6v2h4a2 2 0 012 2v14M9 21v-6h6v6" />
              </svg>
              <h3 className="text-lg font-bold">School Information</h3>
            </div>

            <UploadBox
              label="Upload Logo"
              required
              hint="Recommended: 500x500px, PNG with transparent background"
              inputRef={logoRef}
              preview={logoPreview}
              onChange={(e) => handleFileChange(e, setLogoPreview)}
            />

            <InputField label="School Name" name="schoolName" required />
            <InputField label="School Address" name="schoolAddress" required multiline />

            {/* Contact with phone icon */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-200">Contact Number</label>
              <div className="relative">
                <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <input 
                  type="text" 
                  name="contactNumber" 
                  value={form.contactNumber} 
                  onChange={handleChange}
                  className="w-full bg-[#161b27] border border-[#2e1f55] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none rounded-xl pl-9 pr-4 py-3 text-gray-100 text-sm transition-all" 
                />
              </div>
            </div>

            <InputField label="Email Address" name="emailAddress" />
            <InputField label="Website" name="website" />
            <InputField label="Authorized By" name="authorizedBy" />
            <InputField label="Affiliation Number" name="affiliationNumber" />
          </div>

          {/* RIGHT: Signature + Seal + Preview */}
          <div className="space-y-6">
            {/* Official Signature */}
            <div className="bg-[#161b27] border border-[#2a1a50] rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14.5H8v-2a2 2 0 01.586-1.414z" />
                </svg>
                <h3 className="text-lg font-bold">Official Signature</h3>
              </div>

              {/* Official Person Name */}
              <InputField label="Official Person Name" name="officialPersonName" required />

              <UploadBox
                label="Upload Signature"
                required
                hint="Recommended: Transparent PNG, signature in black ink"
                inputRef={signatureRef}
                preview={signaturePreview}
                onChange={(e) => handleFileChange(e, setSignaturePreview)}
              />
            </div>

            {/* School Seal */}
            <div className="bg-[#161b27] border border-[#2a1a50] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-lg font-bold">
                  School Seal{" "}
                  <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                </h3>
              </div>
              <UploadBox
                label="Upload School Seal"
                hint="Recommended: Round seal, PNG with transparent background"
                inputRef={sealRef}
                preview={sealPreview}
                onChange={(e) => handleFileChange(e, setSealPreview)}
              />
            </div>

            {/* Certificate Preview */}
            <div className="bg-[#161b27] border border-[#2a1a50] rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <h3 className="text-lg font-bold">Certificate Preview</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your customization will be applied to all certificate templates created by Super Admin. Preview will be available after saving.
              </p>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2e1f55] hover:bg-[#1f1540] text-sm font-medium text-gray-200 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Certificate
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex justify-center items-center gap-3 pb-8">
          <button
            onClick={() => alert("Settings saved!")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-900/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}