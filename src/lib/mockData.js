export const cities = [
  "Mumbai",
  "Pune",
  "Nashik",
  "Nagpur",
  "Aurangabad",
  "Kolhapur",
  "Solapur",
  "Satara",
  "Ahmednagar",
  "Jalgaon",
  "Amalner",
];

export const popularRoutes = [
  { from: "Mumbai", to: "Pune", duration: "3h 30m", price: 350 },
  { from: "Pune", to: "Nashik", duration: "4h", price: 280 },
  { from: "Mumbai", to: "Nagpur", duration: "14h", price: 950 },
  { from: "Pune", to: "Kolhapur", duration: "5h", price: 400 },
  { from: "Mumbai", to: "Aurangabad", duration: "6h 30m", price: 520 },
  { from: "Nashik", to: "Jalgaon", duration: "3h", price: 220 },
];

export const mockBuses = [
  {
    id: "bus-001",
    operator: "Shivneri Travels",
    type: "AC Sleeper",
    busType: ["AC", "Sleeper"],
    departure: "22:00",
    arrival: "06:00",
    duration: "8h",
    price: 850,
    totalSeats: 30,
    availableSeats: 12,
    amenities: ["WiFi", "Charging Point", "Water Bottle", "Blanket"],
    rating: 4.5,
    isAC: true,
    isSleeper: true,
    freeCancellation: true,
    hasLiveTracking: true,
    isVolvo: false,
    isSingleWindow: false,
    stops: [
      { name: "Mumbai Central", time: "22:00" },
      { name: "Khopoli", time: "23:30" },
      { name: "Pune Station", time: "06:00" },
    ],
  },
  {
    id: "bus-002",
    operator: "Maharashtra Express",
    type: "Non-AC Seater",
    busType: ["Non-AC", "Seater"],
    departure: "06:00",
    arrival: "09:30",
    duration: "3h 30m",
    price: 350,
    totalSeats: 48,
    availableSeats: 32,
    amenities: ["Charging Point"],
    rating: 3.8,
    isAC: false,
    isSleeper: false,
    freeCancellation: false,
    hasLiveTracking: false,
    isVolvo: false,
    isSingleWindow: false,
    stops: [
      { name: "Mumbai Dadar", time: "06:00" },
      { name: "Panvel", time: "07:00" },
      { name: "Pune Swargate", time: "09:30" },
    ],
  },
  {
    id: "bus-003",
    operator: "Pune Travels",
    type: "AC Seater",
    busType: ["AC", "Seater"],
    departure: "14:00",
    arrival: "17:30",
    duration: "3h 30m",
    price: 550,
    totalSeats: 44,
    availableSeats: 9,
    amenities: ["WiFi", "Charging Point", "Water Bottle"],
    rating: 4.2,
    isAC: true,
    isSleeper: false,
    freeCancellation: true,
    hasLiveTracking: true,
    isVolvo: false,
    isSingleWindow: true,
    stops: [
      { name: "Mumbai Borivali", time: "14:00" },
      { name: "Mumbai CST", time: "14:45" },
      { name: "Pune Station", time: "17:30" },
    ],
  },
  {
    id: "bus-004",
    operator: "Deccan Queen Travels",
    type: "AC Sleeper",
    busType: ["AC", "Sleeper"],
    departure: "23:30",
    arrival: "07:30",
    duration: "8h",
    price: 1200,
    totalSeats: 30,
    availableSeats: 5,
    amenities: ["WiFi", "Charging Point", "Water Bottle", "Blanket"],
    rating: 4.8,
    isAC: true,
    isSleeper: true,
    freeCancellation: true,
    hasLiveTracking: true,
    isVolvo: true,
    isSingleWindow: false,
    stops: [
      { name: "Mumbai Andheri", time: "23:30" },
      { name: "Khalapur", time: "01:00" },
      { name: "Pune Hinjewadi", time: "07:30" },
    ],
  },
  {
    id: "bus-005",
    operator: "Konkan Roadways",
    type: "Non-AC Sleeper",
    busType: ["Non-AC", "Sleeper"],
    departure: "21:00",
    arrival: "05:00",
    duration: "8h",
    price: 680,
    totalSeats: 30,
    availableSeats: 14,
    amenities: ["Charging Point", "Water Bottle"],
    rating: 4.0,
    isAC: false,
    isSleeper: true,
    freeCancellation: false,
    hasLiveTracking: false,
    isVolvo: false,
    isSingleWindow: false,
    stops: [
      { name: "Mumbai Kurla", time: "21:00" },
      { name: "Lonavala", time: "22:30" },
      { name: "Pune Wakad", time: "05:00" },
    ],
  },
  {
    id: "bus-006",
    operator: "City Link Express",
    type: "AC Seater",
    busType: ["AC", "Seater"],
    departure: "08:30",
    arrival: "12:00",
    duration: "3h 30m",
    price: 480,
    totalSeats: 44,
    availableSeats: 28,
    amenities: ["WiFi", "Charging Point"],
    rating: 4.1,
    isAC: true,
    isSleeper: false,
    freeCancellation: true,
    hasLiveTracking: true,
    isVolvo: false,
    isSingleWindow: false,
    stops: [
      { name: "Mumbai Thane", time: "08:30" },
      { name: "Khopoli", time: "09:45" },
      { name: "Pune Kothrud", time: "12:00" },
    ],
  },
  {
    id: "bus-007",
    operator: "VRL Travels",
    type: "AC Sleeper",
    busType: ["AC", "Sleeper"],
    departure: "19:00",
    arrival: "03:00",
    duration: "8h",
    price: 920,
    totalSeats: 30,
    availableSeats: 10,
    amenities: ["WiFi", "Charging Point", "Blanket"],
    rating: 4.3,
    isAC: true,
    isSleeper: true,
    freeCancellation: true,
    hasLiveTracking: true,
    isVolvo: true,
    isSingleWindow: true,
    stops: [
      { name: "Mumbai Malad", time: "19:00" },
      { name: "Pune Camp", time: "03:00" },
    ],
  },
  {
    id: "bus-008",
    operator: "Sahyadri Travels",
    type: "Non-AC Seater",
    busType: ["Non-AC", "Seater"],
    departure: "05:30",
    arrival: "09:00",
    duration: "3h 30m",
    price: 280,
    totalSeats: 52,
    availableSeats: 40,
    amenities: ["Water Bottle"],
    rating: 3.5,
    isAC: false,
    isSleeper: false,
    freeCancellation: false,
    hasLiveTracking: false,
    isVolvo: false,
    isSingleWindow: false,
    stops: [
      { name: "Mumbai Ghatkopar", time: "05:30" },
      { name: "Panvel", time: "06:30" },
      { name: "Pune Shivajinagar", time: "09:00" },
    ],
  },
];

