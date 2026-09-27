// English practice passages. Data only — no UI code here.
// To add a passage: append an object with a unique id (en-<category>-<n>), one of the
// categories below, a difficulty (easy | medium | hard | exam) and plain text on one
// line. Length decides the Short / Medium / Long filter automatically.
// Categories: general, education, science, environment, technology, india,
//             currentAffairs, motivation

export const ENGLISH_PASSAGES = [
  // ---------- easy ----------
  {
    id: "en-education-1",
    category: "education",
    difficulty: "easy",
    title: "The Gift of Education",
    text: "Education gives us the ability to understand the world around us and make better decisions. A good teacher does not only share facts. A good teacher helps students ask questions and think for themselves.",
  },
  {
    id: "en-general-1",
    category: "general",
    difficulty: "easy",
    title: "A Morning Walk",
    text: "Every morning my grandfather goes for a walk in the park near our house. He says that fresh air and a little exercise keep his mind calm for the whole day. On Sundays I walk with him and we talk about many things.",
  },
  {
    id: "en-motivation-1",
    category: "motivation",
    difficulty: "easy",
    title: "Small Steps",
    text: "Big goals are reached through small steps taken every day. If you practise for only ten minutes daily, you will see a clear change in a month. Do not wait for the perfect day to begin. Start today.",
  },
  {
    id: "en-environment-1",
    category: "environment",
    difficulty: "easy",
    title: "Save Water",
    text: "Water is precious and we should not waste it. Turn off the tap while brushing your teeth and repair leaking pipes quickly. Collecting rain water on the roof is a simple way to save water for dry months.",
  },
  {
    id: "en-india-1",
    category: "india",
    difficulty: "easy",
    title: "Unity in Diversity",
    text: "India is a land of many languages, festivals and traditions. People from different states dress, cook and celebrate in their own ways, yet they share a common pride in their country. This is what we call unity in diversity.",
  },
  // ---------- medium ----------
  {
    id: "en-science-1",
    category: "science",
    difficulty: "medium",
    title: "How Plants Make Food",
    text: "Green plants make their own food through a process called photosynthesis. Their leaves contain a green pigment called chlorophyll, which traps energy from sunlight. Using this energy, plants combine water from the soil with carbon dioxide from the air to produce glucose, and they release oxygen as a by-product. Almost every living thing on Earth depends on this simple but remarkable process.",
  },
  {
    id: "en-technology-1",
    category: "technology",
    difficulty: "medium",
    title: "Staying Safe Online",
    text: "The internet has made it easy to learn, shop and pay bills from home, but it also brings new risks. Never share your password or one-time password with anyone, even if the caller claims to be from your bank. Use different passwords for important accounts, keep your phone updated, and think twice before clicking on links sent by unknown people.",
  },
  {
    id: "en-education-2",
    category: "education",
    difficulty: "medium",
    title: "Learning by Doing",
    text: "Children remember what they do far better than what they only hear. When a class plants a small garden, measures the growth of seeds and records the results, lessons about plants, numbers and patience come alive. Activity-based learning turns the classroom into a place of curiosity, and it helps teachers understand how each child thinks.",
  },
  {
    id: "en-currentAffairs-1",
    category: "currentAffairs",
    difficulty: "medium",
    title: "Digital Payments in Daily Life",
    text: "Digital payments have changed the way people in India buy and sell. A vegetable seller can now accept money by showing a QR code, and a student can pay a fee from a mobile phone in seconds. This convenience also calls for care. Users should check the name of the receiver before paying and should never scan a code to receive money.",
  },
  {
    id: "en-general-2",
    category: "general",
    difficulty: "medium",
    title: "The Value of Reading",
    text: "Reading is one of the few habits that improves almost every part of life. It widens our vocabulary, sharpens our concentration and lets us see the world through the eyes of other people. A reader who spends even twenty minutes with a good book each evening slowly builds knowledge that no examination can take away.",
  },
  {
    id: "en-motivation-2",
    category: "motivation",
    difficulty: "medium",
    title: "Learning from Failure",
    text: "Failure is not the opposite of success; it is part of the path that leads to it. Every mistake shows us what does not work and points us towards what might. Students who treat a poor result as feedback, rather than as a judgement on their ability, usually return stronger. What matters most is the decision to try again with a better plan.",
  },
  // ---------- hard ----------
  {
    id: "en-science-2",
    category: "science",
    difficulty: "hard",
    title: "The Water Cycle",
    text: "The water cycle is a continuous journey that water makes between the Earth's surface and the atmosphere. Heat from the Sun causes evaporation from oceans, rivers and lakes, while plants release water vapour through transpiration. As this moist air rises, it cools and condenses into tiny droplets that form clouds. When the droplets combine and grow heavy, they fall back as rain, snow or hail. Some of this water flows into rivers, some soaks into the ground to recharge aquifers, and the cycle begins again.",
  },
  {
    id: "en-environment-2",
    category: "environment",
    difficulty: "hard",
    title: "Forests and Climate",
    text: "Forests are often described as the lungs of the planet, but their role is far wider than producing oxygen. They absorb carbon dioxide, regulate rainfall, protect the soil from erosion and provide shelter to countless species. When forests are cleared for short-term gain, communities lose clean water, fertile land and protection against floods. Protecting existing forests, while restoring degraded land with native trees, is one of the most practical steps any society can take against climate change.",
  },
  {
    id: "en-technology-2",
    category: "technology",
    difficulty: "hard",
    title: "Artificial Intelligence in Classrooms",
    text: "Artificial intelligence is gradually finding its way into classrooms, from tools that check pronunciation to software that suggests practice questions based on a student's mistakes. Used thoughtfully, such tools can give teachers more time for the human side of teaching: encouragement, discussion and guidance. However, they also raise important questions about privacy, fairness and over-dependence. Technology works best when it supports good teaching rather than trying to replace it.",
  },
  {
    id: "en-india-2",
    category: "india",
    difficulty: "hard",
    title: "The Indian Constitution",
    text: "The Constitution of India, which came into force on 26 January 1950, is the foundation on which the world's largest democracy stands. It guarantees fundamental rights such as equality before the law, freedom of speech and the right to education, while also reminding citizens of their fundamental duties. Its framers, led by Dr. B. R. Ambedkar as chairman of the drafting committee, balanced the diversity of the nation with a strong commitment to justice, liberty and fraternity.",
  },
  // ---------- exam ----------
  {
    id: "en-exam-1",
    category: "education",
    difficulty: "exam",
    title: "Role of a Teacher",
    text: "The role of a teacher in modern society has expanded far beyond the delivery of lessons from a prescribed syllabus. A teacher today is expected to be a facilitator, a mentor and a lifelong learner. In a classroom where students come from different social and linguistic backgrounds, the teacher must identify the needs of each learner and adapt methods accordingly. Continuous and comprehensive evaluation, activity-based learning and the use of local examples help students connect knowledge with their own lives. Equally important is the emotional climate of the classroom. When children feel safe to ask questions and make mistakes, they participate more freely and learn more deeply. A teacher who shows patience, fairness and genuine interest in students leaves an impression that lasts much longer than any single lesson.",
  },
  {
    id: "en-exam-2",
    category: "environment",
    difficulty: "exam",
    title: "Sustainable Development",
    text: "Sustainable development means meeting the needs of the present generation without compromising the ability of future generations to meet their own needs. It rests on three connected pillars: economic growth, social inclusion and environmental protection. For a developing country, the challenge is to reduce poverty and create employment while using natural resources wisely. Renewable energy, efficient public transport, water conservation and responsible waste management are practical steps in this direction. Citizens also have a role to play. Simple choices, such as reducing the use of single-use plastic, saving electricity and preferring local products, add up when millions of people make them. Development that ignores the environment may look impressive in the short run, but it creates costs that society must eventually pay.",
  },
  {
    id: "en-exam-3",
    category: "currentAffairs",
    difficulty: "exam",
    title: "India in Space",
    text: "India's space programme has grown from modest beginnings into one of the most respected in the world. In August 2023, the Chandrayaan-3 mission made India the first country to land a spacecraft near the south polar region of the Moon. The achievement was notable not only for its scientific value but also for the careful planning and cost-effective engineering behind it. Space technology is not limited to exploration. Satellites help farmers receive weather forecasts, guide fishermen, support disaster management and connect remote villages through communication networks. For students, such missions show that curiosity, hard work and teamwork can turn ambitious ideas into reality. They also remind us that the benefits of science are greatest when they reach the lives of ordinary citizens.",
  },
  {
    id: "en-exam-4",
    category: "motivation",
    difficulty: "exam",
    title: "Discipline and Consistency",
    text: "Talent may open a door, but discipline decides how far a person walks through it. Many students prepare seriously for a few days before an examination and then lose momentum. Consistent effort, even in small amounts, produces far better results than occasional bursts of hard work. A simple timetable, regular revision and honest self-assessment help build this consistency. It is also important to rest well, eat properly and take short breaks, because a tired mind cannot learn efficiently. Comparing oneself with others often creates needless pressure; a more useful comparison is with one's own performance of the previous week. When progress is measured in this way, every small improvement becomes a reason to continue, and confidence grows naturally.",
  },
];
