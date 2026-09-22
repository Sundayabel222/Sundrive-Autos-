"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";
import {
  fieldErrors,
  formDataToObject,
  loginSchema,
  type ActionState,
} from "@/lib/validation";

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Enter your email and password.",
      errors: fieldErrors(parsed.error),
    };
  }

  const email = parsed.data.email.trim().toLowerCase();

  const user = await prisma.adminUser.findUnique({ where: { email } });

  // Hash a throwaway value when the user is unknown so the response time
  // doesn't reveal whether an account exists.
  const hash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
  const valid = await verifyPassword(parsed.data.password, hash);

  if (!user || !valid) {
    return { ok: false, message: "Incorrect email or password." };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  // The proxy records where the visitor was headed, so signing in can drop them
  // straight back there. Only same-site /admin paths are honoured.
  const requested = formData.get("next");
  const target =
    typeof requested === "string" && /^\/admin(\/|\?|$)/.test(requested) ? requested : "/admin";

  // `redirect` throws internally, so it must sit outside any try/catch.
  redirect(target);
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
