"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrganizationSchema = void 0;
const zod_1 = require("zod");
exports.createOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    type: zod_1.z.enum([
        "CLINIC",
        "PHARMACY",
        "HOME_HEALTH",
        "NURSING_HOME",
        "TRANSPORTATION",
        "DME",
    ]),
    role: zod_1.z.enum(["SENDER", "RECEIVER", "BOTH"]),
    contact: zod_1.z.object({
        email: zod_1.z.string().email('Invalid Email'),
        phone: zod_1.z.string().min(10, 'Invalid Format atleast 10 characters'),
    }),
});
