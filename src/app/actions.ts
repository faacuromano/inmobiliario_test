"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function updateLot(id: number, formData: FormData) {
  const price = formData.get("price");
  const status = formData.get("status");
  const slug = formData.get("slug");
  const dimensions = formData.get("dimensions");
  const area = formData.get("area");

  await prisma.lot.update({
    where: { id },
    data: {
      price: price ? Number(price) : undefined,
      status: status ? String(status) : undefined,
      slug: slug ? String(slug) : undefined,
      dimensions: dimensions ? String(dimensions) : undefined,
      area: area ? Number(area) : undefined,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/card/[slug]"); // Revalidate the dynamic pages too
  revalidatePath("/api/lots"); // Revalidate the API endpoint for map data
}

export async function login(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");
  
  if (
    username === process.env.ADMIN_USER && 
    password === process.env.ADMIN_PASSWORD
  ) {
    (await cookies()).set("admin_session", "true", { 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    return { success: true };
  }
  
  return { success: false, error: "Credenciales incorrectas" };
}

export async function logout() {
  (await cookies()).delete("admin_session");
  redirect("/");
}
