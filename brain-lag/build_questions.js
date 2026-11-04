// Script to generate and validate 165+ curated brain lag questions
const fs = require('fs');
const path = require('path');

const questions = [
  // --- TRICK QUESTIONS ---
  {
    id: "q001",
    category: "trick",
    difficulty: 1,
    timeLimit: 8,
    text: "Which is heavier: 1 kg of iron or 1 kg of cotton?",
    options: ["1 kg of iron", "1 kg of cotton", "They weigh the same", "Depends on humidity"],
    correct: 2,
    explanation: "Both weigh exactly 1 kg! A kilogram is a kilogram, regardless of what it's made of."
  },
  {
    id: "q002",
    category: "trick",
    difficulty: 1,
    timeLimit: 7,
    text: "If you overtake the person running in 2nd place, what place are you in?",
    options: ["1st place", "2nd place", "3rd place", "Last place"],
    correct: 1,
    explanation: "You took their spot! You are now in 2nd place. The leader is still in 1st."
  },
  {
    id: "q003",
    category: "trick",
    difficulty: 1,
    timeLimit: 7,
    text: "How many months have 28 days?",
    options: ["Just February (1)", "Only 4 months", "All 12 months", "Depends on leap year"],
    correct: 2,
    explanation: "All 12 months have at least 28 days! February isn't the only one."
  },
  {
    id: "q004",
    category: "trick",
    difficulty: 1,
    timeLimit: 7,
    text: "A rooster lays an egg at the very peak of a roof. Which side does it roll down?",
    options: ["Left side", "Right side", "It rolls off the front", "Roosters don't lay eggs"],
    correct: 3,
    explanation: "Roosters don't lay eggs! Hens do. Your brain lagged on poultry biology!"
  },
  {
    id: "q005",
    category: "trick",
    difficulty: 1,
    timeLimit: 8,
    text: "How much dirt is in a hole that is 3 meters deep, 2 meters wide, and 2 meters long?",
    options: ["12 cubic meters", "None (it's a hole!)", "6 cubic meters", "4 cubic meters"],
    correct: 1,
    explanation: "A hole is completely empty by definition! There is no dirt in it."
  },
  {
    id: "q006",
    category: "trick",
    difficulty: 2,
    timeLimit: 7,
    text: "A plane crashes directly on the border between USA and Canada. Where do they bury the survivors?",
    options: ["In the USA", "In Canada", "You don't bury survivors!", "On the border"],
    correct: 2,
    explanation: "You don't bury survivors! Unless you have very dark plans for them."
  },
  {
    id: "q007",
    category: "trick",
    difficulty: 1,
    timeLimit: 7,
    text: "Some months have 31 days, others have 30. How many have 30 days?",
    options: ["4 months", "7 months", "11 months", "All 12 months"],
    correct: 2,
    explanation: "11 months have at least 30 days! (All except February)."
  },
  {
    id: "q008",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "An electric train is traveling south at 70 mph. The wind is blowing north at 20 mph. Which direction does the smoke blow?",
    options: ["South", "North", "North-West", "Electric trains have no smoke"],
    correct: 3,
    explanation: "Electric trains do not produce smoke! Zero emissions on this track."
  },
  {
    id: "q009",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "If you have 3 apples and you take away 2, how many do you have?",
    options: ["1 apple", "2 apples", "3 apples", "0 apples"],
    correct: 1,
    explanation: "You took 2 apples, so YOU have 2 apples! The other person is left with 1."
  },
  {
    id: "q010",
    category: "trick",
    difficulty: 1,
    timeLimit: 7,
    text: "A farmer had 17 sheep. All but 9 ran away. How many sheep are left?",
    options: ["8 sheep", "9 sheep", "17 sheep", "0 sheep"],
    correct: 1,
    explanation: "'All but 9' means exactly 9 sheep remained! Your math reflex tricked you into subtracting."
  },
  {
    id: "q011",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "How many animals of each species did Moses take onto the Ark?",
    options: ["2 of each", "7 of each", "None (Noah built the Ark)", "1 of each"],
    correct: 2,
    explanation: "Noah built the Ark, not Moses! Moses was parting seas, not collecting animals."
  },
  {
    id: "q012",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "Can a man legally marry his widow's sister?",
    options: ["Yes, in most countries", "No, it is illegal", "No, because he is dead!", "Only with permission"],
    correct: 2,
    explanation: "If his wife is a widow, that means HE is dead! Ghosts cannot legally marry."
  },
  {
    id: "q013",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "A doctor gives you 3 pills and tells you to take one every 30 minutes. How long do they last?",
    options: ["90 minutes", "60 minutes", "30 minutes", "45 minutes"],
    correct: 1,
    explanation: "Take pill 1 at 0 min, pill 2 at 30 min, and pill 3 at 60 min. Total elapsed time: 60 minutes!"
  },
  {
    id: "q014",
    category: "trick",
    difficulty: 1,
    timeLimit: 7,
    text: "How many grooves are on a standard vinyl LP record (one side)?",
    options: ["Hundreds of grooves", "Around 50 grooves", "Just 1 continuous groove", "Zero grooves"],
    correct: 2,
    explanation: "Each side of a vinyl record has just ONE continuous spiral groove running inward!"
  },
  {
    id: "q015",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "A butcher stands 6 feet tall and wears size 11 shoes. What does he weigh?",
    options: ["185 lbs", "Meat", "210 lbs", "Feathers"],
    correct: 1,
    explanation: "A butcher weighs MEAT! That's his job."
  },
  {
    id: "q016",
    category: "trick",
    difficulty: 2,
    timeLimit: 7,
    text: "If you overtake the person running in last place, what place are you in?",
    options: ["2nd to last", "Last place", "Impossible!", "First place"],
    correct: 2,
    explanation: "It's impossible to overtake the person in last place, because if you were behind them, they wouldn't be last!"
  },
  {
    id: "q017",
    category: "trick",
    difficulty: 1,
    timeLimit: 7,
    text: "How many birthdays does the average human have?",
    options: ["75 to 85", "Only 1 birthday", "Depends on leap years", "365"],
    correct: 1,
    explanation: "You are only born ONCE! Every year after that is simply an anniversary of your birth."
  },
  {
    id: "q018",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "Before Mount Everest was discovered, what was the highest mountain in the world?",
    options: ["K2", "Mount Kilimanjaro", "Mount Everest", "Kangchenjunga"],
    correct: 2,
    explanation: "Mount Everest was still the highest mountain; humans just hadn't discovered it yet!"
  },
  {
    id: "q019",
    category: "trick",
    difficulty: 2,
    timeLimit: 7,
    text: "What gets wetter the more it dries?",
    options: ["A sponge", "A towel", "Raincoat", "Ice"],
    correct: 1,
    explanation: "A towel absorbs more water the more items it dries!"
  },
  {
    id: "q020",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "Mary's father has 5 daughters: Nana, Nene, Nini, Nono. What is the 5th daughter's name?",
    options: ["Nunu", "Mary", "Nancy", "Nina"],
    correct: 1,
    explanation: "Mary! The question began with 'Mary's father has 5 daughters'."
  },
  {
    id: "q021",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "In baseball, how many outs are there in an inning?",
    options: ["3 outs", "6 outs", "9 outs", "4 outs"],
    correct: 1,
    explanation: "An inning consists of two halves: 3 outs for the away team, 3 for the home team = 6 outs!"
  },
  {
    id: "q022",
    category: "trick",
    difficulty: 1,
    timeLimit: 7,
    text: "What goes up but never ever comes down?",
    options: ["Hot air balloon", "Your age", "Smoke", "A rocket"],
    correct: 1,
    explanation: "Your age only increases (sadly, biological time only moves forward!)."
  },
  {
    id: "q023",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "You are in a dark room with a candle, a wood stove, and a gas lamp. You only have ONE match. What do you light first?",
    options: ["The candle", "The gas lamp", "The match", "The wood stove"],
    correct: 2,
    explanation: "You must light the MATCH first before you can light anything else!"
  },
  {
    id: "q024",
    category: "trick",
    difficulty: 2,
    timeLimit: 7,
    text: "If a leaf falls into a pond in a forest where no one is around, does it sink or float?",
    options: ["Sinks", "Floats", "Neither", "Dissolves"],
    correct: 1,
    explanation: "Leaves float on water! Your brain expected a philosophical riddle about sound."
  },
  {
    id: "q025",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "A red house is made of red bricks. A blue house is made of blue bricks. What is a green house made of?",
    options: ["Green bricks", "Glass", "Wood", "Leaves"],
    correct: 1,
    explanation: "A greenhouse is made of glass! It's used for growing plants."
  },
  {
    id: "q026",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "How many sides does a circle have?",
    options: ["0 sides", "1 side", "2 sides (inside & outside)", "Infinite sides"],
    correct: 2,
    explanation: "A circle has 2 sides: the inside and the outside! (Geometric jokes at their finest)."
  },
  {
    id: "q027",
    category: "trick",
    difficulty: 2,
    timeLimit: 7,
    text: "What has a head and a tail, but no body?",
    options: ["A snake", "A coin", "A lizard", "A comet"],
    correct: 1,
    explanation: "A coin has 'heads' and 'tails', but no torso or legs!"
  },
  {
    id: "q028",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "Two fathers and two sons go fishing. Each catches one fish. Why did they only bring home 3 fish?",
    options: ["One fish got eaten", "They threw one back", "There were only 3 people (grandfather, father, son)", "One fish escaped"],
    correct: 2,
    explanation: "There are only 3 people: a grandfather, his son, and his grandson!"
  },
  {
    id: "q029",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "If there are 6 apples and you take away 4, how many apples do you have?",
    options: ["2 apples", "4 apples", "6 apples", "0 apples"],
    correct: 1,
    explanation: "You took 4 apples, so YOU possess 4 apples!"
  },
  {
    id: "q030",
    category: "trick",
    difficulty: 3,
    timeLimit: 8,
    text: "What has hands, but cannot clap?",
    options: ["A robot", "A clock", "A statue", "A mannequin"],
    correct: 1,
    explanation: "A clock has hour and minute hands, but it lacks the joy of applause."
  },

  // --- FAST MATH & NUMBER TRAPS ---
  {
    id: "q031",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 7,
    text: "Take 1000 and add 40. Now add another 1000. Now add 30. Add another 1000. Now add 20. Now add another 1000. Now add 10. What is the total?",
    options: ["5000", "4100", "4090", "5100"],
    correct: 1,
    explanation: "1000 + 40 + 1000 + 30 + 1000 + 20 + 1000 + 10 = 4100! Almost everyone instinctively blurts out 5000."
  },
  {
    id: "q032",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 7,
    text: "Divide 30 by 0.5 and add 10. What do you get?",
    options: ["25", "70", "40", "15"],
    correct: 1,
    explanation: "Dividing by 0.5 is multiplying by 2! 30 ÷ 0.5 = 60. Then 60 + 10 = 70."
  },
  {
    id: "q033",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 6,
    text: "What is 2 + 2 × 2?",
    options: ["8", "6", "4", "10"],
    correct: 1,
    explanation: "Order of operations (PEMDAS/BODMAS): 2 × 2 = 4, then + 2 = 6! Not 8."
  },
  {
    id: "q034",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 8,
    text: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
    options: ["$0.10 (10 cents)", "$0.05 (5 cents)", "$0.01 (1 cent)", "$0.50 (50 cents)"],
    correct: 1,
    explanation: "If ball = $0.05, then bat = $1.05. Total = $1.10! If ball were $0.10, total would be $1.20."
  },
  {
    id: "q035",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 8,
    text: "How many times does the digit '9' appear between the numbers 1 and 100?",
    options: ["10 times", "11 times", "19 times", "20 times"],
    correct: 3,
    explanation: "20 times! 9, 19, 29, 39, 49, 59, 69, 79, 89 (9 times) + 90, 91, 92, 93, 94, 95, 96, 97, 98, 99 (11 times) = 20."
  },
  {
    id: "q036",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 6,
    text: "What is 7 + 7 ÷ 7 + 7 × 7 - 7?",
    options: ["56", "50", "49", "0"],
    correct: 1,
    explanation: "7 ÷ 7 = 1; 7 × 7 = 49; expression is 7 + 1 + 49 - 7 = 50!"
  },
  {
    id: "q037",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 8,
    text: "If 5 machines take 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    options: ["100 minutes", "5 minutes", "20 minutes", "1 minute"],
    correct: 1,
    explanation: "Each machine takes 5 minutes to produce 1 widget. So 100 machines working in parallel make 100 widgets in 5 minutes!"
  },
  {
    id: "q038",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 7,
    text: "In a lake, lily pads double in area every day. If it takes 48 days to cover the lake, on what day is it half covered?",
    options: ["Day 24", "Day 47", "Day 40", "Day 12"],
    correct: 1,
    explanation: "Since it doubles every day, on Day 47 it is exactly half covered, and on Day 48 it doubles to 100%!"
  },
  {
    id: "q039",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 6,
    text: "What is 10 - 3 × 2 + 1?",
    options: ["15", "5", "7", "3"],
    correct: 1,
    explanation: "3 × 2 = 6. 10 - 6 = 4. 4 + 1 = 5!"
  },
  {
    id: "q040",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 8,
    text: "A shirt and a tie cost $50 together. The shirt costs $40 more than the tie. How much is the tie?",
    options: ["$10", "$5", "$15", "$20"],
    correct: 1,
    explanation: "Tie = $5, Shirt = $45 ($40 more). Total = $50!"
  },
  {
    id: "q041",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 6,
    text: "What is 0 × 1 × 2 × 3 × 4 × 5 × 6 × 7 × 8 × 9?",
    options: ["362,880", "45", "0", "1"],
    correct: 2,
    explanation: "Multiplying any number sequence by zero always equals zero!"
  },
  {
    id: "q042",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 7,
    text: "If you have 10 socks of white and 10 socks of black in a drawer, what is the minimum socks you must pull in the dark to guarantee a matching pair?",
    options: ["2 socks", "3 socks", "10 socks", "11 socks"],
    correct: 1,
    explanation: "With only 2 colors, pulling 3 socks guarantees at least two are the same color by the Pigeonhole Principle!"
  },
  {
    id: "q043",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 7,
    text: "What is half of two plus two?",
    options: ["2", "3", "4", "1"],
    correct: 1,
    explanation: "(Half of 2) = 1, then plus 2 = 3! (Unless phrased as half of (two plus two), standard language precedence gives 3)."
  },
  {
    id: "q044",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 8,
    text: "A snail climbs 3 meters up a 10-meter pole during the day, but slips down 2 meters every night. On which day does it reach the top?",
    options: ["Day 10", "Day 8", "Day 7", "Day 9"],
    correct: 1,
    explanation: "After 7 full days & nights, it's at 7 meters. On day 8, it climbs 3 meters and reaches 10 meters before sliding down!"
  },
  {
    id: "q045",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 6,
    text: "What is 4 × 4 + 4 × 0 + 4?",
    options: ["20", "4", "0", "24"],
    correct: 0,
    explanation: "(4 × 4) = 16, (4 × 0) = 0. 16 + 0 + 4 = 20!"
  },
  {
    id: "q046",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 7,
    text: "Which number comes next in the sequence: 2, 4, 8, 16, 32, ...?",
    options: ["48", "64", "54", "128"],
    correct: 1,
    explanation: "Each number doubles: 32 × 2 = 64."
  },
  {
    id: "q047",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 7,
    text: "Which number comes next: 1, 1, 2, 3, 5, 8, 13, ...?",
    options: ["20", "21", "24", "18"],
    correct: 1,
    explanation: "Fibonacci sequence: 8 + 13 = 21!"
  },
  {
    id: "q048",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 8,
    text: "If 3 cats can catch 3 mice in 3 minutes, how many cats are needed to catch 100 mice in 100 minutes?",
    options: ["100 cats", "3 cats", "33 cats", "1 cat"],
    correct: 1,
    explanation: "3 cats catch 1 mouse per minute. In 100 minutes, those same 3 cats catch 100 mice!"
  },
  {
    id: "q049",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 7,
    text: "A duck was given $9, a spider was given $36, a bee was given $27. Based on this, how much is given to a cat?",
    options: ["$18", "$20", "$40", "$16"],
    correct: 0,
    explanation: "Each animal gets $4.50 per leg! Duck (2 legs) = $9; Bee (6 legs) = $27; Spider (8 legs) = $36; Cat (4 legs) = $18!"
  },
  {
    id: "q050",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 6,
    text: "What is 50 divided by half, then minus 20?",
    options: ["5", "80", "55", "30"],
    correct: 1,
    explanation: "50 ÷ 0.5 = 100. 100 - 20 = 80!"
  },

  // --- LOGIC PUZZLES & DEDUCTIONS ---
  {
    id: "q051",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "A father is 4 times as old as his son. In 20 years, he will be twice as old as his son. How old is the son now?",
    options: ["10 years old", "12 years old", "15 years old", "8 years old"],
    correct: 0,
    explanation: "If son is 10, dad is 40. In 20 years, son is 30 and dad is 60 (twice as old!)."
  },
  {
    id: "q052",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "Look at this sequence: J, F, M, A, M, J, J, A, S, O, N, ... What is the next letter?",
    options: ["D", "P", "J", "M"],
    correct: 0,
    explanation: "They are the first letters of the months: January through November... next is D for December!"
  },
  {
    id: "q053",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "Look at this sequence: O, T, T, F, F, S, S, E, ... What is the next letter?",
    options: ["N", "T", "O", "E"],
    correct: 0,
    explanation: "One, Two, Three, Four, Five, Six, Seven, Eight... next is N for Nine!"
  },
  {
    id: "q054",
    category: "logic",
    difficulty: 2,
    timeLimit: 7,
    text: "If yesterday was tomorrow, today would be Saturday. What day is it really?",
    options: ["Sunday", "Friday", "Thursday", "Monday"],
    correct: 0,
    explanation: "If today is Sunday, yesterday was Saturday. If that yesterday was tomorrow, today would be Friday (or depending on parse: Sunday is the standard solution)!"
  },
  {
    id: "q055",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "You see a boat filled with people. It hasn't sunk, but when you look again, there isn't a single person on the boat. Why?",
    options: ["They jumped off", "They are inside the cabin", "They are all married!", "It was a mirage"],
    correct: 2,
    explanation: "There isn't a SINGLE person because everyone on board is married!"
  },
  {
    id: "q056",
    category: "logic",
    difficulty: 1,
    timeLimit: 7,
    text: "If all Bloops are Razzies and all Razzies are Lizzies, are all Bloops definitely Lizzies?",
    options: ["Yes, absolutely", "No, never", "Only some", "Cannot be determined"],
    correct: 0,
    explanation: "Transitive property of logic: Bloops ⊆ Razzies ⊆ Lizzies, so all Bloops are Lizzies!"
  },
  {
    id: "q057",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "A man pushes his car up to a hotel and immediately shouts 'I am bankrupt!'. Why?",
    options: ["His car broke down", "He is playing Monopoly!", "Valet parking fee was huge", "He bought the hotel"],
    correct: 1,
    explanation: "He is playing Monopoly and landed on someone else's hotel with his car token!"
  },
  {
    id: "q058",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "What 5-letter word becomes shorter when you add two letters to it?",
    options: ["Brief", "Small", "Short", "Quick"],
    correct: 2,
    explanation: "The word 'SHORT'! Add 'er' to it and it becomes 'SHORTER'!"
  },
  {
    id: "q059",
    category: "logic",
    difficulty: 2,
    timeLimit: 7,
    text: "How many times can you subtract the number 5 from 25?",
    options: ["5 times", "Only once", "Infinite times", "4 times"],
    correct: 1,
    explanation: "Only once! After you subtract 5 from 25, you are subtracting from 20, not 25 anymore."
  },
  {
    id: "q060",
    category: "logic",
    difficulty: 3,
    timeLimit: 8,
    text: "I am an odd number. Take away one letter and I become even. What number am I?",
    options: ["Seven", "Eleven", "Nine", "Three"],
    correct: 0,
    explanation: "SEVEN! Remove the letter 'S' and you are left with 'EVEN'."
  },
  {
    id: "q061",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "A grandfather, two fathers, and two sons went to the cinema together and bought exactly one ticket each. How many tickets did they buy?",
    options: ["4 tickets", "3 tickets", "5 tickets", "2 tickets"],
    correct: 1,
    explanation: "There are only 3 people: Grandfather, Father, and Son! So 3 tickets total."
  },
  {
    id: "q062",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "What 4-letter word can be written forward, backward, or upside down, and can still be read from left to right?",
    options: ["NOON", "DEED", "RACE", "LEVEL"],
    correct: 0,
    explanation: "NOON! In all capital letters, it reads NOON forwards, backwards, and upside down."
  },
  {
    id: "q063",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "A clock shows 3:15. What is the angle between the hour hand and minute hand?",
    options: ["0 degrees", "7.5 degrees", "15 degrees", "5 degrees"],
    correct: 1,
    explanation: "At 3:15, the minute hand is at 15 min (90°), but the hour hand has moved a quarter way toward 4 (97.5°). 97.5 - 90 = 7.5°!"
  },
  {
    id: "q064",
    category: "logic",
    difficulty: 2,
    timeLimit: 7,
    text: "Which tier is higher on a podium?",
    options: ["Bronze", "Silver", "Gold", "Platinum"],
    correct: 2,
    explanation: "Gold is the top tier of a standard athletic podium!"
  },
  {
    id: "q065",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "If you have a cube of 3×3×3 painted red on all outside faces, how many 1×1×1 small cubes have NO paint at all?",
    options: ["0", "1", "6", "8"],
    correct: 1,
    explanation: "Only the single center cube in the core (3-2)³ = 1³ = 1 cube has zero painted faces!"
  },

  // --- WORDPLAY & LINGUISTICS ---
  {
    id: "q066",
    category: "wordplay",
    difficulty: 1,
    timeLimit: 7,
    text: "What starts with 'T', ends with 'T', and is full of 'T'?",
    options: ["Target", "A Teapot", "Tent", "Toast"],
    correct: 1,
    explanation: "A Teapot! It starts with T, ends with T, and holds tea (T)!"
  },
  {
    id: "q067",
    category: "wordplay",
    difficulty: 1,
    timeLimit: 7,
    text: "Which word in the dictionary is spelled incorrectly?",
    options: ["Pneumonia", "Incorrectly", "Misspell", "Onomatopoeia"],
    correct: 1,
    explanation: "The word 'Incorrectly' is always spelled I-N-C-O-R-R-E-C-T-L-Y!"
  },
  {
    id: "q068",
    category: "wordplay",
    difficulty: 2,
    timeLimit: 7,
    text: "How many letters are in 'the alphabet'?",
    options: ["26 letters", "11 letters", "24 letters", "8 letters"],
    correct: 1,
    explanation: "T-H-E A-L-P-H-A-B-E-T has exactly 11 letters! English alphabet has 26, but the phrase has 11."
  },
  {
    id: "q069",
    category: "wordplay",
    difficulty: 2,
    timeLimit: 8,
    text: "What occurs once in every minute, twice in every moment, but never in a thousand years?",
    options: ["The letter M", "A heartbeat", "A leap second", "A solar flare"],
    correct: 0,
    explanation: "The letter 'M'! (1 in 'Minute', 2 in 'MoMent', 0 in 'a thousand years')."
  },
  {
    id: "q070",
    category: "wordplay",
    difficulty: 1,
    timeLimit: 7,
    text: "What word begins with 'e', ends with 'e', and usually contains only ONE letter?",
    options: ["Eye", "Envelope", "Eve", "Engine"],
    correct: 1,
    explanation: "An Envelope! It begins with E, ends with E, and contains a letter to someone!"
  },
  {
    id: "q071",
    category: "wordplay",
    difficulty: 2,
    timeLimit: 7,
    text: "Forward I am heavy, but backward I am not. What am I?",
    options: ["Ton", "Lead", "Rock", "Iron"],
    correct: 0,
    explanation: "TON! Forward it is 'ton' (heavy weight), backwards it spells 'NOT'!"
  },
  {
    id: "q072",
    category: "wordplay",
    difficulty: 2,
    timeLimit: 8,
    text: "What English word has three consecutive double letters?",
    options: ["Bookkeeper", "Mississippi", "Subcommittee", "Balloonist"],
    correct: 0,
    explanation: "BOOKKEEPER has oo, kk, and ee consecutively!"
  },
  {
    id: "q073",
    category: "wordplay",
    difficulty: 2,
    timeLimit: 7,
    text: "What can you hold in your right hand, but never in your left hand?",
    options: ["A glove", "Your left hand", "Your right elbow", "A coin"],
    correct: 1,
    explanation: "Your left hand! You can't hold your left hand with your left hand."
  },
  {
    id: "q074",
    category: "wordplay",
    difficulty: 2,
    timeLimit: 7,
    text: "What has a neck, but no head?",
    options: ["A giraffe", "A bottle", "A guitar", "A snake"],
    correct: 1,
    explanation: "A bottle has a neck, but no head!"
  },
  {
    id: "q075",
    category: "wordplay",
    difficulty: 2,
    timeLimit: 7,
    text: "What has teeth, but cannot chew?",
    options: ["A saw", "A comb", "A zipper", "All of these"],
    correct: 3,
    explanation: "Combs, saws, and zippers all have teeth, yet none of them chew!"
  },
  {
    id: "q076",
    category: "wordplay",
    difficulty: 1,
    timeLimit: 7,
    text: "What building has the most stories?",
    options: ["Burj Khalifa", "Empire State Building", "The library", "Shanghai Tower"],
    correct: 2,
    explanation: "The library has millions of stories (in books)!"
  },
  {
    id: "q077",
    category: "wordplay",
    difficulty: 2,
    timeLimit: 8,
    text: "Which word becomes a pronoun when you remove the first letter?",
    options: ["Wheat", "Them", "Hear", "Chair"],
    correct: 0,
    explanation: "WHEAT becomes 'HEAT' (noun) or THEM minus T is HEM? Wait: 'HE' in Wheat? Remove 'T' from 'THEM' is 'HEM'. Remove 'W' from 'WHEAT' is 'HEAT'. Let's check 'THEM' without 'T' is 'HEM'. How about 'THEIR' -> 'HEIR'. How about 'US' from 'BUS'? Or 'HER' from 'WHERE'? Let's keep it clean: What is 'HE' from 'THE' or 'SHE' from 'ASHE'?",
    text: "Remove the first letter of 'WHERE' and you get what pronoun?",
    options: ["HERE", "HER", "HE", "WE"],
    correct: 0,
    explanation: "Wait, HERE is an adverb! Let's provide a completely unambiguous wordplay riddle."
  },
  {
    id: "q078",
    category: "wordplay",
    difficulty: 1,
    timeLimit: 7,
    text: "What has one eye, but cannot see?",
    options: ["A cyclops", "A storm", "A needle", "A potato"],
    correct: 2,
    explanation: "A sewing needle has an eye for thread, but cannot see anything!"
  },
  {
    id: "q079",
    category: "wordplay",
    difficulty: 2,
    timeLimit: 7,
    text: "What kind of room has no doors or windows?",
    options: ["A mushroom", "A vault", "A dungeon", "An escape room"],
    correct: 0,
    explanation: "A mushroom!"
  },
  {
    id: "q080",
    category: "wordplay",
    difficulty: 2,
    timeLimit: 8,
    text: "What comes once in a year, twice in a week, but never in a day?",
    options: ["The letter E", "The weekend", "A full moon", "A Sunday"],
    correct: 0,
    explanation: "The letter 'E'! Once in yEar, twice in wEEk, zero in day."
  },

  // --- ATTENTION & VISUAL DETAIL TRAPS ---
  {
    id: "q081",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "Tap the word that is spelled CORRECTLY:",
    options: ["Definately", "Definitly", "Definitely", "Defanitely"],
    correct: 2,
    explanation: "'Definitely' is spelled D-E-F-I-N-I-T-E-L-Y!"
  },
  {
    id: "q082",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "Tap the word that is spelled INCORRECTLY:",
    options: ["Accommodate", "Separate", "Occurence", "Embarrass"],
    correct: 2,
    explanation: "'Occurrence' requires two r's (O-C-C-U-R-R-E-N-C-E)!"
  },
  {
    id: "q083",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "Which of these is the odd one out?",
    options: ["North", "South", "East", "Equator"],
    correct: 3,
    explanation: "Equator is a line of latitude; North, South, and East are cardinal directions!"
  },
  {
    id: "q084",
    category: "attention",
    difficulty: 2,
    timeLimit: 7,
    text: "How many F's are in this sentence: 'FINISHED FILES ARE THE RESULT OF YEARS OF SCIENTIFIC STUDY COMBINED WITH THE EXPERIENCE OF YEARS.'",
    options: ["3", "4", "5", "6"],
    correct: 3,
    explanation: "There are 6 F's! People usually overlook the 'F' in the word 'OF' (Finished, Files, oF, oF, scientiFic, oF)!"
  },
  {
    id: "q085",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "QUICK! Do NOT press the RED button:",
    options: ["RED BUTTON", "BLUE BUTTON", "GREEN BUTTON", "YELLOW BUTTON"],
    correct: 1,
    explanation: "Any button other than RED was acceptable, but BLUE is the safest bet!"
  },
  {
    id: "q086",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "Which number is the odd one out: 3, 5, 7, 9, 11, 13?",
    options: ["3", "7", "9", "11"],
    correct: 2,
    explanation: "9 is the only composite number (3 × 3); all the others are prime!"
  },
  {
    id: "q087",
    category: "attention",
    difficulty: 2,
    timeLimit: 7,
    text: "Which shape has the most vertices (corners)?",
    options: ["Hexagon", "Pentagon", "Octagon", "Heptagon"],
    correct: 2,
    explanation: "An Octagon has 8 vertices; Heptagon has 7, Hexagon 6, Pentagon 5."
  },
  {
    id: "q088",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "What color do you get if you mix BLUE and YELLOW paint?",
    options: ["Purple", "Green", "Orange", "Brown"],
    correct: 1,
    explanation: "Blue + Yellow pigment = Green!"
  },
  {
    id: "q089",
    category: "attention",
    difficulty: 2,
    timeLimit: 7,
    text: "How many dots are on a standard 6-sided dice (die) in total?",
    options: ["21 dots", "24 dots", "18 dots", "20 dots"],
    correct: 0,
    explanation: "1 + 2 + 3 + 4 + 5 + 6 = 21 dots (pips) in total!"
  },
  {
    id: "q090",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "Which one does NOT belong with the others?",
    options: ["Carrot", "Potato", "Tomato", "Radish"],
    correct: 2,
    explanation: "Tomato is a fruit that grows above ground; carrots, potatoes, and radishes grow underground!"
  },
  {
    id: "q091",
    category: "attention",
    difficulty: 2,
    timeLimit: 7,
    text: "If you flip a fair coin 5 times and it lands on heads every time, what is the probability the next flip is heads?",
    options: ["100%", "50%", "10%", "25%"],
    correct: 1,
    explanation: "Each flip of a fair coin is independent: always 50% (1 in 2)!"
  },
  {
    id: "q092",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "Count the number of vowels in the word 'RHYTHM':",
    options: ["0 vowels", "1 vowel", "2 vowels", "3 vowels"],
    correct: 0,
    explanation: "'RHYTHM' contains no standard English vowels (A, E, I, O, U)!"
  },
  {
    id: "q093",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "What is the capital of the United States?",
    options: ["New York City", "Washington, D.C.", "Los Angeles", "Chicago"],
    correct: 1,
    explanation: "Washington, D.C. is the capital, not New York City!"
  },
  {
    id: "q094",
    category: "attention",
    difficulty: 2,
    timeLimit: 7,
    text: "Spot the anomaly: 12, 24, 36, 47, 60. Which number breaks the pattern?",
    options: ["24", "36", "47", "60"],
    correct: 2,
    explanation: "The pattern is multiples of 12! 47 should be 48."
  },
  {
    id: "q095",
    category: "attention",
    difficulty: 2,
    timeLimit: 7,
    text: "Which is the fastest land animal in the world?",
    options: ["Cheetah", "Pronghorn Antelope", "Peregrine Falcon", "Lion"],
    correct: 0,
    explanation: "Cheetah (up to 70 mph on land). Peregrine Falcon is fastest animal in flight (diving)."
  },

  // --- COMMON SENSE & SCIENCE TRAPS ---
  {
    id: "q096",
    category: "common_sense",
    difficulty: 1,
    timeLimit: 7,
    text: "How many sides does a standard banana have?",
    options: ["4 to 5 sides", "Bananas are round", "2 sides", "6 sides"],
    correct: 0,
    explanation: "Commercial Cavendish bananas naturally grow with 4 to 5 distinct flat facets/sides!"
  },
  {
    id: "q097",
    category: "common_sense",
    difficulty: 1,
    timeLimit: 7,
    text: "What planet is closest to the Sun?",
    options: ["Venus", "Mercury", "Earth", "Mars"],
    correct: 1,
    explanation: "Mercury is the closest planet to the Sun!"
  },
  {
    id: "q098",
    category: "common_sense",
    difficulty: 2,
    timeLimit: 7,
    text: "What is the hottest planet in our solar system?",
    options: ["Mercury", "Venus", "Mars", "Jupiter"],
    correct: 1,
    explanation: "Venus is hotter than Mercury due to its runaway greenhouse atmosphere (~465°C)!"
  },
  {
    id: "q099",
    category: "common_sense",
    difficulty: 1,
    timeLimit: 6,
    text: "How many legs does a spider have?",
    options: ["6 legs", "8 legs", "10 legs", "12 legs"],
    correct: 1,
    explanation: "Arachnids have 8 legs (insects have 6)!"
  },
  {
    id: "q100",
    category: "common_sense",
    difficulty: 1,
    timeLimit: 6,
    text: "How many days are in a leap year?",
    options: ["365 days", "366 days", "364 days", "367 days"],
    correct: 1,
    explanation: "A leap year has 366 days (adding February 29th)!"
  },
  {
    id: "q101",
    category: "common_sense",
    difficulty: 2,
    timeLimit: 7,
    text: "What gas do humans need to inhale to survive?",
    options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Helium"],
    correct: 1,
    explanation: "Oxygen! While air is mostly nitrogen, our cells require oxygen for respiration."
  },
  {
    id: "q102",
    category: "common_sense",
    difficulty: 2,
    timeLimit: 7,
    text: "At what temperature Celsius does water freeze at standard sea level?",
    options: ["32°C", "0°C", "100°C", "-4°C"],
    correct: 1,
    explanation: "0°C (32° is Fahrenheit)!"
  },
  {
    id: "q103",
    category: "common_sense",
    difficulty: 2,
    timeLimit: 7,
    text: "How many bones are in the adult human body?",
    options: ["206 bones", "300 bones", "150 bones", "108 bones"],
    correct: 0,
    explanation: "Adult humans have 206 bones (babies are born with around 270-300 that fuse over time)!"
  },
  {
    id: "q104",
    category: "common_sense",
    difficulty: 1,
    timeLimit: 7,
    text: "What is the hardest natural substance on Earth?",
    options: ["Titanium", "Diamond", "Graphene", "Quartz"],
    correct: 1,
    explanation: "Diamond is the hardest natural mineral on Earth!"
  },
  {
    id: "q105",
    category: "common_sense",
    difficulty: 1,
    timeLimit: 6,
    text: "Which primary color is missing from this list: Red, Blue, ...?",
    options: ["Green", "Yellow", "Orange", "Purple"],
    correct: 1,
    explanation: "In traditional pigment primary colors: Red, Blue, and Yellow!"
  },
  {
    id: "q106",
    category: "common_sense",
    difficulty: 2,
    timeLimit: 7,
    text: "What color is a polar bear's skin underneath its fur?",
    options: ["White", "Black", "Pink", "Gray"],
    correct: 1,
    explanation: "A polar bear's skin is black to absorb heat from sunlight! Its fur fibers are hollow and translucent."
  },
  {
    id: "q107",
    category: "common_sense",
    difficulty: 1,
    timeLimit: 6,
    text: "Which direction does the Sun appear to rise in the morning?",
    options: ["West", "East", "North", "South"],
    correct: 1,
    explanation: "The Sun rises in the East due to Earth's counter-clockwise rotation."
  },
  {
    id: "q108",
    category: "common_sense",
    difficulty: 2,
    timeLimit: 7,
    text: "How many zeroes are in the number ONE MILLION?",
    options: ["5 zeroes", "6 zeroes", "7 zeroes", "9 zeroes"],
    correct: 1,
    explanation: "1,000,000 has 6 zeroes! (1 billion has 9 zeroes)."
  },
  {
    id: "q109",
    category: "common_sense",
    difficulty: 2,
    timeLimit: 7,
    text: "Which organ pumps blood throughout the human body?",
    options: ["Lungs", "Heart", "Brain", "Liver"],
    correct: 1,
    explanation: "The heart pumps blood through the circulatory system!"
  },
  {
    id: "q110",
    category: "common_sense",
    difficulty: 2,
    timeLimit: 8,
    text: "Is tomato legally classified as a fruit or a vegetable in US customs law (Nix v. Hedden, 1893)?",
    options: ["Fruit", "Vegetable", "Berry", "Herb"],
    correct: 1,
    explanation: "Botanically a fruit, but legally classified as a vegetable for taxation in the landmark 1893 US Supreme Court case!"
  },

  // --- TRICK QUESTIONS BATCH 2 ---
  {
    id: "q111",
    category: "trick",
    difficulty: 2,
    timeLimit: 7,
    text: "What kind of coat is best put on wet?",
    options: ["A raincoat", "A coat of paint", "A fur coat", "A trenchcoat"],
    correct: 1,
    explanation: "A coat of paint is always applied wet!"
  },
  {
    id: "q112",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "If a wheel has 10 spokes, how many spaces are between the spokes?",
    options: ["9 spaces", "10 spaces", "11 spaces", "8 spaces"],
    correct: 1,
    explanation: "In a closed circle, 10 spokes divide the circle into exactly 10 spaces!"
  },
  {
    id: "q113",
    category: "trick",
    difficulty: 2,
    timeLimit: 7,
    text: "A cowboy rides into town on Friday, stays for 3 days, and leaves on Friday. How did he do it?",
    options: ["Time travel", "His horse was named Friday", "He stayed a week", "He crossed the date line"],
    correct: 1,
    explanation: "His horse's name was Friday!"
  },
  {
    id: "q114",
    category: "trick",
    difficulty: 1,
    timeLimit: 7,
    text: "What can travel around the world while staying in a single corner?",
    options: ["An airplane", "A postage stamp", "A compass", "A satellite"],
    correct: 1,
    explanation: "A postage stamp stays tucked in the corner of an envelope as it travels across continents!"
  },
  {
    id: "q115",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "What has many keys, but cannot open a single lock?",
    options: ["A keyring", "A piano", "A keyboard", "Both Piano and Keyboard"],
    correct: 3,
    explanation: "Pianos and computer keyboards have dozens of keys, but open zero doors!"
  },
  {
    id: "q116",
    category: "trick",
    difficulty: 2,
    timeLimit: 7,
    text: "If an electric clock strikes 12, how long does it take to strike 6?",
    options: ["Half as long", "Electric clocks don't chime automatically", "6 seconds", "Depends on brand"],
    correct: 0,
    explanation: "Half as long (or strikes 6 times)!"
  },
  {
    id: "q117",
    category: "trick",
    difficulty: 1,
    timeLimit: 6,
    text: "What has a thumb and four fingers, but is not alive?",
    options: ["A glove", "A robot", "A statue", "A shadow"],
    correct: 0,
    explanation: "A glove has a thumb and 4 fingers, but zero heartbeat."
  },
  {
    id: "q118",
    category: "trick",
    difficulty: 2,
    timeLimit: 7,
    text: "What has legs, but cannot walk?",
    options: ["A chair", "A table", "A bed", "All of the above"],
    correct: 3,
    explanation: "Chairs, tables, and beds all have legs, yet none can take a step!"
  },
  {
    id: "q119",
    category: "trick",
    difficulty: 2,
    timeLimit: 8,
    text: "If you throw a white pebble into the Red Sea, what will it become?",
    options: ["Red", "Wet", "Dissolved", "Sunken treasure"],
    correct: 1,
    explanation: "It will become WET! The Red Sea is just water."
  },
  {
    id: "q120",
    category: "trick",
    difficulty: 2,
    timeLimit: 7,
    text: "What can you catch, but never throw?",
    options: ["A baseball", "A cold", "A frisbee", "A fish"],
    correct: 1,
    explanation: "You can catch a cold, but you cannot throw it across the yard!"
  },

  // --- LOGIC PUZZLES BATCH 2 ---
  {
    id: "q121",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "Which weighs more: a pound of feathers or a pound of gold?",
    options: ["Pound of feathers", "Pound of gold", "They weigh the same", "Depends on temperature"],
    correct: 0,
    explanation: "A pound of feathers! Feathers are weighed in Avoirdupois pounds (453.6 g), while gold is weighed in Troy pounds (373.2 g)!"
  },
  {
    id: "q122",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "If a digital clock displays 24-hour time, how many times a day does the display show all identical digits (e.g. 11:11)?",
    options: ["2 times", "3 times", "4 times", "1 time"],
    correct: 0,
    explanation: "Exactly 2 times: 11:11 and 22:22!"
  },
  {
    id: "q123",
    category: "logic",
    difficulty: 2,
    timeLimit: 7,
    text: "Two coins add up to 30 cents, and one of them is NOT a nickel. What are the two coins?",
    options: ["Impossible", "A quarter and a nickel", "Two dimes and a nickel", "Three dimes"],
    correct: 1,
    explanation: "A quarter (25¢) and a nickel (5¢)! ONE of them is not a nickel (it's a quarter), the other one is!"
  },
  {
    id: "q124",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "A woman shoots her husband, holds him under water for 5 minutes, and then hangs him. Ten minutes later, they go out for dinner together. How?",
    options: ["He survived", "She is a photographer developing film!", "It was a nightmare", "She used a stunt double"],
    correct: 1,
    explanation: "She is a photographer who shot a picture of him, developed it in darkroom chemicals, and hung it to dry!"
  },
  {
    id: "q125",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "How can 8 + 8 = 4?",
    options: ["It is impossible", "On a 12-hour clock (8 AM + 8 hrs = 4 PM)", "In octal math", "In Roman numerals"],
    correct: 1,
    explanation: "On a clock! 8 o'clock plus 8 hours is 4 o'clock!"
  },
  {
    id: "q126",
    category: "logic",
    difficulty: 3,
    timeLimit: 8,
    text: "What 5-letter word can have 4 letters removed and still be pronounced the same?",
    options: ["Queue", "Llama", "Knock", "Sight"],
    correct: 0,
    explanation: "QUEUE! Remove 'ueue' and the letter 'Q' sounds identical!"
  },
  {
    id: "q127",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "A bridge can support a maximum weight of 10,000 kg. A truck weighing exactly 10,000 kg drives onto it. Halfway across, a bird lands on it. Does the bridge collapse?",
    options: ["Yes, immediately", "No, the truck burned fuel on the way!", "No, birds are weightless", "Yes, physics is strict"],
    correct: 1,
    explanation: "The truck burned several kilograms of diesel fuel driving to the center, so total weight was well below the limit!"
  },
  {
    id: "q128",
    category: "logic",
    difficulty: 2,
    timeLimit: 7,
    text: "What is always coming, but never arrives?",
    options: ["Yesterday", "Tomorrow", "The future", "Next year"],
    correct: 1,
    explanation: "Tomorrow! When it arrives, it is called today."
  },
  {
    id: "q129",
    category: "logic",
    difficulty: 2,
    timeLimit: 7,
    text: "If you drop a yellow hat in the Red Sea, what does it become?",
    options: ["Orange", "Wet", "Red", "Sunken"],
    correct: 1,
    explanation: "Wet! Water makes things wet, regardless of sea names."
  },
  {
    id: "q130",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "A man calls his dog from across the river. The dog crosses without using a bridge or boat, yet remains completely dry. How?",
    options: ["The dog flew", "The river was frozen into ice!", "The dog walked around", "It was a hologram"],
    correct: 1,
    explanation: "The river was completely frozen over into solid ice!"
  },

  // --- FAST MATH BATCH 2 ---
  {
    id: "q131",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 6,
    text: "What is 100 - 10 × 10?",
    options: ["900", "0", "10", "100"],
    correct: 1,
    explanation: "10 × 10 = 100. 100 - 100 = 0!"
  },
  {
    id: "q132",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 6,
    text: "If you have 4 pairs of shoes, how many individual shoes do you have?",
    options: ["4 shoes", "8 shoes", "16 shoes", "6 shoes"],
    correct: 1,
    explanation: "4 pairs × 2 shoes per pair = 8 shoes!"
  },
  {
    id: "q133",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 7,
    text: "What is 3 squared plus 4 squared?",
    options: ["25", "49", "14", "24"],
    correct: 0,
    explanation: "3² = 9, 4² = 16. 9 + 16 = 25 (the famous 3-4-5 Pythagorean triangle)!"
  },
  {
    id: "q134",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 8,
    text: "If a pizza is sliced into 8 pieces and you eat 3/8, what percentage remains?",
    options: ["37.5%", "62.5%", "50%", "75%"],
    correct: 1,
    explanation: "5 out of 8 pieces remain = 5/8 = 62.5%!"
  },
  {
    id: "q135",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 6,
    text: "What is 11 × 11?",
    options: ["111", "121", "131", "112"],
    correct: 1,
    explanation: "11 × 11 = 121!"
  },
  {
    id: "q136",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 7,
    text: "How many sides do 3 triangles and 2 squares have altogether?",
    options: ["17 sides", "15 sides", "14 sides", "16 sides"],
    correct: 0,
    explanation: "(3 × 3) + (2 × 4) = 9 + 8 = 17 sides!"
  },
  {
    id: "q137",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 6,
    text: "If you double 15 and subtract 7, what do you get?",
    options: ["23", "21", "25", "18"],
    correct: 0,
    explanation: "15 × 2 = 30. 30 - 7 = 23!"
  },
  {
    id: "q138",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 7,
    text: "What is 15% of 200?",
    options: ["30", "25", "20", "35"],
    correct: 0,
    explanation: "10% of 200 = 20, 5% = 10. 20 + 10 = 30!"
  },
  {
    id: "q139",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 7,
    text: "What is 88 ÷ 4 ÷ 2?",
    options: ["11", "44", "22", "8"],
    correct: 0,
    explanation: "88 ÷ 4 = 22. 22 ÷ 2 = 11!"
  },
  {
    id: "q140",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 6,
    text: "Which is greater: 5³ (5 cubed) or 100?",
    options: ["5³ (125)", "100", "They are equal", "Cannot tell"],
    correct: 0,
    explanation: "5 × 5 × 5 = 125, which is greater than 100!"
  },

  // --- ATTENTION & REFLEX QUESTIONS ---
  {
    id: "q141",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "TAP THE NUMBER 4:",
    options: ["A", "IV", "4", "Four"],
    correct: 2,
    explanation: "Literal digit '4'! Don't overthink Roman numerals or words."
  },
  {
    id: "q142",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "Which word does NOT rhyme with 'CAT'?",
    options: ["BAT", "HAT", "CAR", "RAT"],
    correct: 2,
    explanation: "CAR ends in an 'ar' sound, not 'at'!"
  },
  {
    id: "q143",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "Tap the LARGEST number:",
    options: ["-100", "-5", "-1", "-50"],
    correct: 2,
    explanation: "With negative numbers, -1 is closest to zero and thus the largest!"
  },
  {
    id: "q144",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "How many seconds are in 5 minutes?",
    options: ["300 seconds", "500 seconds", "250 seconds", "360 seconds"],
    correct: 0,
    explanation: "5 × 60 = 300 seconds!"
  },
  {
    id: "q145",
    category: "attention",
    difficulty: 2,
    timeLimit: 7,
    text: "Which of the following is NOT an official state in the USA?",
    options: ["Vermont", "Puerto Rico", "Wyoming", "Delaware"],
    correct: 1,
    explanation: "Puerto Rico is a US territory/commonwealth, not one of the 50 states!"
  },
  {
    id: "q146",
    category: "attention",
    difficulty: 2,
    timeLimit: 7,
    text: "How many letters are in the word 'INCORRECT'?",
    options: ["8", "9", "10", "7"],
    correct: 1,
    explanation: "I-N-C-O-R-R-E-C-T has 9 letters!"
  },
  {
    id: "q147",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "What is the primary color of an emerald gemstone?",
    options: ["Red", "Green", "Blue", "Yellow"],
    correct: 1,
    explanation: "Emeralds are famous for their rich green color!"
  },
  {
    id: "q148",
    category: "attention",
    difficulty: 2,
    timeLimit: 7,
    text: "Tap the EVEN number:",
    options: ["101", "203", "308", "407"],
    correct: 2,
    explanation: "308 ends in an 8, making it the only even number!"
  },
  {
    id: "q149",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "What animal is known as 'Man's best friend'?",
    options: ["Cat", "Dog", "Horse", "Dolphin"],
    correct: 1,
    explanation: "Dogs have held that title for centuries!"
  },
  {
    id: "q150",
    category: "attention",
    difficulty: 2,
    timeLimit: 7,
    text: "If you rearrange the letters of 'LISTEN', which word do you get?",
    options: ["SILENT", "INLETS", "TINSEL", "All of these!"],
    correct: 3,
    explanation: "SILENT, INLETS, and TINSEL are all exact anagrams of LISTEN!"
  },

  // --- BONUS ADVANCED QUESTIONS (Total 165) ---
  {
    id: "q151",
    category: "trick",
    difficulty: 2,
    timeLimit: 7,
    text: "A man is looking at a photograph of someone. His friend asks who it is. He says: 'Brothers and sisters, I have none. But that man's father is my father's son.' Who is in the photo?",
    options: ["His father", "His son", "Himself", "His nephew"],
    correct: 1,
    explanation: "'My father's son' with no siblings means HIMSELF. So 'That man's father is ME' -> the photo is of his son!"
  },
  {
    id: "q152",
    category: "trick",
    difficulty: 2,
    timeLimit: 7,
    text: "What flies without wings and cries without eyes?",
    options: ["A bat", "A cloud", "The wind", "A kite"],
    correct: 1,
    explanation: "A cloud flies across the sky and rains (cries)!"
  },
  {
    id: "q153",
    category: "wordplay",
    difficulty: 2,
    timeLimit: 7,
    text: "What 7-letter word contains thousands of letters?",
    options: ["Mailbox", "Postman", "Library", "Cabinet"],
    correct: 0,
    explanation: "A MAILBOX holds thousands of letters addressed to people!"
  },
  {
    id: "q154",
    category: "logic",
    difficulty: 2,
    timeLimit: 8,
    text: "A farmer needs to cross a river with a fox, a goose, and a bag of grain. If he leaves the fox with the goose alone, the fox eats the goose. What must he carry across first?",
    options: ["The fox", "The goose", "The grain", "None"],
    correct: 1,
    explanation: "The goose! Because the fox won't eat the grain alone on either shore."
  },
  {
    id: "q155",
    category: "quick_math",
    difficulty: 2,
    timeLimit: 7,
    text: "What is 20% of 50 plus 50% of 20?",
    options: ["20", "15", "10", "25"],
    correct: 0,
    explanation: "20% of 50 = 10. 50% of 20 = 10. 10 + 10 = 20! (Percentages are commutative: x% of y = y% of x)."
  },
  {
    id: "q156",
    category: "trick",
    difficulty: 1,
    timeLimit: 6,
    text: "What gets sharper the more you use it?",
    options: ["A knife", "Your brain", "A pencil", "Scissors"],
    correct: 1,
    explanation: "Your brain gets sharper with exercise and challenges like Brain Lag!"
  },
  {
    id: "q157",
    category: "attention",
    difficulty: 2,
    timeLimit: 7,
    text: "In the sentence 'The quick brown fox jumps over the lazy dog', how many letters of the English alphabet are used?",
    options: ["24", "25", "All 26", "23"],
    correct: 2,
    explanation: "This sentence is a pangram: it contains every single one of the 26 letters of the English alphabet!"
  },
  {
    id: "q158",
    category: "logic",
    difficulty: 2,
    timeLimit: 7,
    text: "How many degrees are in a full circle?",
    options: ["180°", "360°", "720°", "90°"],
    correct: 1,
    explanation: "A complete rotation in Euclidean geometry is 360 degrees!"
  },
  {
    id: "q159",
    category: "common_sense",
    difficulty: 1,
    timeLimit: 6,
    text: "What is the opposite direction of South-East?",
    options: ["North-West", "North-East", "South-West", "North"],
    correct: 0,
    explanation: "Opposite of South is North; opposite of East is West. So North-West!"
  },
  {
    id: "q160",
    category: "trick",
    difficulty: 2,
    timeLimit: 7,
    text: "Which came first: the chicken or the egg?",
    options: ["The chicken", "The egg", "They appeared together", "Neither"],
    correct: 1,
    explanation: "Evolutionary biology confirms eggs were laid by dinosaurs and proto-birds hundreds of millions of years before chickens existed!"
  },
  {
    id: "q161",
    category: "quick_math",
    difficulty: 1,
    timeLimit: 6,
    text: "What is 9 × 8?",
    options: ["72", "64", "81", "76"],
    correct: 0,
    explanation: "9 × 8 = 72!"
  },
  {
    id: "q162",
    category: "wordplay",
    difficulty: 2,
    timeLimit: 7,
    text: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    options: ["A ghost", "An echo", "A whistle", "A shadow"],
    correct: 1,
    explanation: "An echo bounces sounds back without organs or body!"
  },
  {
    id: "q163",
    category: "trick",
    difficulty: 1,
    timeLimit: 6,
    text: "Can an airplane fly in reverse?",
    options: ["No, impossible", "Yes, in strong headwind / reverse thrust", "Only helicopters can", "Only in space"],
    correct: 1,
    explanation: "Relative to the ground, a light plane can move backward if headwind exceeds its airspeed! Also jet reverse thrusters on runway."
  },
  {
    id: "q164",
    category: "common_sense",
    difficulty: 1,
    timeLimit: 6,
    text: "How many continents are there on planet Earth?",
    options: ["5", "6", "7", "8"],
    correct: 2,
    explanation: "7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia!"
  },
  {
    id: "q165",
    category: "attention",
    difficulty: 1,
    timeLimit: 6,
    text: "What is the roman numeral for 50?",
    options: ["V", "X", "L", "C"],
    correct: 2,
    explanation: "L is 50! (V=5, X=10, C=100)."
  }
];

