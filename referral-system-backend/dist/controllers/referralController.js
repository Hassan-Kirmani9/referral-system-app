"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReferralStatus = exports.getReferrals = exports.createReferral = void 0;
const prisma_1 = __importDefault(require("../services/prisma"));
const asyncHandler_1 = require("../utils/asyncHandler");
exports.createReferral = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { senderOrgId, receiverOrgId, patientName, insuranceNumber, notes } = req.body;
    if (!senderOrgId || !receiverOrgId || !patientName || !insuranceNumber) {
        return res.status(400).json({
            success: false,
            error: "senderOrgId, receiverOrgId, patientName, and insuranceNumber are required",
        });
    }
    const [sender, receiver] = await Promise.all([
        prisma_1.default.organization.findUnique({ where: { id: senderOrgId } }),
        prisma_1.default.organization.findUnique({ where: { id: receiverOrgId } }),
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
            error: "Receiver organization cannot receive referrals (role is SENDER)",
        });
    }
    const referral = await prisma_1.default.referral.create({
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
});
exports.getReferrals = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { senderOrgId, receiverOrgId, status } = req.query;
    const referral = await prisma_1.default.referral.findMany({
        where: {
            ...(senderOrgId && { senderOrgId: senderOrgId }),
            ...(receiverOrgId && { receiverOrgId: receiverOrgId }),
            ...(status && { status: status }),
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
});
exports.updateReferralStatus = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const id = req.params.id;
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
    const referral = await prisma_1.default.referral.update({
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
});
