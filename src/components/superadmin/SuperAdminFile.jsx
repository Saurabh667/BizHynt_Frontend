import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  File as FileIcon,
  Search,
  Download,
  Trash2,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Folder,
  FolderOpen,
  FolderPlus,
  Pencil,
  ChevronRight,
  Home,
  CalendarDays,
  UserRound,
  ShieldCheck,
  Eye
} from "lucide-react";

import useAuthStore from "../../store/authStore";
import fileService from "../../services/fileService";
import FileViewer from "./files/FileViewer";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const formatBytes = (bytes = 0) => {
  if (bytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(
    index === 0 ? 0 : 2
  )} ${units[index]}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getFileName = (file) =>
  file?.originalName ||
  file?.original_name ||
  file?.fileName ||
  file?.filename ||
  file?.name ||
  "Untitled file";

const getFileSize = (file) =>
  Number(file?.size ?? file?.fileSize ?? file?.file_size ?? 0);

const getFileDate = (file) =>
  file?.createdAt ||
  file?.created_at ||
  file?.uploadedAt ||
  file?.uploaded_at;

const getUploaderName = (file) => {
  const uploader =
    file?.uploadedBy ||
    file?.uploader ||
    file?.user ||
    file?.owner;

  if (typeof uploader === "string") return uploader;

  if (!uploader) {
    return (
      file?.uploadedByName ||
      file?.uploaderName ||
      file?.userName ||
      "Unknown user"
    );
  }

  return (
    uploader.name ||
    uploader.fullName ||
    uploader.full_name ||
    uploader.email ||
    "Unknown user"
  );
};

const getFileId = (file) => file?.id ?? file?._id;

const getExtension = (name = "") => {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
};

const getFileIcon = (name = "") => {
  const extension = getExtension(name);

  if (
    ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"].includes(
      extension
    )
  ) {
    return FileImage;
  }

  if (
    ["mp4", "mov", "avi", "mkv", "webm", "mpeg", "mpg"].includes(extension)
  ) {
    return FileVideo;
  }

  if (["mp3", "wav", "ogg", "aac", "flac", "m4a"].includes(extension)) {
    return FileAudio;
  }

  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return FileArchive;
  }

  if (
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "java",
      "cpp",
      "c",
      "html",
      "css",
      "json",
      "xml",
    ].includes(extension)
  ) {
    return FileCode;
  }

  if (
    [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
      "csv",
    ].includes(extension)
  ) {
    return FileText;
  }

  return FileIcon;
};

const getFileType = (file) => {
  if (file?.mimeType || file?.mime_type || file?.contentType) {
    return file.mimeType || file.mime_type || file.contentType;
  }

  const extension = getExtension(getFileName(file));

  return extension ? extension.toUpperCase() : "FILE";
};

const normalizeFilesResponse = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.files)) return data.files;

  if (Array.isArray(data?.data)) return data.data;

  if (Array.isArray(data?.items)) return data.items;

  return [];
};

const normalizeUsersResponse = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.users)) return data.users;

  if (Array.isArray(data?.data)) return data.data;

  return [];
};

