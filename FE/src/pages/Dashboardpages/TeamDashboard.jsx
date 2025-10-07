import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../config/axios.config";
import Breadcrumb from "../../components/Dashboard/AdminBreadcrumb";
const baseURL = import.meta.env.VITE_API_URL.replace("/api", "");


export default function TeamDashboard() {
  const [team, setTeam] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchTeam = async () => {
    try {
      const body = await axiosInstance.get("/team", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeam(body.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load team");
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await axiosInstance.delete(`/team/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeam((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
        <Breadcrumb title="Team Dashboard" />

    <div className="container py-5">

      <div className="d-flex justify-content-end align-items-center mb-4">
        <Link to="/admin/team/add" className="btn btn-success align-self-right">
          + Add Member
        </Link>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {team.length === 0 ? (
        <p>No team members yet.</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Role</th>
              <th style={{ width: "180px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {team.map((member) => (
              <tr key={member._id}>
                <td>
                  {member.img ? (
                    <img
                      src={`${baseURL}${member.img}`}
                      alt={member.name}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>{member.name}</td>
                <td>{member.role}</td>
                <td>
                  <Link
                    to={`/admin/team/edit/${member._id}`}
                    className="btn btn-primary btn-sm me-2"
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(member._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </>
  );
}
