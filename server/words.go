package main

import "math/rand"

// Words categorized by difficulty.
var easyWords = []string{
	// Common animals
	"Cat", "Dog", "Fish", "Bird", "Bear", "Frog", "Cow", "Pig", "Duck", "Owl",
	"Rabbit", "Tiger", "Lion", "Horse", "Sheep", "Puppy", "Kitten", "Deer",
	// Common food
	"Pizza", "Bread", "Cheese", "Cookie", "Banana", "Apple", "Candy", "Cake",
	"Pasta", "Burger", "Taco", "Donut", "Honey", "Egg", "Milk", "Rice",
	// Common objects
	"Ball", "Book", "Chair", "Door", "Clock", "Bell", "Key", "Lamp",
	"Bed", "Cup", "Hat", "Shoe", "Bag", "Kite", "Box", "Ring",
	// Simple nature
	"Sun", "Moon", "Star", "Tree", "Rain", "Snow", "Wind", "Fire",
	"River", "Beach", "Cloud", "Flower", "Rock", "Sand", "Leaf", "Grass",
	// Simple places
	"School", "House", "Park", "Farm", "Garden", "Beach", "Shop", "Zoo",
	// Simple concepts
	"Dream", "Love", "Hope", "Joy", "Fun", "Play", "Song", "Gift",
}

var mediumWords = []string{
	// Animals
	"Elephant", "Penguin", "Dolphin", "Eagle", "Butterfly", "Fox", "Wolf",
	"Parrot", "Octopus", "Giraffe", "Kangaroo", "Turtle", "Hamster", "Panda",
	"Flamingo", "Jellyfish", "Seahorse", "Koala", "Hedgehog", "Otter", "Peacock",
	"Cheetah", "Gorilla", "Hummingbird", "Lobster", "Raccoon", "Squirrel", "Alpaca",
	// Food
	"Chocolate", "Coffee", "Sushi", "Watermelon", "Pancake", "Popcorn", "Avocado",
	"Strawberry", "Waffle", "Pretzel", "Mango", "Cinnamon", "Milkshake", "Pineapple",
	"Cupcake", "Marshmallow", "Noodle", "Pickle", "Smoothie", "Croissant", "Dumpling",
	"Ramen", "Muffin", "Caramel", "Coconut", "Cheesecake", "Macaron", "Nachos",
	// Nature
	"Mountain", "Ocean", "Forest", "Desert", "Volcano", "Rainbow", "Thunder",
	"Sunset", "Waterfall", "Island", "Cave", "Meadow", "Canyon", "Tornado",
	"Lightning", "Valley", "Glacier", "Jungle",
	// Objects
	"Mirror", "Castle", "Bridge", "Compass", "Lantern", "Treasure", "Crown",
	"Shield", "Sword", "Umbrella", "Backpack", "Ladder", "Anchor", "Balloon",
	"Whistle", "Feather", "Pillow", "Hammock", "Kite", "Boomerang", "Hourglass",
	"Trophy", "Medal", "Puzzle", "Dice", "Yo-yo", "Snowglobe", "Wand",
	// Places
	"Library", "Museum", "Lighthouse", "Stadium", "Temple", "Palace", "Theater",
	"Aquarium", "Bakery", "Greenhouse", "Treehouse", "Igloo", "Cottage", "Mansion",
	"Tower", "Fortress", "Playground", "Pier", "Harbor", "Barn", "Cabin",
	// Professions
	"Astronaut", "Detective", "Pirate", "Wizard", "Knight", "Chef", "Pilot",
	"Ninja", "Samurai", "Doctor", "Firefighter", "Artist", "Musician", "Dancer",
	"Cowboy", "Magician", "Mermaid", "Fairy",
	// Sports
	"Soccer", "Basketball", "Tennis", "Skateboard", "Surfing", "Archery", "Boxing",
	"Golf", "Hockey", "Volleyball", "Bowling", "Chess", "Frisbee", "Gymnastics",
	// Music & Art
	"Guitar", "Piano", "Violin", "Drums", "Trumpet", "Flute", "Origami",
	// Technology
	"Submarine", "Spaceship", "Bicycle", "Helicopter", "Robot", "Camera", "Rocket",
	// Clothing
	"Sneaker", "Scarf", "Helmet", "Cape", "Goggles", "Boots",
	// Holidays
	"Birthday", "Halloween", "Christmas", "Fireworks", "Parade", "Festival", "Costume",
	"Pumpkin", "Snowman", "Confetti",
}

