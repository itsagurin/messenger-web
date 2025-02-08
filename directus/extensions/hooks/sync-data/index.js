export default ({ schedule, services }) => {
  const { ItemsService } = services;

  const syncData = async () => {
    try {
      const axios = require('axios');

      const usersService = new ItemsService('users', { schema: services.schema });
      const messagesService = new ItemsService('messages', { schema: services.schema });
      const subscriptionsService = new ItemsService('subscriptions', { schema: services.schema });

      const [usersResponse, messagesResponse, subscriptionsResponse] = await Promise.all([
        axios.get('http://backend:4000/auth/users'),
        axios.get('http://backend:4000/messages/all'),
        axios.get('http://backend:4000/payment/subscriptions')
      ]);

      for (const user of usersResponse.data) {
        await usersService.upsertOne({
          id: user.userId,
          email: user.email,
          created_at: user.createdAt
        });
      }

      for (const message of messagesResponse.data) {
        await messagesService.upsertOne({
          id: message.id,
          sender_id: message.senderId,
          receiver_id: message.receiverId,
          content: message.content,
          read: message.read,
          created_at: message.createdAt
        });
      }

      for (const sub of subscriptionsResponse.data) {
        await subscriptionsService.upsertOne({
          id: sub.id,
          user_id: sub.userId,
          plan_type: sub.planType,
          status: sub.status,
          created_at: sub.createdAt,
          expires_at: sub.expiresAt
        });
      }

    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  schedule('*/5 * * * *', syncData);
};