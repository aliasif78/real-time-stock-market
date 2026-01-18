import { getAllUsersForNewsEmail } from '../actions/user.actions';
import { getWatchlistSymbolsByEmail } from '../actions/watchlist.actions';
import { getNews } from '../actions/finnhub.actions';
import { sendNewsSummaryEmail, sendWelcomeEmail } from '../nodemailer';
import { inngest } from './client';
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from './prompts';
import { formatDateToday } from '../utils';

export const sendSignUpEmail = inngest.createFunction({ id: 'sign-up-email' }, { event: 'app/user.created' }, async ({ event, step }) => {
  const userProfile = `
    - Country: ${event.data.country}
    - Investment Goals: ${event.data.investmentGoals}
    - Risk Tolerance: ${event.data.riskTolerance}
    - Preferred Industry: ${event.data.preferredIndustry}
    `;

  const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile);

  const response = await step.ai.infer('generate-welcome-intro', {
    model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
    body: { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
  });

  await step.run('send-welcome-email', async () => {
    const part = response.candidates?.[0]?.content?.parts?.[0];
    const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining Signalist! You now have the tools to track markets and make smarter moves.';

    // Email sending logic here
    const {
      data: { email, name },
    } = event;
    await sendWelcomeEmail({ email, name, intro: introText });

    return { success: true, message: 'Welcome email sent successfully' };
  });
});

export const sendDailyNewsSummary = inngest.createFunction(
  { id: 'daily-news-summary' },
  [{ event: 'app/send.daily.news' }, { cron: '0 12 * * *' }], // 12 PM UTC daily
  async ({ event, step }) => {
    // 1. Get all users for new delivery
    const users = await step.run('get-all-users', getAllUsersForNewsEmail);

    if (!users || !users.length) {
      return { success: false, message: 'No users found for news email' };
    }

    const startResults: { userId: string; status: string; newsCount?: number }[] = [];

    // 2. Process each user sequentially
    for (const user of users) {
      if (!user.email) continue;

      // A. Fetch news
      const news = await step.run(`fetch-news-${user.id}`, async () => {
        const symbols = await getWatchlistSymbolsByEmail(user.email!);
        return await getNews(symbols);
      });

      if (!news || news.length === 0) {
        startResults.push({ userId: user.id, status: 'no-news' });
        continue;
      }

      // B. Summarize news (AI Step)
      const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{news}}', JSON.stringify(news, null, 2));
      const response = await step.ai.infer(`summarize-news-${user.id}`, {
        model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
        body: { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      });

      const candidate = response.candidates?.[0]?.content?.parts?.[0];
      const summary = (candidate && (candidate as { text?: string }).text) || 'Here is your daily market summary.';

      // C. Send email (Placeholder)
      await step.run(`send-new-emails`, async () => {
        await Promise.all(
          users.map(async (user) => {
            if (!user.email) return false;
            return await sendNewsSummaryEmail({ email: user.email!, date: formatDateToday, newsContent: summary });
          })
        );
      });

      startResults.push({ userId: user.id, status: 'sent', newsCount: news.length });
    }

    return { success: true, processed: startResults.length, details: startResults, message: 'Daily news summary sent successfully' };
  }
);
