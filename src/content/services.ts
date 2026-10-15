import type { CabTripType } from "@/lib/validators/booking";
import { PHOTOS, type Photo } from "./destinations";
import type { Faq } from "./faqs";

export type ServicePage = {
  slug: string;
  photo: Photo;
  title: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  intro: string;
  tripTypes: CabTripType[];
  points: { title: string; body: string }[];
  faqs: Faq[];
};

export const SERVICE_PAGES = {
  local: {
    slug: "local-cab",
    photo: PHOTOS.kalaram,
    title: "Local Cab Service in Nashik",
    metaTitle: "Local Cab & Taxi Service in Nashik",
    metaDescription:
      "Book a local cab in Nashik for city travel, errands, temple visits and sightseeing. See the full fare before you pay.",
    eyebrow: "Local rentals",
    intro:
      "Hire a cab with a driver for a fixed block of hours and kilometres — ideal for shopping, meetings, temple visits and sightseeing around Nashik.",
    tripTypes: ["local"],
    points: [
      {
        title: "Packages by hours and kilometres",
        body: "Each local package shows exactly how many hours and kilometres are included.",
      },
      {
        title: "Clear extra charges",
        body: "If your trip runs longer, the extra-hour and extra-kilometre rates are shown before you book.",
      },
      {
        title: "Book ahead or call",
        body: "Book online in advance, or call or WhatsApp us for same-day requirements.",
      },
    ],
    faqs: [
      {
        question: "What happens if I use more hours or kilometres than included?",
        answer:
          "The extra-hour and extra-kilometre rates shown in your fare breakdown apply, and are settled with the driver at the end of the trip.",
      },
    ],
  },
  outstation: {
    slug: "outstation-cab",
    photo: PHOTOS.harihar,
    title: "Outstation Taxi from Nashik",
    metaTitle: "Outstation Cab from Nashik — One Way & Round Trip",
    metaDescription:
      "Book one-way and round-trip outstation cabs from Nashik to Mumbai, Pune, Shirdi and more, with an itemised fare before payment.",
    eyebrow: "Outstation",
    intro:
      "One-way drops and round trips from Nashik. Choose your route and vehicle, see the itemised fare, and book in a few steps.",
    tripTypes: ["one_way", "round_trip"],
    points: [
      { title: "One way or round trip", body: "Pay only for a drop, or keep the cab for your return journey." },
      {
        title: "Driver allowance shown up front",
        body: "Multi-day round trips list the driver allowance per day in the breakdown.",
      },
      {
        title: "Tolls made clear",
        body: "Every route states whether tolls and parking are included or paid at actuals.",
      },
    ],
    faqs: [
      {
        question: "How are multi-day round trips priced?",
        answer:
          "The base fare covers the included days and kilometres. Additional days and the driver allowance per day are added in the breakdown before you pay.",
      },
    ],
  },
  airport: {
    slug: "airport-transfer",
    photo: PHOTOS.sulaVines,
    title: "Airport Transfers",
    metaTitle: "Airport Taxi Transfers from Nashik",
    metaDescription:
      "Book airport pickups and drops from Nashik with a confirmed fare and booking reference.",
    eyebrow: "Airport transfers",
    intro: "Reliable pickups and drops for your flights. Book in advance and travel with a confirmed fare.",
    tripTypes: ["airport_transfer"],
    points: [
      { title: "Plan around your flight", body: "Choose a pickup time that leaves comfortable margin for check-in." },
      { title: "Room for luggage", body: "Each vehicle lists its passenger and luggage capacity." },
      { title: "Booking reference", body: "Keep your PT- reference handy to check status or contact us." },
    ],
    faqs: [
      {
        question: "What if my flight is delayed?",
        answer:
          "Add your flight details in the special instructions and contact us if your plans change. Waiting charges, if any, are shown in your fare breakdown.",
      },
    ],
  },
  railway: {
    slug: "railway-station-transfer",
    photo: PHOTOS.muktidham,
    title: "Railway Station Transfers",
    metaTitle: "Nashik Road Railway Station Taxi Transfers",
    metaDescription: "Book a cab to or from Nashik Road railway station with an itemised fare.",
    eyebrow: "Railway transfers",
    intro: "Pickups and drops for your train journeys, booked in advance with a clear fare.",
    tripTypes: ["railway_transfer"],
    points: [
      { title: "Station pickups and drops", body: "Choose the transfer that matches your journey." },
      { title: "Early and late trains", body: "Any night pickup charge is shown in the breakdown before you pay." },
      { title: "Help when you need it", body: "Call or WhatsApp us with your booking reference." },
    ],
    faqs: [],
  },
} satisfies Record<string, ServicePage>;
