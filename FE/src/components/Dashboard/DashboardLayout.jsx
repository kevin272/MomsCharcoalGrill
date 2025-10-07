import Breadcrumb from "./AdminBreadcrumb";

export default function DashboardLayout({ title, actions, children }) {
  return (
      <>
      <Breadcrumb title={title} />

    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-end align-items-center mb-4">
        <div>{actions}</div>
      </div>

      {/* Content Section */}
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body">{children}</div>
      </div>
    </div>
    </>
  );
}
