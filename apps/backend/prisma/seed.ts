import { PrismaClient, PlanType, SubStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const users = [
  { email: 'alex@example.com', password: 'alex' },
  { email: 'artem@example.com', password: 'artem' },
  { email: 'mike@example.com', password: 'mike' },
  { email: 'kate@example.com', password: 'kate' },
  { email: 'adam@example.com', password: 'adam' },
  { email: 'james@example.com', password: 'james' },
  { email: 'richard@example.com', password: 'richard' },
];

const subscriptionTypes = [
  { email: 'alex@example.com', planType: PlanType.BASIC },
  { email: 'artem@example.com', planType: PlanType.BASIC },
  { email: 'mike@example.com', planType: PlanType.BASIC },
  { email: 'kate@example.com', planType: PlanType.BASIC },
  { email: 'adam@example.com', planType: PlanType.BASIC },
  { email: 'james@example.com', planType: PlanType.BASIC },
  { email: 'richard@example.com', planType: PlanType.BASIC },
];

const messages = [
  { senderEmail: 'alex@example.com', receiverEmail: 'artem@example.com', text: 'Hey, how are you?' },
  { senderEmail: 'artem@example.com', receiverEmail: 'alex@example.com', text: 'I\'m good, thanks! How about you?' },
  { senderEmail: 'alex@example.com', receiverEmail: 'mike@example.com', text: 'Did you see the new feature?' },
  { senderEmail: 'mike@example.com', receiverEmail: 'alex@example.com', text: 'Yes, it\'s awesome!' },
  { senderEmail: 'kate@example.com', receiverEmail: 'adam@example.com', text: 'When is the meeting?' },
  { senderEmail: 'adam@example.com', receiverEmail: 'kate@example.com', text: 'Tomorrow at 2 PM' },
];

async function main() {
  console.log('Checking if database is empty...');

  const userCount = await prisma.user.count();

  if (userCount > 0) {
    console.log('Database already has users. Skipping seed.');
    return;
  }

  console.log('Database is empty. Starting to seed...');

  const createdUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return prisma.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
        },
      });
    })
  );

  console.log(`Created ${createdUsers.length} users`);

  for (const sub of subscriptionTypes) {
    const user = await prisma.user.findUnique({
      where: { email: sub.email },
    });

    if (user) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planType: sub.planType,
          status: SubStatus.ACTIVE,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      });
    }
  }

  console.log(`Created subscriptions`);

  for (const message of messages) {
    const sender = await prisma.user.findUnique({
      where: { email: message.senderEmail },
    });

    const receiver = await prisma.user.findUnique({
      where: { email: message.receiverEmail },
    });

    if (sender && receiver) {
      await prisma.message.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          text: message.text,
        },
      });
    }
  }

  console.log(`Created messages`);
  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });