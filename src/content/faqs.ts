/**
 * Frequently asked questions. Answers describe how this website and booking
 * system work; they deliberately avoid business-specific claims (prices,
 * fleet size, policies) that the owner has not confirmed. Policy details
 * live on the policy pages, which the owner must review before launch.
 */
export type Faq = { question: string; answer: string };

export const GENERAL_FAQS: Faq[] = [
  {
    question: "How do I book a cab?",
    answer:
      "Just call or WhatsApp us. Tell us your pickup point, destination, date, time and number of passengers — we'll suggest the right vehicle and confirm the full fare on the call.",
  },
  {
    question: "How is the fare calculated?",
    answer:
      "Fares come from our approved rates for each route and vehicle type. When you call, we tell you the base fare, what it includes (such as kilometres or hours), any driver allowance or night charge, and tax. Charges that depend on the actual trip — like extra kilometres, tolls and parking when they are not included, or waiting time — are explained upfront and paid during the trip.",
  },
  {
    question: "Are tolls and parking included?",
    answer:
      "It depends on the route. When we quote your fare we tell you whether tolls and parking are included, a fixed amount, or paid as per actual receipts during the trip.",
  },
  {
    question: "What if my route or vehicle isn't listed?",
    answer:
      "Send us an enquiry with your trip details, or call or WhatsApp us. Starting fares on the website are a guide — we'll confirm the exact fare for your trip when you call.",
  },
  {
    question: "How much notice do you need?",
    answer:
      "Booking a day or more ahead gives us the best chance of having your preferred vehicle ready, but call us for same-day trips too — we'll tell you straight away what's available.",
  },
  {
    question: "How do I check or change my booking?",
    answer:
      "Call or WhatsApp us from the mobile number you booked with and we'll look it up for you.",
  },
  {
    question: "Can I cancel or change my booking?",
    answer:
      "Yes — call or WhatsApp us as early as you can. Any cancellation charges follow our cancellation and refund policy.",
  },
  {
    question: "Do you help with hotels, flights or trains?",
    answer:
      "Yes, we offer booking assistance. Send an enquiry from the Contact page with your travel dates and requirements.",
  },
];
