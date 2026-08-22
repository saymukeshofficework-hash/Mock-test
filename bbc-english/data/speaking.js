/* Speaking Lab prompts. Original content — realistic everyday situations.
   Each entry: id, category, title, prompt, tip, seconds */
window.SPEAKING_PROMPTS = [
  { id: "s1", category: "Introductions", title: "Introduce Yourself", prompt: "Say your name, where you're from, and one thing you enjoy doing.", tip: "Start with 'Hi, I'm...' and speak slowly and clearly.", seconds: 30 },
  { id: "s2", category: "Introductions", title: "Introduce Your Family", prompt: "Describe your family — how many members, their names and what they do.", tip: "Use simple present tense: 'My father works as...'", seconds: 45 },
  { id: "s3", category: "Introductions", title: "Talk About Your Hometown", prompt: "Describe Burhar or your hometown to someone visiting for the first time.", tip: "Mention location, what it's known for, and one place to visit.", seconds: 45 },
  { id: "s4", category: "Meeting People", title: "Meet a New Classmate", prompt: "You meet a new student on your first day. Introduce yourself and ask about them.", tip: "Ask open questions: 'Where are you from?' 'What do you like?'", seconds: 30 },
  { id: "s5", category: "Meeting People", title: "Small Talk at an Event", prompt: "You're at a friend's function. Make small talk with someone you just met.", tip: "Comment on the event, then ask a friendly question.", seconds: 30 },
  { id: "s6", category: "Meeting People", title: "Reconnect With an Old Friend", prompt: "You meet a school friend after years. Greet them and catch up.", tip: "Use 'It's been so long!' and ask what they've been doing.", seconds: 30 },
  { id: "s7", category: "Classroom", title: "Ask Your Teacher a Question", prompt: "You didn't understand a topic. Politely ask your teacher to explain it again.", tip: "Use 'Could you please explain... again?'", seconds: 20 },
  { id: "s8", category: "Classroom", title: "Give an Opinion in Class", prompt: "Your teacher asks the class's opinion on a topic. Share your view politely.", tip: "Start with 'In my opinion...' or 'I think that...'", seconds: 30 },
  { id: "s9", category: "Classroom", title: "Explain a Topic to a Classmate", prompt: "A classmate missed class. Explain what was taught today in simple words.", tip: "Use simple, short sentences and check they understood.", seconds: 45 },
  { id: "s10", category: "Shopping", title: "Ask About a Product", prompt: "You're in a shop and want to know the price and details of an item.", tip: "Use 'How much does this cost?' and 'Do you have this in another size?'", seconds: 30 },
  { id: "s11", category: "Shopping", title: "Ask for a Discount", prompt: "Politely ask the shopkeeper if a discount is possible.", tip: "Use 'Could you give me a little discount, please?'", seconds: 20 },
  { id: "s12", category: "Shopping", title: "Return or Exchange an Item", prompt: "Explain to the shopkeeper why you want to return or exchange something.", tip: "Explain the reason clearly and stay polite even if there's a problem.", seconds: 30 },
  { id: "s13", category: "Restaurant", title: "Order Food", prompt: "You're at a restaurant. Order a meal and a drink politely.", tip: "Use 'Could I have...' or 'I'd like to order...'", seconds: 30 },
  { id: "s14", category: "Restaurant", title: "Ask About the Menu", prompt: "Ask the waiter to recommend a dish and explain what's in it.", tip: "Use 'What would you recommend?' and 'What's in this dish?'", seconds: 25 },
  { id: "s15", category: "Restaurant", title: "Make a Complaint Politely", prompt: "Your order was wrong. Politely explain the issue to the waiter.", tip: "Stay calm: 'Excuse me, I think there's a small mistake with my order.'", seconds: 30 },
  { id: "s16", category: "Travel", title: "Ask for Directions", prompt: "You're lost. Ask a stranger for directions to the bus stand.", tip: "Use 'Excuse me, could you tell me the way to...?'", seconds: 25 },
  { id: "s17", category: "Travel", title: "Book a Ticket", prompt: "You're at a ticket counter. Ask about timing and book a ticket.", tip: "Use 'What time does the next bus leave?'", seconds: 30 },
  { id: "s18", category: "Travel", title: "Describe Your Favourite Trip", prompt: "Talk about a place you've travelled to and what you liked about it.", tip: "Use past tense: 'I visited... It was...'", seconds: 45 },
  { id: "s19", category: "Telephone", title: "Answer a Phone Call", prompt: "Answer a call from an unknown number politely and ask who's calling.", tip: "Use 'Hello, who's speaking, please?'", seconds: 20 },
  { id: "s20", category: "Telephone", title: "Leave a Voicemail", prompt: "Leave a short voicemail explaining why you called and asking for a callback.", tip: "Give your name, reason, and 'Please call me back when you can.'", seconds: 30 },
  { id: "s21", category: "Telephone", title: "Reschedule an Appointment", prompt: "Call to politely ask if you can change the time of an appointment.", tip: "Use 'I was wondering if I could reschedule to...'", seconds: 30 },
  { id: "s22", category: "Interview", title: "Tell Me About Yourself", prompt: "Answer this common interview question in under a minute.", tip: "Cover: who you are, your background, and what you're looking for.", seconds: 60 },
  { id: "s23", category: "Interview", title: "Your Strengths", prompt: "Describe two of your strengths with an example for each.", tip: "Use 'One of my strengths is... For example...'", seconds: 45 },
  { id: "s24", category: "Interview", title: "Why Should We Hire You?", prompt: "Give a confident, honest answer to this question.", tip: "Focus on skills relevant to the role and your willingness to learn.", seconds: 45 },
  { id: "s25", category: "Workplace", title: "Ask Your Manager for Help", prompt: "You're stuck on a task. Ask your manager for guidance politely.", tip: "Use 'Could you help me understand...?'", seconds: 30 },
  { id: "s26", category: "Workplace", title: "Give an Update in a Meeting", prompt: "Give a short update on a task you're working on.", tip: "Structure: what you did, what's next, any blockers.", seconds: 45 },
  { id: "s27", category: "Workplace", title: "Disagree Politely", prompt: "You disagree with a colleague's idea. Share your view respectfully.", tip: "Use 'I see your point, but I think...'", seconds: 30 },
  { id: "s28", category: "Public Speaking", title: "Introduce a Speaker", prompt: "Introduce a guest speaker to an audience in a few sentences.", tip: "Mention their name, background, and why they're here.", seconds: 30 },
  { id: "s29", category: "Public Speaking", title: "Give a One-Minute Speech", prompt: "Speak for one minute on: 'Why daily practice matters.'", tip: "Plan a beginning, one main idea, and a closing line.", seconds: 60 },
  { id: "s30", category: "Public Speaking", title: "Thank the Audience", prompt: "Close a short talk by thanking the audience and inviting questions.", tip: "Use 'Thank you for listening. I'm happy to take any questions.'", seconds: 20 },
  { id: "s31", category: "Confidence", title: "Describe a Picture", prompt: "Pick any picture nearby and describe what you see in detail.", tip: "Describe people, place, colours and what might be happening.", seconds: 40 },
  { id: "s32", category: "Confidence", title: "Give Your Opinion", prompt: "Share your opinion on: 'Is daily practice more important than talent?'", tip: "State your opinion first, then give one reason.", seconds: 45 },
  { id: "s33", category: "Confidence", title: "Tell a Short Story", prompt: "Tell a short story about something interesting that happened to you.", tip: "Use past tense and keep a clear beginning, middle and end.", seconds: 60 }
];

/* The 7-Day Speaking Challenge — a fixed sequence of themes. */
window.SEVEN_DAY_CHALLENGE = [
  { day: 1, title: "Introduce Yourself", prompt: "Say your name, where you're from, and what you do or study.", seconds: 30 },
  { day: 2, title: "Your Family", prompt: "Describe your family members and one thing you enjoy doing together.", seconds: 40 },
  { day: 3, title: "Your School or Work", prompt: "Describe your school or workplace and what a typical day looks like.", seconds: 40 },
  { day: 4, title: "Your Favourite Place", prompt: "Describe your favourite place and why you like going there.", seconds: 45 },
  { day: 5, title: "Your Goals", prompt: "Talk about one goal you're working towards and your plan to reach it.", seconds: 45 },
  { day: 6, title: "Tell a Story", prompt: "Tell a short story about a memorable day in your life.", seconds: 60 },
  { day: 7, title: "Two-Minute Speech", prompt: "Choose any topic you like and speak confidently for two minutes.", seconds: 120 }
];
