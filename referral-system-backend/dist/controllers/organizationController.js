"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganization = exports.updateOrganization = exports.updateCoverageAreas = exports.getOrganizationById = exports.getOrganizations = exports.createOrganization = void 0;
const validation_1 = require("../utils/validation");
const prisma_1 = __importDefault(require("../services/prisma"));
const asyncHandler_1 = require("../utils/asyncHandler");
exports.createOrganization = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const validatedData = validation_1.createOrganizationSchema.parse(req.body);
    const organization = await prisma_1.default.organization.create({
        data: validatedData,
    });
    res.status(201).json({
        success: true,
        message: "Organization created successfully",
        data: organization,
    });
});
exports.getOrganizations = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const organizations = await prisma_1.default.organization.findMany({
        include: {
            coverageAreas: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    res.json({
        success: true,
        message: "Organizations fetched successfully",
        data: organizations,
        count: organizations.length,
    });
});
exports.getOrganizationById = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const id = req.params.id;
    const org = await prisma_1.default.organization.findUnique({
        where: { id },
        include: {
            coverageAreas: true,
            sentReferrals: true,
            receivedReferrals: true,
        },
    });
    if (!org) {
        return res.status(404).json({
            success: false,
            error: "Organization not found",
        });
    }
    res.json({
        success: true,
        message: "Organization fetched successfully",
        data: org,
    });
});
exports.updateCoverageAreas = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const id = req.params.id;
    const { coverageAreas } = req.body;
    if (coverageAreas.length === 0 || !Array.isArray(coverageAreas)) {
        return res.status(400).json({
            success: false,
            message: "Coverage Area Not found / is req",
        });
    }
    const orgExists = await prisma_1.default.organization.findUnique({ where: { id } });
    if (!orgExists) {
        return res.status(404).json({
            success: false,
            error: "Organization not found",
        });
    }
    await prisma_1.default.$transaction([
        prisma_1.default.coverageArea.deleteMany({
            where: { organizationId: id },
        }),
        prisma_1.default.coverageArea.createMany({
            data: coverageAreas.map((area) => ({
                state: area.state,
                county: area.county || null,
                city: area.city || null,
                zipCode: area.zipCode || null,
                organizationId: id,
            })),
        }),
    ]);
    const updatedOrg = await prisma_1.default.organization.findUnique({
        where: { id },
        include: { coverageAreas: true },
    });
    return res.json({
        success: true,
        message: "Coverage updated successfully",
        data: updatedOrg,
    });
});
exports.updateOrganization = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const id = req.params.id;
    const { name, type, role, contact } = req.body;
    const updateData = {};
    if (name)
        updateData.name = name;
    if (type)
        updateData.type = type;
    if (role)
        updateData.role = role;
    if (contact)
        updateData.contact = contact;
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
            success: false,
            error: 'No fields to update'
        });
    }
    const organization = await prisma_1.default.organization.update({
        where: { id },
        data: updateData,
        include: {
            coverageAreas: true
        }
    });
    res.json({
        success: true,
        message: 'Organization updated successfully',
        data: organization
    });
});
exports.deleteOrganization = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const id = req.params.id;
    const org = await prisma_1.default.organization.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    sentReferrals: true,
                    receivedReferrals: true
                }
            }
        }
    });
    if (!org) {
        return res.status(404).json({
            success: false,
            error: 'Organization not found'
        });
    }
    const totalReferrals = org._count.sentReferrals + org._count.receivedReferrals;
    if (totalReferrals > 0) {
        return res.status(400).json({
            success: false,
            error: `Cannot delete organization with ${totalReferrals} existing referrals`
        });
    }
    await prisma_1.default.organization.delete({
        where: { id }
    });
    res.json({
        success: true,
        message: 'Organization deleted successfully'
    });
});
