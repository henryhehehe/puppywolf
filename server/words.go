package main

import "math/rand"

// wordList contains a curated set of nouns suitable for a Werewords game.
var wordList = []string{
	// Animals
	"Cat", "Dog", "Elephant", "Penguin", "Dolphin", "Eagle", "Tiger", "Bear",
	"Rabbit", "Owl", "Whale", "Shark", "Butterfly", "Fox", "Wolf", "Parrot",
	"Octopus", "Giraffe", "Kangaroo", "Turtle",

	// Food & Drink
	"Pizza", "Chocolate", "Coffee", "Banana", "Sushi", "Bread", "Honey",
	"Cheese", "Watermelon", "Pancake", "Burger", "Taco", "Pasta", "Cookie",
	"Lemonade", "Popcorn", "Avocado", "Strawberry",

	// Nature
	"Mountain", "Ocean", "Forest", "Desert", "Volcano", "Glacier", "Rainbow",
	"Thunder", "Sunset", "Waterfall", "Island", "River", "Cave", "Meadow",
	"Coral", "Canyon", "Aurora", "Tornado",

	// Objects
	"Mirror", "Castle", "Bridge", "Clock", "Telescope", "Compass", "Lantern",
	"Treasure", "Crown", "Shield", "Sword", "Key", "Bell", "Candle",
	"Umbrella", "Backpack", "Ladder", "Anchor",

	// Places
	"Library", "Hospital", "Airport", "Museum", "Lighthouse", "Stadium",
	"Temple", "Palace", "Prison", "Pharmacy", "Theater", "Aquarium",
	"Cathedral", "Warehouse", "Carnival",

	// Concepts & Abstract
	"Shadow", "Dream", "Silence", "Gravity", "Echo", "Fortune",
	"Mystery", "Freedom", "Harmony", "Wisdom", "Courage", "Illusion",
	"Memory", "Rhythm", "Balance",

	// Professions & People
	"Astronaut", "Detective", "Pirate", "Wizard", "Knight", "Chef",
	"Pilot", "Architect", "Inventor", "Explorer", "Ninja", "Samurai",

	// Technology & Transport
	"Submarine", "Spaceship", "Bicycle", "Guitar", "Satellite", "Diamond",
	"Magnet", "Firework", "Parachute", "Helicopter", "Telescope", "Compass",
	"Robot", "Camera", "Microphone",
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
