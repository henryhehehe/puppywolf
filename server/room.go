package main

import (
	"fmt"
	"log"
	"math/rand"
	"strings"
	"sync"
	"time"
)

const (
	initialTime       = 240
	roleRevealTime    = 8
	werewolfGuessTime = 30
	minPlayers        = 3
	maxPlayers        = 10
)

var botNames = []string{
	"Luna", "Felix", "Shadow", "Maple", "Coco", "Mochi",
	"Pepper", "Honey", "Biscuit", "Pumpkin", "Stormy", "Hazel",
}

type Room struct {
	code    string
	hub     *Hub
	clients map[string]*Client
	players map[string]*Player
	order   []string

	phase         string
	secretWord    string
	timeRemaining int
	tokensUsed    int
	tokenHistory  []TokenAction
	guesses       map[string]*GuessEntry
	wordOptions   []string
	winner        string
	votes         map[string]string
	scores        map[string]int // persistent scores keyed by player ID

	gameEpoch int
	ticker    *time.Ticker
	stopCh    chan struct{}
	mu        sync.Mutex
}

func newRoom(code string, hub *Hub) *Room {
	return &Room{
		code:         code,
		hub:          hub,
		clients:      make(map[string]*Client),
		players:      make(map[string]*Player),
		order:        make([]string, 0),
		phase:        PhaseLobby,
		tokenHistory: make([]TokenAction, 0),
		guesses:      make(map[string]*GuessEntry),
		votes:        make(map[string]string),
		scores:       make(map[string]int),
	}
}

// ============================================================
// Player Management
// ============================================================

func (r *Room) addClient(c *Client, name string, avatarURL string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.phase != PhaseLobby {
		c.sendError("Game already in progress")
		return
	}
	if len(r.players) >= maxPlayers {
		c.sendError("Room is full")
		return
	}

	if avatarURL == "" {
		avatarURL = fmt.Sprintf("https://api.dicebear.com/7.x/adventurer/svg?seed=%s&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf", c.playerID)
	}

	player := &Player{
		ID:        c.playerID,
		Name:      name,
		Role:      RoleVillager,
		IsMayor:   false,
		IsReady:   false,
		AvatarURL: avatarURL,
		IsBot:     false,
	}

	r.clients[c.playerID] = c
	r.players[c.playerID] = player
	r.order = append(r.order, c.playerID)
	c.room = r

	log.Printf("[Room %s] %s joined (%d players)", r.code, name, len(r.players))
	r.broadcastState()
}

func (r *Room) removeClient(c *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()

	playerName := ""
	if p := r.players[c.playerID]; p != nil {
		playerName = p.Name
	}

	delete(r.clients, c.playerID)
	delete(r.players, c.playerID)
	for i, id := range r.order {
		if id == c.playerID {
			r.order = append(r.order[:i], r.order[i+1:]...)
			break
		}
	}
	c.room = nil

	log.Printf("[Room %s] %s disconnected (%d remaining)", r.code, playerName, len(r.clients))

	if len(r.clients) == 0 {
		r.stopTimers()
		r.hub.removeRoom(r.code)
		return
	}

	if r.phase == PhaseVoting {
		r.checkVotingComplete()
	}
	r.broadcastState()
}

// ============================================================
// Bot Management
// ============================================================

func (r *Room) handleAddBot() {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.phase != PhaseLobby {
		return
	}
	if len(r.players) >= maxPlayers {
		return
	}

	botID := newUUID()
	name := r.pickBotName()

	player := &Player{
		ID:        botID,
		Name:      name,
		Role:      RoleVillager,
		IsMayor:   false,
		IsReady:   true,
		AvatarURL: fmt.Sprintf("https://api.dicebear.com/7.x/adventurer/svg?seed=bot-%s&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf", botID),
		IsBot:     true,
	}

	// Bots go in players + order, but NOT in clients (no WS connection)
	r.players[botID] = player
	r.order = append(r.order, botID)

	log.Printf("[Room %s] Bot %q added (%d players)", r.code, name, len(r.players))
	r.broadcastState()
}

func (r *Room) pickBotName() string {
	usedNames := make(map[string]bool)
	for _, p := range r.players {
		usedNames[p.Name] = true
	}
	for _, n := range botNames {
		if !usedNames[n] {
			return n
		}
	}
	return fmt.Sprintf("Bot-%d", rand.Intn(999))
}

