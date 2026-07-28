/**
 * Certificate Template Builder Component (self-contained, working version)
 * Visual designer for creating certificate templates with live preview.
 *
 * Certificate visual design matches the "Code Excellence Edutech" reference:
 *  - gradient (blue -> violet -> magenta) outer border, thin gold inner rule
 *  - org name + large decorative "CERTIFICATE" headline
 *  - magenta ribbon banner ("OF COMPLETION")
 *  - "This is to proudly certify that" + cursive student name + underline
 *  - body paragraph with an inline blank for the course name
 *  - gold rosette seal in the middle, two signature blocks left/right
 *  - logo top-right, QR code corner
 *
 * How the two dynamic pieces work:
 *  1. ADMIN SIDE (this builder): the admin picks the Course from the
 *     dropdown in the Settings tab. That selection drives which
 *     template/course the certificate belongs to (courseId / courseCode),
 *     and the course's title is live-substituted into the body paragraph
 *     wherever the `{courseName}` token appears (currently inside the
 *     `body-text` field's content).
 *  2. STUDENT SIDE (at issue-time, outside this builder): once a student
 *     completes a course, your backend calls the certificate-generation
 *     service with the template id, the student's name, the course name,
 *     the date and a generated certificate id. That service should swap
 *     the placeholder "content" values of the `student-name`, `date` and
 *     `certificate-id` fields, and resolve the `{courseName}` /
 *     `{orgName}` tokens inside `body-text`, with the real, dynamic
 *     values before rendering/rasterizing the final PDF/PNG. Everything
 *     else in this file (colors, fonts, positions) stays exactly as
 *     designed here.
 *
 * After saving, the builder switches to a "Certificate Templates" list view
 * showing every template saved in this session, with the option to start a
 * new one.
 *
 * Drop this file into your admin app. It has no external context dependency —
 * pass `courses` in as a prop (or swap in your own MasterDataContext hook
 * where indicated below).
 */

import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Upload,
  Eye,
  Save,
  X,
  Image as ImageIcon,
  Type,
  Palette,
  Layout,
  Settings,
  FileText,
  AlertCircle,
  CheckCircle,
  Layers,
  ZoomIn,
  ZoomOut,
  QrCode,
  Plus,
  Pencil,
  ListChecks,
} from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import { createPortal } from 'react-dom';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Course {
  id: string;
  title: string;
  isActive?: boolean;
}

export interface CertificateType {
  id?: string;
  name: string;
  courseId: string;
  courseCode?: string;
  organizationName: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string;
  signatureUrl: string;
  signature2Url: string;
  signatory1Name: string;
  signatory1Role: string;
  signatory2Name: string;
  signatory2Role: string;
  backgroundUrl: string;
  sealEnabled: boolean;
  qrPosition: 'bottom-right' | 'bottom-left' | 'top-right';
  includeRanking?: boolean;
  includeScore?: boolean;
  templateVersion?: number;
  isDraft?: boolean;
  publishedAt?: string;
}

interface CertificateTemplateBuilderProps {
  isDarkMode?: boolean;
  template?: CertificateType;
  courses?: Course[];
  onSave: (template: Partial<CertificateType>) => void;
  onCancel: () => void;
}

type FieldPosition = { x: number; y: number };

type CertificateField = {
  id: string;
  label: string;
  position: FieldPosition;
  fontSize: number;
  fontWeight: string;
  fontFamilyOverride?: string;
  textAlign: 'left' | 'center' | 'right';
  color: string;
  content: string;
};

const RIBBON_LABEL = 'OF COMPLETION';
const DEFAULT_ORG_NAME = 'CODE EXCELLENCE EDUTECH';

