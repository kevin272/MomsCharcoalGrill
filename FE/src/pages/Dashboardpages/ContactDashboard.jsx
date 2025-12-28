import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios.config";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";

export default function ContactDashboard() {
  const [messages, setMessages] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const navigate = useNavigate();

  const fetchMessages = async () => {
    try {
      const body = await axiosInstance.get("/contact/list");
      setMessages(body.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchMessages();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await axiosInstance.delete(`/contact/${id}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      if (selectedMsg?._id === id) setSelectedMsg(null);
    } catch (err) {
      console.error("Error deleting message:", err);
      alert(err?.message || "Delete failed");
    }
  };

  const handleOpenMessage = async (msg) => {
    setSelectedMsg(msg);

    if (msg.status === "new") {
      try {
        const body = await axiosInstance.put(`/contact/${msg._id}/status`, {
          status: "read",
        });
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msg._id ? { ...m, status: body.data.status } : m
          )
        );
        setSelectedMsg((prev) =>
          prev ? { ...prev, status: body.data.status } : prev
        );
      } catch (err) {
        console.error("Error updating message status:", err);
      }
    }
  };

  return (
    <DashboardLayout title="Contact Messages">
      <div className="contact-dashboard">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          <div className="grid">
            {messages.map((msg) => (
              <div
                key={msg._id}
                onClick={() => handleOpenMessage(msg)}
                className="contact-card"
              >
                <div>
                  <h2>{msg.name}</h2>
                  <p>
                    <strong>Email:</strong> {msg.email}
                  </p>
                  <p>
                    <strong>Subject:</strong> {msg.subject}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span
                    className={`status-badge ${
                      msg.status === "new" ? "badge-new" : "badge-read"
                    }`}
                  >
                    {msg.status || "new"}
                  </span>

                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(msg._id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedMsg && (
          <div className="fixed inset-0 bg-black bg-opacity-40">
            <div className="modal-card">
              <button
                className="close-btn"
                onClick={() => setSelectedMsg(null)}
              >
                ✖
              </button>

              {/* <h2 className="pl-10">{selectedMsg.subject}</h2> */}

              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {selectedMsg.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedMsg.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedMsg.number || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status-badge ${
                      selectedMsg.status === "new"
                        ? "badge-new"
                        : "badge-read"
                    }`}
                  >
                    {selectedMsg.status || "new"}
                  </span>
                </p>

                <div className="mt-4 p-3 bg-gray-50">
                  <p className="message-text">
                    {selectedMsg.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