// scheduleBotActions starts goroutines for bots to act in the current phase.
// Must be called with lock held.
func (r *Room) scheduleBotActions(epoch int) {
	switch r.phase {
	case PhaseDayPhase:
		for _, id := range r.order {
			if p := r.players[id]; p != nil && p.IsBot && p.IsMayor {
				go r.runBotMayor(id, epoch)
			}
		}
	case PhaseVoting:
		for _, id := range r.order {
			if p := r.players[id]; p != nil && p.IsBot {
				go r.runBotVote(id, epoch, PhaseVoting)
			}
		}
	case PhaseWerewolfGuess:
		for _, id := range r.order {
			if p := r.players[id]; p != nil && p.IsBot && p.Role == RoleWerewolf {
				go r.runBotVote(id, epoch, PhaseWerewolfGuess)
			}
		}
	}
}

func (r *Room) runBotMayor(botID string, epoch int) {
	tokenTypes := []string{TokenYes, TokenNo, TokenMaybe, TokenSoClose, TokenWayOff}
	for {
		delay := time.Duration(3+rand.Intn(3)) * time.Second
		select {
		case <-time.After(delay):
			r.mu.Lock()
			if r.gameEpoch != epoch || r.phase != PhaseDayPhase {
				r.mu.Unlock()
				return
			}
			nonMayors := make([]string, 0)
			for _, id := range r.order {
				if p := r.players[id]; p != nil && !p.IsMayor {
					nonMayors = append(nonMayors, id)
				}
			}
			var targetID string
			if len(nonMayors) > 0 {
				targetID = nonMayors[rand.Intn(len(nonMayors))]
			}
			token := TokenAction{
				ID:             newUUID(),
				Type:           tokenTypes[rand.Intn(len(tokenTypes))],
				Timestamp:      time.Now().UnixMilli(),
				TargetPlayerID: targetID,
			}
			r.tokenHistory = append([]TokenAction{token}, r.tokenHistory...)
			r.tokensUsed++
			r.broadcastState()
			r.mu.Unlock()
		case <-r.stopCh:
			return
		}
	}
}

func (r *Room) runBotVote(botID string, epoch int, phase string) {
	delay := time.Duration(2+rand.Intn(4)) * time.Second
	select {
	case <-time.After(delay):
		r.mu.Lock()
		defer r.mu.Unlock()
		if r.gameEpoch != epoch || r.phase != phase {
			return
		}
		if _, hasVoted := r.votes[botID]; hasVoted {
			return
		}
		targets := make([]string, 0)
		for _, id := range r.order {
			if id != botID {
				targets = append(targets, id)
			}
		}
		if len(targets) == 0 {
			return
		}
		targetID := targets[rand.Intn(len(targets))]
		r.votes[botID] = targetID
		r.players[targetID].VotesReceived++

		log.Printf("[Room %s] Bot %s voted for %s", r.code, botID, targetID)

		if phase == PhaseWerewolfGuess {
			r.checkWerewolfGuessComplete()
		} else {
			r.checkVotingComplete()
		}
		r.broadcastState()
	case <-r.stopCh:
		return
	}
}

// ============================================================
// Lobby Actions
// ============================================================

func (r *Room) handleToggleReady(c *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.phase != PhaseLobby {
		c.sendError("Cannot toggle ready outside lobby")
		return
	}
	player := r.players[c.playerID]
	if player == nil {
		return
	}
	player.IsReady = !player.IsReady
	r.broadcastState()
}

func (r *Room) handleToggleWantsMayor(c *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.phase != PhaseLobby {
		c.sendError("Cannot volunteer outside lobby")
		return
	}
	player := r.players[c.playerID]
	if player == nil {
		return
	}
	player.WantsMayor = !player.WantsMayor
	r.broadcastState()
}

func (r *Room) handleStartGame(c *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.phase != PhaseLobby {
		c.sendError("Game already started")
		return
	}
	if len(r.players) < minPlayers {
		c.sendError(fmt.Sprintf("Need at least %d players to start", minPlayers))
		return
	}
	for _, p := range r.players {
		if !p.IsReady {
			c.sendError("All players must be ready")
			return
		}
	}
	r.startGame()
}

// ============================================================
// Game Logic
// ============================================================