export function CertificateTemplateBuilder({
  isDarkMode = true,
  template,
  courses: initialCourses,
  onSave,
  onCancel,
}: CertificateTemplateBuilderProps) {
  // Top-level view: the builder itself, or the list of saved templates
  const [view, setView] = useState<'builder' | 'list'>('builder');
  const [savedTemplates, setSavedTemplates] = useState<Partial<CertificateType>[]>([]);

  const [activeTab, setActiveTab] = useState<'design' | 'settings' | 'preview'>('design');
  const [zoom, setZoom] = useState(1);

  // Courses — always kept as an array, no matter what the API returns
  const [courses, setCourses] = useState<Course[]>(
    Array.isArray(initialCourses) ? initialCourses : []
  );
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // Template state
  const [templateName, setTemplateName] = useState(template?.name || '');
  const [courseId, setCourseId] = useState(template?.courseId || '');
  const [organizationName, setOrganizationName] = useState(
    template?.organizationName || DEFAULT_ORG_NAME
  );

  // Design state
  const [primaryColor, setPrimaryColor] = useState(template?.primaryColor || '#2A1B5D');
  const [accentColor, setAccentColor] = useState(template?.accentColor || '#C21E9A');
  const [fontFamily, setFontFamily] = useState(template?.fontFamily || 'Playfair Display');
  const [logoUrl, setLogoUrl] = useState(template?.logoUrl || '');
  const [signatureUrl, setSignatureUrl] = useState(template?.signatureUrl || '');
  const [signature2Url, setSignature2Url] = useState(template?.signature2Url || '');
  const [signatory1Name, setSignatory1Name] = useState(template?.signatory1Name || 'Raina Bafna');
  const [signatory1Role, setSignatory1Role] = useState(template?.signatory1Role || 'Founder');
  const [signatory2Name, setSignatory2Name] = useState(template?.signatory2Name || 'Madhavi Patil');
  const [signatory2Role, setSignatory2Role] = useState(template?.signatory2Role || 'Co-Founder');
  const [backgroundUrl, setBackgroundUrl] = useState(template?.backgroundUrl || '');
  const [sealEnabled, setSealEnabled] = useState(template?.sealEnabled ?? true);
  const [qrPosition, setQrPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right'>(
    template?.qrPosition || 'bottom-right'
  );

  // ---------------------------------------------------------------------
  // Load courses from the API. Normalizes whatever shape the API
  // returns (`[...]`, `{ data: [...] }`, `{ courses: [...] }`, etc.)
  // into a plain array so `.map` / `.find` never crash downstream.
  // ---------------------------------------------------------------------
  useEffect(() => {
    // If courses were already passed in as a prop, don't overwrite them.
    if (Array.isArray(initialCourses) && initialCourses.length > 0) {
      setCoursesLoading(false);
      return;
    }
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCourses = async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const response = await fetch('/api/courses');

      if (!response.ok) {
        throw new Error(`Failed to load courses (status ${response.status})`);
      }

      const data = await response.json();

      const list: Course[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.courses)
        ? data.courses
        : [];

      setCourses(list);
      if (list.length === 0) {
        setCoursesError('No courses found.');
      }
    } catch (error) {
      console.error('Course API Error:', error);
      setCourses([]);
      setCoursesError('Could not load courses. Please try again.');
    } finally {
      setCoursesLoading(false);
    }
  };

  // Defensive fallback used everywhere below — guarantees an array even
  // if `courses` state is ever set to something unexpected.
  const safeCourses = Array.isArray(courses) ? courses : [];

  // Certificate fields (positionable on canvas)
  const [fields, setFields] = useState<CertificateField[]>([
    {
      id: 'certify-text',
      label: 'Intro Text',
      position: { x: 50, y: 30 },
      fontSize: 15,
      fontWeight: '500',
      textAlign: 'center',
      color: '#3a2c63',
      content: 'This is to proudly certify that',
    },
    {
      id: 'student-name',
      label: 'Student Name',
      position: { x: 50, y: 40 },
      fontSize: 46,
      fontWeight: '400',
      fontFamilyOverride: "'Dancing Script', cursive",
      textAlign: 'center',
      color: primaryColor,
      // Placeholder — replaced with the real student name at issue-time
      content: '',
    },
    {
      id: 'body-text',
      label: 'Body Paragraph',
      position: { x: 50, y: 56 },
      fontSize: 13.5,
      fontWeight: 'normal',
      textAlign: 'center',
      color: '#3a2c63',
      content:
        'has successfully completed the course in {courseName}\noffered by {orgName}. Throughout the course, the student has\ndemonstrated dedication, enthusiasm, and commitment to learning\nrelevant concepts, problem-solving, and practical applied skills.\nWe congratulate him/her on this achievement.',
    },
    {
      id: 'date',
      label: 'Issue Date',
      position: { x: 20, y: 88 },
      fontSize: 12,
      fontWeight: 'normal',
      textAlign: 'left',
      color: '#3a2c63',
      // Placeholder — replaced with the actual completion/issue date
      content: '',
    },
    {
      id: 'certificate-id',
      label: 'Certificate ID',
      position: { x: 80, y: 88 },
      fontSize: 12,
      fontWeight: 'normal',
      textAlign: 'right',
      color: '#3a2c63',
      // Placeholder — replaced with the generated certificate id
      content: '',
    },
  ]);

  const [selectedField, setSelectedField] = useState<string | null>(null);
  const draggedFieldRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------------------
  // Theme tokens (course/dark violet theme to match exam-builder pages)
  // -------------------------------------------------------------------------
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-gray-600';
  const cardBg = isDarkMode ? 'bg-[#0f1117]' : 'bg-white';
  const panelBg = isDarkMode ? 'bg-[#0a0c12]' : 'bg-gray-50';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-purple-200';
  const inputBg = isDarkMode ? 'bg-[#0a0c12]' : 'bg-gray-50';
  const accentRing = 'focus:border-violet-500 focus:outline-none';

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------
  const isValid = () => {
    if (!templateName.trim()) return false;
    if (!courseId) return false;
    return true;
  };

  const buildTemplatePayload = (): Partial<CertificateType> => {
    const selectedCourse = safeCourses.find(
      (course) => String(course.id) === String(courseId)
    );

    return {
      name: templateName,
      courseId,
      courseCode: selectedCourse?.title.toUpperCase().replace(/\s+/g, '').substring(0, 8) || 'CERT',
      organizationName,
      primaryColor,
      accentColor,
      fontFamily,
      logoUrl,
      signatureUrl,
      signature2Url,
      signatory1Name,
      signatory1Role,
      signatory2Name,
      signatory2Role,
      backgroundUrl,
      sealEnabled,
      qrPosition,
      includeRanking: true,
      includeScore: true,
      templateVersion: (template?.templateVersion || 0) + 1,
      isDraft: false,
      publishedAt: new Date().toISOString(),
    };
  };

  const handleSave = () => {
    if (!isValid()) return;

    const templateData = buildTemplatePayload();

    onSave(templateData);
    setSavedTemplates((prev) => [...prev, templateData]);
    setView('list');
  };

  const handleCreateNew = () => {
    setTemplateName('');
    setCourseId('');
    setOrganizationName(DEFAULT_ORG_NAME);
    setActiveTab('design');
    setSelectedField(null);
    setView('builder');
  };

  const handleEditSaved = (t: Partial<CertificateType>) => {
    setTemplateName(t.name || '');
    setCourseId(t.courseId || '');
    setOrganizationName(t.organizationName || DEFAULT_ORG_NAME);
    if (t.primaryColor) setPrimaryColor(t.primaryColor);
    if (t.accentColor) setAccentColor(t.accentColor);
    if (t.fontFamily) setFontFamily(t.fontFamily);
    setLogoUrl(t.logoUrl || '');
    setSignatureUrl(t.signatureUrl || '');
    setSignature2Url(t.signature2Url || '');
    setSignatory1Name(t.signatory1Name || 'Raina Bafna');
    setSignatory1Role(t.signatory1Role || 'Founder');
    setSignatory2Name(t.signatory2Name || 'Madhavi Patil');
    setSignatory2Role(t.signatory2Role || 'Co-Founder');
    setBackgroundUrl(t.backgroundUrl || '');
    setSealEnabled(t.sealEnabled ?? true);
    setQrPosition(t.qrPosition || 'bottom-right');
    setActiveTab('design');
    setView('builder');
  };

  // -------------------------------------------------------------------------
  // Drag-to-position fields on canvas
  // -------------------------------------------------------------------------
  const handleFieldDragStart = (fieldId: string) => {
    draggedFieldRef.current = fieldId;
    setSelectedField(fieldId);
  };

  const handleFieldDrag = (e: React.MouseEvent) => {
    if (!draggedFieldRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFields((prev) =>
      prev.map((field) =>
        field.id === draggedFieldRef.current
          ? { ...field, position: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } }
          : field
      )
    );
  };

  const handleFieldDragEnd = () => {
    draggedFieldRef.current = null;
  };

  const updateFieldText = (fieldId: string, content: string) => {
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, content } : f)));
  };

  // -------------------------------------------------------------------------
  // Real image uploads -> base64 data URLs so previews actually render
  // -------------------------------------------------------------------------
  const handleImageUpload = (
    type: 'logo' | 'signature' | 'signature2' | 'background',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (type === 'logo') setLogoUrl(dataUrl);
      if (type === 'signature') setSignatureUrl(dataUrl);
      if (type === 'signature2') setSignature2Url(dataUrl);
      if (type === 'background') setBackgroundUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------------------
  // Reusable certificate canvas (used for both editable design tab + preview)
  // -------------------------------------------------------------------------
  const renderCertificate = (editable: boolean) => (
    <div
      className="relative mx-auto"
      style={{
        width: '297mm',
        maxWidth: '100%',
        aspectRatio: '297 / 210',
        padding: '10px',
        borderRadius: '10px',
        background: `linear-gradient(135deg, #1c4fd6 0%, ${primaryColor} 45%, ${accentColor} 100%)`,
        boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
      }}
    >
      {/* Google fonts used by the design (decorative headline + cursive name) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&family=Playfair+Display:wght@700;800&display=swap');
      `}</style>

      <div
        ref={editable ? canvasRef : undefined}
        className="relative w-full h-full select-none"
        style={{
          background: backgroundUrl ? `url(${backgroundUrl})` : '#ffffff',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '4px',
          border: '2px solid #C7A03C',
          boxShadow: editable ? 'inset 0 0 0 1px rgba(0,0,0,0.04)' : undefined,
          overflow: 'hidden',
        }}
        onMouseMove={editable ? handleFieldDrag : undefined}
        onMouseUp={editable ? handleFieldDragEnd : undefined}
        onMouseLeave={editable ? handleFieldDragEnd : undefined}
      >
        {/* inner hairline border, echoes the gold double-rule in the reference */}
        <div
          className="absolute pointer-events-none"
          style={{ inset: '10px', border: '1px solid #C7A03C', borderRadius: '2px' }}
        />

        {/* Logo top-right */}
        {logoUrl ? (
          <div className="absolute top-6 right-6 w-16 h-16">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
        ) : (
          <div
            className="absolute top-6 right-6 w-16 h-16 rounded-lg flex items-center justify-center"
            style={{ background: primaryColor }}
          >
            <Award className="w-8 h-8 text-white/70" />
          </div>
        )}

        {/* Org name + headline */}
        <div className="absolute left-0 right-0 text-center" style={{ top: '6%' }}>
          <p
            className="tracking-[0.15em] font-bold"
            style={{ color: primaryColor, fontSize: '18px', fontFamily: 'Playfair Display, serif' }}
          >
            {organizationName}
          </p>
          <h1
            className="leading-none"
            style={{
              color: primaryColor,
              fontFamily: 'Playfair Display, serif',
              fontWeight: 800,
              fontStyle: 'italic',
              fontSize: '58px',
              marginTop: '6px',
              letterSpacing: '0.02em',
            }}
          >
            Certificate
          </h1>
        </div>

        {/* Ribbon banner */}
        <div className="absolute left-0 right-0 flex justify-center" style={{ top: '24%' }}>
          <div
            className="px-8 py-2 text-white font-semibold tracking-[0.25em]"
            style={{
              background: accentColor,
              fontSize: '13px',
              clipPath:
                'polygon(3% 0%, 97% 0%, 100% 50%, 97% 100%, 3% 100%, 0% 50%)',
            }}
          >
            {RIBBON_LABEL}
          </div>
        </div>

        {/* Positionable text fields */}
        {fields.map((field) => (
          <div
            key={field.id}
            className={`absolute ${editable ? 'cursor-move' : ''} transition-shadow ${
              editable && selectedField === field.id ? 'ring-2 ring-[#C21E9A] ring-offset-2' : ''
            }`}
            style={{
              left: `${field.position.x}%`,
              top: `${field.position.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${field.fontSize * (editable ? zoom : 1)}px`,
              fontWeight: field.fontWeight,
              textAlign: field.textAlign,
              color: field.id === 'student-name' ? primaryColor : field.color,
              fontFamily: field.fontFamilyOverride || fontFamily,
              width: field.textAlign === 'center' ? '82%' : 'auto',
              maxWidth: '92%',
              whiteSpace: 'pre-line',
              lineHeight: field.id === 'body-text' ? 1.7 : 1.3,
            }}
            onMouseDown={editable ? () => handleFieldDragStart(field.id) : undefined}
            onClick={editable ? () => setSelectedField(field.id) : undefined}
          >
            {field.content
              .replace('{orgName}', organizationName)
              .replace(
                '{courseName}',
                safeCourses.find((c) => c.id === courseId)?.title ||
                  '____________________________'
              )}
            {field.id === 'student-name' && (
              <div
                className="mx-auto mt-1"
                style={{ width: '55%', height: '2px', background: accentColor }}
              />
            )}
          </div>
        ))}

        {/* Gold rosette seal, centered above the signatures */}
        {sealEnabled && (
          <div
            className="absolute flex items-center justify-center"
            style={{ left: '50%', bottom: '10%', transform: 'translate(-50%, 50%)' }}
          >
            <svg width="88" height="88" viewBox="0 0 100 100">
              <polygon
                points="50,2 58,18 75,12 75,30 92,35 80,48 92,61 75,66 75,84 58,78 50,94 42,78 25,84 25,66 8,61 20,48 8,35 25,30 25,12 42,18"
                fill="#F6EEDD"
                stroke="#C7A03C"
                strokeWidth="2"
              />
              <circle cx="50" cy="46" r="24" fill="none" stroke="#C7A03C" strokeWidth="2" />
            </svg>
          </div>
        )}

        {/* Signature blocks */}
        <div className="absolute flex items-end" style={{ left: '12%', bottom: '9%' }}>
          <div className="text-center" style={{ width: '150px' }}>
            {signatureUrl && (
              <img src={signatureUrl} alt="Signature 1" className="h-10 mx-auto object-contain mb-1" />
            )}
            <div style={{ height: '1px', background: accentColor, marginBottom: '6px' }} />
            <p style={{ color: primaryColor, fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em' }}>
              {signatory1Name.toUpperCase()}
            </p>
            <p style={{ color: primaryColor, fontSize: '11px', fontStyle: 'italic' }}>{signatory1Role}</p>
          </div>
        </div>

        <div className="absolute flex items-end" style={{ right: '12%', bottom: '9%' }}>
          <div className="text-center" style={{ width: '150px' }}>
            {signature2Url && (
              <img src={signature2Url} alt="Signature 2" className="h-10 mx-auto object-contain mb-1" />
            )}
            <div style={{ height: '1px', background: accentColor, marginBottom: '6px' }} />
            <p style={{ color: primaryColor, fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em' }}>
              {signatory2Name.toUpperCase()}
            </p>
            <p style={{ color: primaryColor, fontSize: '11px', fontStyle: 'italic' }}>{signatory2Role}</p>
          </div>
        </div>

        {/* QR code corner */}
        <div
          className="absolute w-12 h-12 border border-gray-300 rounded flex items-center justify-center bg-white"
          style={{
            [qrPosition.includes('bottom') ? 'bottom' : 'top']: '12px',
            [qrPosition.includes('right') ? 'right' : 'left']: '12px',
          }}
        >
          <QrCode className="w-8 h-8 text-gray-400" />
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------------------
  // List view: shown after a template is saved
  // -------------------------------------------------------------------------
  const renderListView = () => (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-bold text-lg ${textPrimary} flex items-center gap-2`}>
            <ListChecks className="w-5 h-5 text-fuchsia-400" />
            Certificate Templates
          </h3>
          <p className={`text-sm ${textSecondary}`}>
            {savedTemplates.length} template{savedTemplates.length === 1 ? '' : 's'} saved this session
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Template
        </button>
      </div>

      {savedTemplates.length === 0 ? (
        <div className={`${panelBg} rounded-xl p-10 border ${borderColor} text-center`}>
          <Award className={`w-10 h-10 mx-auto mb-3 ${textSecondary}`} />
          <p className={`${textPrimary} font-semibold`}>No certificate templates yet</p>
          <p className={`text-sm ${textSecondary} mt-1`}>Create your first template to see it listed here.</p>
        </div>
      ) : (
        <div className={`${panelBg} rounded-xl border ${borderColor} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${borderColor} text-left`}>
                <th className={`px-4 py-3 font-semibold ${textSecondary}`}>Template Name</th>
                <th className={`px-4 py-3 font-semibold ${textSecondary}`}>Course</th>
                <th className={`px-4 py-3 font-semibold ${textSecondary}`}>Version</th>
                <th className={`px-4 py-3 font-semibold ${textSecondary} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {savedTemplates.map((t, idx) => (
                <tr key={idx} className={`border-b last:border-b-0 ${borderColor} hover:bg-white/5`}>
                  <td className={`px-4 py-3 font-medium ${textPrimary}`}>{t.name}</td>
                  <td className={`px-4 py-3 ${textSecondary}`}>
                    {safeCourses.find((c) => c.id === t.courseId)?.title || t.courseId}
                  </td>
                  <td className={`px-4 py-3 ${textSecondary}`}>v{t.templateVersion}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEditSaved(t)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${inputBg} ${textPrimary} border ${borderColor} hover:bg-violet-600 hover:text-white transition-all`}
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`${cardBg} rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col border ${borderColor}`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                {view === 'list'
                  ? 'Certificate Templates'
                  : template
                  ? 'Edit Certificate Template'
                  : 'Create Certificate Template'}
              </h2>
              <p className={`text-sm ${textSecondary}`}>
                {view === 'list'
                  ? 'Templates saved so far'
                  : 'Design and configure your certificate template'}
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className={`p-2 rounded-lg ${inputBg} ${textSecondary} hover:bg-red-500/10 hover:text-red-400 transition-all`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {view === 'builder' && (
          <div className={`px-6 pt-4 border-b ${borderColor} flex items-center gap-2`}>
            {(['design', 'settings', 'preview'] as const).map((tab) => {
              const icons = { design: Palette, settings: Settings, preview: Eye };
              const Icon = icons[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-t-lg font-semibold transition-all capitalize ${
                    activeTab === tab
                      ? `${panelBg} ${textPrimary} border-b-2 border-violet-500`
                      : `${textSecondary} hover:bg-white/5`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'list' ? (
            renderListView()
          ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'design' && (
              <motion.div
                key="design"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Design Controls */}
                <div className="lg:col-span-1 space-y-4">
                  <div className={`${panelBg} rounded-xl p-4 border ${borderColor}`}>
                    <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                      <FileText className="w-4 h-4 text-fuchsia-400" />
                      Organization
                    </h3>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g., Code Excellence Edutech"
                      className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm ${accentRing}`}
                    />
                  </div>

                  <div className={`${panelBg} rounded-xl p-4 border ${borderColor}`}>
                    <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                      <Palette className="w-4 h-4 text-fuchsia-400" />
                      Colors
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className={`text-sm font-semibold ${textSecondary} mb-2 block`}>
                          Primary Color (title / text / seal ink)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-12 h-10 rounded-lg cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm ${accentRing}`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`text-sm font-semibold ${textSecondary} mb-2 block`}>
                          Accent Color (ribbon / underline)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-12 h-10 rounded-lg cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm ${accentRing}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`${panelBg} rounded-xl p-4 border ${borderColor}`}>
                    <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                      <Type className="w-4 h-4 text-fuchsia-400" />
                      Body Typography
                    </h3>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} ${accentRing}`}
                    >
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Merriweather">Merriweather</option>
                      <option value="Crimson Text">Crimson Text</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                    <p className={`text-xs ${textSecondary} mt-2`}>
                      Headline uses Playfair Display and the student name uses Dancing Script
                      automatically, to match the certificate reference design.
                    </p>
                  </div>

                  <div className={`${panelBg} rounded-xl p-4 border ${borderColor}`}>
                    <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                      <ImageIcon className="w-4 h-4 text-fuchsia-400" />
                      Assets
                    </h3>
                    <div className="space-y-3">
                      {(['logo', 'signature', 'signature2', 'background'] as const).map((type) => {
                        const url =
                          type === 'logo'
                            ? logoUrl
                            : type === 'signature'
                            ? signatureUrl
                            : type === 'signature2'
                            ? signature2Url
                            : backgroundUrl;
                        const label =
                          type === 'signature'
                            ? 'signature 1'
                            : type === 'signature2'
                            ? 'signature 2'
                            : type;
                        return (
                          <div key={type}>
                            <label className={`text-sm font-semibold ${textSecondary} mb-2 block capitalize`}>
                              {label}
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(type, e)}
                              className="hidden"
                              id={`${type}-upload`}
                            />
                            <label
                              htmlFor={`${type}-upload`}
                              className={`px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm cursor-pointer hover:bg-white/5 flex items-center justify-center gap-2`}
                            >
                              <Upload className="w-4 h-4" />
                              Upload {label}
                            </label>
                            {url && (
                              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {label} uploaded
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={`${panelBg} rounded-xl p-4 border ${borderColor}`}>
                    <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                      <Layout className="w-4 h-4 text-fuchsia-400" />
                      Layout Options
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className={`text-sm font-semibold ${textSecondary}`}>Enable Seal</label>
                        <button
                          onClick={() => setSealEnabled(!sealEnabled)}
                          className={`w-12 h-6 rounded-full transition-all ${sealEnabled ? 'bg-violet-600' : 'bg-gray-600'}`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              sealEnabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                      <div>
                        <label className={`text-sm font-semibold ${textSecondary} mb-2 block`}>
                          QR Code Position
                        </label>
                        <select
                          value={qrPosition}
                          onChange={(e) => setQrPosition(e.target.value as any)}
                          className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} ${accentRing}`}
                        >
                          <option value="bottom-right">Bottom Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="top-right">Top Right</option>
                        </select>
                      </div>
                      <div>
                        <label className={`text-sm font-semibold ${textSecondary} mb-2 block`}>
                          Signatory 1 Name / Role
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={signatory1Name}
                            onChange={(e) => setSignatory1Name(e.target.value)}
                            className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm ${accentRing}`}
                          />
                          <input
                            type="text"
                            value={signatory1Role}
                            onChange={(e) => setSignatory1Role(e.target.value)}
                            className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm ${accentRing}`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`text-sm font-semibold ${textSecondary} mb-2 block`}>
                          Signatory 2 Name / Role
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={signatory2Name}
                            onChange={(e) => setSignatory2Name(e.target.value)}
                            className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm ${accentRing}`}
                          />
                          <input
                            type="text"
                            value={signatory2Role}
                            onChange={(e) => setSignatory2Role(e.target.value)}
                            className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm ${accentRing}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected field text editor */}
                  {selectedField && (
                    <div className={`${panelBg} rounded-xl p-4 border ${borderColor}`}>
                      <h3 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                        <Type className="w-4 h-4 text-fuchsia-400" />
                        Edit Selected Field
                      </h3>
                      <textarea
                        value={fields.find((f) => f.id === selectedField)?.content || ''}
                        onChange={(e) => updateFieldText(selectedField, e.target.value)}
                        rows={selectedField === 'body-text' ? 5 : 1}
                        className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm ${accentRing}`}
                      />
                      {selectedField === 'student-name' && (
                        <p className={`text-xs ${textSecondary} mt-2`}>
                          This is a placeholder. When a student completes the course, generate the
                          certificate by replacing this value with the student's real name.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Canvas Area */}
                <div className="lg:col-span-2">
                  <div className={`${panelBg} rounded-xl p-4 border ${borderColor}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                        <Layers className="w-4 h-4 text-fuchsia-400" />
                        Certificate Canvas (A4)
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                          className={`p-2 rounded-lg ${cardBg} ${textSecondary} hover:bg-violet-600 hover:text-white transition-all`}
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className={`text-sm ${textSecondary} min-w-[60px] text-center`}>
                          {Math.round(zoom * 100)}%
                        </span>
                        <button
                          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                          className={`p-2 rounded-lg ${cardBg} ${textSecondary} hover:bg-violet-600 hover:text-white transition-all`}
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="overflow-auto max-h-[600px]">{renderCertificate(true)}</div>

                    <div className="mt-4 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                      <p className="text-sm text-violet-300">
                        💡 Click and drag text elements to reposition them. Click a field to edit its text in the
                        panel on the left.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="max-w-3xl mx-auto space-y-6"
              >
                <div className={`${panelBg} rounded-xl p-6 border ${borderColor}`}>
                  <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                    <FileText className="w-5 h-5 text-fuchsia-400" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`text-sm font-semibold ${textSecondary} mb-2 block`}>
                        Template Name *
                      </label>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="e.g., Python Advanced Certificate"
                        className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} ${accentRing}`}
                      />
                    </div>

                    <div>
                      <label className={`text-sm font-semibold ${textSecondary} mb-2 block`}>
                        Course *
                      </label>
                      <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        disabled={coursesLoading}
                        className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} ${accentRing} disabled:opacity-50`}
                      >
                        <option value="">
                          {coursesLoading ? 'Loading courses…' : 'Select Course'}
                        </option>

                        {safeCourses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>

                      {!coursesLoading && coursesError && (
                        <div className="flex items-center gap-2 text-xs text-red-300 mt-2">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {coursesError}
                          <button
                            type="button"
                            onClick={loadCourses}
                            className="underline hover:text-red-200"
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      <p className={`text-xs ${textSecondary} mt-1`}>
                        Each certificate template must be linked to exactly ONE course. The admin
                        selects the course here; at issue-time your backend swaps in the matching
                        course title and the completing student's name automatically.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="max-w-5xl mx-auto"
              >
                <div className={`${panelBg} rounded-xl p-6 border ${borderColor}`}>
                  <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                    <Eye className="w-5 h-5 text-fuchsia-400" />
                    Full Certificate Preview
                  </h3>

                  <div className="overflow-auto">{renderCertificate(false)}</div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${cardBg} border ${borderColor}`}>
                      <p className={`text-xs ${textSecondary} mb-1`}>Template Name</p>
                      <p className={`text-sm font-semibold ${textPrimary}`}>{templateName || 'Not set'}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${cardBg} border ${borderColor}`}>
                      <p className={`text-xs ${textSecondary} mb-1`}>Course</p>
                      <p className={`text-sm font-semibold ${textPrimary}`}>
                        {safeCourses.find((c) => c.id === courseId)?.title || 'Not selected'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {view === 'builder' && (
          <div className={`px-6 py-4 border-t ${borderColor} flex items-center justify-between`}>
            <div>
              {!isValid() && (
                <div className="flex items-center gap-2 text-sm text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  Please complete all required fields
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className={`px-6 py-3 rounded-lg font-semibold ${textSecondary} hover:bg-white/5 transition-all`}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={!isValid()}
                className={`px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white
                  hover:shadow-lg hover:shadow-violet-500/20 transition-all flex items-center gap-2
                  ${!isValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save className="w-4 h-4" />
                Save Template
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}
