import {z} from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "CLINIC",
    "PHARMACY",
    "HOME_HEALTH",
    "NURSING_HOME",
    "TRANSPORTATION",
    "DME",
  ]),
  role: z.enum(["SENDER", "RECEIVER", "BOTH"]),
  contact: z.object({
    email: z.string().email('Invalid Email'),
    phone: z.string().min(10 ,'Invalid Format atleast 10 characters'),
  }),
});