func (r *Room) startGame() {
	r.gameEpoch++
	epoch := r.gameEpoch

	roles := r.generateRoles(len(r.order))
	rand.Shuffle(len(roles), func(i, j int) { roles[i], roles[j] = roles[j], roles[i] })

	// Pick mayor: prefer volunteers, then random
	volunteers := make([]int, 0)
	for i, playerID := range r.order {
		if p := r.players[playerID]; p != nil && p.WantsMayor {
			volunteers = append(volunteers, i)
		}
	}
	var mayorIdx int
	if len(volunteers) > 0 {
		mayorIdx = volunteers[rand.Intn(len(volunteers))]
	} else {
		mayorIdx = rand.Intn(len(r.order))
	}

	for i, playerID := range r.order {
		player := r.players[playerID]
		player.Role = roles[i]
		player.IsMayor = (i == mayorIdx)
		player.VotesReceived = 0
		player.WantsMayor = false // Clear for next round
	}

	r.secretWord = ""
	r.wordOptions = getRandomWords(5)
	r.timeRemaining = initialTime
	r.tokensUsed = 0
	r.tokenHistory = make([]TokenAction, 0)
	r.guesses = make(map[string]*GuessEntry)
	r.votes = make(map[string]string)
	r.winner = ""

	r.phase = PhaseRoleReveal
	r.broadcastState()

	r.stopCh = make(chan struct{})
	go func() {
		select {
		case <-time.After(time.Duration(roleRevealTime) * time.Second):
			r.mu.Lock()
			defer r.mu.Unlock()
			if r.gameEpoch != epoch {
				return
			}
			if r.phase == PhaseRoleReveal {
				r.phase = PhaseWordSelection
				r.timeRemaining = 30 // 30 seconds to choose
				r.broadcastState()
				r.startWordSelectionTimer(epoch)
				r.scheduleBotWordChoice(epoch)
			}
		case <-r.stopCh:
			return
		}
	}()

	log.Printf("[Room %s] Game started! Players: %d", r.code, len(r.order))
}

func (r *Room) handleChooseWord(c *Client, payload ChooseWordPayload) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.phase != PhaseWordSelection {
		c.sendError("Cannot choose word outside word selection phase")
		return
	}
	player := r.players[c.playerID]
	if player == nil || !player.IsMayor {
		c.sendError("Only the Pack Leader can choose the word")
		return
	}

	// Validate word is one of the options
	valid := false
	for _, w := range r.wordOptions {
		if w == payload.Word {
			valid = true
			break
		}
	}
	if !valid {
		c.sendError("Invalid word choice")
		return
	}

	r.secretWord = payload.Word
	r.wordOptions = nil
	r.transitionToDayPhase()
}

func (r *Room) startWordSelectionTimer(epoch int) {
	if r.ticker != nil {
		r.ticker.Stop()
	}
	r.ticker = time.NewTicker(1 * time.Second)
	go func() {
		for {
			select {
			case <-r.ticker.C:
				r.mu.Lock()
				if r.gameEpoch != epoch || r.phase != PhaseWordSelection {
					r.ticker.Stop()
					r.mu.Unlock()
					return
				}
				if r.timeRemaining > 0 {
					r.timeRemaining--
					r.broadcastState()
					r.mu.Unlock()
				} else {
					r.ticker.Stop()
					// Time's up — auto-pick a word
					if r.secretWord == "" && len(r.wordOptions) > 0 {
						r.secretWord = r.wordOptions[rand.Intn(len(r.wordOptions))]
						r.wordOptions = nil
					}
					r.transitionToDayPhase()
					r.mu.Unlock()
					return // exit goroutine; day timer now owns the ticker
				}
			case <-r.stopCh:
				return
			}
		}
	}()
}

func (r *Room) scheduleBotWordChoice(epoch int) {
	for _, id := range r.order {
		if p := r.players[id]; p != nil && p.IsBot && p.IsMayor {
			go func(botID string) {
				delay := time.Duration(2+rand.Intn(3)) * time.Second
				select {
				case <-time.After(delay):
					r.mu.Lock()
					defer r.mu.Unlock()
					if r.gameEpoch != epoch || r.phase != PhaseWordSelection {
						return
					}
					if r.secretWord == "" && len(r.wordOptions) > 0 {
						r.secretWord = r.wordOptions[rand.Intn(len(r.wordOptions))]
						r.wordOptions = nil
						r.transitionToDayPhase()
					}
				case <-r.stopCh:
					return
				}
			}(id)
		}
	}
}

// transitionToDayPhase moves from word selection to the day phase.
// Must be called with lock held.
func (r *Room) transitionToDayPhase() {
	epoch := r.gameEpoch
	r.phase = PhaseDayPhase
	r.timeRemaining = initialTime
	r.startDayTimer(epoch)
	r.scheduleBotActions(epoch)
	r.broadcastState()
	log.Printf("[Room %s] Word chosen: %q — Day phase started", r.code, r.secretWord)
}

