import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateCoverageAreas,
  updateOrganization,
  deleteOrganization,
} from "../controllers/organizationController";

const router = Router();

router.post("/", authenticate, createOrganization);
router.get("/", authenticate, getOrganizations);
router.get("/:id", authenticate, getOrganizationById);
router.put("/:id/coverage", authenticate, updateCoverageAreas);
router.patch("/:id", authenticate, updateOrganization);
router.delete("/:id", authenticate, deleteOrganization);

export default router;
