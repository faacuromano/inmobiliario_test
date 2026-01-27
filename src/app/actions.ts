"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
}
