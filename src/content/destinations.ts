import type { StaticImageData } from "next/image";
import anjaneri from "@/assets/nashik/anjaneri.jpg";
import bhandardara from "@/assets/nashik/bhandardara.jpg";
import dugarwadi from "@/assets/nashik/dugarwadi.jpg";
import godavariGhats from "@/assets/nashik/godavari-ghats.jpg";
import harihar from "@/assets/nashik/harihar.jpg";
import kalaram from "@/assets/nashik/kalaram.jpg";
import kalsubai from "@/assets/nashik/kalsubai.jpg";
import muktidham from "@/assets/nashik/muktidham.jpg";
import pandavleni from "@/assets/nashik/pandavleni.jpg";
import ramkund from "@/assets/nashik/ramkund.jpg";
import saptashrungi from "@/assets/nashik/saptashrungi.jpg";
import sulaEstate from "@/assets/nashik/sula.jpg";
import sulaVines from "@/assets/nashik/sula-2.jpg";
import trimbakeshwarMonsoon from "@/assets/nashik/trimbakeshwar.jpg";
import trimbakeshwarCourtyard from "@/assets/nashik/trimbakeshwar-2.jpg";

/*
 * Photos are from Wikimedia Commons under free licences. CC BY / CC BY-SA
 * require attribution, which /explore-nashik#photo-credits provides — keep a
 * credit entry for every photo shown on the site. To swap in your own photos,
 * replace the file in src/assets/nashik and update (or drop) its credit.
 */
export type PhotoCredit = { title: string; author: string; license: string; licenseUrl: string; source: string };
export type Photo = { src: StaticImageData; alt: string; credit: PhotoCredit };

function commons(file: string, author: string, license: "CC0" | "CC BY-SA 3.0" | "CC BY-SA 4.0"): PhotoCredit {
  const licenseUrl =
    license === "CC0"
      ? "https://creativecommons.org/publicdomain/zero/1.0/"
      : `https://creativecommons.org/licenses/by-sa/${license.endsWith("3.0") ? "3.0" : "4.0"}/`;
  return {
    title: file.replace(/_/g, " ").replace(/\.[a-z]+$/i, ""),
    author,
    license,
    licenseUrl,
    source: `https://commons.wikimedia.org/wiki/File:${encodeURI(file)}`,
  };
}

export const PHOTOS = {
  trimbakeshwarMonsoon: {
    src: trimbakeshwarMonsoon,
    alt: "Trimbakeshwar temple's black-stone spire beneath mist-covered Brahmagiri hills during the monsoon",
    credit: commons("Trimbakeshwar_Temple,_Nashik.jpg", "Prashant Kharote", "CC BY-SA 4.0"),
  },
  trimbakeshwarCourtyard: {
    src: trimbakeshwarCourtyard,
    alt: "Pilgrims in the stone courtyard of Trimbakeshwar Shiva temple under a clear blue sky",
    credit: commons("Trimbakeshwar_Shiva_Temple,_Trimbak,_Nashik_District,_Maharastra_(2).jpg", "K.Venkataramana", "CC0"),
  },
  godavariGhats: {
    src: godavariGhats,
    alt: "The Godavari river at Panchavati, with temples and old houses lining the ghats",
    credit: commons("Gandhi_Talav_Godavari_Nashik_Maharashtra_(cropped).jpg", "MayurFreelancer", "CC BY-SA 4.0"),
  },
  ramkund: {
    src: ramkund,
    alt: "Devotees in colourful saris bathing at Ramkund on the Godavari during Makar Sankranti",
    credit: commons(
      "Makar_Sankranti_Celebration_at_Ramkund_Nashik_Maharashtra_14_Jan_2025_Rohit_R_Nashik_Photos_1.jpg",
      "Rohit R Nashik",
      "CC BY-SA 4.0",
    ),
  },
  pandavleni: {
    src: pandavleni,
    alt: "The carved horseshoe-arch facade of the chaitya hall at the Pandavleni Buddhist caves",
    credit: commons("Pandavleni_Caves_Nashik.jpg", "Katyare", "CC BY-SA 3.0"),
  },
  kalaram: {
    src: kalaram,
    alt: "The black-stone domes and spire of Kalaram temple in Panchavati",
    credit: commons("Kalaram_Temple,_Panchavati,_Nashik.jpg", "K.Venkataramana", "CC0"),
  },
  muktidham: {
    src: muktidham,
    alt: "The white marble facade of Muktidham temple at Nashik Road",
    credit: commons("Muktidham_Temple,_Nashik,_Maharastra.jpg", "K.Venkataramana", "CC0"),
  },
  sulaEstate: {
    src: sulaEstate,
    alt: "Aerial view of Sula Vineyards' tasting rooms surrounded by rows of grapevines and green hills",
    credit: commons("Sula_Vineyards_Updated_View.jpg", "Puneets26", "CC BY-SA 4.0"),
  },
  sulaVines: {
    src: sulaVines,
    alt: "Long green rows of grapevines stretching towards distant hills near Nashik",
    credit: commons("Sula_Grape_Vineyard.jpg", "Wikieditor11221", "CC BY-SA 4.0"),
  },
  saptashrungi: {
    src: saptashrungi,
    alt: "Saptashrungi temple perched on a sheer rock face above the pilgrim market at Vani",
    credit: commons("Saptashrungi_temple.JPG", "Dharmadhyaksha", "CC BY-SA 3.0"),
  },
  anjaneri: {
    src: anjaneri,
    alt: "The flat-topped Anjaneri hill wrapped in monsoon clouds above green paddy fields",
    credit: commons("Anjineri_fort_Nasik.jpg", "Coolgama", "CC BY-SA 4.0"),
  },
  harihar: {
    src: harihar,
    alt: "Sunlit Sahyadri ridges framed by a stone archway at Harihar Fort",
    credit: commons("Harihar_fort_1.jpg", "Ccmarathe", "CC BY-SA 4.0"),
  },
  dugarwadi: {
    src: dugarwadi,
    alt: "Dugarwadi waterfall plunging into a deep forested gorge near Trimbak",
    credit: commons("Dugarwadi_waterfall.jpg", "Dusanesurbhi", "CC BY-SA 4.0"),
  },
  bhandardara: {
    src: bhandardara,
    alt: "Monsoon waterfalls cascading over black rock at Bhandardara",
    credit: commons("Bhandardara_Waterfall.jpg", "Adwait", "CC BY-SA 4.0"),
  },
  kalsubai: {
    src: kalsubai,
    alt: "Clouds drifting over the Sahyadri ranges at sunrise, seen from Kalsubai peak",
    credit: commons("Sunrise_from_Kalsubai_peak_1.jpg", "Ragz13", "CC BY-SA 4.0"),
  },
} satisfies Record<string, Photo>;

