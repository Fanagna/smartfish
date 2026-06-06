import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefresh } from "../../lib/jwt";
import { HttpError } from "../../middleware/error";

function tokenPayload(u: { id: string; email: string; role: string }) {
  return { sub: u.id, email: u.email, role: u.role };
}

function publicUser(u: { id: string; email: string; fullName: string; role: string; avatarUrl: string | null }) {
  return { id: u.id, email: u.email, fullName: u.fullName, role: u.role, avatarUrl: u.avatarUrl };
}

export const authService = {
  async register(input: { email: string; password: string; fullName: string; role?: any }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new HttpError(409, "Email already registered");
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: { email: input.email, passwordHash, fullName: input.fullName, role: input.role ?? "OPERATOR" },
    });
    return this.issueTokens(user);
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, "Invalid credentials");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");
    return this.issueTokens(user);
  },

  async refresh(refreshToken: string) {
    let payload;
    try { payload = verifyRefresh(refreshToken); }
    catch { throw new HttpError(401, "Invalid refresh token"); }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) throw new HttpError(401, "Refresh token expired");

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new HttpError(401, "User not found");

    await prisma.refreshToken.delete({ where: { token: refreshToken } }).catch(() => {});
    return this.issueTokens(user);
  },

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(404, "User not found");
    return publicUser(user);
  },

  async issueTokens(user: { id: string; email: string; role: string; fullName: string; avatarUrl: string | null }) {
    const token = signAccessToken(tokenPayload(user));
    const refreshToken = signRefreshToken(tokenPayload(user));
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });
    return { user: publicUser(user), token, refreshToken };
  },
};