func (r *Room) generateRoles(count int) []string {
	roles := make([]string, count)
	idx := 0
	numWerewolves := 1
	if count >= 6 {
		numWerewolves = 2
	}
	for i := 0; i < numWerewolves; i++ {
		roles[idx] = RoleWerewolf
		idx++
	}
	roles[idx] = RoleSeer
	idx++
	for idx < count {
		roles[idx] = RoleVillager
		idx++
	}
	return roles
}

func (r *Room) startDayTimer(epoch int) {
	if r.ticker != nil {
		r.ticker.Stop()
	}
	r.ticker = time.NewTicker(1 * time.Second)
	go func() {
		for {
			select {
			case <-r.ticker.C:
				r.mu.Lock()
				if r.gameEpoch != epoch || r.phase != PhaseDayPhase {
					r.ticker.Stop()
					r.mu.Unlock()
					return
				}
				if r.timeRemaining > 0 {
					r.timeRemaining--
					r.broadcastState()
				} else {
					r.ticker.Stop()
					r.startVotingPhase()
					r.scheduleBotActions(epoch)
					r.broadcastState()
				}
				r.mu.Unlock()
			case <-r.stopCh:
				return
			}
		}
	}()
}

func (r *Room) handleSubmitGuess(c *Client, payload SubmitGuessPayload) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.phase != PhaseDayPhase {
		return
	}
	player := r.players[c.playerID]
	if player == nil || player.IsMayor {
		return // Mayor doesn't guess
	}
	text := payload.Text
	if len(text) > 80 {
		text = text[:80]
	}
	if text == "" {
		return
	}

	r.guesses[c.playerID] = &GuessEntry{
		PlayerID:  c.playerID,
		Text:      text,
		Timestamp: time.Now().UnixMilli(),
	}

	// Auto-check: if the guess matches the secret word, village guessed correctly
	if strings.EqualFold(strings.TrimSpace(text), strings.TrimSpace(r.secretWord)) {
		log.Printf("[Room %s] Player %s guessed the correct word!", r.code, c.playerID)
		// Record a CORRECT token targeting this player
		r.tokenHistory = append(r.tokenHistory, TokenAction{
			ID:             newUUID(),
			Type:           TokenCorrect,
			Timestamp:      time.Now().UnixMilli(),
			TargetPlayerID: c.playerID,
		})
		r.tokensUsed++
		r.guesses = make(map[string]*GuessEntry)
		r.startWerewolfGuess()
		return
	}

	r.broadcastState()
}

func (r *Room) handleSubmitToken(c *Client, payload SubmitTokenPayload) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.phase != PhaseDayPhase {
		c.sendError("Tokens can only be submitted during the day phase")
		return
	}
	player := r.players[c.playerID]
	if player == nil || !player.IsMayor {
		c.sendError("Only the Mayor can submit tokens")
		return
	}

	// Use the target player specified by the Mayor, or fall back to most recent guesser
	var targetPlayerID string
	if payload.TargetPlayerID != "" {
		// Validate the target exists and is not the Mayor
		if tp := r.players[payload.TargetPlayerID]; tp != nil && !tp.IsMayor {
			targetPlayerID = payload.TargetPlayerID
		}
	}
	// Fallback: most recent guesser
	if targetPlayerID == "" {
		var latestTimestamp int64
		for id, guess := range r.guesses {
			if guess.Timestamp > latestTimestamp {
				latestTimestamp = guess.Timestamp
				targetPlayerID = id
			}
		}
	}
	// Fallback: random non-mayor
	if targetPlayerID == "" {
		nonMayors := make([]string, 0)
		for _, id := range r.order {
			if p := r.players[id]; p != nil && !p.IsMayor {
				nonMayors = append(nonMayors, id)
			}
		}
		if len(nonMayors) > 0 {
			targetPlayerID = nonMayors[rand.Intn(len(nonMayors))]
		}
	}

	token := TokenAction{
		ID:             newUUID(),
		Type:           payload.TokenType,
		Timestamp:      time.Now().UnixMilli(),
		TargetPlayerID: targetPlayerID,
	}
	r.tokenHistory = append([]TokenAction{token}, r.tokenHistory...)
	r.tokensUsed++

	// Clear all guesses after Mayor responds
	r.guesses = make(map[string]*GuessEntry)

	if payload.TokenType == TokenCorrect {
		r.startWerewolfGuess()
	} else {
		r.broadcastState()
	}
}

