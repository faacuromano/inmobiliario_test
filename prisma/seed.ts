import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");
  
  const lots = [
    {
      slug: "lote-1",
      number: "1",
      price: 15000,
      currency: "USD",
      status: "AVAILABLE",
      dimensions: "10m x 30m",
      area: 300,
      description: "Excelente lote cerca de la entrada principal con orientación Norte.",
    },
    {
      slug: "lote-2",
      number: "2",
      price: 18000,
      currency: "USD",
      status: "RESERVED",
      dimensions: "12m x 30m",
      area: 360,
      description: "Lote amplio con vista al parque central.",
    },
    {
      slug: "lote-3",
      number: "3",
      price: 12000,
      currency: "USD",
      status: "SOLD",
      dimensions: "10m x 25m",
      area: 250,
      description: "Oportunidad de inversión.",
    },
  ];

  for (const lot of lots) {
    const user = await prisma.lot.upsert({
      where: { slug: lot.slug },
      update: {},
      create: {
        slug: lot.slug,
        number: lot.number,
        price: lot.price,
        currency: lot.currency,
        status: lot.status as any,
        dimensions: lot.dimensions,
        area: lot.area,
        description: lot.description,
      },
    });
    console.log(`Created lot with id: ${user.id}`);
  }
  
  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
