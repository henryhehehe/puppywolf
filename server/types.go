package main

import (
	cryptorand "crypto/rand"
	"encoding/json"
	"fmt"
)

// --- Game Phase Constants ---

const (
	PhaseLogin         = "LOGIN"
	PhaseLobby         = "LOBBY"
	PhaseRoleReveal    = "ROLE_REVEAL"
	PhaseWordSelection = "WORD_SELECTION"
	PhaseDayPhase      = "DAY_PHASE"
	PhaseVoting        = "VOTING"
	PhaseWerewolfGuess = "WEREWOLF_GUESS"
	PhaseGameOver      = "GAME_OVER"
)

// --- Role Constants ---

const (
	RoleVillager = "VILLAGER"
	RoleWerewolf = "WEREWOLF"
	RoleSeer     = "SEER"
)

// --- Token Type Constants ---

const (
	TokenYes     = "YES"
	TokenNo      = "NO"
	TokenMaybe   = "MAYBE"
	TokenSoClose = "SO_CLOSE"
	TokenWayOff  = "WAY_OFF"
	TokenCorrect = "CORRECT"
)

// --- Winner Constants ---

const (
	WinnerVillage  = "VILLAGE"
	WinnerWerewolf = "WEREWOLF"
)

// --- Difficulty Constants ---

const (
	DifficultyEasy   = "EASY"
	DifficultyMedium = "MEDIUM"
	DifficultyHard   = "HARD"
)

// --- Data Structures ---

type Player struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Role          string   `json:"role"`
	IsMayor       bool     `json:"isMayor"`
	IsReady       bool     `json:"isReady"`
	WantsMayor    bool     `json:"wantsMayor"`
	AvatarURL     string   `json:"avatarUrl,omitempty"`
	VotesReceived int      `json:"votesReceived"`
	IsBot         bool     `json:"isBot"`
	Score         int      `json:"score"`
	Achievements  []string `json:"achievements,omitempty"`
}

type TokenAction struct {
	ID             string `json:"id"`
	Type           string `json:"type"`
	Timestamp      int64  `json:"timestamp"`
	TargetPlayerID string `json:"targetPlayerId,omitempty"`
}

type GuessEntry struct {
	PlayerID  string `json:"playerId"`
	Text      string `json:"text"`
	Timestamp int64  `json:"timestamp"`
}

type GameState struct {
	Phase            string        `json:"phase"`
	RoomCode         string        `json:"roomCode"`
	Players          []Player      `json:"players"`
	SecretWord       string        `json:"secretWord"`
	SecretWordHints  string        `json:"secretWordHints,omitempty"`
	WordOptions      []string      `json:"wordOptions,omitempty"`
	TimeRemaining    int           `json:"timeRemaining"`
	TokensUsed       int           `json:"tokensUsed"`
	TokenHistory     []TokenAction `json:"tokenHistory"`
	Guesses          []GuessEntry  `json:"guesses"`
	Winner           string        `json:"winner,omitempty"`
	MyPlayerID       string        `json:"myPlayerId"`
	Difficulty       string        `json:"difficulty"`
	HintsRevealed    int           `json:"hintsRevealed"`
	NumWerewolves    int           `json:"numWerewolves"`
}

// RoomInfo is a summary of a room for the room browser.
type RoomInfo struct {
	Code        string   `json:"code"`
	PlayerCount int      `json:"playerCount"`
	MaxPlayers  int      `json:"maxPlayers"`
	Phase       string   `json:"phase"`
	PlayerNames []string `json:"playerNames"`
}

// --- Client → Server Messages ---

type ClientMessage struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

type JoinGamePayload struct {
	Name      string `json:"name"`
	RoomCode  string `json:"roomCode,omitempty"`
	AvatarURL string `json:"avatarUrl,omitempty"`
}

type SubmitTokenPayload struct {
	TokenType      string `json:"tokenType"`
	TargetPlayerID string `json:"targetPlayerId,omitempty"`
}

type SubmitGuessPayload struct {
	Text string `json:"text"`
}

type ChooseWordPayload struct {
	Word string `json:"word"`
}

type VotePayload struct {
	TargetID string `json:"targetId"`
}

type SendReactionPayload struct {
	Emoji string `json:"emoji"`
}

type SetDifficultyPayload struct {
	Difficulty string `json:"difficulty"`
}

// ReactionBroadcast is an ephemeral message broadcast to all clients.
type ReactionBroadcast struct {
	PlayerID string `json:"playerId"`
	Emoji    string `json:"emoji"`
}

// --- Server → Client Messages ---

type ServerMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type ErrorPayload struct {
	Message string `json:"message"`
}

type RoomListPayload struct {
	Rooms []RoomInfo `json:"rooms"`
}

// --- Utilities ---

func newUUID() string {
	b := make([]byte, 16)
	_, _ = cryptorand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
