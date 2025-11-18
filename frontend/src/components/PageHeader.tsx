// src/components/PageHeader.tsx
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
}

export default function PageHeader({ title, subtitle, backTo }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      style={{
        backgroundColor: "#2563EB",
        color: "white",
        padding: "20px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      aria-label={`${title} page header`}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            style={{
              backgroundColor: "transparent",
              color: "white",
              border: "2px solid white",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              marginRight: "20px",
            }}
            aria-label="Go back"
          >
            ← BACK
          </button>
        )}
        <h1 style={{ margin: 0 }}>{title}</h1>
      </div>
      {subtitle && (
        <p style={{ margin: 0, fontStyle: "italic", opacity: 0.85 }}>{subtitle}</p>
      )}
    </header>
  );
}