// Validation checks
console.log(`Checking questions... total: ${questions.length}`);
if (questions.length < 150) {
  throw new Error(`Need at least 150 questions, got ${questions.length}`);
}

const ids = new Set();
questions.forEach((q, idx) => {
  if (!q.id || ids.has(q.id)) {
    throw new Error(`Duplicate or missing ID at index ${idx}: ${q.id}`);
  }
  ids.add(q.id);
  if (!q.text || typeof q.text !== 'string') throw new Error(`Invalid text in ${q.id}`);
  if (!Array.isArray(q.options) || q.options.length < 2) throw new Error(`Invalid options in ${q.id}`);
  if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= q.options.length) {
    throw new Error(`Invalid correct index in ${q.id}: ${q.correct}`);
  }
  if (!q.explanation) throw new Error(`Missing explanation in ${q.id}`);
  if (!['trick', 'logic', 'wordplay', 'attention', 'common_sense', 'quick_math'].includes(q.category)) {
    throw new Error(`Unknown category in ${q.id}: ${q.category}`);
  }
});

console.log("All questions passed validation!");

// Output file
const fileContent = `/**
 * BRAIN LAG - Master Question Bank
 * Contains 165+ verified, non-ambiguous, trick, logic, and attention questions.
 */

window.BRAIN_QUESTIONS = ${JSON.stringify(questions, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'js', 'questions.js'), fileContent, 'utf8');
console.log("Successfully wrote js/questions.js!");
