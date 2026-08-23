import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ChatFlow database with realistic demo accounts & chats...");

  // Clear existing data
  await prisma.report.deleteMany({});
  await prisma.userBlock.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.messageRead.deleteMany({});
  await prisma.messageDelivery.deleteMany({});
  await prisma.messageReaction.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversationMember.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.userSettings.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Users
  const userAli = await prisma.user.create({
    data: {
      email: "ali@chatflow.app",
      passwordHash,
      role: "USER",
      emailVerified: true,
      profile: {
        create: {
          username: "ali_khan",
          displayName: "Ali Khan",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          bio: "Building cool apps & real-time systems 🚀",
          isOnline: true,
          lastSeen: new Date(),
        },
      },
      settings: {
        create: {
          discoverability: "EVERYONE",
          onlineStatusPrivacy: "EVERYONE",
          lastSeenPrivacy: "EVERYONE",
          profilePicturePrivacy: "EVERYONE",
          readReceiptsEnabled: true,
          typingIndicatorEnabled: true,
          theme: "system",
        },
      },
    },
    include: { profile: true },
  });

  const userSara = await prisma.user.create({
    data: {
      email: "sara@chatflow.app",
      passwordHash,
      role: "USER",
      emailVerified: true,
      profile: {
        create: {
          username: "sara_dev",
          displayName: "Sara Ahmed",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
          bio: "Full-stack developer & open source enthusiast 💻✨",
          isOnline: true,
          lastSeen: new Date(),
        },
      },
      settings: {
        create: {
          discoverability: "EVERYONE",
          onlineStatusPrivacy: "EVERYONE",
          lastSeenPrivacy: "EVERYONE",
          profilePicturePrivacy: "EVERYONE",
          readReceiptsEnabled: true,
          typingIndicatorEnabled: true,
          theme: "dark",
        },
      },
    },
    include: { profile: true },
  });

  const userJohn = await prisma.user.create({
    data: {
      email: "john@chatflow.app",
      passwordHash,
      role: "USER",
      emailVerified: true,
      profile: {
        create: {
          username: "john_doe",
          displayName: "John Doe",
          avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
          bio: "Product Designer & UI/UX explorer 🎨",
          isOnline: false,
          lastSeen: new Date(Date.now() - 1000 * 60 * 25), // 25 min ago
        },
      },
      settings: {
        create: {
          discoverability: "EVERYONE",
          onlineStatusPrivacy: "EVERYONE",
          lastSeenPrivacy: "EVERYONE",
          profilePicturePrivacy: "EVERYONE",
          readReceiptsEnabled: true,
          typingIndicatorEnabled: true,
          theme: "system",
        },
      },
    },
    include: { profile: true },
  });

  const userAlex = await prisma.user.create({
    data: {
      email: "alex@chatflow.app",
      passwordHash,
      role: "USER",
      emailVerified: true,
      profile: {
        create: {
          username: "alex_designer",
          displayName: "Alex Rivera",
          avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80",
          bio: "Creative Lead & Visual Architect ⚡",
          isOnline: false,
          lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3h ago
        },
      },
      settings: {
        create: {
          discoverability: "EVERYONE",
          onlineStatusPrivacy: "EVERYONE",
          lastSeenPrivacy: "EVERYONE",
          profilePicturePrivacy: "EVERYONE",
          readReceiptsEnabled: true,
          typingIndicatorEnabled: true,
          theme: "system",
        },
      },
    },
    include: { profile: true },
  });

  const userAdmin = await prisma.user.create({
    data: {
      email: "admin@chatflow.app",
      passwordHash,
      role: "ADMIN",
      emailVerified: true,
      profile: {
        create: {
          username: "admin_user",
          displayName: "ChatFlow Security & Admin",
          avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
          bio: "Official System Administrator & Trust/Safety 🛡️",
          isOnline: true,
          lastSeen: new Date(),
        },
      },
      settings: {
        create: {
          discoverability: "EVERYONE",
          onlineStatusPrivacy: "EVERYONE",
          lastSeenPrivacy: "EVERYONE",
          profilePicturePrivacy: "EVERYONE",
          readReceiptsEnabled: true,
          typingIndicatorEnabled: true,
          theme: "dark",
        },
      },
    },
    include: { profile: true },
  });

  console.log("✅ Created 5 sample users (Ali, Sara, John, Alex, Admin)");

  // 2. Create 1-on-1 Conversation between Ali and Sara
  const convAliSara = await prisma.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [
          { userId: userAli.id, role: "MEMBER" },
          { userId: userSara.id, role: "MEMBER" },
        ],
      },
    },
  });

  const msg1 = await prisma.message.create({
    data: {
      conversationId: convAliSara.id,
      senderId: userSara.id,
      content: "Hey Ali! Welcome to ChatFlow 👋 Have you checked out the username discovery system?",
      type: "TEXT",
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
    },
  });

  const msg2 = await prisma.message.create({
    data: {
      conversationId: convAliSara.id,
      senderId: userAli.id,
      content: "Hey Sara! Yes, finding people with `@username` without giving out phone numbers is so refreshing!",
      type: "TEXT",
      replyToId: msg1.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
    },
  });

  // Reaction to msg2
  await prisma.messageReaction.create({
    data: {
      messageId: msg2.id,
      userId: userSara.id,
      emoji: "❤️",
    },
  });

  const msg3 = await prisma.message.create({
    data: {
      conversationId: convAliSara.id,
      senderId: userSara.id,
      content: "Here is a preview of the new dashboard mockup I was working on:",
      type: "IMAGE",
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      attachments: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
            fileName: "chatflow_preview.jpg",
            fileType: "image/jpeg",
            fileSize: 245000,
          },
        ],
      },
    },
  });

  await prisma.messageReaction.create({
    data: {
      messageId: msg3.id,
      userId: userAli.id,
      emoji: "👍",
    },
  });

  const msg4 = await prisma.message.create({
    data: {
      conversationId: convAliSara.id,
      senderId: userAli.id,
      content: "Looks stunning! The real-time messaging and voice notes work super fast.",
      type: "TEXT",
      createdAt: new Date(Date.now() - 1000 * 60 * 1),
    },
  });

  // 3. Create 1-on-1 Conversation between Ali and John
  const convAliJohn = await prisma.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [
          { userId: userAli.id, role: "MEMBER" },
          { userId: userJohn.id, role: "MEMBER" },
        ],
      },
    },
  });

  await prisma.message.create({
    data: {
      conversationId: convAliJohn.id,
      senderId: userJohn.id,
      content: "Hi Ali! Let's review the new design system when you have a moment.",
      type: "TEXT",
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  });

  // 4. Create Group Conversation: "ChatFlow Core Team"
  const groupTeam = await prisma.conversation.create({
    data: {
      isGroup: true,
      name: "ChatFlow Core Team 🚀",
      description: "Official channel for product development, design updates, and announcements.",
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80",
      ownerId: userAli.id,
      members: {
        create: [
          { userId: userAli.id, role: "OWNER" },
          { userId: userSara.id, role: "ADMIN" },
          { userId: userJohn.id, role: "MEMBER" },
          { userId: userAlex.id, role: "MEMBER" },
        ],
      },
    },
  });

  await prisma.message.create({
    data: {
      conversationId: groupTeam.id,
      senderId: userAli.id,
      content: "Welcome everyone to ChatFlow Core Team! Feel free to share updates and collaborate in real-time.",
      type: "TEXT",
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: groupTeam.id,
      senderId: userSara.id,
      content: "Excited to be here! Real-time typing indicators and notifications are all working smoothly.",
      type: "TEXT",
      createdAt: new Date(Date.now() - 1000 * 60 * 12),
    },
  });

  // 5. Create Sample Notifications
  await prisma.notification.create({
    data: {
      userId: userAli.id,
      actorId: userSara.id,
      type: "MESSAGE",
      title: "Sara Ahmed (@sara_dev)",
      content: "Looks stunning! The real-time messaging...",
      isRead: false,
      dataJson: JSON.stringify({ conversationId: convAliSara.id }),
    },
  });

  await prisma.notification.create({
    data: {
      userId: userAli.id,
      actorId: userSara.id,
      type: "REACTION",
      title: "Reaction on message",
      content: "Sara reacted with ❤️ to your message",
      isRead: true,
      dataJson: JSON.stringify({ conversationId: convAliSara.id }),
    },
  });

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
