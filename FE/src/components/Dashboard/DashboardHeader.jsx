export default function DashboardHeader({ title, onAdd, addLabel }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2>{title}</h2>
      {onAdd && (
        <button className="btn btn-success" onClick={onAdd}>
          {addLabel || "Add New"}
        </button>
      )}
    </div>
  );
}