// ============================================================
// Voting
// ============================================================

func (r *Room) startVotingPhase() {
	r.phase = PhaseVoting
	r.votes = make(map[string]string)
	for _, p := range r.players {
		p.VotesReceived = 0
	}
}

func (r *Room) handleVote(c *Client, payload VotePayload) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.phase != PhaseVoting && r.phase != PhaseWerewolfGuess {
		c.sendError("Voting is not open")
		return
	}
	if r.phase == PhaseWerewolfGuess {
		voter := r.players[c.playerID]
		if voter == nil || voter.Role != RoleWerewolf {
			c.sendError("Only werewolves can vote in this phase")
			return
		}
	}
	if payload.TargetID == c.playerID {
		c.sendError("Cannot vote for yourself")
		return
	}
	if _, exists := r.players[payload.TargetID]; !exists {
		c.sendError("Invalid vote target")
		return
	}
	if _, hasVoted := r.votes[c.playerID]; hasVoted {
		c.sendError("You have already voted")
		return
	}

	r.votes[c.playerID] = payload.TargetID
	r.players[payload.TargetID].VotesReceived++

	if r.phase == PhaseWerewolfGuess {
		r.checkWerewolfGuessComplete()
	} else {
		r.checkVotingComplete()
	}
	r.broadcastState()
}

func (r *Room) checkVotingComplete() {
	for _, id := range r.order {
		if _, hasVoted := r.votes[id]; !hasVoted {
			p := r.players[id]
			if p == nil {
				continue
			}
			if p.IsBot {
				return // Bot hasn't voted yet, wait
			}
			if _, isConnected := r.clients[id]; isConnected {
				return // Connected real player hasn't voted
			}
		}
	}
	if len(r.votes) > 0 {
		r.resolveVoting()
	}
}

func (r *Room) resolveVoting() {
	var mostVotedID string
	maxVotes := 0
	for _, id := range r.order {
		if p := r.players[id]; p != nil && p.VotesReceived > maxVotes {
			maxVotes = p.VotesReceived
			mostVotedID = id
		}
	}
	if mostVotedID != "" && r.players[mostVotedID].Role == RoleWerewolf {
		r.endGame(WinnerVillage)
	} else {
		r.endGame(WinnerWerewolf)
	}
}

// ============================================================
// Werewolf Guess
// ============================================================

func (r *Room) startWerewolfGuess() {
	if r.ticker != nil {
		r.ticker.Stop()
	}
	r.phase = PhaseWerewolfGuess
	r.votes = make(map[string]string)
	r.timeRemaining = werewolfGuessTime
	for _, p := range r.players {
		p.VotesReceived = 0
	}
	r.broadcastState()

	epoch := r.gameEpoch
	r.startWerewolfGuessTimer(epoch)
	r.scheduleBotActions(epoch)

	log.Printf("[Room %s] Werewolf guess phase started", r.code)
}

func (r *Room) startWerewolfGuessTimer(epoch int) {
	if r.ticker != nil {
		r.ticker.Stop()
	}
	r.ticker = time.NewTicker(1 * time.Second)
	go func() {
		for {
			select {
			case <-r.ticker.C:
				r.mu.Lock()
				if r.gameEpoch != epoch || r.phase != PhaseWerewolfGuess {
					r.ticker.Stop()
					r.mu.Unlock()
					return
				}
				if r.timeRemaining > 0 {
					r.timeRemaining--
					r.broadcastState()
				} else {
					r.ticker.Stop()
					r.endGame(WinnerVillage)
				}
				r.mu.Unlock()
			case <-r.stopCh:
				return
			}
		}
	}()
}

func (r *Room) checkWerewolfGuessComplete() {
	for _, id := range r.order {
		p := r.players[id]
		if p != nil && p.Role == RoleWerewolf {
			if _, hasVoted := r.votes[id]; !hasVoted {
				if p.IsBot {
					return
				}
				if _, isConnected := r.clients[id]; isConnected {
					return
				}
			}
		}
	}
	if len(r.votes) > 0 {
		r.resolveWerewolfGuess()
	} else {
		r.endGame(WinnerVillage)
	}
}