export const governmentBuses = [
  {
    id: "msrtc",
    shortName: "MSRTC",
    fullName: "Maharashtra State Road Transport Corporation",
    regionalName: "महाराष्ट्र राज्य मार्ग परिवहन महामंडळ",
    rating: 3.9,
    totalServices: 2100,
    popularServices: ["Shivneri", "Asiad", "Hirkani"],
    logoColor: "#FF6B35",
    logoInitials: "MS",
    trustMessage: "Get instant refund with UPI payments",
    isOfficialPartner: true,
  },
  {
    id: "apsrtc",
    shortName: "APSRTC",
    fullName: "Andhra Pradesh State Road Transport Corporation",
    regionalName: "ఆంధ్రప్రదేశ్ రాష్ట్ర రోడ్డు రవాణా సంస్థ",
    rating: 3.85,
    totalServices: 1539,
    popularServices: ["Garuda", "Garuda Plus"],
    logoColor: "#1565C0",
    logoInitials: "AP",
    trustMessage: "Get instant refund with UPI payments",
    isOfficialPartner: true,
  },
  {
    id: "tgsrtc",
    shortName: "TGSRTC",
    fullName: "Telangana State Road Transport Corporation",
    regionalName: "తెలంగాణ రాష్ట్ర రోడ్డు రవాణా సంస్థ",
    rating: 3.71,
    totalServices: 1450,
    popularServices: ["Garuda Plus", "Rajdhani"],
    logoColor: "#2E7D32",
    logoInitials: "TG",
    trustMessage: "trusted place to book TGSRTC tickets online",
    isOfficialPartner: true,
  },
  {
    id: "ksrtc",
    shortName: "KERALA RTC",
    fullName: "Kerala State Road Transport Corporation",
    regionalName: "കേരള സ്റ്റേറ്റ് റോഡ് ട്രാൻസ്പോർട്",
    rating: 3.85,
    totalServices: 940,
    popularServices: ["Swift", "AC Multiaxle"],
    logoColor: "#B71C1C",
    logoInitials: "KL",
    trustMessage: "Get instant refund with UPI payments",
    isOfficialPartner: true,
  },
  {
    id: "ktcl",
    shortName: "KTCL",
    fullName: "Kadamba Transport Corporation Limited",
    regionalName: "कदंब येरादारी म्हामंडळ",
    rating: 3.83,
    totalServices: 60,
    popularServices: ["Volvo Bus", "AC", "Non AC Bus"],
    logoColor: "#E65100",
    logoInitials: "KT",
    trustMessage: "trusted place to book KTCL tickets online",
    isOfficialPartner: true,
  },
  {
    id: "gsrtc",
    shortName: "GSRTC",
    fullName: "Gujarat State Road Transport Corporation",
    regionalName: "ગુજરાત રાજ્ય માર્ગ વાहन નિગમ",
    rating: 3.75,
    totalServices: 800,
    popularServices: ["Volvo", "Express", "Ordinary"],
    logoColor: "#6A1B9A",
    logoInitials: "GS",
    trustMessage: "Get instant refund with UPI payments",
    isOfficialPartner: true,
  },
  {
    id: "upsrtc",
    shortName: "UPSRTC",
    fullName: "Uttar Pradesh State Road Transport Corporation",
    regionalName: "उत्तर प्रदेश राज्य सड़क परिवहन निगम",
    rating: 3.60,
    totalServices: 3200,
    popularServices: ["Jan Rath", "Volvo", "Sangam"],
    logoColor: "#1B5E20",
    logoInitials: "UP",
    trustMessage: "trusted place to book UPSRTC tickets online",
    isOfficialPartner: true,
  },
  {
    id: "hrtc",
    shortName: "HRTC",
    fullName: "Himachal Road Transport Corporation",
    regionalName: "हिमाचल सड़क परिवहन निगम",
    rating: 3.70,
    totalServices: 420,
    popularServices: ["Volvo", "Semi Deluxe", "Ordinary"],
    logoColor: "#0277BD",
    logoInitials: "HR",
    trustMessage: "Get instant refund with UPI payments",
    isOfficialPartner: true,
  },
];

