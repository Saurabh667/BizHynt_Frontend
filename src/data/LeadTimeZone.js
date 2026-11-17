
const USE_CURRENT_OFFSET = true;

const norm = (v) => String(v ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const wrap = (v) => ` ${norm(v)} `;
const has = (hay, phrase) => hay.includes(` ${norm(phrase)} `);


const COUNTRIES = [
  ["India", "Asia/Kolkata", [
    "india", "new delhi", "delhi", "mumbai", "bengaluru", "bangalore", "hyderabad",
    "chennai", "kolkata", "pune", "ahmedabad", "jaipur", "lucknow", "noida", "gurgaon",
    "gurugram", "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
    "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka", "kerala",
    "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland",
    "odisha", "orissa", "punjab", "rajasthan", "sikkim", "tamil nadu", "telangana",
    "tripura", "uttar pradesh", "uttarakhand", "west bengal", "chandigarh", "jammu",
    "kashmir", "ladakh", "puducherry",
  ], ["in", "ind", "bharat"]],
  ["Pakistan", "Asia/Karachi", ["pakistan", "karachi", "lahore", "islamabad"], ["pk", "pak"]],
  ["Bangladesh", "Asia/Dhaka", ["bangladesh", "dhaka"], ["bd"]],
  ["Sri Lanka", "Asia/Colombo", ["sri lanka", "colombo"], ["lk"]],
  ["Nepal", "Asia/Kathmandu", ["nepal", "kathmandu"], ["np"]],
  ["UAE", "Asia/Dubai", ["united arab emirates", "uae", "dubai", "abu dhabi", "sharjah", "ajman"], ["ae"]],
  ["Saudi Arabia", "Asia/Riyadh", ["saudi arabia", "riyadh", "jeddah"], ["sa", "ksa"]],
  ["Qatar", "Asia/Qatar", ["qatar", "doha"], ["qa"]],
  ["Kuwait", "Asia/Kuwait", ["kuwait"], ["kw"]],
  ["Oman", "Asia/Muscat", ["oman", "muscat"], ["om"]],
  ["Bahrain", "Asia/Bahrain", ["bahrain"], ["bh"]],
  ["Israel", "Asia/Jerusalem", ["israel", "tel aviv", "jerusalem"], ["il"]],
  ["Turkey", "Europe/Istanbul", ["turkey", "turkiye", "istanbul", "ankara"], ["tr"]],
  ["Singapore", "Asia/Singapore", ["singapore"], ["sg"]],
  ["Malaysia", "Asia/Kuala_Lumpur", ["malaysia", "kuala lumpur"], ["my"]],
  ["Thailand", "Asia/Bangkok", ["thailand", "bangkok"], ["th"]],
  ["Vietnam", "Asia/Ho_Chi_Minh", ["vietnam", "viet nam", "hanoi", "ho chi minh"], ["vn"]],
  ["Indonesia", "Asia/Jakarta", ["indonesia", "jakarta"], ["id"]],
  ["Philippines", "Asia/Manila", ["philippines", "manila"], ["ph"]],
  ["Hong Kong", "Asia/Hong_Kong", ["hong kong"], ["hk"]],
  ["China", "Asia/Shanghai", ["china", "beijing", "shanghai", "shenzhen"], ["cn"]],
  ["Japan", "Asia/Tokyo", ["japan", "tokyo", "osaka"], ["jp"]],
  ["South Korea", "Asia/Seoul", ["south korea", "korea", "seoul"], ["kr"]],
  ["New Zealand", "Pacific/Auckland", ["new zealand", "auckland", "wellington"], ["nz"]],
  ["Australia", "Australia/Sydney", ["australia", "sydney", "melbourne", "brisbane", "adelaide", "perth", "new south wales", "queensland", "tasmania"], ["au", "aus"]],
  ["United Kingdom", "Europe/London", ["united kingdom", "great britain", "england", "scotland", "wales", "northern ireland", "london"], ["uk", "gb", "gbr"]],
  ["Ireland", "Europe/Dublin", ["ireland", "dublin"], ["ie"]],
  ["France", "Europe/Paris", ["france", "paris"], ["fr"]],
  ["Germany", "Europe/Berlin", ["germany", "berlin", "munich"], ["de"]],
  ["Spain", "Europe/Madrid", ["spain", "madrid", "barcelona"], ["es"]],
  ["Italy", "Europe/Rome", ["italy", "rome", "milan"], ["it"]],
  ["Netherlands", "Europe/Amsterdam", ["netherlands", "amsterdam"], ["nl"]],
  ["Belgium", "Europe/Brussels", ["belgium", "brussels"], ["be"]],
  ["Switzerland", "Europe/Zurich", ["switzerland", "zurich"], ["ch"]],
  ["Austria", "Europe/Vienna", ["austria", "vienna"], ["at"]],
  ["Sweden", "Europe/Stockholm", ["sweden", "stockholm"], ["se"]],
  ["Norway", "Europe/Oslo", ["norway", "oslo"], ["no"]],
  ["Denmark", "Europe/Copenhagen", ["denmark", "copenhagen"], ["dk"]],
  ["Finland", "Europe/Helsinki", ["finland", "helsinki"], ["fi"]],
  ["Poland", "Europe/Warsaw", ["poland", "warsaw"], ["pl"]],
  ["Portugal", "Europe/Lisbon", ["portugal", "lisbon"], ["pt"]],
  ["Greece", "Europe/Athens", ["greece", "athens"], ["gr"]],
  ["Czech Republic", "Europe/Prague", ["czech republic", "czechia", "prague"], ["cz"]],
  ["Romania", "Europe/Bucharest", ["romania", "bucharest"], ["ro"]],
  ["Ukraine", "Europe/Kyiv", ["ukraine", "kyiv", "kiev"], ["ua"]],
  ["Russia", "Europe/Moscow", ["russia", "moscow"], ["ru"]],
  ["Egypt", "Africa/Cairo", ["egypt", "cairo"], ["eg"]],
  ["South Africa", "Africa/Johannesburg", ["south africa", "johannesburg", "cape town"], ["za"]],
  ["Nigeria", "Africa/Lagos", ["nigeria", "lagos"], ["ng"]],
  ["Kenya", "Africa/Nairobi", ["kenya", "nairobi"], ["ke"]],
  ["Ghana", "Africa/Accra", ["ghana", "accra"], ["gh"]],
  ["Morocco", "Africa/Casablanca", ["morocco", "casablanca"], ["ma"]],
  ["Brazil", "America/Sao_Paulo", ["brazil", "brasil", "sao paulo"], ["br"]],
  ["Mexico", "America/Mexico_City", ["mexico", "mexico city"], ["mx"]],
  ["Argentina", "America/Argentina/Buenos_Aires", ["argentina", "buenos aires"], ["ar"]],
  ["Chile", "America/Santiago", ["chile", "santiago"], ["cl"]],
  ["Colombia", "America/Bogota", ["colombia", "bogota"], ["co"]],
  ["Peru", "America/Lima", ["peru", "lima"], ["pe"]],
  ["Canada", "America/Toronto", ["canada", "toronto", "vancouver", "montreal", "ontario", "british columbia", "alberta", "quebec"], ["ca", "can"]],
  ["USA", "America/New_York", ["united states", "united states of america", "usa", "u s a", "america"], ["us", "usa"]],
];

// US states: only used to recognise that an address is in the USA.
const US_STATE_NAMES = [
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut",
  "delaware", "district of columbia", "florida", "georgia", "hawaii", "idaho", "illinois",
  "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine", "maryland",
  "massachusetts", "michigan", "minnesota", "mississippi", "missouri", "montana",
  "nebraska", "nevada", "new hampshire", "new jersey", "new mexico", "new york",
  "north carolina", "north dakota", "ohio", "oklahoma", "oregon", "pennsylvania",
  "rhode island", "south carolina", "south dakota", "tennessee", "texas", "utah",
  "vermont", "virginia", "washington", "west virginia", "wisconsin", "wyoming",
];
const US_STATE_ABBR = new Set((
  "al ak az ar ca co ct de dc fl ga hi id il in ia ks ky la me md ma mi mn ms mo mt " +
  "ne nv nh nj nm ny nc nd oh ok or pa ri sc sd tn tx ut vt va wa wv wi wy"
).split(" "));

const byName = (name) => COUNTRIES.find((c) => c[0] === name);

// ---------- offsets ----------
const fmtCache = new Map();
const getFmt = (tz) => {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23",
      year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric",
    });
    fmtCache.set(tz, f);
  }
  return f;
};

