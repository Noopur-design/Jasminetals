/* ============================================================
   Client films — short event highlight reels.
   Stock films (Pexels CDN) stand in for real client footage in this
   design build. Posters reuse the curated photography; the video file
   itself is only fetched when the visitor presses play (preload="none"),
   so the page stays light.
   ============================================================ */

export type ClientFilm = {
  id: string;
  title: string;
  detail: string;
  posterSeed: string;
  src: string;
  quote: string;
};

const PX = "https://videos.pexels.com/video-files/";

export const clientFilms: ClientFilm[] = [
  {
    id: "aanya-vikram",
    title: "Aanya & Vikram",
    detail: "Lakeside Wedding · Udaipur",
    posterSeed: "udaipur-couple-portrait",
    src: `${PX}3209828/3209828-hd_1920_1080_25fps.mp4`,
    quote: "Three days, twelve functions, and not a single moment we had to worry about.",
  },
  {
    id: "saira-dev",
    title: "Saira & Dev",
    detail: "Beach Wedding · Goa",
    posterSeed: "destination-couple-sunset",
    src: `${PX}2169879/2169879-uhd_3840_2160_30fps.mp4`,
    quote: "They turned a logistical nightmare into the most relaxed weekend of our lives.",
  },
  {
    id: "horizon",
    title: "Horizon — Global Launch",
    detail: "Product Launch · New Delhi",
    posterSeed: "corporate-gala-dinner",
    src: `${PX}4114797/4114797-uhd_3840_2160_25fps.mp4`,
    quote: "A flawless production, broadcast live to forty countries. Not one missed cue.",
  },
  {
    id: "mehta",
    title: "The Mehta Silver Jubilee",
    detail: "Anniversary · Gurugram",
    posterSeed: "anniversary-garden-soiree",
    src: `${PX}5752729/5752729-uhd_2560_1440_30fps.mp4`,
    quote: "Twenty-five years deserved a perfect evening — and that's exactly what we got.",
  },
];