export const offers = [
  {
    id: 1,
    category: "Bus",
    title: "Save up to Rs 300 on bus tickets",
    validTill: "30 Jun",
    code: "BUS300",
    discount: 300,
    discountType: "flat",
    minAmount: 500,
    bgColor: "#FFE8E8",
    illustration: "bus",
  },
  {
    id: 2,
    category: "Bus",
    title: "Save up to Rs 500 on IDFC FIRST Bank Credit cards",
    validTill: "30 Jun",
    code: "IDFC500",
    discount: 500,
    discountType: "flat",
    minAmount: 800,
    bgColor: "#FFE8E8",
    bankLogo: "IDFC",
  },
  {
    id: 3,
    category: "Bus",
    title: "Save upto Rs 500 on RBL Bank Credit card",
    validTill: "30 Jun",
    code: "RBLCC500",
    discount: 500,
    discountType: "flat",
    minAmount: 800,
    bgColor: "#FFE8E8",
    bankLogo: "RBL",
  },
  {
    id: 4,
    category: "Bus",
    title: "Save upto Rs 200 with AU Bank Credit Cards",
    validTill: "30 Jun",
    code: "AUBUS200",
    discount: 200,
    discountType: "flat",
    minAmount: 400,
    bgColor: "#EDE8FF",
    bankLogo: "AU",
  },
  {
    id: 5,
    category: "Bus",
    title: "Get 10% off on your first bus booking",
    validTill: "31 Jul",
    code: "FIRST10",
    discount: 10,
    discountType: "percent",
    maxDiscount: 150,
    minAmount: 300,
    bgColor: "#FFF3E0",
    illustration: "bus",
  },
  {
    id: 6,
    category: "Festival",
    title: "Diwali Special! Flat Rs 250 off on all bus tickets",
    validTill: "30 Jun",
    code: "DIWALI250",
    discount: 250,
    discountType: "flat",
    minAmount: 500,
    bgColor: "#FFF8E1",
    illustration: "festival",
  },
  {
    id: 7,
    category: "Festival",
    title: "Independence Day offer — 15% off on bus travel",
    validTill: "15 Aug",
    code: "INDIE15",
    discount: 15,
    discountType: "percent",
    maxDiscount: 200,
    minAmount: 400,
    bgColor: "#E8F5E9",
    illustration: "festival",
  },
  {
    id: 8,
    category: "Weekend",
    title: "Weekend getaway — Rs 150 off on Friday & Saturday rides",
    validTill: "31 Jul",
    code: "WKND150",
    discount: 150,
    discountType: "flat",
    minAmount: 400,
    bgColor: "#EDE8FF",
    illustration: "bus",
  },
  {
    id: 9,
    category: "Weekend",
    title: "Sunday special — 12% off on all routes",
    validTill: "31 Jul",
    code: "SUN12",
    discount: 12,
    discountType: "percent",
    maxDiscount: 180,
    minAmount: 350,
    bgColor: "#FFF3E0",
    illustration: "bus",
  },
];

