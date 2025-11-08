import express from "express";
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "../controllers/documentController.js";
import { protectHR } from "../middlewares/authMiddleware.js";

const documentRouter = express.Router();

// Protect all routes
documentRouter.use(protectHR);

documentRouter.post("/", createDocument);
documentRouter.get("/", getDocuments);
documentRouter.get("/:id", getDocumentById);
documentRouter.put("/:id", updateDocument);
documentRouter.delete("/:id", deleteDocument);

export default documentRouter;