export type DestinationCategory = "Spiritual" | "Heritage" | "Nature" | "Experiences";

export type Destination = {
  slug: string;
  name: string;
  category: DestinationCategory;
  /** Approximate road distance from central Nashik, shown as-is. */
  distance: string;
  tagline: string;
  body: string;
  bestTime: string;
  photo: Photo;
};

export const DESTINATIONS: Destination[] = [
  {
    slug: "trimbakeshwar",
    name: "Trimbakeshwar",
    category: "Spiritual",
    distance: "≈ 30 km",
    tagline: "One of the twelve Jyotirlingas",
    body: "An 18th-century black-stone Shiva temple at the foot of the Brahmagiri hills, where the Godavari river begins. Pair darshan with a drive through the green Trimbak valley.",
    bestTime: "All year · lush in the monsoon",
    photo: PHOTOS.trimbakeshwarMonsoon,
  },
  {
    slug: "ramkund-panchavati",
    name: "Ramkund & Panchavati",
    category: "Spiritual",
    distance: "In the city",
    tagline: "The sacred heart of Nashik",
    body: "Holy bathing ghats on the Godavari, linked with the Ramayana and with the Simhastha Kumbh Mela. Evenings bring aarti, lamps on the water and busy temple lanes.",
    bestTime: "Early morning or evening aarti",
    photo: PHOTOS.godavariGhats,
  },
  {
    slug: "kalaram-temple",
    name: "Kalaram Temple",
    category: "Spiritual",
    distance: "In the city",
    tagline: "Black-stone shrine to Lord Rama",
    body: "A graceful Panchavati temple built in black stone, named after its dark idol of Lord Rama. Combine it with Sita Gufa and Ramkund on a half-day city tour.",
    bestTime: "All year · festive at Ram Navami",
    photo: PHOTOS.kalaram,
  },
  {
    slug: "pandavleni-caves",
    name: "Pandavleni Caves",
    category: "Heritage",
    distance: "≈ 8 km",
    tagline: "2,000-year-old Buddhist caves",
    body: "More than twenty rock-cut caves carved into Trirashmi hill, with chaitya halls, inscriptions and sculpted facades. A short climb rewards you with views over the city.",
    bestTime: "Mornings, October to March",
    photo: PHOTOS.pandavleni,
  },
  {
    slug: "sula-vineyards",
    name: "Sula Vineyards",
    category: "Experiences",
    distance: "≈ 15 km",
    tagline: "India's wine country",
    body: "Nashik grows much of India's wine. Tour the vineyards, try a tasting and stay for sunset over Gangapur's backwaters — we'll drive, so you can relax.",
    bestTime: "November to March · harvest season",
    photo: PHOTOS.sulaEstate,
  },
  {
    slug: "muktidham",
    name: "Muktidham",
    category: "Spiritual",
    distance: "≈ 8 km",
    tagline: "White marble temple at Nashik Road",
    body: "A serene marble temple with replicas of the twelve Jyotirlingas and the Bhagavad Gita inscribed on its walls. An easy stop on the way to or from Nashik Road station.",
    bestTime: "All year",
    photo: PHOTOS.muktidham,
  },
  {
    slug: "anjaneri",
    name: "Anjaneri",
    category: "Nature",
    distance: "≈ 20 km",
    tagline: "Hills of Lord Hanuman",
    body: "Revered as the birthplace of Lord Hanuman, Anjaneri's flat-topped hill turns emerald in the rains. A popular trek and a scenic stop on the Trimbak road.",
    bestTime: "July to October",
    photo: PHOTOS.anjaneri,
  },
  {
    slug: "harihar-fort",
    name: "Harihar Fort",
    category: "Heritage",
    distance: "≈ 45 km",
    tagline: "The famous rock-cut stairway",
    body: "A Sahyadri fort known for its near-vertical steps carved into the rock. The top opens onto sweeping views of the Trimbak range — an unforgettable day trek.",
    bestTime: "August to February",
    photo: PHOTOS.harihar,
  },
  {
    slug: "dugarwadi-waterfall",
    name: "Dugarwadi Waterfall",
    category: "Nature",
    distance: "≈ 35 km",
    tagline: "A hidden monsoon cascade",
    body: "A tall waterfall tumbling into a forested gorge near Trimbak, reached by a short trek through the woods. Best enjoyed with a local guide after good rains.",
    bestTime: "July to September",
    photo: PHOTOS.dugarwadi,
  },
  {
    slug: "saptashrungi",
    name: "Saptashrungi Devi",
    category: "Spiritual",
    distance: "≈ 60 km",
    tagline: "Temple on a cliff at Vani",
    body: "A revered shrine to the Goddess set into a sheer rock face among seven peaks. Reach it by the stone stairway or the funicular, with wide views of the Sahyadris.",
    bestTime: "All year · crowded during Navratri",
    photo: PHOTOS.saptashrungi,
  },
  {
    slug: "bhandardara",
    name: "Bhandardara",
    category: "Nature",
    distance: "≈ 75 km",
    tagline: "Lakes, falls and fireflies",
    body: "A hill retreat around Arthur Lake and Wilson Dam, with waterfalls in the monsoon and firefly-lit forests in early summer. Perfect for a weekend escape.",
    bestTime: "June to October · fireflies in May–June",
    photo: PHOTOS.bhandardara,
  },
  {
    slug: "kalsubai",
    name: "Kalsubai Peak",
    category: "Nature",
    distance: "≈ 70 km",
    tagline: "The highest point in Maharashtra",
    body: "At about 1,646 m, Kalsubai is the state's tallest summit. Start early from Bari village to watch the sun rise over a sea of clouds.",
    bestTime: "August to February",
    photo: PHOTOS.kalsubai,
  },
];

