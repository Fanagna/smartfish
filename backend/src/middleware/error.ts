import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: "Resource not found" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: "Validation error", issues: err.issues });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return res.status(409).json({ message: "Conflict: duplicate value" });
    if (err.code === "P2025") return res.status(404).json({ message: "Resource not found" });
    return res.status(400).json({ message: err.message, code: err.code });
  }
  if (err instanceof Error) {
    const status = (err as any).status ?? 500;
    return res.status(status).json({ message: err.message });
  }
  return res.status(500).json({ message: "Internal server error" });
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
