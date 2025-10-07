import { useNavigate } from "react-router-dom";

export default function DashboardLinks({ links }) {
  const navigate = useNavigate();

  return (
    <div className="row g-3 mb-4">
      {links.map((link, idx) => (
        <div className="col-md-4" key={idx}>
          <div
            className="card shadow-sm border-0 rounded-3 h-100 clickable"
            onClick={() => navigate(link.to)}
            style={{ cursor: "pointer" }}
          >
            <div className={`card-body text-center py-4 bg-light`}>
              <h5 className={`fw-semibold text-${link.variant || "primary"}`}>
                {link.icon} {link.label}
              </h5>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
