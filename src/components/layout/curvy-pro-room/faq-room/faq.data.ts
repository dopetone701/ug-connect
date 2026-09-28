import { getLiveServices } from '../../../../app/config/live-services.config';
import { getPricing } from './currency-map-calculater';

export const buildFaqData = () => {
  const live = getLiveServices();
  const firstLive = live[0];
  const p = getPricing();

  return [
    {
      q: "What is Ug-Connect?",
      a: `Ug-Connect is a premium videography platform serving translated movies in Luganda by your favourite VJs. We bring you closer to home with high-quality entertainment, carefully curated and voiced by the VJs you know and love. Currently live with ${firstLive?.name || 'Movies'}, we are continuously expanding to bring more essential services for Ugandans abroad under one trusted app.`,
    },
    {
      q: `How can I watch ${firstLive?.name || 'movies'}?`,
      a: "Sign in to watch instantly. Simply tap on any movie card, select your movie and hit Watch. As a new user, you automatically unlock your welcome bonus of one week unlimited streaming - no restrictions, full access from day one.",
    },
    {
      q: "How much is Ug-Connect?",
      a: `${p.monthlyFormatted} per month for unlimited streaming, or ${p.yearlyFormatted} per year and save ${p.saveFormatted} - our best value. Pricing is automatically displayed in your local currency (${p.currency}) based on your region. We also offer a free option: share Ug-Connect with 5 friends who sign in, and you unlock 10 movies absolutely free.`,
    },
    {
      q: "How do I unlock with sharing?",
      a: "Get 10 movies free in 3 simple steps. Tap share, send your personal link to 5 friends, and once they successfully sign in, your free movies are automatically unlocked. It's our way of saying thank you for growing the community.",
    },
    {
      q: "How to sign in?",
      a: "Hit the Sign In button above and follow the simple instructions. We made it effortless for you - quick sign-in with your Google account, Apple account, or email. Prefer to explore first? You can also continue as guest and experience a limited version of the app instantly.",
    },
    {
      q: "Can I continue as guest?",
      a: "Yes, absolutely. You can continue as a guest and enjoy a limited version with access to previews and trailers. For full, unlimited streaming, simply sign in when you're ready.",
    },
    {
      q: "Can I sign out or cancel anytime?",
      a: "Of course. You are free to leave at any time - no questions asked, no hard feelings. At Ug-Connect, we keep the door open for you. Your account remains safe with us, and we will always reserve a seat for you should you decide to return. You are part of our family.",
    },
  ];
};
