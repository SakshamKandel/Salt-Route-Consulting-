// ── Journal / editorial stories ─────────────────────────────────────────────
// Static content source shared by the homepage teaser (/), the journal index
// (/journal) and article pages (/journal/[slug]). Add entries here.

export type JournalArticle = {
  slug: string
  title: string
  category: string
  excerpt: string
  readTime: string
  date: string
  image: string
  body: string[]
}

export const journalArticles: JournalArticle[] = [
  {
    slug: "a-morning-in-ilams-tea-gardens",
    title: "A Morning in Ilam's Tea Gardens",
    category: "Places",
    excerpt:
      "Before the mist lifts off the eastern hills, the tea pickers are already among the rows. A slow account of dawn in Nepal's tea country.",
    readTime: "5 min read",
    date: "June 2026",
    image:
      "/images/marketing/nepal-landscape.jpg",
    body: [
      "Ilam wakes gently. Long before the sun crests the ridgeline, a soft grey light settles over the terraced gardens, and the first pickers move quietly between the rows, baskets on their backs, fingers finding the youngest leaves by touch as much as by sight.",
      "This is Nepal's tea country — a landscape of folded green hills in the far east of the country, where the air is cool and faintly sweet, and the day is measured not by the clock but by the light. To stay here is to borrow that rhythm for a while.",
      "By mid-morning the mist has burned away and the valley opens out in every direction: gardens stacked like contour lines, a distant monastery, the pale suggestion of the Himalaya beyond. It is the kind of view that asks nothing of you but attention.",
      "We shape our stays in Ilam around exactly this — mornings that begin slowly, tea poured from leaves grown on the hillside outside your window, and time enough to simply watch the country wake.",
    ],
  },
  {
    slug: "the-living-heritage-of-kathmandu-valley",
    title: "The Living Heritage of Kathmandu Valley",
    category: "Culture",
    excerpt:
      "Temples worn smooth by centuries of hands, courtyards where daily life and the sacred share the same stone. An invitation to look closer.",
    readTime: "6 min read",
    date: "May 2026",
    image:
      "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1600&auto=format&fit=crop",
    body: [
      "The Kathmandu Valley wears its history openly. In the old squares of the three royal cities, temples stand not behind ropes but in the middle of everything — market, shrine, meeting place, and monument all at once.",
      "What makes the valley remarkable is not any single monument but the way the sacred and the everyday are woven together. A woman lights a butter lamp on her way to work; children play in the shadow of a pagoda older than most nations; the smell of incense and frying dough drift through the same lane.",
      "To move through it well is to move slowly, and with a guide who knows which courtyard to duck into and when the light falls best across a particular carved façade.",
      "Our valley stays place you within walking distance of this living heritage, so the city reveals itself the way it should — on foot, unhurried, and up close.",
    ],
  },
  {
    slug: "slow-travel-why-nepal-rewards-the-unhurried",
    title: "Slow Travel: Why Nepal Rewards the Unhurried",
    category: "Journeys",
    excerpt:
      "The country does not give up its best moments to those in a rush. A case for staying longer, and doing less.",
    readTime: "4 min read",
    date: "April 2026",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop",
    body: [
      "There is a version of Nepal that can be seen in a week — a checklist of peaks and temples, ticked off between flights and jeep transfers. And there is another Nepal that only opens to those willing to stay a little longer and do a little less.",
      "The second is the one worth travelling for. It is the afternoon that turns into an evening because a host insisted you stay for tea. It is the walk you took with no destination that became the memory of the trip.",
      "Slow travel is not idleness; it is attention. It is choosing depth over distance, and letting a single valley become familiar rather than glimpsing ten.",
      "Every journey we shape is built on this belief — fewer places, more deeply felt. Tell us the pace you want, and we will build the days around it.",
    ],
  },
  {
    slug: "the-light-at-phewa-lake",
    title: "The Light at Phewa Lake",
    category: "Places",
    excerpt:
      "Pokhara is famous for the Annapurna backdrop, but the lake holds its own quiet drama at the hours most travellers miss. A field note from the shoreline.",
    readTime: "5 min read",
    date: "March 2026",
    image:
      "https://images.unsplash.com/photo-1706187975952-33765f844667?q=80&w=1600&auto=format&fit=crop",
    body: [
      "Most visitors come to Phewa Lake for the reflection — that famous mirror image of Machhapuchhre floating on still water at dawn. It is worth the early start. But the lake keeps a second, quieter show for those who stay into the evening.",
      "As the day cools, the wooden rowboats return to their moorings and the lakeside empties. The water goes from glass to silk, taking on the colours of the sky behind the ridge — rose, then amber, then a deep, unsaturated blue that holds for a long time before night.",
      "On the far shore, the Tal Barahi temple sits on its small island, lit faintly from within. You hear the bell before you see who is ringing it. A fisherman paddles past without hurrying. The mountains have already disappeared into their own shadow.",
      "We send our guests out onto the water at this hour, with a boatman who knows where to drift and when to be still. The reflection is the photograph; the evening is the memory.",
    ],
  },
  {
    slug: "a-kitchen-in-the-hills-newari-cooking",
    title: "A Kitchen in the Hills: Newari Cooking",
    category: "Food",
    excerpt:
      "The Newar people of the valley have one of the oldest living food traditions in the Himalaya. An afternoon spent learning it, one dish at a time.",
    readTime: "7 min read",
    date: "February 2026",
    image:
      "https://images.unsplash.com/photo-1567213230501-4627cf931f34?q=80&w=1600&auto=format&fit=crop",
    body: [
      "The kitchen is small, smoky, and warm. A clay stove burns against one wall; bundles of mustard greens, fermented bamboo shoots, and a slab of buffalo hang within arm's reach of the cook, who has been making these dishes since before I was born.",
      "Newari food is precise and ancient. There is chatamari — a rice-flour crepe topped with minced meat and egg, sometimes called Nepali pizza by people who have not eaten it. There is choila, grilled meat pounded with mustard oil, garlic, and roasted timur pepper. There is yomari, a sweet steamed dumpling shaped like a fig, filled with molasses and sesame, made for the winter festival.",
      "What you learn, watching, is that nothing is wasted and nothing is rushed. The fermented greens — gundruk — are prepared weeks ahead. The aila, a clear distilled spirit, is poured from a long-necked vessel into a small bowl with a flick of the wrist that takes years to master.",
      "By the end of the afternoon the table is crowded, the family has gathered, and the meal is eaten with the right hand and a patience that the food deserves. This is not a cooking class so much as an invitation to sit inside a tradition.",
    ],
  },
  {
    slug: "what-the-mountains-teach-about-waiting",
    title: "What the Mountains Teach About Waiting",
    category: "Journeys",
    excerpt:
      "In the high country, the weather decides the schedule. A short essay on acclimatisation days, and why they are not lost time.",
    readTime: "6 min read",
    date: "January 2026",
    image:
      "https://images.unsplash.com/photo-1713506052667-bf79c280a70f?q=80&w=1600&auto=format&fit=crop",
    body: [
      "The first acclimatisation day is the hardest for the impatient. You have flown across the world, walked for days, and now the trail stops — on purpose — at a village of stone houses and a single lodge, and you are told to rest.",
      "It feels like wasted time. It is not. The body is doing quiet, vital work: thickening the blood, adjusting the breath, learning to live on less oxygen. Skip this day and the mountain will collect the debt higher up, with interest.",
      "But there is something else the rest day teaches, less medical and more honest. The mountains do not run on your schedule. They never have. A storm rolls in over the pass and you wait. A porter twists an ankle and you wait. The clouds sit on the valley for two days and you wait.",
      "Travellers who learn to wait well — who use the day to drink tea with the lodge owner, to watch the yak trains come in, to walk the short ridge above camp just to see what is there — these travellers come home with a different story. Not of conquest, but of attention.",
      "We build our treks with this in mind. The rest days are not gaps in the itinerary. They are the itinerary.",
    ],
  },
  {
    slug: "the-monastery-at-boudhanath",
    title: "The Monastery at Boudhanath",
    category: "Culture",
    excerpt:
      "Around the great stupa, the day turns in a slow circle of pilgrims, butter lamps, and prayer wheels. A walk through one of the most sacred sites in the Himalaya.",
    readTime: "5 min read",
    date: "December 2025",
    image:
      "https://images.unsplash.com/photo-1648702978569-d21e6c4701b2?q=80&w=1600&auto=format&fit=crop",
    body: [
      "Boudhanath does not announce itself. You turn a corner in a residential neighbourhood of Kathmandu, pass through a gate, and suddenly the great white dome is there — vast, ancient, with the painted eyes of the Buddha watching over the square from all four sides.",
      "The faithful walk around it clockwise, kora, spinning prayer wheels as they go. Old women with prayer beads. A young monk on his phone. A Tibetan family that has come for a blessing. The circuit never really stops; it only slows after dark and resumes before dawn.",
      "Around the stupa, the rooftop cafes fill in the afternoon. From up there you can watch the whole rotation — the people, the pigeons, the light moving across the dome as it has for centuries. Below, the butter lamps burn in the small temples, and the smell of ghee and juniper hangs in the air.",
      "Stay until evening. The crowd thins, the lamps are lit, and the chanting from the surrounding monasteries begins to overlap into a single low hum that you feel as much as hear. This is the moment the place was built for.",
    ],
  },
  {
    slug: "lodges-we-trust-in-the-annapurnas",
    title: "Lodges We Trust in the Annapurnas",
    category: "Lodges",
    excerpt:
      "Not every teahouse on the trail is worth recommending. A short list of the ones we send our guests to, and why.",
    readTime: "6 min read",
    date: "November 2025",
    image:
      "https://images.unsplash.com/photo-1756746214471-d04bd3b37136?q=80&w=1600&auto=format&fit=crop",
    body: [
      "A trek is only as good as the place you sleep at the end of it. On the Annapurna circuit and sanctuary routes, the teahouse landscape has changed a great deal in the last decade — some lodges have grown into proper comfort, others have stayed honest and basic, and a few should be avoided.",
      "In Ghandruk, the family-run lodges on the upper terraces remain our preference. The rooms are simple, the dining room is warm, and the view from the window at dawn — Annapurna South and Hiunchuli turning gold — is the reason people come to Nepal.",
      "Higher up, in Chhomrong and beyond, the better lodges have invested in solar hot water and insulated dining rooms. The difference at 2,700 metres, after a long day's walk, is not minor. We book these in advance during the shoulder seasons; they fill.",
      "Above the tree line, comfort gives way to necessity. The lodges at Deurali and MBC are functional, and that is enough. What matters there is the staff — the young women and men who carry gas cylinders up the trail so you can have a hot cup of tea at 4,000 metres. We know the good ones, and we tip them well.",
      "Tell us your route and your standard, and we will place you in the right bed each night. It is one of the small things that makes a trek work.",
    ],
  },
  {
    slug: "the-river-and-the-raft",
    title: "The River and the Raft",
    category: "Journeys",
    excerpt:
      "Nepal's rivers drop fast from the Himalaya, and a few days on the Trisuli or Sun Koshi is a different way to see the country. Notes from the water.",
    readTime: "5 min read",
    date: "October 2025",
    image:
      "https://images.unsplash.com/photo-1641584495089-5914d85d9bcc?q=80&w=1600&auto=format&fit=crop",
    body: [
      "From the road, the rivers of Nepal look like ribbons of milk running between green hills. From the raft, they are something else entirely — cold, fast, and alive in a way that no photograph quite captures.",
      "The Trisuli is the gentle introduction: a day or two of rapids that a careful beginner can handle, with long calm stretches where you float and watch the canyon walls rise on either side. The Sun Koshi is the longer commitment — a multi-day expedition that starts in the low hills and runs east through country most travellers never see.",
      "What surprises people is the quiet. Between the rapids, the river is almost silent, and the banks hold villages, temples, and stretches of forest where you might see a fishing cat or a kingfisher. The camps are on white sand beaches, and the night sky, away from any town, is the one our grandparents knew.",
      "We work with a small group of river guides we have known for years. They read the water the way a good driver reads a road, and they know where to stop for lunch and where to portage the line that is not worth running.",
    ],
  },
  {
    slug: "chitwan-and-the-edge-of-the-forest",
    title: "Chitwan and the Edge of the Forest",
    category: "Places",
    excerpt:
      "The lowlands of the south are a different Nepal — flat, hot, and home to rhino, tiger, and the Tharu people. A few days in the country's first national park.",
    readTime: "6 min read",
    date: "September 2025",
    image:
      "https://images.unsplash.com/photo-1534215782964-d58601aa091c?q=80&w=1600&auto=format&fit=crop",
    body: [
      "After weeks in the hills, the Terai comes as a surprise. The land flattens, the air thickens, and the temperature climbs. You are still in Nepal, but it does not feel like it — and that is the point of coming.",
      "Chitwan, the country's first national park, holds the last great stretch of sal forest and grassland in the lowlands. The one-horned rhinoceros is the animal most people see, and see well — grazing in the early morning, or standing in a wallow at the forest edge, looking prehistoric and entirely unbothered.",
      "The tiger is rarer. Most visitors leave without one, and that is the honest answer. But the forest is full of other life: gharial crocodiles on the riverbanks, peacocks in the clearings, and the small, vivid birds that the grassland hides in plain sight.",
      "The Tharu people have lived here for centuries, and their longhouses, their harvest festivals, and their knowledge of the forest are worth as much time as the wildlife. We pair a stay in Chitwan with a Tharu village walk, led by a local guide who grew up here. It is the part of the trip people talk about longest.",
    ],
  },
  {
    slug: "the-craft-of-the-knife-in-bhojpur",
    title: "The Craft of the Knife in Bhojpur",
    category: "Craft",
    excerpt:
      "The khukuri is Nepal's most famous tool, and the village smiths of the eastern hills still make it by hand. A morning at a forge that has been in one family for four generations.",
    readTime: "7 min read",
    date: "August 2025",
    image:
      "https://images.unsplash.com/photo-1762514772931-42fe31cecd9d?q=80&w=1600&auto=format&fit=crop",
    body: [
      "The forge is dug into the ground, the bellows are worked by hand, and the smith — a quiet man in his fifties — has been making khukuri since he was tall enough to reach the anvil. His father made them before him, and his grandfather before that.",
      "The blade begins as a length of recycled truck leaf spring, heated to a dull red and hammered on a stump anvil until it takes the famous inward curve. The handle is carved from buffalo horn or hardwood, fitted by eye, and bound with brass. The small knives that sit in the sheath — the karda and the chakmak — are made in the same afternoon.",
      "What is striking is how little the process has changed. There is electricity in the village now, and a few of the younger smiths use power hammers, but the work is still done the old way: by hand, by heat, by judgement that comes from making the same object ten thousand times.",
      "A real village khukuri is not the ornamental blade sold in the tourist shops of Thamel. It is a working tool, balanced for the hand that will use it, and it carries the marks of the hammer that made it. We arrange visits to the forge for guests who want to see the work and, if they wish, to commission a blade.",
    ],
  },
  {
    slug: "when-to-come-a-short-guide-to-the-seasons",
    title: "When to Come: A Short Guide to the Seasons",
    category: "Journeys",
    excerpt:
      "Nepal has two real trekking windows and a handful of quieter alternatives. A plain guide to choosing the right month for the right trip.",
    readTime: "5 min read",
    date: "July 2025",
    image:
      "https://images.unsplash.com/photo-1751566477091-921125737d76?q=80&w=1600&auto=format&fit=crop",
    body: [
      "The first thing to know is that the monsoon is not a single event but a season, and it shapes the calendar more than any other factor. From late June through September, the hills are green, the trails are quiet, and the views are often hidden behind cloud.",
      "October and November are the classic months. The monsoon has cleared, the air is sharp, and the mountains stand out against a blue so deep it almost looks printed. The trails are busy, and the lodges fill — book early, and accept the company.",
      "March and April are the second window. The rhododendrons are in flower on the lower trails, the days lengthen, and the air is a little softer than in autumn. A fine choice for the Annapurnas and for treks that do not go too high too early.",
      "The winter months — December through February — are cold and clear, and the high passes close. But the lower routes, the cultural trips, and the wildlife of Chitwan are at their best, and the crowds are thin. We are happy to build a winter itinerary; it is one of our favourite times.",
    ],
  },
  {
    slug: "the-sound-of-a-festival-in-bhaktapur",
    title: "The Sound of a Festival in Bhaktapur",
    category: "Culture",
    excerpt:
      "Of the three old cities of the valley, Bhaktapur keeps its festivals loudest and most intact. A note from Bisket Jatra, when the city pulls its chariots through the narrow lanes.",
    readTime: "6 min read",
    date: "June 2025",
    image:
      "https://images.unsplash.com/photo-1561576019-4e870814d336?q=80&w=1600&auto=format&fit=crop",
    body: [
      "Bhaktapur is the smallest of the valley's royal cities, and the one that has held on to its old life most completely. The brick lanes are swept, the temples are lived in, and the festivals are not performances for visitors — they are the city's own business.",
      "At Bisket Jatra, in the spring, the chariots come out. Two great wooden wagons, carrying the gods, are hauled through the streets by teams of young men from the old quarters. The pulling is a contest, the contest is a tradition, and the tradition is several centuries old.",
      "The sound is what stays with you. Drums, bells, the creak of the chariot wheels on stone, and the crowd — not a crowd of tourists but of families, neighbours, and the old men who have watched this since they were the ones pulling.",
      "We time a small number of trips each year around the festival calendar. They are not for everyone — the streets are crowded, the hours are long, and there is no schedule you can rely on. But for the right traveller, there is no better way to see the valley as it actually lives.",
    ],
  },
  {
    slug: "a-walk-around-bandipur",
    title: "A Walk Around Bandipur",
    category: "Places",
    excerpt:
      "Halfway between Kathmandu and Pokhara, a hilltop town that time nearly forgot. A slow afternoon on its single paved street.",
    readTime: "4 min read",
    date: "May 2025",
    image:
      "https://images.unsplash.com/photo-1641720370581-71cfdf96e7af?q=80&w=1600&auto=format&fit=crop",
    body: [
      "Bandipur sits on a ridge above the Prithvi Highway, and most people drive past it without knowing it is there. That is its quiet good fortune. The town was a trade stop on the route between India and Tibet, and when the new road dropped into the valley below, Bandipur was simply left where it was.",
      "What remains is a single street of restored Newari shop-houses, a small temple square, and a view that runs the full width of the Himalaya on a clear day. There are no cars in the old town. You walk.",
      "An afternoon here is enough to slow down, and a night is better. The guesthouses are family-run, the food is local, and the silence after the buses of the highway is something you did not know you needed.",
      "We include Bandipur on most of our road journeys between the capital and Pokhara. It is the kind of stop that turns a transfer into a memory, and it asks for nothing but a little of your time.",
    ],
  },
  {
    slug: "the-porters-who-make-the-trek",
    title: "The Porters Who Make the Trek",
    category: "Journeys",
    excerpt:
      "Behind every trekker on a Himalayan trail is a team carrying the weight. A short piece on the people who make these journeys possible, and how we work with them.",
    readTime: "5 min read",
    date: "April 2025",
    image:
      "https://images.unsplash.com/photo-1600774841769-e7ac3da8fb99?q=80&w=1600&auto=format&fit=crop",
    body: [
      "There is a photograph most trekkers take, sooner or later: a porter coming up the trail behind you, a load that looks impossible balanced on a strap across his forehead, moving at a pace that does not slow on the steepest sections. You step aside. He nods. He passes.",
      "The porter is the backbone of trekking in Nepal, and the part of the industry that is most easily mistreated. The work is hard, the pay has historically been low, and the gear — in the worst cases — has been inadequate for the altitude.",
      "We do not run our treks that way. Our porters are employed directly, paid a fair wage above the union minimum, equipped with proper clothing and footwear, and insured for the duration of the trip. Their loads are weighed, and we keep them within the guidelines. This is not charity; it is the cost of doing the work properly.",
      "If you trek with us, you will meet your team at the start of the trail and walk with them for the duration. You will learn their names. By the end, you will understand that the mountain belongs to them more than to anyone carrying a camera.",
    ],
  },
  {
    slug: "mustang-and-the-edge-of-the-plateau",
    title: "Mustang and the Edge of the Plateau",
    category: "Places",
    excerpt:
      "Upper Mustang is the slice of Nepal that looks toward Tibet — rain-shadow desert, cave monasteries, and a kingdom that lasted until 2008. A note on a place unlike the rest of the country.",
    readTime: "7 min read",
    date: "March 2025",
    image:
      "https://images.unsplash.com/photo-1758701320640-048f894e6639?q=80&w=1600&auto=format&fit=crop",
    body: [
      "Cross the Kali Gandaki beyond Jomsom and the country changes. The green falls away, the wind picks up, and the rock turns to red, ochre, and a strange pale gold that the afternoon light makes almost unbearable to look at.",
      "Upper Mustang is a restricted area — a small number of permits, a required guide, and a landscape that has changed less in a thousand years than most places have in fifty. The walled city of Lo Manthang sits at the end of the road, its royal palace still standing though the kingdom itself was dissolved in 2008.",
      "The culture is Tibetan Buddhist, old and deep. The cave temples above the valley hold frescoes that date to the fifteenth century, and the monasteries are still active, still chanted in, still lived in by a handful of monks in a way that feels less like preservation and more like continuation.",
      "This is not an easy trip. It is dry, high, and exposed, and the wind can blow for days. But for the traveller who wants to see a Himalaya that the modern world has barely touched, there is nothing else quite like it. We run a small number of Mustang expeditions each season; they need planning, and they are worth it.",
    ],
  },
  {
    slug: "tea-with-a-stranger-in-langtang",
    title: "Tea with a Stranger in Langtang",
    category: "Journeys",
    excerpt:
      "The Langtang valley is the closest trek to Kathmandu, and one of the most human. A short story from a teahouse at 3,500 metres.",
    readTime: "5 min read",
    date: "February 2025",
    image:
      "https://images.unsplash.com/photo-1683171364844-99519ac3dae7?q=80&w=1600&auto=format&fit=crop",
    body: [
      "Langtang is the trek you can do when you do not have time for a trek. A day's drive from Kathmandu, a few days up the valley, and you are in the high country — glaciers above, yak pastures below, and the kind of air that makes you aware of your own breathing.",
      "The valley was badly damaged in the 2015 earthquake. A whole village was lost. What has come back, slowly and stubbornly, is a credit to the people who lived through it. The teahouses are rebuilt, the trails are open, and the welcome — perhaps because of what was lost — is warmer than anywhere else we go.",
      "On my last visit I sat in a lodge at Kyanjin Gompa while a woman I had never met poured me tea and told me, in careful English, about her daughter who was studying in the city. We talked for an hour. She did not need to. That is the trip, more than the peaks.",
      "If you have a week and want to see the Himalaya properly — not from a viewpoint but from inside it — Langtang is where we send you. It is not the most famous valley in Nepal. It is, in some ways, the truest.",
    ],
  },
]

export function getArticle(slug: string): JournalArticle | undefined {
  return journalArticles.find((a) => a.slug === slug)
}
