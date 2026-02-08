import { Request, Response, NextFunction } from "express";
import { createOrganizationSchema } from "../utils/validation";
import prisma from "../services/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "zod";

export const createOrganization = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = createOrganizationSchema.parse(req.body);

    const organization = await prisma.organization.create({
      data: validatedData,
    });

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: organization,
    });
  },
);

export const getOrganizations = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string)
    const limit = 10
    const totalCount = await prisma.organization.count()
    const totalPages =  Math.ceil(totalCount/limit)
    const skip = (page - 1) * totalCount 
    const organizations = await prisma.organization.findMany({
      take: limit,
      skip,
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
      pagination:{
        currentPage : page,
        totalPages,
        totalCount,
        limit,
        skip
      }
    });
  },
);

export const getOrganizationById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const org = await prisma.organization.findUnique({
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
  },
);

export const updateCoverageAreas = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const { coverageAreas } = req.body;
    if (coverageAreas.length === 0 || !Array.isArray(coverageAreas)) {
      return res.status(400).json({
        success: false,
        message: "Coverage Area Not found / is req",
      });
    }
    const orgExists = await prisma.organization.findUnique({ where: { id } });
    if (!orgExists) {
      return res.status(404).json({
        success: false,
        error: "Organization not found",
      });
    }

    await prisma.$transaction([
      prisma.coverageArea.deleteMany({
        where: { organizationId: id },
      }),
      prisma.coverageArea.createMany({
        data: coverageAreas.map((area: any) => ({
          state: area.state,
          county: area.county || null,
          city: area.city || null,
          zipCode: area.zipCode || null,
          organizationId: id,
        })),
      }),
    ]);

    const updatedOrg = await prisma.organization.findUnique({
      where: { id },
      include: { coverageAreas: true },
    });

    return res.json({
      success: true,
      message: "Coverage updated successfully",
      data: updatedOrg,
    });
  },
);

export const updateOrganization = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const { name, type, role, contact } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (role) updateData.role = role;
    if (contact) updateData.contact = contact;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    const organization = await prisma.organization.update({
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
  }
);

export const deleteOrganization = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const org = await prisma.organization.findUnique({
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

    await prisma.organization.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  }
);