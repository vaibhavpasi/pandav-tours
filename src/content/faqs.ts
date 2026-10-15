/**
 * Frequently asked questions. Answers describe how this website and booking
 * system work; they deliberately avoid business-specific claims (prices,
 * fleet size, policies) that the owner has not confirmed. Policy details
 * live on the policy pages, which the owner must review before launch.
 */
export type Faq = { question: string; answer: string };

export const GENERAL_FAQS: Faq[] = [
  {
    question: "How do I book a cab online?",
    answer:
      "Choose your trip type and route, pick the date, time and number of passengers, then select a vehicle. You will see the full fare breakdown before you enter your details and pay.",
  },
  {
    question: "How is the fare calculated?",
    answer:
      "Fares come from our approved rates for each route and vehicle type. The breakdown shows the base fare, what it includes (such as kilometres or hours), any driver allowance or night charge, and tax. Charges that depend on the actual trip — like extra kilometres, tolls and parking when they are not included, or waiting time — are listed separately and paid during the trip.",
  },
  {
    question: "Are tolls and parking included?",
    answer:
      "It depends on the route. Each fare breakdown clearly says whether tolls and parking are included, prepaid as a fixed amount, or paid as per actual receipts during the trip.",
  },
  {
    question: "What if my route or vehicle isn't listed?",
    answer:
      "Send us an enquiry with your trip details, or call or WhatsApp us. We only show online prices for routes with approved fares, so we'll confirm your fare personally.",
  },
  {
    question: "How much notice do you need?",
    answer:
      "Online bookings need a minimum amount of notice before pickup, shown when you choose your time. For urgent trips, please call us directly.",
  },
  {
    question: "How do I check my booking?",
    answer:
      "Use the Booking Status page with your booking reference (it looks like PT-ABCD2345) and the mobile number you booked with.",
  },
  {
    question: "Can I cancel or change my booking?",
    answer:
      "Please contact us with your booking reference. Cancellation charges and refunds follow our cancellation and refund policy.",
  },
  {
    question: "Do you help with hotels, flights or trains?",
    answer:
      "Yes, we offer booking assistance. Send an enquiry from the Contact page with your travel dates and requirements.",
  },
];
