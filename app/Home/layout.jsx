export default function HomeLayout({ children }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body {
          font-family: 'Sora', 'Segoe UI', sans-serif;
          background: #1e0a2e;
          color: #e9d5ff;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
        }
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        ::-webkit-scrollbar        { width: 5px; }
        ::-webkit-scrollbar-track  { background: #1e0a2e; }
        ::-webkit-scrollbar-thumb  { background: #7c3aed; border-radius: 3px; }

        @keyframes float1 {
          0%,100% { transform: translateY(0) rotate(12deg); }
          50%      { transform: translateY(-14px) rotate(12deg); }
        }
        @keyframes float2 {
          0%,100% { transform: translateY(0) rotate(-6deg); }
          50%      { transform: translateY(-10px) rotate(-6deg); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulseDot {
          0%,100% { opacity:1; }
          50%      { opacity:0.35; }
        }
      `}</style>
      {children}
    </>
  );
}