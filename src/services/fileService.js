import api from "./api";

const withOwner = (params = {}, ownerId) => {
  const next = { ...params };

  if (
    ownerId !== undefined &&
    ownerId !== null &&
    ownerId !== ""
  ) {
    next.ownerId = ownerId;
  }

  return next;
};

const fileService = {
  // =========================
  // UPLOAD FILE
  // =========================
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      "/files/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  // =========================
  // GET FILES
  // =========================
  getFiles: async (params = {}) => {
    const response = await api.get("/files", {
      params,
    });

    return response.data;
  },

  // =========================
  // GET USERS FOR FOLDER SECTION
  // =========================
  getFolderUsers: async () => {
    const response = await api.get(
      "/files/folder-users"
    );

    return response.data;
  },

  // =========================
  // VIEW FILE
  // =========================
  viewFile: async (id) => {
    const response = await api.get(
      `/files/${id}/view`
    );

    return response.data;
  },

  // =========================
  // DOWNLOAD FILE
  // =========================
  downloadFile: async (id) => {
    const response = await api.get(
      `/files/${id}/download`
    );

    return response.data;
  },

  // =========================
  // DELETE FILE
  // =========================
  deleteFile: async (id) => {
    const response = await api.delete(
      `/files/${id}`
    );

    return response.data;
  },

  // =========================
  // GET FOLDERS
  // =========================
  getFolders: async (
    parentId = null,
    ownerId
  ) => {
    const params = withOwner({}, ownerId);

    if (
      parentId !== null &&
      parentId !== undefined
    ) {
      params.parentId = parentId;
    }

    const response = await api.get(
      "/files/folders",
      { params }
    );

    return response.data;
  },

  // =========================
  // CREATE FOLDER
  // =========================
  createFolder: async (
    name,
    parentId = null,
    ownerId
  ) => {
    const params = withOwner({}, ownerId);

    const response = await api.post(
      "/files/folders",
      {
        name,
        parentId,
      },
      { params }
    );

    return response.data;
  },

  // =========================
  // RENAME FOLDER
  // =========================
  renameFolder: async (
    id,
    name,
    ownerId
  ) => {
    const response = await api.patch(
      `/files/folders/${id}`,
      { name },
      {
        params: withOwner({}, ownerId),
      }
    );

    return response.data;
  },

  // =========================
  // DELETE FOLDER
  // =========================
  deleteFolder: async (
    id,
    ownerId
  ) => {
    const response = await api.delete(
      `/files/folders/${id}`,
      {
        params: withOwner({}, ownerId),
      }
    );

    return response.data;
  },

  // =========================
  // MOVE FILE TO FOLDER
  // =========================
  moveFile: async (
    fileId,
    folderId,
    ownerId
  ) => {
    const response = await api.patch(
      `/files/${fileId}/folder`,
      { folderId },
      {
        params: withOwner({}, ownerId),
      }
    );

    return response.data;
  },

  // =========================
  // MOVE FILE TO ROOT
  // =========================
  moveFileToRoot: async (
    fileId,
    ownerId
  ) => {
    const response = await api.patch(
      `/files/${fileId}/folder`,
      { folderId: null },
      {
        params: withOwner({}, ownerId),
      }
    );

    return response.data;
  },
};

export default fileService;