export default function Files() {
  const user = useAuthStore((state) => state.user);

  const isSuperAdmin = user?.role === "super_admin";

  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);

  // Folder explorer is enabled for Super Admin only for this phase.
  const [folders, setFolders] = useState([]);
  const [folderStack, setFolderStack] = useState([]);
  const currentFolder = folderStack[folderStack.length - 1] || null;
  const currentFolderId = currentFolder?.id ?? null;
  const [foldersLoading, setFoldersLoading] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [fileCategory, setFileCategory] = useState("all");
  const [uploaderFilter, setUploaderFilter] = useState("all");
  // Super Admin section scope: "my", "all", or a user ID.
  const [sectionFilter, setSectionFilter] = useState("my");
  const [activeOwnerId, setActiveOwnerId] = useState(user?.id ?? null);

  const selectedOwnerId = useMemo(() => {
    if (!isSuperAdmin) return user?.id ?? null;
    if (folderStack.length > 0 && activeOwnerId != null) return Number(activeOwnerId);
    if (sectionFilter === "my") return user?.id ?? null;
    if (sectionFilter === "all") return null;
    return Number(sectionFilter);
  }, [isSuperAdmin, user?.id, folderStack.length, activeOwnerId, sectionFilter]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDestination, setUploadDestination] = useState("root");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const folderId = currentFolderId ?? 0;
      if (isSuperAdmin && sectionFilter === "all" && folderStack.length === 0) {
        // Fetch each owner's root separately so folder assignments never mix.
        const owners = users.length ? users : [{ id: user?.id }];
        const responses = await Promise.all(owners.filter((u) => u?.id != null).map((owner) =>
          fileService.getFiles({ folderId, ownerId: owner.id, ...(uploaderFilter !== "all" ? { uploadedById: uploaderFilter } : {}) })
        ));
        setFiles(responses.flatMap(normalizeFilesResponse));
      } else {
        const ownerId = selectedOwnerId ?? user?.id;
        const params = { folderId, ownerId };
        if (isSuperAdmin && uploaderFilter !== "all") params.uploadedById = uploaderFilter;
        setFiles(normalizeFilesResponse(await fileService.getFiles(params)));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load files. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, sectionFilter, folderStack.length, currentFolderId, selectedOwnerId, uploaderFilter, users, user?.id]);

  const loadFolders = useCallback(async (parentId = null) => {
    setFoldersLoading(true);
    try {
      if (isSuperAdmin && sectionFilter === "all" && folderStack.length === 0) {
        const owners = users.length ? users : [{ id: user?.id }];
        const responses = await Promise.all(owners.filter((u) => u?.id != null).map(async (owner) => {
          const response = await fileService.getFolders(null, owner.id);
          const list = Array.isArray(response) ? response : response?.folders || response?.data || [];
          return list.map((folder) => ({ ...folder, ownerId: folder.ownerId ?? Number(owner.id), ownerName: owner.name || `User ${owner.id}` }));
        }));
        setFolders(responses.flat());
      } else {
        const ownerId = selectedOwnerId ?? user?.id;
        const response = await fileService.getFolders(parentId, ownerId);
        const list = Array.isArray(response) ? response : response?.folders || response?.data || [];
        setFolders(list);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load folders. Please try again.");
    } finally {
      setFoldersLoading(false);
    }
  }, [isSuperAdmin, sectionFilter, folderStack.length, selectedOwnerId, users, user?.id]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  useEffect(() => {
    loadFolders(currentFolderId);
  }, [currentFolderId, loadFolders]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let active = true;
    const loadUsers = async () => {
      try {
        const response = await fileService.getFolderUsers();
        const list = normalizeUsersResponse(response).map((item) => ({ ...item, id: String(item.id) }));
        if (active) setUsers(list);
      } catch (err) {
        // Keep the current section usable if user-list loading fails.
      }
    };
    loadUsers();
    return () => { active = false; };
  }, [isSuperAdmin]);

  const [previewFile, setPreviewFile] = useState(null);
  const [thumbnailUrls, setThumbnailUrls] = useState({});

  // The list endpoint may not include image URLs. Ask the existing view API
  // for a signed/inline URL so image thumbnails can render in the grid.
  useEffect(() => {
    let active = true;

    const loadThumbnails = async () => {
      const mediaFiles = files.filter((file) => {
        const name = getFileName(file);
        const extension = getExtension(name);
        const mimeType = String(
          file?.mimeType || file?.mime_type || file?.contentType || ""
        ).toLowerCase();
        return mimeType.startsWith("image/") ||
          mimeType.startsWith("video/") ||
          ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif", "heic", "mp4", "mov", "avi", "mkv", "webm", "mpeg", "mpg", "m4v", "3gp"].includes(extension);
      });

      const results = await Promise.all(mediaFiles.map(async (file) => {
        const id = getFileId(file);
        if (id == null) return null;

        const existingUrl = file?.thumbnailUrl || file?.thumbnail_url ||
          file?.previewUrl || file?.preview_url || file?.url || file?.fileUrl ||
          file?.file_url || file?.storageUrl || file?.storage_url ||
          file?.publicUrl || file?.public_url;
        if (existingUrl) return [String(id), existingUrl];

        try {
          const response = await fileService.viewFile(id);
          const payload = response?.data || response?.file || response;
          const url = typeof payload === "string" ? payload :
            payload?.url || payload?.viewUrl || payload?.view_url ||
            payload?.signedUrl || payload?.signed_url || payload?.downloadUrl ||
            payload?.download_url;
          return url ? [String(id), url] : null;
        } catch {
          return null;
        }
      }));

      if (active) {
        setThumbnailUrls((previous) => {
          const next = { ...previous };
          results.filter(Boolean).forEach(([id, url]) => { next[id] = url; });
          return next;
        });
      }
    };

    if (files.length) loadThumbnails();
    return () => { active = false; };
  }, [files]);

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif", "heic"];
    const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm", "mpeg", "mpg", "m4v", "3gp"];
    const audioExtensions = ["mp3", "wav", "ogg", "aac", "flac", "m4a", "wma", "opus"];

    return files.filter((file) => {
      const fileName = getFileName(file);
      const name = fileName.toLowerCase();
      const type = getFileType(file).toLowerCase();
      const uploader = getUploaderName(file).toLowerCase();
      const extension = getExtension(fileName);
      const mimeType = String(file?.mimeType || file?.mime_type || file?.contentType || "").toLowerCase();
      const isImage = mimeType.startsWith("image/") || imageExtensions.includes(extension);
      const isVideo = mimeType.startsWith("video/") || videoExtensions.includes(extension);
      const isAudio = mimeType.startsWith("audio/") || audioExtensions.includes(extension);
      const matchesCategory = fileCategory === "all" ||
        (fileCategory === "images" && isImage) ||
        (fileCategory === "videos" && isVideo) ||
        (fileCategory === "audio" && isAudio) ||
        (fileCategory === "files" && !isImage && !isVideo && !isAudio);

      return matchesCategory && (!query || name.includes(query) || type.includes(query) || uploader.includes(query));
    });
  }, [files, search, fileCategory]);

  const categoryCounts = useMemo(() => {
    const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif", "heic"];
    const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm", "mpeg", "mpg", "m4v", "3gp"];
    const audioExtensions = ["mp3", "wav", "ogg", "aac", "flac", "m4a", "wma", "opus"];

    const counts = { all: files.length, audio: 0, videos: 0, images: 0, files: 0 };

    files.forEach((file) => {
      const extension = getExtension(getFileName(file));
      const mimeType = String(file?.mimeType || file?.mime_type || file?.contentType || "").toLowerCase();
      const isImage = mimeType.startsWith("image/") || imageExtensions.includes(extension);
      const isVideo = mimeType.startsWith("video/") || videoExtensions.includes(extension);
      const isAudio = mimeType.startsWith("audio/") || audioExtensions.includes(extension);

      if (isImage) counts.images += 1;
      else if (isVideo) counts.videos += 1;
      else if (isAudio) counts.audio += 1;
      else counts.files += 1;
    });

    return counts;
  }, [files]);

  const totalStorage = useMemo(
    () => files.reduce((total, file) => total + getFileSize(file), 0),
    [files]
  );

  const handleFileSelection = (fileList) => {
    clearMessages();

    const incomingFiles = Array.from(fileList || []);

    if (incomingFiles.length === 0) return;

    const validFiles = [];
    const rejectedFiles = [];

    incomingFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        rejectedFiles.push(`${file.name} exceeds 25 MB`);
      } else {
        validFiles.push(file);
      }
    });

    if (rejectedFiles.length > 0) {
      setError(rejectedFiles.join(". "));
    }

    if (validFiles.length > 0) {
      setSelectedFiles((previous) => [...previous, ...validFiles]);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || uploading) return;

    clearMessages();
    setUploading(true);
    const failedUploads = [];
    const failedNames = new Set();
    let uploadedCount = 0;

    try {
      for (const file of selectedFiles) {
        try {
          const response = await fileService.uploadFile(file);
          const uploadedFile = response?.file || response?.data || response;
          const uploadedId = getFileId(uploadedFile);

          if (isSuperAdmin && uploadDestination !== "root") {
            if (uploadedId == null) {
              throw new Error("Upload succeeded, but the server did not return the file ID needed to place it in the selected folder.");
            }
            await fileService.moveFile(uploadedId, Number(uploadDestination), selectedOwnerId ?? user?.id);
          }
          uploadedCount += 1;
        } catch (err) {
          failedNames.add(file.name);
          failedUploads.push(`${file.name}: ${err.response?.data?.message || err.message || "Upload failed"}`);
        }
      }

      if (uploadedCount > 0) {
        setSuccess(`${uploadedCount} file${uploadedCount > 1 ? "s" : ""} uploaded successfully.`);
      }
      if (failedUploads.length > 0) setError(failedUploads.join("\n"));

      if (uploadedCount > 0) {
        setSelectedFiles((previous) => previous.filter((file) => failedNames.has(file.name)));
        setShowUploadModal(false);
        await loadFiles();
        if (isSuperAdmin) await loadFolders(currentFolderId);
      } else if (failedUploads.length === 0) {
        setError("No files were uploaded.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file) => {
    const id = getFileId(file);

    if (id == null) {
      setError("Unable to identify this file.");
      return;
    }

    clearMessages();
    setDownloadingId(id);

    try {
      const response = await fileService.downloadFile(id);

      const downloadUrl =
        typeof response === "string"
          ? response
          : response?.url ||
          response?.downloadUrl ||
          response?.download_url ||
          response?.signedUrl;

      if (!downloadUrl) {
        throw new Error("The server did not return a download URL.");
      }

      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = getFileName(file);
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to download this file."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDelete = (file) => {
    setFileToDelete(file);
    setShowDeleteModal(true);
    clearMessages();
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;

    const id = getFileId(fileToDelete);

    if (id == null) {
      setError("Unable to identify this file.");
      return;
    }

    setDeletingId(id);
    clearMessages();

    try {
      await fileService.deleteFile(id);

      setFiles((previous) =>
        previous.filter((file) => String(getFileId(file)) !== String(id))
      );

      setSuccess(`"${getFileName(fileToDelete)}" was deleted successfully.`);
      setShowDeleteModal(false);
      setFileToDelete(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete this file. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateFolder = async () => {
    const name = window.prompt("Enter folder name:");
    if (!name?.trim()) return;
    clearMessages();
    try {
      await fileService.createFolder(name.trim(), currentFolderId, selectedOwnerId ?? user?.id);
      setSuccess(`Folder "${name.trim()}" created successfully.`);
      await loadFolders(currentFolderId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create folder.");
    }
  };

  const handleRenameFolder = async (folder) => {
    const name = window.prompt("Enter the new folder name:", folder.name);
    if (!name?.trim() || name.trim() === folder.name) return;
    clearMessages();
    try {
      await fileService.renameFolder(folder.id, name.trim(), folder.ownerId ?? selectedOwnerId ?? user?.id);
      setSuccess("Folder renamed successfully.");
      await loadFolders(currentFolderId);
      setFolderStack((previous) =>
        previous.map((item) =>
          String(item.id) === String(folder.id)
            ? { ...item, name: name.trim() }
            : item
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to rename folder.");
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (!window.confirm(
      `Delete folder "${folder.name}"? Files themselves will not be deleted.`
    )) return;
    clearMessages();
    try {
      await fileService.deleteFolder(folder.id, folder.ownerId ?? selectedOwnerId ?? user?.id);
      setSuccess(`Folder "${folder.name}" deleted successfully.`);
      await loadFolders(currentFolderId);
      await loadFiles();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete folder.");
    }
  };

  const handleMoveFile = async (file, destinationId) => {
    const id = getFileId(file);
    if (id == null) return;
    clearMessages();
    try {
      if (destinationId === "root") {
        await fileService.moveFileToRoot(id, selectedOwnerId ?? user?.id);
      } else {
        await fileService.moveFile(id, Number(destinationId), selectedOwnerId ?? user?.id);
      }
      setSuccess(`"${getFileName(file)}" moved successfully.`);
      await loadFiles();
      await loadFolders(currentFolderId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to move file.");
    }
  };

  const handleRefresh = () => {
    clearMessages();
    loadFiles();
    if (isSuperAdmin) loadFolders(currentFolderId);
  };

  return (
    <div className="min-h-full space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              <HardDrive size={22} />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              File Management
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Your Files
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Upload, organize, download and manage your documents.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:self-auto"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">{error}</div>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 rounded-lg p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">{success}</div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="shrink-0 rounded-lg p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            aria-label="Dismiss success"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Simple upload button */}
      <section className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upload Files</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose where the files should be saved.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setUploadDestination(isSuperAdmin && currentFolderId != null ? String(currentFolderId) : "root");
            setShowUploadModal(true);
          }}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        >
          <UploadCloud size={18} /> Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            handleFileSelection(event.target.files);
            event.target.value = "";
          }}
        />
      </section>

      {/* Folder explorer is available to every user; ownership is enforced by the backend. */}
      {(
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <FolderOpen size={20} className="text-indigo-600" />
                Folder Explorer
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Organize folders in your section or browse other users as Super Admin.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateFolder}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <FolderPlus size={17} />
              New Folder
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setFolderStack([]); setActiveOwnerId(sectionFilter === "my" ? user?.id : sectionFilter === "all" ? null : Number(sectionFilter)); }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                folderStack.length === 0
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Home size={15} /> Root
            </button>
            {folderStack.map((folder, index) => (
              <span key={folder.id} className="flex items-center gap-2">
                <ChevronRight size={15} className="text-slate-400" />
                <button
                  type="button"
                  onClick={() => setFolderStack((previous) => previous.slice(0, index + 1))}
                  className={`rounded-lg px-2 py-1.5 text-sm font-semibold ${
                    index === folderStack.length - 1
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {folder.name}
                </button>
              </span>
            ))}
          </div>

          {foldersLoading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
              <RefreshCw size={16} className="animate-spin" /> Loading folders...
            </div>
          ) : folders.length === 0 ? (
            <div className="p-8 text-center">
              <Folder size={30} className="mx-auto text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                No folders here yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Create a folder to start organizing files.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/5"
                >
                  <button
                    type="button"
                    onClick={() => { if (isSuperAdmin && sectionFilter === "all" && folderStack.length === 0) setActiveOwnerId(Number(folder.ownerId)); setFolderStack((previous) => [...previous, folder]); }}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                      <Folder size={21} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {folder.name}
                      </span>
                      {isSuperAdmin && sectionFilter === "all" && folderStack.length === 0 && (
                        <span className="mt-0.5 block truncate text-xs text-indigo-600 dark:text-indigo-300">
                          {folder.ownerName || `User ${folder.ownerId}`}
                        </span>
                      )}
                      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                        {folder._count?.children ?? 0} subfolders · {folder._count?.assignments ?? 0} files
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    title="Rename folder"
                    onClick={() => handleRenameFolder(folder)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-indigo-600 dark:hover:bg-slate-800"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    title="Delete folder"
                    onClick={() => handleDeleteFolder(folder)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Files table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                File Library
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isSuperAdmin
                  ? "Browse files in the selected section."
                  : "Manage files uploaded by your account."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:min-w-64">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search files..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />
              </div>

              {isSuperAdmin && (
                <select
                  value={sectionFilter}
                  onChange={(event) => {
                    setSectionFilter(event.target.value);
                    setFolderStack([]);
                    setActiveOwnerId(event.target.value === "my" ? user?.id : event.target.value === "all" ? null : Number(event.target.value));
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  aria-label="Select folder section"
                >
                  <option value="my">My Section</option>
                  <option value="all">All Users</option>
                  {users.filter((item) => String(item.id) !== String(user?.id)).map((item) => (
                    <option key={item.id} value={item.id}>{item.name || item.email || `User ${item.id}`}</option>
                  ))}
                </select>
              )}

              {isSuperAdmin && (
                <select
                  value={uploaderFilter}
                  onChange={(event) => setUploaderFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  aria-label="Filter files by uploader"
                >
                  <option value="all">All uploaders</option>

                  {users.map((uploader) => (
                    <option key={uploader.id} value={uploader.id}>
                      {uploader.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          {[
            { id: "all", label: `All files (${categoryCounts.all})`, icon: HardDrive },
            { id: "audio", label: `Audio (${categoryCounts.audio})`, icon: FileAudio },
            { id: "videos", label: `Video (${categoryCounts.videos})`, icon: FileVideo },
            { id: "images", label: `Images (${categoryCounts.images})`, icon: FileImage },
            { id: "files", label: `Files (${categoryCounts.files})`, icon: FileText },
          ].map(({ id, label, icon: CategoryIcon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFileCategory(id)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                fileCategory === id
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <CategoryIcon size={16} />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw
              size={27}
              className="animate-spin text-indigo-500"
            />

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Loading your files...
            </p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <HardDrive size={30} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              {search ? "No matching files" : "No files yet"}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {search
                ? "Try a different search term."
                : "Upload your first file using the upload section above."}
            </p>
          </div>
        ) : (
          <>
            {/* Google Drive-style file grid */}
            <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {filteredFiles.map((file) => {
                const id = getFileId(file);
                const fileName = getFileName(file);
                const extension = getExtension(fileName);
                const mimeType = String(file?.mimeType || file?.mime_type || file?.contentType || "").toLowerCase();
                const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif", "heic"];
                const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm", "mpeg", "mpg", "m4v", "3gp"];
                const isImage = mimeType.startsWith("image/") || imageExtensions.includes(extension);
                const isVideo = mimeType.startsWith("video/") || videoExtensions.includes(extension);
                const Icon = getFileIcon(fileName);
                const thumbnailUrl =
                  file?.thumbnailUrl || file?.thumbnail_url || file?.previewUrl ||
                  file?.preview_url || file?.url || file?.fileUrl || file?.file_url ||
                  file?.storageUrl || file?.storage_url || file?.publicUrl || file?.public_url ||
                  thumbnailUrls[String(id)];

                return (
                  <article
                    key={id}
                    className="group min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewFile(file)}
                      className="relative block w-full overflow-hidden bg-slate-100 text-left dark:bg-slate-800"
                      aria-label={`Preview ${fileName}`}
                    >
                      <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden">
                        {isImage && thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={fileName}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : isVideo && thumbnailUrl ? (
                          <video
                            src={thumbnailUrl}
                            muted
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-slate-400 dark:text-slate-500">
                            <Icon size={42} strokeWidth={1.4} />
                            <span className="text-xs font-semibold uppercase tracking-wide">{extension || "FILE"}</span>
                          </div>
                        )}
                      </div>
                      <span className="absolute right-2 top-2 rounded-lg border border-slate-200/80 bg-white/95 p-2 text-slate-600 shadow-sm transition hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200">
                        <Eye size={16} />
                      </span>
                    </button>

                    <div className="min-w-0 p-3">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100" title={fileName}>
                        {fileName}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatBytes(getFileSize(file))}</span>
                        <span>·</span>
                        <span>{formatDate(getFileDate(file))}</span>
                      </div>
                      {isSuperAdmin && (
                        <p className="mt-1.5 truncate text-xs text-slate-500 dark:text-slate-400" title={getUploaderName(file)}>
                          {getUploaderName(file)}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                        {isSuperAdmin && (
                          <select
                            aria-label={`Move ${fileName} to another folder`}
                            title="Move to another folder"
                            value=""
                            onChange={(event) => {
                              const destination = event.target.value;
                              if (destination) handleMoveFile(file, destination);
                            }}
                            className="max-w-32 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                          >
                            <option value="">Move to...</option>
                            <option value="root">Main folder</option>
                            {folders.map((folder) => (
                              <option key={folder.id} value={String(folder.id)}>
                                {folder.name}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownload(file)}
                          disabled={downloadingId === id}
                          title="Download file"
                          aria-label={`Download ${fileName}`}
                          className="rounded-lg p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-indigo-500/10"
                        >
                          {downloadingId === id ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDelete(file)}
                          title="Delete file"
                          aria-label={`Delete ${fileName}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {!loading && filteredFiles.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Showing {filteredFiles.length} of {files.length} files
          </div>
        )}
      </section>

      {/* Upload destination modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !uploading) setShowUploadModal(false);
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="upload-modal-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="upload-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">Upload files</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a folder (including a subfolder), then select your files. You can also open a subfolder first; it will be selected automatically.</p>
              </div>
              <button type="button" disabled={uploading} onClick={() => setShowUploadModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800" aria-label="Close upload dialog"><X size={19} /></button>
            </div>

            <div className="mt-5">
              <label htmlFor="upload-destination" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Where should these files be uploaded?</label>
              {(isSuperAdmin || folders.length > 0) ? (
                <select id="upload-destination" value={uploadDestination} onChange={(event) => setUploadDestination(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  <option value="root">Main folder (no folder)</option>
                  {currentFolder && <option value={String(currentFolder.id)}>{currentFolder.name} (current folder)</option>}
                  {folders.map((folder) => <option key={folder.id} value={String(folder.id)}>{folder.name}</option>)}
                </select>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">My files (main folder)</div>
              )}
              {folders.length === 0 && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">No folders here yet. Create a folder first, or choose the main folder.</p>}
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
              <input ref={inputRef} type="file" multiple className="hidden" onChange={(event) => { handleFileSelection(event.target.files); event.target.value = ""; }} />
              <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                <UploadCloud size={17} /> {selectedFiles.length ? "Choose more files" : "Choose files"}
              </button>
              <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">Maximum 25 MB per file</p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Selected files ({selectedFiles.length})</p>
                  <button type="button" disabled={uploading} onClick={() => setSelectedFiles([])} className="text-xs font-semibold text-slate-500 hover:text-red-600 disabled:opacity-50">Clear all</button>
                </div>
                <div className="max-h-36 space-y-2 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={`${file.name}-${file.size}-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
                      <FileText size={17} className="shrink-0 text-indigo-500" />
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-200">{file.name}</span>
                      <button type="button" disabled={uploading} onClick={() => removeSelectedFile(index)} className="rounded-md p-1 text-slate-400 hover:text-red-600 disabled:opacity-50" aria-label={`Remove ${file.name}`}><X size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={uploading} onClick={() => setShowUploadModal(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
              <button type="button" onClick={handleUpload} disabled={uploading || selectedFiles.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
                {uploading ? <><RefreshCw size={16} className="animate-spin" /> Uploading...</> : <><UploadCloud size={16} /> Upload {selectedFiles.length || "files"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && fileToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingId) {
              setShowDeleteModal(false);
              setFileToDelete(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-file-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <Trash2 size={23} />
            </div>

            <h2
              id="delete-file-title"
              className="mt-4 text-lg font-bold text-slate-900 dark:text-white"
            >
              Delete this file?
            </h2>

            <p className="mt-2 break-words text-sm leading-6 text-slate-500 dark:text-slate-400">
              You are about to delete{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {getFileName(fileToDelete)}
              </span>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() => {
                  setShowDeleteModal(false);
                  setFileToDelete(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deletingId !== null}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId !== null ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete File
                  </>
                )}
              </button>
            </div>
          </div>
        
        </div>
        
      )}
      <FileViewer
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}