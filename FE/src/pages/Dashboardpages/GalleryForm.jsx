import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios.config";

const MAX_SIZE = 5 * 1024 * 1024;
const acceptImage = (f) => f && f.type?.startsWith("image/");
const stripExt = (name = "") => name.replace(/\.[^/.]+$/, "");

export default function GalleryForm() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("single"); // 'single' | 'bulk'

  // single
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);

  // bulk
  const [files, setFiles] = useState([]);
  const [titles, setTitles] = useState([]);

  // control
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const validFiles = useMemo(
    () => files.filter((f) => acceptImage(f) && f.size <= MAX_SIZE),
    [files]
  );

  const onSingleFile = (e) => {
    const f = e.target.files?.[0];
    setError("");
    if (!f) return setImage(null);
    if (!acceptImage(f)) return setError("Please select an image file");
    if (f.size > MAX_SIZE) return setError("Image must be 5MB or smaller");
    setImage(f);
  };

  const onBulkFiles = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    const badType = list.find((f) => !acceptImage(f));
    if (badType) return setError(`"${badType.name}" is not an image`);
    const tooBig = list.find((f) => f.size > MAX_SIZE);
    if (tooBig) return setError(`"${tooBig.name}" exceeds 5MB`);

    setError("");
    setFiles(list);
    setTitles(list.map((f) => stripExt(f.name)));
  };

  const updateTitleAt = (idx, v) => {
    setTitles((old) => {
      const next = old.slice();
      next[idx] = v;
      return next;
    });
  };

  const handleSubmitSingle = async () => {
    if (!image) return setError("Please select an image");
    setSubmitting(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("image", image);

      await axiosInstance.post("/gallery", fd, {
        onUploadProgress: (pe) => {
          if (!pe.total) return;
          setProgress(Math.round((pe.loaded * 100) / pe.total));
        },
      });

      navigate("/admin/gallery", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Upload failed";
      setError(msg);
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  const handleSubmitBulk = async () => {
    if (!validFiles.length) return setError("Please select image files");
    setSubmitting(true);
    setProgress(0);
    try {
      const fd = new FormData();
      validFiles.forEach((f) => fd.append("images", f));
      titles.forEach((t) => fd.append("titles[]", t.trim()));

      await axiosInstance.post("/gallery/bulk", fd, {
        onUploadProgress: (pe) => {
          if (!pe.total) return;
          setProgress(Math.round((pe.loaded * 100) / pe.total));
        },
      });

      navigate("/admin/gallery", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Bulk upload failed";
      setError(msg);
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (mode === "single") return handleSubmitSingle();
    return handleSubmitBulk();
  };

  return (
    <div className="admin-page-container">
      <div className="admin-form-card">
        <div className="admin-form-header">
          <h2>Add Gallery Image(s)</h2>
          <div className="accent-line"></div>

          <div className="options-group mt-4">
            <label className="checkbox-label">
              <input
                type="radio"
                name="mode"
                checked={mode === "single"}
                onChange={() => setMode("single")}
              />
              <span>Single Upload</span>
            </label>
            <label className="checkbox-label">
              <input
                type="radio"
                name="mode"
                checked={mode === "bulk"}
                onChange={() => setMode("bulk")}
              />
              <span>Bulk Upload</span>
            </label>
          </div>
        </div>

        {error && <div className="form-error-banner mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form-grid">
          {mode === "single" ? (
            <>
              <div className="form-field full-width">
                <label>Image Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Enter a descriptive title"
                />
              </div>

              <div className="form-field full-width">
                <label>Select Image</label>
                <div className="image-upload-zone">
                  <input
                    type="file"
                    onChange={onSingleFile}
                    accept="image/*"
                    required
                  />
                  {image && (
                    <div className="mt-2 text-sm text-gray-400">
                      {image.name} — {(image.size / 1024).toFixed(0)} KB
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-field full-width">
                <label>Images (Multiple)</label>
                <div className="image-upload-zone">
                  <input
                    type="file"
                    multiple
                    onChange={onBulkFiles}
                    accept="image/*"
                  />
                </div>
              </div>

              {validFiles.length > 0 && (
                <div className="form-field full-width">
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Preview</th>
                          <th>Title</th>
                          <th>Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validFiles.map((f, i) => (
                          <tr key={i}>
                            <td>
                              <img
                                src={URL.createObjectURL(f)}
                                alt=""
                                className="thumb-preview"
                                onLoad={(e) =>
                                  URL.revokeObjectURL(e.currentTarget.src)
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="table-input"
                                value={titles[i] ?? ""}
                                onChange={(e) => updateTitleAt(i, e.target.value)}
                                placeholder={stripExt(f.name)}
                              />
                            </td>
                            <td>{(f.size / 1024).toFixed(0)} KB</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {submitting && (
            <div className="form-field full-width">
              <div className="admin-progress-container">
                <div
                  className="admin-progress-bar"
                  style={{ width: `${progress}%` }}
                ></div>
                <span className="progress-text">{progress}% Uploaded</span>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button className="submit-btn" disabled={submitting}>
              {submitting
                ? "Uploading..."
                : mode === "single"
                  ? "Upload Image"
                  : "Upload All"}
            </button>
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate("/admin/gallery")}
            >
              Back to Gallery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