func (r *Room) resolveWerewolfGuess() {
	var mostVotedID string
	maxVotes := 0
	for _, id := range r.order {
		if p := r.players[id]; p != nil && p.VotesReceived > maxVotes {
			maxVotes = p.VotesReceived
			mostVotedID = id
		}
	}
	if mostVotedID != "" && r.players[mostVotedID].Role == RoleSeer {
		log.Printf("[Room %s] Werewolves found the Seer!", r.code)
		r.endGame(WinnerWerewolf)
	} else {
		log.Printf("[Room %s] Werewolves guessed wrong", r.code)
		r.endGame(WinnerVillage)
	}
}

// ============================================================
// Game End & Reset
// ============================================================

func (r *Room) endGame(winner string) {
	r.stopTimers()
	r.winner = winner
	r.phase = PhaseGameOver

	// Award scores
	for _, id := range r.order {
		p := r.players[id]
		if p == nil {
			continue
		}
		if winner == WinnerVillage {
			// Village team wins: non-werewolves score
			if p.Role != RoleWerewolf {
				r.scores[id]++
				if p.IsMayor {
					r.scores[id]++ // Mayor bonus
				}
			}
		} else {
			// Werewolf team wins
			if p.Role == RoleWerewolf {
				r.scores[id] += 2
			}
		}
		// Sync score into player struct for broadcasting
		p.Score = r.scores[id]
	}

	r.broadcastState()
	log.Printf("[Room %s] Game over! Winner: %s", r.code, winner)
}

func (r *Room) handleResetGame(c *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.stopTimers()
	r.phase = PhaseLobby
	r.secretWord = ""
	r.tokenHistory = make([]TokenAction, 0)
	r.guesses = make(map[string]*GuessEntry)
	r.tokensUsed = 0
	r.winner = ""
	r.votes = make(map[string]string)

	for _, p := range r.players {
		p.IsReady = p.IsBot // Bots stay ready
		p.VotesReceived = 0
		p.Role = RoleVillager
		p.IsMayor = false
		p.WantsMayor = false
	}

	r.broadcastState()
	log.Printf("[Room %s] Reset to lobby", r.code)
}

func (r *Room) stopTimers() {
	if r.ticker != nil {
		r.ticker.Stop()
	}
	if r.stopCh != nil {
		select {
		case <-r.stopCh:
		default:
			close(r.stopCh)
		}
	}
}

// ============================================================
// State Broadcasting
// ============================================================

func (r *Room) broadcastState() {
	for playerID, client := range r.clients {
		state := r.buildStateForPlayer(playerID)
		client.sendState(state)
	}
}

func (r *Room) buildStateForPlayer(playerID string) GameState {
	thisPlayer := r.players[playerID]
	isWerewolf := thisPlayer != nil && thisPlayer.Role == RoleWerewolf

	players := make([]Player, 0, len(r.order))
	for _, id := range r.order {
		if p := r.players[id]; p != nil {
			pc := *p
			pc.Score = r.scores[id] // always sync persistent score
			if r.phase != PhaseGameOver && r.phase != PhaseLobby {
				if id != playerID {
					// Werewolves can see other werewolves
					if isWerewolf && pc.Role == RoleWerewolf {
						// keep role visible
					} else {
						pc.Role = ""
					}
				}
			}
			players = append(players, pc)
		}
	}

	secretWord := ""
	if thisPlayer != nil {
		if r.phase == PhaseGameOver || r.phase == PhaseWerewolfGuess {
			secretWord = r.secretWord
		} else if thisPlayer.IsMayor || thisPlayer.Role == RoleWerewolf || thisPlayer.Role == RoleSeer {
			secretWord = r.secretWord
		}
	}

	tokenHistory := r.tokenHistory
	if tokenHistory == nil {
		tokenHistory = make([]TokenAction, 0)
	}

	guesses := make([]GuessEntry, 0, len(r.guesses))
	for _, g := range r.guesses {
		guesses = append(guesses, *g)
	}

	// Word options shown only to the Mayor during word selection
	var wordOptions []string
	if r.phase == PhaseWordSelection {
		if thisPlayer != nil && thisPlayer.IsMayor {
			wordOptions = r.wordOptions
		}
	}

	return GameState{
		Phase:         r.phase,
		RoomCode:      r.code,
		Players:       players,
		SecretWord:    secretWord,
		WordOptions:   wordOptions,
		TimeRemaining: r.timeRemaining,
		TokensUsed:    r.tokensUsed,
		TokenHistory:  tokenHistory,
		Guesses:       guesses,
		Winner:        r.winner,
		MyPlayerID:    playerID,
	}
}