export function generateSeatLayout(busId) {
  const bus = mockBuses.find((b) => b.id === busId);
  const isSleeper = bus?.busType.includes("Sleeper");

  const bookedSeats = new Set();
  const femaleSeats = new Set();

  const totalSeats = bus?.totalSeats || 40;
  const bookedCount = totalSeats - (bus?.availableSeats || 20);

  const allSeatIds = [];
  for (let i = 1; i <= totalSeats; i++) {
    allSeatIds.push(i);
  }

  // Randomly pick booked seats
  const shuffled = [...allSeatIds].sort(() => Math.random() - 0.5);
  shuffled.slice(0, bookedCount).forEach((id) => bookedSeats.add(id));

  // Mark some seats as female-only
  const femaleCount = Math.floor(totalSeats * 0.1);
  shuffled.slice(bookedCount, bookedCount + femaleCount).forEach((id) => {
    if (!bookedSeats.has(id)) femaleSeats.add(id);
  });

  if (isSleeper) {
    return generateSleeperLayout(totalSeats, bookedSeats, femaleSeats);
  } else {
    return generateSeaterLayout(totalSeats, bookedSeats, femaleSeats);
  }
}

function generateSleeperLayout(totalSeats, bookedSeats, femaleSeats) {
  const seatsPerDeck = Math.floor(totalSeats / 2);
  const lower = generateSleeperDeckLayout(1, seatsPerDeck, bookedSeats, femaleSeats);
  const upper = generateSleeperDeckLayout(seatsPerDeck + 1, totalSeats, bookedSeats, femaleSeats);
  return { type: "sleeper", lower, upper };
}

// 1 berth left + aisle + 2 berths right per row (like real Indian sleeper buses)
function generateSleeperDeckLayout(start, end, bookedSeats, femaleSeats) {
  const rows = [];
  let seatNum = start;
  while (seatNum <= end) {
    const row = [];
    const positions = ["window", null, "aisle", "window"];
    for (const pos of positions) {
      if (pos === null) {
        row.push(null);
      } else if (seatNum <= end) {
        row.push({
          id: seatNum,
          number: `S${seatNum}`,
          type: pos,
          status: bookedSeats.has(seatNum) ? "booked" : "available",
          isFemaleOnly: femaleSeats.has(seatNum),
        });
        seatNum++;
      } else {
        row.push(null);
      }
    }
    rows.push(row);
  }
  return rows;
}

function generateSeaterLayout(totalSeats, bookedSeats, femaleSeats) {
  const seats = generateDeckLayout(1, totalSeats, bookedSeats, femaleSeats);
  return { type: "seater", lower: seats };
}

function generateDeckLayout(start, end, bookedSeats, femaleSeats) {
  const rows = [];
  let seatNum = start;
  while (seatNum <= end) {
    const row = [];
    // Layout: [window, aisle, null(aisle gap), aisle, window]
    const positions = ["window", "aisle", null, "aisle", "window"];
    for (const pos of positions) {
      if (pos === null) {
        row.push(null); // aisle gap
      } else if (seatNum <= end) {
        row.push({
          id: seatNum,
          number: `S${seatNum}`,
          type: pos,
          status: bookedSeats.has(seatNum) ? "booked" : "available",
          isFemaleOnly: femaleSeats.has(seatNum),
        });
        seatNum++;
      } else {
        row.push(null);
      }
    }
    rows.push(row);
  }
  return rows;
}
