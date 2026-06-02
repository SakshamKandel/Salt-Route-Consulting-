/**
 * Visual Journey: Tapestry of Nepal
 * 13 tiles, each with cover + gallery images, hook, narrative, bullets, CTA.
 * Used by:
 *   - components/public/VisualJourney.tsx  (homepage horizontal scroller + modal)
 *   - app/(public)/visual-journey/page.tsx (long-form inside page)
 *
 * All image URLs were resolved from real Unsplash / Pexels photo pages
 * supplied by the client. To swap a photo, find a new photo on Unsplash or
 * Pexels and replace the helper-call below.
 */

export type VisualJourneyTile = {
  slug: string
  num: string
  title: string
  hook: string
  narrative: string
  bullets: { label: string; body: string }[]
  cta: string
  cover: string
  gallery: string[]
}

// Unsplash CDN
const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=1600&auto=format&fit=crop`

// Unsplash+ (premium) CDN
const up = (id: string) =>
  `https://plus.unsplash.com/premium_photo-${id}?q=80&w=1600&auto=format&fit=crop`

// Pexels
const p = (id: number | string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`

export const VISUAL_JOURNEY_TILES: VisualJourneyTile[] = [
  {
    slug: "kathmandu-durbar-squares",
    num: "01",
    title: "Kathmandu's Durbar Squares",
    hook: "Step into the living heart of ancient kingdoms, where centuries-old temples still pulse with daily devotion.",
    narrative:
      "The Kathmandu Valley boasts three majestic Durbar Squares — Kathmandu, Patan, and Bhaktapur. Once the royal palaces of rival kings, these squares are masterpieces of traditional brickwork, terra-cotta, and intricate timber carvings. Here, history isn't behind glass; it's alive. You'll find locals sipping tea on ancient temple steps, the revered Kumari (the living goddess) offering glimpses from her meticulously carved wooden window, and the scent of street food mingling with burning incense.",
    bullets: [
      { label: "Walk among marvels", body: "Explore palatial architecture and temples built between the 12th and 18th centuries." },
      { label: "The Living Goddess", body: "Witness the unique and ancient tradition of the Kumari." },
      { label: "Local life", body: "Taste authentic street snacks right in the shadow of towering pagodas." },
    ],
    cta: "Let us design an architectural and cultural walk that brings these ancient royal courts to life just for you.",
    // SNaSgKUE6VI · FTxTyNog7BY · 74Oi-lTP_Io · O7cGk7o6quQ
    cover: u("1706188370039-e0cf9bd6ea16"),
    gallery: [
      u("1706188370039-e0cf9bd6ea16"),
      u("1731227102390-15f6200d625e"),
      u("1670333667468-f5825eb39366"),
    ],
  },
  {
    slug: "culinary-canvas",
    num: "02",
    title: "A Culinary Canvas",
    hook: "Nepal's culinary scene is a vibrant reflection of its diverse terrain and centuries of trade.",
    narrative:
      "Beyond the iconic momo lies a rich tapestry of flavors. In the mountains, hearty Tibetan influences reign, while the Kathmandu Valley is famous for elaborate Newari feasts featuring spiced meats and beaten rice. Don't miss a traditional Thakali thali — a perfectly balanced platter of rice, lentils, seasonal vegetables, and rich ghee. And when you crave global tastes, the capital's cosmopolitan dining scene offers everything from authentic Italian wood-fired pizza to comforting Japanese ramen and Korean barbecue.",
    bullets: [
      { label: "The Perfect Balance", body: "Savor a traditional Thakali thali, celebrated for its nutritional and flavor harmony." },
      { label: "Indigenous Flavors", body: "Explore the complex, spice-rich dishes of the local Newa community." },
      { label: "Global Tastes", body: "Enjoy world-class international dining tucked away in Kathmandu's vibrant alleys." },
    ],
    cta: "Hungry for adventure? We'll weave the best local eateries and hidden dining gems into your journey.",
    // 5Q-7kgG7xbo · tSujMB65cXQ · lJNmedUvg74 · LR559Dcst70
    cover: u("1588644525273-f37b60d78512"),
    gallery: [
      u("1588644525273-f37b60d78512"),
      u("1593252719532-53f183016149"),
      u("1632283769417-1f275ffe3127"),
      u("1534422298391-e4f8c172dddb"),
    ],
  },
  {
    slug: "lumbini",
    num: "03",
    title: "Lumbini",
    hook: "Find your center in the subtropical plains where Siddhartha Gautama — the Buddha — was born over 2,500 years ago.",
    narrative:
      "A pilgrimage site of global significance, Lumbini is a serene expanse of monastic zones, ancient ruins, and sacred gardens. Unlike the towering peaks of the north, this region is flat, warm, and deeply tranquil. Wander among stunning monasteries built by nations from around the world, each reflecting unique Buddhist traditions and architectural styles, all united in the pursuit of mindfulness and peace.",
    bullets: [
      { label: "The Exact Spot", body: "Stand at the historic birthplace marked by the ancient Mayadevi Temple." },
      { label: "Global Architecture", body: "Explore a vast monastic zone featuring distinct temples from Thailand, Japan, Germany, and beyond." },
      { label: "A Different Landscape", body: "Experience the unique geography and warmer climate of the Terai plains." },
    ],
    cta: "Let us guide you through the sacred gardens to find your own moment of reflection.",
    // aNU8MnzWhKo · EY7jJ40zWug · 7uSwdSWjSVU · iXmnUFeHHjw
    cover: u("1616166831462-48a3e9089c20"),
    gallery: [
      u("1616166831462-48a3e9089c20"),
      u("1611892370612-0ac8e4a4507a"),
      u("1617587684591-082bc7f60f54"),
      u("1705602666111-cbc89f3e9afe"),
    ],
  },
  {
    slug: "janakpur",
    num: "04",
    title: "Janakpur",
    hook: "Enter a city where myth and reality blur, painted in the vibrant colors of the ancient Ramayana epic.",
    narrative:
      "Janakpur is the legendary birthplace of Goddess Sita and the site of her marriage to Lord Ram. At its heart lies the stunning Janaki Mandir, a massive marble temple blending Mughal and Rajput architecture that looks like it was pulled from a fairy tale. Beyond the temple, the city thrives with vibrant Mithila art, peaceful sacred ponds, and a deeply devoted local culture that makes you feel as though you've stepped back into the pages of history.",
    bullets: [
      { label: "Architectural Grandeur", body: "Marvel at the Janaki Mandir, a breathtaking structure built entirely of stone and marble." },
      { label: "Living Canvas", body: "Discover the intricate and colorful Mithila art that decorates local homes and crafts." },
      { label: "Sacred Waters", body: "Visit the ancient, stepped ponds where pilgrims perform daily rituals." },
    ],
    cta: "Step into a living legend with an itinerary that uncovers Nepal's spiritual south.",
    // I9qpVJXfGmo · wMVekFvHlzU · aUKJG9l-wks
    cover: u("1713627273497-cb9b6136ac62"),
    gallery: [
      u("1713627273497-cb9b6136ac62"),
      u("1575861359263-6c0867878d05"),
      u("1540996654611-699b763e8a1f"),
    ],
  },
  {
    slug: "mustang",
    num: "05",
    title: "Mustang",
    hook: "Journey to the rain shadow of the Himalayas, where an ancient, arid kingdom guards secrets of the old salt trade.",
    narrative:
      "Divided into Upper and Lower regions, Mustang is a stark, breathtaking high-altitude desert. Once an independent kingdom controlling the salt trade between Tibet and India, its cliffside caves and ancient monasteries remain remarkably preserved. It is also a land of profound spiritual harmony; at the sacred Muktinath temple, you will find 108 stone water spouts and the miraculous Jwala Mai, where natural earth gas burns an eternal flame directly over a flowing spring — revered by Hindus and tended by Buddhist nuns.",
    bullets: [
      { label: "A Desert in the Clouds", body: "Trek through a striking, wind-carved landscape entirely distinct from the rest of Nepal." },
      { label: "Cross-Religious Harmony", body: "Discover the mystical Muktinath temple, sacred to both Hindus and Buddhists." },
      { label: "Elemental Wonder", body: "Witness fire burning on water at the incredible Jwala Mai shrine." },
    ],
    cta: "Ready to explore the mysteries of the forbidden kingdom? Let's plan your expedition.",
    // tM7p9GOBPwk · aBX7Otg1oh8 · BPaH-9HM0gI · Pm5bAaUkXco
    cover: u("1619463206719-f87a692cdd7a"),
    gallery: [
      u("1619463206719-f87a692cdd7a"),
      up("1691735666207-be6e91326e3a"),
      u("1540876508220-988a11575ed6"),
      u("1540961286473-8ad1368dc1bd"),
    ],
  },
  {
    slug: "the-himalayas",
    num: "06",
    title: "The Himalayas",
    hook: "Stand in the shadow of giants, where the earth reaches its highest peaks and human resilience shines brightest.",
    narrative:
      "The Nepali Himalayas are more than just a dramatic backdrop; they are a way of life. This massive frozen frontier is home to eight of the world's fourteen highest peaks, including Everest. But the true soul of the mountains lies in the legendary Sherpa communities, the ancient trails connecting remote highland villages, and a rich history of mountaineering triumph. The air is thin, but the spirit of the Himalayas is undeniably powerful.",
    bullets: [
      { label: "The Roof of the World", body: "Gaze upon the most iconic and formidable mountain range on the planet." },
      { label: "Mountain People", body: "Connect with the legendary Sherpa culture, known for their warmth and high-altitude resilience." },
      { label: "Historic Trails", body: "Walk the same paths that have tested the world's greatest explorers." },
    ],
    cta: "Whether you want to trek to base camp or take a scenic mountain flight, we'll take you to the top of the world.",
    // dstd4DoLQ90 · 8__IZFB9AD8 · 3KqHG0zqarY  (YVDZINbyNd4 removed per client)
    cover: u("1513614835783-51537729c8ba"),
    gallery: [
      u("1513614835783-51537729c8ba"),
      u("1580424917967-a8867a6e676e"),
      up("1661963741928-673ed7f7c00b"),
    ],
  },
  {
    slug: "topographical-marvel",
    num: "07",
    title: "A Topographical Marvel",
    hook: "Experience the most dramatic geographical shift on Earth, all within the borders of a single, narrow country.",
    narrative:
      "Nepal is an ecological anomaly. In a lateral distance of just 150 kilometers, the land rockets from tropical, sea-level jungles in the south to the freezing, 8,848-meter summit of Mount Everest in the north. This incredible vertical climb means the Himalayas are the youngest and most active mountain range on the planet. This rapid elevation change creates diverse microclimates, shaping everything from the weather to the way people build their homes and farm the land.",
    bullets: [
      { label: "Extreme Shifts", body: "Travel from lush, humid plains to arctic alpine conditions in just a few days." },
      { label: "Living Geology", body: "Learn how the collision of tectonic plates created the youngest mountains on Earth." },
      { label: "Microclimates", body: "Experience completely distinct ecosystems that shift with every few hundred meters of elevation." },
    ],
    cta: "Discover the sheer scale of Nepal's changing landscapes with an expertly routed journey.",
    // infssQ2tjeM · WhZTCXud5Xc · xyE1p1rG04U
    cover: u("1637846959991-18e54d6e2035"),
    gallery: [
      u("1637846959991-18e54d6e2035"),
      u("1636513988093-126e51dee32d"),
      u("1518002054494-3a6f94352e9d"),
    ],
  },
  {
    slug: "wildlife-and-nature",
    num: "08",
    title: "Wildlife & Nature",
    hook: "Leave the city behind and step into some of the most successful conservation stories on the planet.",
    narrative:
      "Nepal's dense forests and national parks are sanctuaries for some of the world's most magnificent and endangered creatures. From tracking the elusive Bengal tiger and the one-horned rhinoceros in the southern jungles to spotting snow leopards in the high Himalayas, the biodiversity is staggering. Thanks to rigorous community-led conservation efforts and anti-poaching wins, Nepal has become a global model for protecting natural habitats and the migratory species that pass through them.",
    bullets: [
      { label: "Jungle Safaris", body: "Spot rhinos, elephants, and tigers in their natural, protected habitats." },
      { label: "Conservation Wins", body: "Learn about Nepal's globally recognized and successful anti-poaching campaigns." },
      { label: "Birdwatcher's Paradise", body: "Look out for hundreds of endemic and migratory species across diverse climates." },
    ],
    cta: "Let us organize an unforgettable wildlife safari tailored to your love for nature.",
    // FXVY6ZIOkhM · _rHplGon_uU · QMAOXqlLn5Q · IDO_a-dxrCY
    cover: u("1549888668-19281758dfbe"),
    gallery: [
      u("1549888668-19281758dfbe"),
      u("1534215782964-d58601aa091c"),
      up("1661832611972-b6ee1aba3581"),
      u("1500463959177-e0869687df26"),
    ],
  },
  {
    slug: "roots-and-agriculture",
    num: "09",
    title: "Roots & Agriculture",
    hook: "Taste the essence of the soil in a country where the rhythm of life is deeply tied to the harvest.",
    narrative:
      "Agriculture forms the backbone of Nepal, with terraced hillsides transforming from vibrant green to golden yellow with the changing seasons. The country's unique altitudes yield exceptional produce. Explore the rolling, misty tea estates of Fikkal in Ilam, where some of the world's finest orthodox teas are plucked by hand. Further west, shaded hillsides are producing rich, high-altitude Arabica coffee. It is a land where farming is still an art form, driven by the monsoon and generations of tradition.",
    bullets: [
      { label: "Highland Tea", body: "Walk through the scenic, mist-covered tea gardens of Ilam in eastern Nepal." },
      { label: "Himalayan Coffee", body: "Taste premium, single-origin coffee grown in high-altitude shade." },
      { label: "Terraced Beauty", body: "Witness the stunning, functional beauty of traditional farming carved into the mountainsides." },
    ],
    cta: "Add a flavor of the land to your trip with an exclusive tea or coffee estate tour.",
    // NqgeETELodA · 9vrKy0Jd1VA · mKie52E4xxc · 56HOtT5aGBs
    cover: u("1636947112949-8fa88a394e65"),
    gallery: [
      u("1636947112949-8fa88a394e65"),
      u("1659345709013-d949ed7ffc19"),
      up("1674864875568-374ab9e9dcbc"),
      u("1760007471922-2aac8483348c"),
    ],
  },
  {
    slug: "wellness-and-serenity",
    num: "10",
    title: "Wellness & Serenity",
    hook: "Unplug, breathe, and find your balance in the spiritual capital of the Himalayas.",
    narrative:
      "For centuries, seekers have journeyed to Nepal not just to climb mountains, but to look inward. The country offers a natural sanctuary for wellness and rejuvenation. Whether it's meditating in the quiet courtyards of a Buddhist monastery, practicing yoga as the sun rises over the Annapurnas, or experiencing the deep resonant healing of traditional singing bowl therapy, wellness here is deeply authentic. It's an invitation to slow down and reconnect with yourself.",
    bullets: [
      { label: "Ancient Healing", body: "Engage in authentic practices like singing bowl sound healing and Vipassana meditation." },
      { label: "Yoga with a View", body: "Practice mindfulness with breathtaking, panoramic views of the Himalayan range." },
      { label: "Natural Retreats", body: "Rejuvenate in natural hot springs hidden away in lush mountain valleys." },
    ],
    cta: "Let us tailor a retreat that balances exploration with profound personal restoration.",
    // No client-supplied URLs for this tile yet — using existing placeholders. Swap when ready.
    cover: u("1545389336-cf090694435e"),
    gallery: [
      u("1545389336-cf090694435e"),
      u("1566554273541-37a9ca77b91f"),
      "/luxury_nepalese_interior_details_1777124245155.png",
    ],
  },
  {
    slug: "adrenaline-and-adventure",
    num: "11",
    title: "Adrenaline & Adventure",
    hook: "Push your limits in a country that offers some of the most thrilling natural arenas on earth.",
    narrative:
      "Nepal is synonymous with high-octane adventure. Beyond trekking, the dramatic landscapes provide the perfect setting for a massive rush of adrenaline. Navigate world-class rapids on a white-water rafting expedition, free-fall toward a raging glacial river on a canyon bungee jump, or paraglide seamlessly alongside Himalayan griffons in Pokhara. For those looking for modern thrills, you can even explore rugged forest trails on an ATV or walk above the clouds on a glass skywalk.",
    bullets: [
      { label: "River Rushing", body: "Conquer some of the best white-water rafting and kayaking rivers in the world." },
      { label: "Modern Thrills", body: "Experience the rush of contemporary adventures like ATV riding and high-altitude skywalks." },
      { label: "Take Flight", body: "Paraglide over tranquil lakes with a backdrop of snow-capped peaks." },
    ],
    cta: "Ready to get your heart racing? Let us inject some pure adrenaline into your itinerary.",
    // u3aYUsaHT20 (Unsplash) + Pexels: 12121705 · 31758766 · 37416846 · 14981339
    cover: u("1554710869-95f3df6a3197"),
    gallery: [
      u("1554710869-95f3df6a3197"),
      p(12121705),
      p(31758766),
      p(37416846),
      p(14981339),
    ],
  },
  {
    slug: "rhythms-of-nepal",
    num: "12",
    title: "Rhythms of Nepal",
    hook: "Step into a calendar dictated by the moon, where there are almost as many festivals as there are days in the year.",
    narrative:
      "Nepal does not keep its culture in museums; it celebrates it in the streets. From the colorful, chaotic chariot processions of Indra Jatra and Bisket Jatra to the vibrant color-throwing of Holi and the glowing oil lamps of Tihar, festivals here are explosive and deeply communal. These celebrations are a dazzling mix of Hindu and Buddhist traditions, filled with masked dances, traditional music, and feasting that sweep up locals and travelers alike into the joy of the moment.",
    bullets: [
      { label: "Chariot Processions", body: "Witness massive wooden chariots being pulled through the narrow streets of ancient cities." },
      { label: "Ancient Dances", body: "Experience the visual spectacle of masked deity dances that have been performed for centuries." },
      { label: "Communal Joy", body: "Immerse yourself in celebrations that welcome everyone to join the music and color." },
    ],
    cta: "Time your visit perfectly — let us align your journey with Nepal's most spectacular celebrations.",
    // Pexels: 32135288 · 37234410 · 35201166 · 32135290 · 33440910 · 31707427
    cover: p(32135288),
    gallery: [
      p(32135288),
      p(37234410),
      p(35201166),
      p(32135290),
      p(33440910),
      p(31707427),
    ],
  },
  {
    slug: "arts-and-artisans",
    num: "13",
    title: "Arts & Artisans",
    hook: "Discover the meticulous craftsmanship that has adorned temples and homes for generations.",
    narrative:
      "The artistic heritage of Nepal is kept alive by masterful artisans whose skills have been passed down through centuries. In the narrow alleys of Patan and Bhaktapur, you can hear the rhythmic tapping of metalworkers forging singing bowls and intricate copper deities. Watch master painters use single-hair brushes to create highly detailed, meditative Thangka paintings, and see woodcarvers chisel intricate mandala designs into timber. Every piece tells a story of devotion, patience, and incredible skill.",
    bullets: [
      { label: "Sacred Paintings", body: "Observe the meditative, precise process of authentic Thangka painting." },
      { label: "Metal Forging", body: "Visit traditional foundries where singing bowls and bronze statues are hand-forged." },
      { label: "Wooden Masterpieces", body: "See firsthand how raw timber is transformed into intricate architectural art." },
    ],
    cta: "Let us guide you to the authentic workshops and hidden artisan studios of the Kathmandu Valley.",
    // Pexels: 37324525 · 12035212 · 11485748 · 30734381
    cover: p(37324525),
    gallery: [
      p(37324525),
      p(12035212),
      p(11485748),
      p(30734381),
    ],
  },
]
