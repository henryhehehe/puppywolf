package main

import "math/rand"

// wordList contains a large curated set of nouns for WerePups.
// ~500 words across many categories for high replayability.
var wordList = []string{
	// ── Animals ──
	"Cat", "Dog", "Elephant", "Penguin", "Dolphin", "Eagle", "Tiger", "Bear",
	"Rabbit", "Owl", "Whale", "Shark", "Butterfly", "Fox", "Wolf", "Parrot",
	"Octopus", "Giraffe", "Kangaroo", "Turtle", "Hamster", "Panda", "Flamingo",
	"Chameleon", "Jellyfish", "Seahorse", "Koala", "Hedgehog", "Otter", "Peacock",
	"Sloth", "Cheetah", "Gorilla", "Hummingbird", "Lobster", "Bat", "Moose",
	"Crab", "Falcon", "Swan", "Deer", "Raccoon", "Squirrel", "Frog", "Alpaca",
	"Puppy", "Kitten", "Duckling", "Lamb", "Piglet",

	// ── Food & Drink ──
	"Pizza", "Chocolate", "Coffee", "Banana", "Sushi", "Bread", "Honey",
	"Cheese", "Watermelon", "Pancake", "Burger", "Taco", "Pasta", "Cookie",
	"Lemonade", "Popcorn", "Avocado", "Strawberry", "Donut", "Waffle",
	"Pretzel", "Mango", "Cinnamon", "Milkshake", "Pineapple", "Cupcake",
	"Marshmallow", "Noodle", "Pickle", "Smoothie", "Croissant", "Bubbletea",
	"Dumpling", "Ramen", "Muffin", "Gummy", "Caramel", "Coconut",
	"Cheesecake", "Macaron", "Brownie", "Corndog", "Nachos",

	// ── Nature ──
	"Mountain", "Ocean", "Forest", "Desert", "Volcano", "Glacier", "Rainbow",
	"Thunder", "Sunset", "Waterfall", "Island", "River", "Cave", "Meadow",
	"Coral", "Canyon", "Aurora", "Tornado", "Blizzard", "Tsunami",
	"Avalanche", "Eclipse", "Geyser", "Lagoon", "Jungle", "Savanna",
	"Oasis", "Tundra", "Reef", "Swamp", "Pebble", "Dune", "Fog",
	"Lightning", "Hailstone", "Tide", "Cliff", "Valley", "Spring",
	"Creek", "Glacier", "Fjord", "Marsh", "Prairie",

	// ── Space & Science ──
	"Galaxy", "Asteroid", "Nebula", "Comet", "Planet", "Satellite",
	"Blackhole", "Constellation", "Supernova", "Orbit", "Telescope",
	"Meteor", "Gravity", "Atom", "Molecule", "Magnet", "Prism",
	"Spectrum", "Electron", "Neutron", "Proton", "Photon", "Laser",
	"Radar", "Fossil", "Dinosaur", "Bacteria", "Virus", "DNA",
	"Chromosome", "Crystal", "Mineral", "Element",

	// ── Objects & Things ──
	"Mirror", "Castle", "Bridge", "Clock", "Compass", "Lantern",
	"Treasure", "Crown", "Shield", "Sword", "Key", "Bell", "Candle",
	"Umbrella", "Backpack", "Ladder", "Anchor", "Balloon", "Whistle",
	"Feather", "Pillow", "Blanket", "Hammock", "Trampoline", "Kite",
	"Boomerang", "Slingshot", "Hourglass", "Kaleidoscope", "Pendulum",
	"Trophy", "Medal", "Stamp", "Envelope", "Postcard", "Bookmark",
	"Puzzle", "Dice", "Marble", "Yo-yo", "Pinwheel", "Snowglobe",
	"Locket", "Ring", "Bracelet", "Necklace", "Tiara", "Wand",

	// ── Places ──
	"Library", "Hospital", "Airport", "Museum", "Lighthouse", "Stadium",
	"Temple", "Palace", "Prison", "Pharmacy", "Theater", "Aquarium",
	"Cathedral", "Warehouse", "Carnival", "Bakery", "Greenhouse",
	"Observatory", "Treehouse", "Igloo", "Cottage", "Mansion", "Dungeon",
	"Tower", "Fortress", "Chapel", "Marketplace", "Garden", "Playground",
	"Beach", "Pier", "Harbor", "Vineyard", "Ranch", "Barn",
	"Cabin", "Lodge", "Resort", "Spa", "Casino", "Arena",

	// ── Professions & People ──
	"Astronaut", "Detective", "Pirate", "Wizard", "Knight", "Chef",
	"Pilot", "Architect", "Inventor", "Explorer", "Ninja", "Samurai",
	"Doctor", "Firefighter", "Teacher", "Artist", "Musician", "Dancer",
	"Farmer", "Fisherman", "Blacksmith", "Carpenter", "Sailor", "Ranger",
	"Jester", "King", "Queen", "Prince", "Princess", "Monk",
	"Gladiator", "Viking", "Cowboy", "Sheriff", "Magician", "Clown",
	"Mermaid", "Fairy", "Elf", "Dwarf", "Dragon", "Unicorn",

	// ── Sports & Games ──
	"Soccer", "Basketball", "Tennis", "Swimming", "Skateboard", "Surfing",
	"Archery", "Boxing", "Fencing", "Golf", "Hockey", "Volleyball",
	"Bowling", "Darts", "Chess", "Poker", "Dominoes", "Frisbee",
	"Marathon", "Relay", "Diving", "Gymnastics", "Wrestling", "Karate",
	"Skiing", "Snowboard", "Kayak", "Canoe", "Trampoline",

	// ── Music & Art ──
	"Guitar", "Piano", "Violin", "Drums", "Trumpet", "Flute",
	"Harmonica", "Saxophone", "Harp", "Banjo", "Ukulele", "Accordion",
	"Paintbrush", "Canvas", "Sculpture", "Origami", "Mosaic", "Graffiti",
	"Symphony", "Melody", "Rhythm", "Chorus", "Opera", "Ballet",

	// ── Technology & Transport ──
	"Submarine", "Spaceship", "Bicycle", "Helicopter", "Robot", "Camera",
	"Microphone", "Firework", "Parachute", "Keyboard", "Headphones",
	"Projector", "Antenna", "Battery", "Engine", "Propeller", "Radar",
	"Rocket", "Sailboat", "Trolley", "Gondola", "Zeppelin", "Hovercraft",
	"Bulldozer", "Crane", "Forklift", "Tractor", "Ambulance",

	// ── Clothing & Fashion ──
	"Sneaker", "Bowtie", "Scarf", "Mittens", "Helmet", "Cape",
	"Goggles", "Apron", "Bandana", "Beret", "Fedora", "Sombrero",
	"Sandals", "Boots", "Tutu", "Kimono", "Poncho", "Vest",

	// ── Concepts & Abstract ──
	"Shadow", "Dream", "Silence", "Echo", "Fortune", "Mystery",
	"Freedom", "Harmony", "Wisdom", "Courage", "Illusion", "Memory",
	"Balance", "Patience", "Curiosity", "Kindness", "Nostalgia",
	"Serenity", "Adventure", "Destiny", "Legend", "Secret",
	"Riddle", "Paradox", "Miracle", "Chaos", "Peace", "Hope",
	"Joy", "Laughter", "Friendship", "Journey", "Promise", "Wish",

	// ── Holidays & Celebrations ──
	"Birthday", "Halloween", "Christmas", "Fireworks", "Parade",
	"Festival", "Wedding", "Costume", "Pumpkin", "Snowman", "Ornament",
	"Wreath", "Confetti", "Sparkler", "Piñata", "Lantern", "Gift",

	// ── Weather & Seasons ──
	"Sunshine", "Raindrop", "Snowflake", "Breeze", "Storm", "Frost",
	"Icicle", "Dewdrop", "Mist", "Sleet", "Humidity", "Drought",

	// ── Around the House ──
	"Doorbell", "Chimney", "Staircase", "Bathtub", "Chandelier",
	"Fireplace", "Bookshelf", "Windowsill", "Mailbox", "Doorknob",
	"Curtain", "Carpet", "Cupboard", "Drawer", "Pantry",
	"Flowerpot", "Birdhouse", "Treehouse", "Fountain", "Gazebo",

	// ── Mythical & Fantasy ──
	"Phoenix", "Griffin", "Centaur", "Pegasus", "Minotaur",
	"Kraken", "Hydra", "Sphinx", "Werewolf", "Vampire",
	"Zombie", "Ghost", "Goblin", "Troll", "Ogre", "Cyclops",
	"Basilisk", "Chimera", "Banshee", "Leprechaun",

	// ── Body & Health ──
	"Skeleton", "Heartbeat", "Muscle", "Fingerprint", "Backbone",
	"Eyelash", "Dimple", "Freckle", "Knuckle", "Elbow",

	// ── Colors & Patterns ──
	"Polkadot", "Stripe", "Plaid", "Camouflage", "Zigzag",
	"Checkerboard", "Gradient", "Silhouette", "Stencil", "Mosaic",
}

// getRandomWord returns a random word from the word list.
func getRandomWord() string {
	return wordList[rand.Intn(len(wordList))]
}

// getRandomWords returns n unique random words from the word list.
func getRandomWords(n int) []string {
	if n > len(wordList) {
		n = len(wordList)
	}
	perm := rand.Perm(len(wordList))
	words := make([]string, n)
	for i := 0; i < n; i++ {
		words[i] = wordList[perm[i]]
	}
	return words
}
