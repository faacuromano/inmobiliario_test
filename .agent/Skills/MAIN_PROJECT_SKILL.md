---
name: project-loteo-specs
description: Technical specification and execution plan for the Loteo 3D Real Estate project.
---

# Project Specification: Loteo 3D

## 1. System Architecture

### A. Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Vercel Postgres
- **ORM:** Prisma
- **Language:** TypeScript
- **Deployment:** Vercel

### B. Database Schema (Prisma)

Use this exact schema as the foundation.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

generator client {
  provider = "prisma-client-js"
}

enum LotStatus {
  AVAILABLE
  RESERVED
  SOLD
}

model Lot {
  id          Int       @id @default(autoincrement())
  slug        String    @unique // e.g., "lote-12", used in Panoee links
  number      String    // Visual number "12"
  price       Decimal   @db.Decimal(10, 2)
  currency    String    @default("USD")
  status      LotStatus @default(AVAILABLE)
  dimensions  String    // "12m x 30m"
  area        Int       // m2
  description String?   @db.Text
  imageUrl    String?   // Render or photo of the specific view

  updatedAt   DateTime  @updatedAt
}
```