/** Photos for the scrolling gallery, in display order. */
export const GALLERY: Photo[] = [
  PHOTOS.trimbakeshwarCourtyard,
  PHOTOS.ramkund,
  PHOTOS.harihar,
  PHOTOS.sulaVines,
  PHOTOS.pandavleni,
  PHOTOS.bhandardara,
  PHOTOS.kalaram,
  PHOTOS.kalsubai,
  PHOTOS.saptashrungi,
  PHOTOS.dugarwadi,
];

/** Picks a photo for a tour package that has no image of its own. */
export function photoForPackage(text: string): Photo {
  const t = text.toLowerCase();
  if (t.includes("trimbak")) return PHOTOS.trimbakeshwarCourtyard;
  if (t.includes("saptashrung") || t.includes("vani")) return PHOTOS.saptashrungi;
  if (t.includes("wine") || t.includes("sula") || t.includes("vineyard")) return PHOTOS.sulaVines;
  if (t.includes("bhandardara") || t.includes("honeymoon")) return PHOTOS.bhandardara;
  if (t.includes("trek") || t.includes("fort")) return PHOTOS.harihar;
  if (t.includes("pilgrim") || t.includes("temple") || t.includes("darshan")) return PHOTOS.kalaram;
  return PHOTOS.godavariGhats;
}
