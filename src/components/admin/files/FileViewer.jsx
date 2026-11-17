import React, { useEffect, useState } from "react";
import { X, Loader2, FileText, AlertCircle } from "lucide-react";
import fileService from "../../../services/fileService";

const FileViewer = ({ file, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadPreview = async () => {
      try {
        setLoading(true);
        setError("");
        setPreviewUrl("");

        const fileId = file?.id ?? file?._id ?? file?.fileId;

        if (fileId == null) {
          throw new Error("Unable to identify this file.");
        }

        // This service method must call the backend's inline-view endpoint.
        const response = await fileService.viewFile(fileId);

        const url =
          typeof response === "string"
            ? response
            : response?.url ||
              response?.viewUrl ||
              response?.view_url;

        if (!url) {
          throw new Error("The server did not return a preview URL.");
        }

        if (active) {
          setPreviewUrl(url);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to preview this file."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (file) {
      loadPreview();
    }

    return () => {
      active = false;
    };
  }, [file]);

  if (!file) return null;

  const fileName =
    file.originalName ||
    file.originalname ||
    file.filename ||
    file.name ||
    "File Preview";

  const extension = fileName.split(".").pop()?.toLowerCase();

  const isImage = [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "bmp",
    "svg",
  ].includes(extension);

  const isPdf = extension === "pdf";

  const isVideo = ["mp4", "webm", "ogg"].includes(extension);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-violet-600" />

            <h2 className="truncate font-semibold text-gray-800">
              {fileName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close file preview"
          >
            <X size={22} />
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-4">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-gray-600">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
              <p>Loading preview...</p>
            </div>
          )}

          {!loading && error && (
            <div className="max-w-md text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />

              <p className="font-medium text-gray-800">
                Unable to preview file
              </p>

              <p className="mt-2 text-sm text-gray-600">{error}</p>
            </div>
          )}

          {!loading && !error && previewUrl && (
            <>
              {isImage ? (
                <img
                  src={previewUrl}
                  alt={fileName}
                  className="max-h-full max-w-full rounded-lg object-contain"
                />
              ) : isVideo ? (
                <video
                  src={previewUrl}
                  controls
                  className="max-h-full max-w-full"
                >
                  Your browser does not support video playback.
                </video>
              ) : isPdf ? (
                <iframe
                  src={previewUrl}
                  title={fileName}
                  className="h-full min-h-[60vh] w-full rounded-lg bg-white"
                />
              ) : (
                <div className="max-w-lg text-center">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />

                  <p className="font-medium text-gray-800">
                    Preview is not supported for this file type.
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Browser previews generally support PDFs and images.
                    Other formats may require a dedicated viewer.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;