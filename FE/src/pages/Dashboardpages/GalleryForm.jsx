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
    <div className="container py-5" style={{ maxWidth: 860 }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="m-0">Add Gallery Image(s)</h2>
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-sm ${
              mode === "single" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setMode("single")}
          >
            Single
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              mode === "bulk" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setMode("bulk")}
          >
            Bulk
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {mode === "single" ? (
          <>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Image</label>
              <input
                type="file"
                className="form-control"
                onChange={onSingleFile}
                accept="image/*"
                required
              />
              {image && (
                <div className="mt-2">
                  <small className="text-muted">
                    {image.name} — {(image.size / 1024).toFixed(0)} KB
                  </small>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mb-3">
              <label className="form-label">Images (multiple)</label>
              <input
                type="file"
                className="form-control"
                multiple
                onChange={onBulkFiles}
                accept="image/*"
              />
            </div>

            {validFiles.length > 0 && (
              <div className="mb-4">
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Preview</th>
                        <th>Filename</th>
                        <th>Title</th>
                        <th>Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validFiles.map((f, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>
                            <img
                              src={URL.createObjectURL(f)}
                              alt=""
                              style={{
                                width: 80,
                                height: 56,
                                objectFit: "cover",
                                borderRadius: 6,
                              }}
                              onLoad={(e) =>
                                URL.revokeObjectURL(e.currentTarget.src)
                              }
                            />
                          </td>
                          <td>{f.name}</td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
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
          <div className="mb-3">
            <div className="progress">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {progress}%
              </div>
            </div>
          </div>
        )}

        <button className="btn btn-primary" disabled={submitting}>
          {submitting
            ? "Uploading..."
            : mode === "single"
            ? "Upload"
            : "Upload All"}
        </button>
      </form>
    </div>
  );
}
