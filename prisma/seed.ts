import "dotenv/config";
import { PrismaClient, TransactionType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "DATABASE_URL is not set. Add your Supabase connection string to .env before seeding.",
  );
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEFAULT_USER_EMAIL = "owner@finance-tracker.local";

const EXPENSE_CATEGORIES = [
  "Groceries",
  "Rent",
  "Dining",
  "Transport",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Health",
];

const INCOME_CATEGORIES = ["Salary", "Freelance", "Interest", "Other Income"];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: { email: DEFAULT_USER_EMAIL, name: "Owner" },
  });

  const presets: Array<{ name: string; type: TransactionType }> = [
    ...EXPENSE_CATEGORIES.map((name) => ({
      name,
      type: TransactionType.EXPENSE,
    })),
    ...INCOME_CATEGORIES.map((name) => ({
      name,
      type: TransactionType.INCOME,
    })),
  ];

  for (const preset of presets) {
    await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: preset.name,
          type: preset.type,
        },
      },
      update: {},
      create: { ...preset, isPreset: true, userId: user.id },
    });
  }

  // Add a little sample data only if the account is empty, so the dashboard
  // shows something on first run.
  const existing = await prisma.transaction.count({ where: { userId: user.id } });
  if (existing === 0) {
    const categories = await prisma.category.findMany({
      where: { userId: user.id },
    });
    const idFor = (name: string) => categories.find((c) => c.name === name)?.id;

    const now = new Date();
    const day = (d: number) =>
      new Date(Date.UTC(now.getFullYear(), now.getMonth(), d));

    await prisma.transaction.createMany({
      data: [
        {
          userId: user.id,
          amount: "3200.00",
          description: "Monthly paycheck",
          type: TransactionType.INCOME,
          categoryId: idFor("Salary"),
          occurredAt: day(1),
        },
        {
          userId: user.id,
          amount: "1450.00",
          description: "Apartment rent",
          type: TransactionType.EXPENSE,
          categoryId: idFor("Rent"),
          occurredAt: day(2),
        },
        {
          userId: user.id,
          amount: "86.40",
          description: "Weekly groceries",
          type: TransactionType.EXPENSE,
          categoryId: idFor("Groceries"),
          occurredAt: day(4),
        },
        {
          userId: user.id,
          amount: "24.75",
          description: "Dinner out",
          type: TransactionType.EXPENSE,
          categoryId: idFor("Dining"),
          occurredAt: day(6),
        },
        {
          userId: user.id,
          amount: "60.00",
          description: "Monthly transit pass",
          type: TransactionType.EXPENSE,
          categoryId: idFor("Transport"),
          occurredAt: day(7),
        },
      ],
    });
  }

  console.log(`Seeded user ${user.email} with ${presets.length} categories.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
