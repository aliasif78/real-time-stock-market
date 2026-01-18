'use server';

import { connectToDatabase } from '@/database/mongoose';
import Watchlist from '@/database/models/watchlist.model';

export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) throw new Error('Database connection not found');

    const user = await db.collection('user').findOne({ email });

    if (!user) {
      console.warn(`User found not for email: ${email}`);
      return [];
    }

    const userId = user.id || user._id?.toString();

    if (!userId) {
      console.warn(`User ID not found for email: ${email}`);
      return [];
    }

    const watchlistItems = await Watchlist.find({ userId });

    return watchlistItems.map((item) => item.symbol);
  } catch (error) {
    console.error('Error fetching watchlist symbols:', error);
    return [];
  }
};