function offsetMinutesAt(tz, date) {
  const p = {};
  for (const { type, value } of getFmt(tz).formatToParts(date)) p[type] = value;
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

function offsetMinutes(tz) {
  const now = new Date();
  if (USE_CURRENT_OFFSET) return offsetMinutesAt(tz, now);
  const y = now.getUTCFullYear();
  return Math.min(
    offsetMinutesAt(tz, new Date(Date.UTC(y, 0, 1, 12))),
    offsetMinutesAt(tz, new Date(Date.UTC(y, 6, 1, 12))),
  );
}

function formatOffset(min) {
  if (!min) return "0";
  const a = Math.abs(min);
  const h = Math.floor(a / 60);
  const m = a % 60;
  return `${min > 0 ? "+" : "-"}${h}${m ? ":" + String(m).padStart(2, "0") : ""}`;
}

const cache = new Map();

function buildResult(entry) {
  const [country, zone] = entry;
  let r = cache.get(zone);
  if (!r) {
    r = { zone, offset: formatOffset(offsetMinutes(zone)) };
    cache.set(zone, r);
  }
  let localTime = "";
  try {
    localTime = new Date().toLocaleTimeString("en-US", {
      timeZone: zone, hour: "numeric", minute: "2-digit",
    });
  } catch { /* ignore */ }
  return {
    ...r,
    country,
    city: country, // shown under the offset in the table
    title: `${country} · ${zone} (UTC${r.offset === "0" ? "" : r.offset})${localTime ? ` — now ${localTime}` : ""}`,
  };
}

// ---------- country detection ----------
export function getLeadCountry(lead) {
  if (!lead) return null;

  const addressRaw = String(lead.address || "");
  const text = [lead.city, lead.state, lead.country, lead.address].filter(Boolean).join(" , ");
  const hay = wrap(text);

  // 1) The country field itself (name or short code like "IN", "UK").
  const countryN = norm(lead.country);
  if (countryN) {
    const cHay = wrap(lead.country);
    const hit = COUNTRIES.find((c) => c[3].includes(countryN) || c[2].some((n) => has(cHay, n)));
    if (hit) return hit;
  }

  // 2) A country / well-known city found anywhere in state, city or address.
  //    "new mexico" is removed first so it isn't read as Mexico.
  const scan = hay.replace(/ new mexico /g, " ");
  const found = COUNTRIES.find((c) => c[2].some((n) => has(scan, n)));
  if (found) return found;

  // 3) Indian 6-digit pincode when no country is written anywhere.
  if (/\b[1-9]\d{5}\b/.test(`${lead.pincode || ""} ${addressRaw}`)) return byName("India");

  // 4) US clues: a state name, or "TX 75001" style abbreviation + ZIP.
  const stateN = norm(lead.state);
  const zip = addressRaw.match(/\b([A-Z]{2})\s+\d{5}(?:-\d{4})?\b/);
  if (
    US_STATE_NAMES.includes(stateN) ||
    US_STATE_ABBR.has(stateN) ||
    (zip && US_STATE_ABBR.has(zip[1].toLowerCase())) ||
    US_STATE_NAMES.some((s) => hay.includes(` ${s} `))
  ) {
    return byName("USA");
  }

  return null;
}

export function getLeadTimeZone(lead) {
  try {
    const entry = getLeadCountry(lead);
    return entry ? buildResult(entry) : null;
  } catch {
    return null;
  }
}