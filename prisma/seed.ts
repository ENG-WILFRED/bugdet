import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Users
  const users = await prisma.user.createMany({
    data: [
      { name: 'Wilfred', password: 'wilfred', email: 'wilfred@example.com' },
      { name: 'John', password: 'john', email: 'john@example.com' },
      { name: 'Peter', password: 'peter', email: 'peter@example.com' },
      { name: 'Reuben', password: 'reuben', email: 'reuben@example.com' },
    ],
  });

  // Get users to use in item relations
  const userRecords = await prisma.user.findMany();

  // Create Items (5 samples, distributed among users)
  const sampleItems = [
    {
      name: 'Groceries',
      cost: 50.75,
      comment: 'Weekly shopping',
    },
    {
      name: 'Electricity Bill',
      cost: 120.5,
      comment: 'KPLC August bill',
    },
    {
      name: 'Internet Subscription',
      cost: 35.0,
      comment: 'Monthly WiFi',
    },
    {
      name: 'School Fees',
      cost: 200.0,
      comment: 'Term 3 Payment',
    },
    {
      name: 'Fuel',
      cost: 70.0,
      comment: 'Trip to Nairobi',
    },
  ];

  // Assign each item to a random user
  for (let item of sampleItems) {
    const randomUser = userRecords[Math.floor(Math.random() * userRecords.length)];
    await prisma.item.create({
      data: {
        ...item,
        authorId: randomUser.id,
      },
    });
  }
}

main()
  .then(() => {
    console.log('✅ Seed complete');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
