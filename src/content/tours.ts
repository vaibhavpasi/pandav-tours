import { PHOTOS, type Photo } from "./destinations";

/*
 * Static tour pages. Prices are deliberately absent: fares come from the
 * booking system (or an enquiry), so nothing here can drift out of date.
 * OWNER: review the stops and indicative timings against how you actually
 * run the trip before going live.
 */
export type TourPlan = {
  id: string;
  name: string;
  duration: string;
  summary: string;
  stops: string[];
  photo: Photo;
};

export type ItineraryStep = { time: string; title: string; body: string };

export const SHIRDI_TOUR = {
  slug: "shirdi-darshan",
  title: "Shirdi Sai Baba Darshan Tour from Nashik",
  metaTitle: "Shirdi Tour from Nashik — Sai Baba Darshan by Cab",
  metaDescription:
    "Private cab tour from Nashik to Shirdi for Sai Baba darshan, with an option to add Shani Shingnapur. Pickup from your home, hotel or Nashik Road station.",
  intro:
    "A private cab from your door in Nashik to Shirdi and back — darshan at the Samadhi Mandir, the sacred sites around it, and the option to add Shani Shingnapur the same day.",
  facts: [
    { label: "Distance", value: "≈ 90 km each way" },
    { label: "Drive time", value: "≈ 2–2½ hrs each way" },
    { label: "Duration", value: "Same day" },
    { label: "Pickup", value: "Home, hotel or Nashik Road station" },
  ],
  plans: [
    {
      id: "shirdi-day",
      name: "Shirdi Darshan",
      duration: "Same day · about 10–12 hours",
      summary: "Darshan at the Samadhi Mandir and the main sites of Sai Baba's life, back in Nashik by evening.",
      stops: ["Samadhi Mandir", "Dwarkamai", "Chawadi", "Gurusthan", "Lendi Baug"],
      photo: PHOTOS.shirdiChawadi,
    },
    {
      id: "shirdi-shani",
      name: "Shirdi + Shani Shingnapur",
      duration: "Full day · about 14–16 hours",
      summary: "Morning darshan in Shirdi, then on to Shani Shingnapur, about 70 km away, before the drive home.",
      stops: ["Samadhi Mandir", "Dwarkamai", "Chawadi", "Shani Shingnapur temple"],
      photo: PHOTOS.shaniShingnapur,
    },
  ] satisfies TourPlan[],
  itinerary: [
    {
      time: "Early morning",
      title: "Pickup in Nashik",
      body: "Your driver collects you from home, your hotel or Nashik Road station. An early start means shorter darshan queues.",
    },
    {
      time: "≈ 2–2½ hrs",
      title: "Drive to Shirdi via Sinnar",
      body: "A comfortable highway drive. Stop for tea and breakfast on the way whenever you like.",
    },
    {
      time: "Morning",
      title: "Darshan at the Samadhi Mandir",
      body: "Your driver waits while you join the darshan queue. Queue times vary a lot by day and season.",
    },
    {
      time: "Late morning",
      title: "Dwarkamai, Chawadi & Gurusthan",
      body: "Visit the mosque where Sai Baba lived, the Chawadi where he rested, and the neem tree at Gurusthan — all a short walk apart.",
    },
    {
      time: "Afternoon",
      title: "Lunch, then home — or on to Shani Shingnapur",
      body: "Have lunch in Shirdi and head back to Nashik, or continue to Shani Shingnapur if you chose the full-day plan.",
    },
    {
      time: "Evening",
      title: "Drop-off in Nashik",
      body: "Dropped back at your door. Timings above are indicative and depend on queues and traffic.",
    },
  ] satisfies ItineraryStep[],
  sites: [
    { name: "Samadhi Mandir", body: "The shrine built over Sai Baba's resting place, and the heart of every visit." },
    { name: "Dwarkamai", body: "The old mosque where Sai Baba lived, with the sacred fire (dhuni) he kept burning." },
    { name: "Chawadi", body: "Where Sai Baba slept on alternate nights; a procession still honours it every Thursday." },
    { name: "Gurusthan", body: "The neem tree under which Sai Baba was first seen as a young man in Shirdi." },
    { name: "Lendi Baug", body: "A quiet garden Sai Baba tended and walked in daily." },
    { name: "Shani Shingnapur", body: "Shrine to Lord Shani in the famous village whose homes have no doors." },
  ],
  included: [
    "Private cab with driver for the whole trip",
    "Pickup and drop at your home, hotel or Nashik Road station",
    "Your choice of vehicle for your group size",
    "Full fare shown before you pay, including driver allowance and taxes",
  ],
  notIncluded: [
    "Darshan or aarti passes — book through the Shri Saibaba Sansthan Trust's official channels",
    "Meals, offerings and personal expenses",
    "Tolls and parking, where your fare says they're paid at actuals",
  ],
  tips: [
    "Thursdays, weekends and festivals like Guru Purnima and Ram Navami are the busiest days — weekdays are calmer.",
    "Dress modestly and carry little; temple rules on phones and bags change, so check them before you go.",
    "Start early: morning queues are usually shorter and you avoid the afternoon heat.",
  ],
};
