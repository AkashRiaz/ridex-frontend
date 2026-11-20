/*
 * Bangladesh divisions → districts with approximate district-centre
 * coordinates (used as a listing's location when the seller does not
 * share exact coordinates, and for radius search).
 * Copy of ridex-backend/src/app/helper/bdLocations.ts — keep in sync
 */

export type TDistrict = { name: string; lat: number; lng: number };

export type TDivision = { name: string; districts: TDistrict[] };

const d = (name: string, lat: number, lng: number): TDistrict => ({ name, lat, lng });

export const BD_DIVISIONS: TDivision[] = [
  {
    name: "Dhaka",
    districts: [
      d("Dhaka", 23.8103, 90.4125),
      d("Gazipur", 24.0023, 90.4264),
      d("Narayanganj", 23.6238, 90.5),
      d("Narsingdi", 23.9322, 90.7151),
      d("Manikganj", 23.8617, 90.0003),
      d("Munshiganj", 23.5422, 90.5305),
      d("Tangail", 24.2513, 89.9167),
      d("Kishoreganj", 24.4449, 90.7766),
      d("Faridpur", 23.607, 89.8429),
      d("Gopalganj", 23.005, 89.8266),
      d("Madaripur", 23.1641, 90.1897),
      d("Rajbari", 23.7574, 89.6444),
      d("Shariatpur", 23.2423, 90.4348),
    ],
  },
  {
    name: "Chattogram",
    districts: [
      d("Chattogram", 22.3569, 91.7832),
      d("Cox's Bazar", 21.4272, 92.0058),
      d("Cumilla", 23.4607, 91.1809),
      d("Feni", 23.0159, 91.3976),
      d("Noakhali", 22.8696, 91.0995),
      d("Lakshmipur", 22.9447, 90.8282),
      d("Chandpur", 23.2333, 90.6713),
      d("Brahmanbaria", 23.9571, 91.1119),
      d("Rangamati", 22.6533, 92.175),
      d("Khagrachhari", 23.1193, 91.9847),
      d("Bandarban", 22.1953, 92.2184),
    ],
  },
  {
    name: "Rajshahi",
    districts: [
      d("Rajshahi", 24.3745, 88.6042),
      d("Bogura", 24.8465, 89.3773),
      d("Pabna", 24.0064, 89.2372),
      d("Sirajganj", 24.4534, 89.7007),
      d("Naogaon", 24.7936, 88.9318),
      d("Natore", 24.4102, 89.0076),
      d("Chapai Nawabganj", 24.5965, 88.2776),
      d("Joypurhat", 25.0968, 89.0227),
    ],
  },
  {
    name: "Khulna",
    districts: [
      d("Khulna", 22.8456, 89.5403),
      d("Jashore", 23.1664, 89.2081),
      d("Satkhira", 22.7185, 89.0705),
      d("Bagerhat", 22.6516, 89.7859),
      d("Kushtia", 23.9013, 89.1205),
      d("Jhenaidah", 23.545, 89.1726),
      d("Magura", 23.4873, 89.4198),
      d("Narail", 23.1725, 89.5126),
      d("Chuadanga", 23.6402, 88.8418),
      d("Meherpur", 23.7622, 88.6318),
    ],
  },
  {
    name: "Barishal",
    districts: [
      d("Barishal", 22.701, 90.3535),
      d("Patuakhali", 22.3596, 90.3299),
      d("Bhola", 22.6859, 90.6482),
      d("Pirojpur", 22.5841, 89.972),
      d("Jhalokati", 22.6406, 90.1987),
      d("Barguna", 22.1591, 90.1258),
    ],
  },
  {
    name: "Sylhet",
    districts: [
      d("Sylhet", 24.8949, 91.8687),
      d("Moulvibazar", 24.4829, 91.7774),
      d("Habiganj", 24.3745, 91.4155),
      d("Sunamganj", 25.0715, 91.3992),
    ],
  },
  {
    name: "Rangpur",
    districts: [
      d("Rangpur", 25.7439, 89.2752),
      d("Dinajpur", 25.6217, 88.6354),
      d("Kurigram", 25.8072, 89.6295),
      d("Gaibandha", 25.3288, 89.528),
      d("Nilphamari", 25.931, 88.856),
      d("Lalmonirhat", 25.9923, 89.2847),
      d("Thakurgaon", 26.0336, 88.4616),
      d("Panchagarh", 26.3411, 88.5541),
    ],
  },
  {
    name: "Mymensingh",
    districts: [
      d("Mymensingh", 24.7471, 90.4203),
      d("Jamalpur", 24.9375, 89.9378),
      d("Netrokona", 24.8835, 90.7279),
      d("Sherpur", 25.0205, 90.0153),
    ],
  },
];

export const findDistrict = (division: string, district: string) =>
  BD_DIVISIONS.find((item) => item.name === division)?.districts.find(
    (item) => item.name === district,
  ) ?? null;

export const isValidLocation = (division: string, district: string) =>
  Boolean(findDistrict(division, district));

/*
 * Bangladesh bounding box — exact coordinates outside it are rejected.
 */
export const isInsideBangladesh = (lat: number, lng: number) =>
  lat >= 20.5 && lat <= 26.7 && lng >= 88.0 && lng <= 92.75;