var hardWords = []string{
	// Rare animals
	"Chameleon", "Sloth", "Moose", "Falcon", "Swan", "Duckling", "Piglet", "Crab",
	// Abstract/complex food
	"Bubbletea", "Gummy", "Brownie", "Corndog", "Lemonade",
	// Complex nature
	"Glacier", "Coral", "Aurora", "Blizzard", "Tsunami", "Avalanche", "Eclipse",
	"Geyser", "Lagoon", "Savanna", "Oasis", "Tundra", "Reef", "Swamp",
	"Fjord", "Marsh", "Prairie", "Hailstone",
	// Space
	"Galaxy", "Asteroid", "Nebula", "Comet", "Satellite", "Blackhole", "Constellation",
	"Supernova", "Orbit", "Telescope", "Meteor", "Gravity", "Molecule", "Prism",
	"Spectrum", "Electron", "Photon", "Laser", "Fossil", "Dinosaur", "Chromosome",
	"Crystal", "Mineral",
	// Complex objects
	"Kaleidoscope", "Pendulum", "Pinwheel", "Locket", "Bracelet", "Necklace", "Tiara",
	// Concepts
	"Shadow", "Silence", "Echo", "Fortune", "Mystery", "Freedom", "Harmony",
	"Wisdom", "Courage", "Illusion", "Memory", "Balance", "Patience", "Curiosity",
	"Kindness", "Nostalgia", "Serenity", "Adventure", "Destiny", "Legend", "Secret",
	"Riddle", "Paradox", "Miracle", "Chaos", "Peace", "Laughter", "Friendship",
	"Journey", "Promise",
	// Mythical
	"Phoenix", "Griffin", "Centaur", "Pegasus", "Minotaur", "Kraken", "Hydra",
	"Sphinx", "Werewolf", "Vampire", "Zombie", "Goblin", "Troll", "Ogre",
	"Cyclops", "Basilisk", "Chimera", "Banshee", "Leprechaun",
	// Body
	"Skeleton", "Heartbeat", "Fingerprint", "Backbone", "Eyelash", "Dimple",
	// Patterns
	"Polkadot", "Camouflage", "Zigzag", "Checkerboard", "Gradient", "Silhouette",
	// Complex professions/people
	"Architect", "Inventor", "Explorer", "Blacksmith", "Carpenter", "Jester",
	"Gladiator", "Viking", "Elf", "Dwarf",
	// Complex places
	"Hospital", "Airport", "Cathedral", "Warehouse", "Carnival", "Observatory",
	"Dungeon", "Chapel", "Marketplace", "Vineyard", "Ranch",
	// Around the house
	"Doorbell", "Chimney", "Staircase", "Bathtub", "Chandelier", "Fireplace",
	"Bookshelf", "Windowsill", "Mailbox", "Cupboard", "Pantry", "Gazebo",
	// Weather
	"Snowflake", "Breeze", "Frost", "Icicle", "Dewdrop", "Mist", "Sleet",
	"Humidity", "Drought",
}

// allWords is the union of all difficulty lists.
var allWords []string

func init() {
	allWords = make([]string, 0, len(easyWords)+len(mediumWords)+len(hardWords))
	allWords = append(allWords, easyWords...)
	allWords = append(allWords, mediumWords...)
	allWords = append(allWords, hardWords...)
}

// getRandomWord returns a random word from all words.
func getRandomWord() string {
	return allWords[rand.Intn(len(allWords))]
}

// getRandomWords returns n unique random words from all words.
func getRandomWords(n int) []string {
	return pickRandom(allWords, n)
}

// getRandomWordsByDifficulty returns n unique random words from the given difficulty.
func getRandomWordsByDifficulty(n int, difficulty string) []string {
	var pool []string
	switch difficulty {
	case DifficultyEasy:
		pool = easyWords
	case DifficultyHard:
		pool = hardWords
	default:
		pool = mediumWords
	}
	return pickRandom(pool, n)
}

func pickRandom(pool []string, n int) []string {
	if n > len(pool) {
		n = len(pool)
	}
	perm := rand.Perm(len(pool))
	words := make([]string, n)
	for i := 0; i < n; i++ {
		words[i] = pool[perm[i]]
	}
	return words
}
