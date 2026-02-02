import { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma";
import { asyncHandler } from "../utils/asyncHandler";

export const createReferral = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { senderOrgId, receiverOrgId, patientName, insuranceNumber, notes } =
      req.body;

    if (!senderOrgId || !receiverOrgId || !patientName || !insuranceNumber) {
      return res.status(400).json({
        success: false,
        error:
          "senderOrgId, receiverOrgId, patientName, and insuranceNumber are required",
      });
    }

    const [sender, receiver] = await Promise.all([
      prisma.organization.findUnique({ where: { id: senderOrgId } }),
      prisma.organization.findUnique({ where: { id: receiverOrgId } }),
    ]);

    if (!sender) {
      return res.status(404).json({
        success: false,
        error: "Sender organization not found",
      });
    }

    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: "Receiver organization not found",
      });
    }

    if (sender.role === "RECEIVER") {
      return res.status(400).json({
        success: false,
        error: "Sender organization cannot send referrals (role is RECEIVER)",
      });
    }

    if (receiver.role === "SENDER") {
      return res.status(400).json({
        success: false,
        error:
          "Receiver organization cannot receive referrals (role is SENDER)",
      });
    }

    const referral = await prisma.referral.create({
      data: {
        senderOrgId,
        receiverOrgId,
        patientName,
        insuranceNumber,
        notes: notes || null,
      },
      include: {
        senderOrg: true,
        receiverOrg: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Referral created successfully",
      data: referral,
    });
  },
);
export const getReferrals = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { senderOrgId, receiverOrgId, status } = req.query;

    const referral = await prisma.referral.findMany({
      where: {
        ...(senderOrgId && { senderOrgId: senderOrgId as string }),
        ...(receiverOrgId && { receiverOrgId: receiverOrgId as string }),
        ...(status && { status: status as any }),
      },
      include: {
        senderOrg: true,
        receiverOrg: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      message: "Refs fetched successfully",
      data: referral,
      count: referral.length,
    });
  },
);
export const updateReferralStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    const validStatuses = ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const referral = await prisma.referral.update({
      where: { id },
      data: { status },
      include: {
        senderOrg: true,
        receiverOrg: true,
      },
    });

    res.json({
      success: true,
      message: "Referral status updated successfully",
      data: referral,
    });
  },
);
