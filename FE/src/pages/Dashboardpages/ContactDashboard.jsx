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
        const body = await axiosInstance.put(`/contact/${msg._id}/status`, { status: "read" });
        setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, status: body.data.status } : m)));
        setSelectedMsg((prev) => (prev ? { ...prev, status: body.data.status } : prev));
      } catch (err) {
        console.error("Error updating message status:", err);
      }
    }
  };

  return (
    <DashboardLayout title="Contact Messages">
      {messages.length === 0 ? (
        <p className="text-gray-500">No messages yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {messages.map((msg) => (
            <div
              key={msg._id}
              onClick={() => handleOpenMessage(msg)}
              className="p-5 bg-white border border-gray-200 rounded-2xl shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-transform flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                  {msg.name}
                </h2>
                <p className="text-sm text-gray-600 truncate">
                  <strong>Email:</strong> {msg.email}
                </p>
                <p className="text-sm text-gray-600 truncate mt-1">
                  <strong>Subject:</strong> {msg.subject}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    msg.status === "new" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                  }`}
                >
                  {msg.status || "new"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(msg._id);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMsg && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
            <button onClick={() => setSelectedMsg(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              ✖
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-4 truncate">{selectedMsg.subject}</h2>

            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedMsg.name}</p>
              <p><strong>Email:</strong> {selectedMsg.email}</p>
              <p><strong>Phone:</strong> {selectedMsg.number || "N/A"}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    selectedMsg.status === "new" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                  }`}
                >
                  {selectedMsg.status || "new"}
                </span>
              </p>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                <p className="text-gray-700 whitespace-pre-line">{selectedMsg.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
