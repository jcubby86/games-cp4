import { SUGGESTIONS_PERM } from './constants';
import { Category } from '../.generated/prisma';
import { hash } from '../models/users';
import prisma from '../prisma';

const actions_past = [
  'So they threw coins off the top of the space needle trying to hit people. But soon upgraded to water balloons',
  'Got married of course! ',
  'Locked pinkies and skipped off into the sunset, singing Somewhere Over the Rainbow',
  'Left to go look for their digits',
  'Went gravesite shopping at the cemetery for their vacation. ',
  'Put on their big boy pants and stepped into moving traffic',
  'So they solved world hunger, cured cancer, and explored the deepest parts of the ocean',
  'went skydiving with the dog.',
  'read a book with a baby',
  'ate all of the spaghettis',
  'huffed and puffed and blew the house down',
  'cried every time',
  "attempted to put on each other's straight jackets but you can't put on someone else's while you are wearing one.",
  'Sold their birthrights for some stronger lungs.',
  'Jumped on the trees and jumped on the houses and punched peoples cars ',
  'wrestled in a vat of warm milk and one of them died.',
  'Physically entered the portal to the virtual world of the video game to save their cousin, but died from a squirtle.',
  'Went camping in a haunted motorhome and the ghost Nate their spam',
  'Went alligator surfing during the hurricane in florida and saved all the flamingos',
  'So she fell into the pit of quicksand as he screamed in terror, but she only sank down to her ankles so it ended up being fine. ',
  'Retired from milking goats and started a business milking almonds ',
  'Ran away',
  'Frolicked throughout the corn maze until they arrived at the yellow brick road'
];
const actions_present = [
  'dancing in the rain',
  'eating spaghetti',
  'driving to the airport',
  'sledding down the hill',
  'writing love letters',
  'watching Shrek 2',
  'washing potatoes',
  'listening to white noise',
  'snuggling with stuffed animals',
  'reading a good book',
  'coding up a fun game',
  'Dancing to that song Walk like a man like ya know in that song walk like a man. ',
  'Bickering over who killed who',
  'Being towed in a wagon while in the Running of the Bulls',
  'Scuba diving in a pool of Jello ',
  'Hiding from a murderer in a closet while talking loudly on a phone',
  'Playing mine sweeper looking to kill cute ducks',
  'Skipping down main street singing Christmas carols. ',
  'Eating their curds and whey. Gross.',
  'walking on the beach and throwing the jellyfish back in the ocean',
  'Selling Seashells by the homeless man in an abandoned subway tunnel',
  'Looking lovingly into each others eyes. Gross.',
  'separating the good water from the bad water and punishing the bad water',
  'Particle colliding in their free time.',
  'Watching a dcumentary about cannibalism',
  'Eating ice cream at a pizza place in new york',
  'Gossiping'
];
const female_names = [
  'Wynona Ryder',
  'The Queen of England',
  'Fiona',
  'Mary',
  'Elsa',
  'Beyonce',
  'Grandma',
  'Mom',
  'Honey Boo Boo',
  'Princess Zelda',
  'Rashida Jones',
  'Leslie Knope',
  'Mariah Carey',
  'Queen Victoria',
  'Anastasia',
  'Dolores Umbridge',
  'Thumbelina',
  'Miss Piggy',
  'Hildegard von Bingen',
  'Ursula',
  'Melania Trump',
  'Xena warrior princess',
  'Leia',
  'Michelle Obama',
  'She-hulk'
];
const male_names = [
  'Jason Bourne',
  'Jeff Bezos',
  'Elon Musk',
  'Mark Zuckerburg',
  'Justin Bieber',
  'Channing Tatum',
  'Robin Hood',
  'Shrek',
  'Jack Skellington',
  'Benjamin Franklin',
  'Joe Biden',
  'Chris Evans',
  'Alfred',
  'Rick Astley',
  'Grandpa',
  'Dad',
  'Mario',
  'Christian Bale',
  'Judas',
  'Humphrey Higgins',
  'Frankinstein',
  'Snape',
  'Jafar'
];
const statements = [
  'I like cheese',
  'What did you call me?',
  'Why are you so mean?',
  'Did you mean to call or was it an accident?',
  'Look out!',
  'My reflexes are just fine, look!',
  "Don't throw that away, it could be useful!",
  'Wait for me!',
  'Okay, but no mayonnaise this time',
  'Can you grab the weekwhacker? I need to shave my back again',
  "Ok let's go change. And this time I get the sparkly pink jumpsuit!",
  "I haven't thrown a great, big tantrum in a while...",
  'Will you marry me? ',
  'Really? I thought I was the only one!',
  'We need to bring back milk men.',
  'I am woman hear me roar',
  "I don't read good",
  "Stop breathing.  It's annoying!",
  'Oh, what a beautiful mid-morning!',
  "It's my birthday and I'll cry if I want to, cry if I want to, cry cry cry CRY",
  "I can't hear you over my inner demons ",
  'McDonals forgot my McNuggets….. we are about to have a McProblem',
  'Boost my bottom!!!',
  "I don't think we need to bring China into this",
  'I thought we were just changing a lightbulb, how did we end up here?',
  "It's hard to tap dance on the beach",
  'I love it when I stroll grandly through the ocean',
  'Make sure to save the wrapping paper and the bows',
  "I didn't even think the new Star Wars movies were that bad",
  'Quick, let me feel!',
  'New phone, who dis?',
  "Stop exhaling — you're ruining the air and making the earth toxic",
  'If you could be the one who if you were the greatest then if you were who you wanted to be for your parents?',
  'I hate to tell you this / but I have leprosy ',
  'You woke me up for this?!?',
  'What the frick?',
  'Well I never',
  "I don't care who your mother is, I am going to get on that boat",
  "That's what she said",
  'Have you seen my spleen?',
  'Time to wake up to WOKE, fool.',
  'Thinks for thanking of me',
  "I'm not as think as you drunk I am, ocifer"
];

export const main = async (env?: string) => {
  if (env === 'dev') {
    const hashed = await hash('password');
    await prisma.user.create({
      data: {
        username: 'username',
        password: hashed,
        permissions: [SUGGESTIONS_PERM]
      }
    });
  }

  const all: { category: Category; value: string }[] = [
    ...actions_past.map((s) => ({
      category: Category.PAST_ACTION,
      value: s
    })),
    ...actions_present.map((s) => ({
      category: Category.PRESENT_ACTION,
      value: s
    })),
    ...statements.map((s) => ({
      category: Category.STATEMENT,
      value: s
    })),
    ...male_names.map((s) => ({
      category: Category.MALE_NAME,
      value: s
    })),
    ...female_names.map((s) => ({
      category: Category.FEMALE_NAME,
      value: s
    }))
  ];

  await prisma.suggestion.createMany({
    data: all
  });
};
