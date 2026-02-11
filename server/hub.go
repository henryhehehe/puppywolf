package main

import (
	"fmt"
	"log"
	"math/rand"
	"sync"
)

type Hub struct {
	rooms map[string]*Room
	mu    sync.RWMutex
}

func newHub() *Hub {
	return &Hub{
		rooms: make(map[string]*Room),
	}
}

func (h *Hub) handleJoinGame(c *Client, payload JoinGamePayload) {
	if c.room != nil {
		c.sendError("You are already in a room")
		return
	}

	c.playerID = newUUID()

	if payload.RoomCode != "" {
		h.mu.RLock()
		room, exists := h.rooms[payload.RoomCode]
		h.mu.RUnlock()

		if !exists {
			c.sendError("Room not found: " + payload.RoomCode)
			return
		}

		room.addClient(c, payload.Name, payload.AvatarURL)
		log.Printf("[Hub] Player %q joined room %s", payload.Name, payload.RoomCode)
	} else {
		code := h.generateRoomCode()
		room := newRoom(code, h)

		h.mu.Lock()
		h.rooms[code] = room
		h.mu.Unlock()

		room.addClient(c, payload.Name, payload.AvatarURL)
		log.Printf("[Hub] Player %q created room %s", payload.Name, code)
	}
}

// listRooms returns info about all rooms currently in lobby phase.
func (h *Hub) listRooms() []RoomInfo {
	h.mu.RLock()
	defer h.mu.RUnlock()

	rooms := make([]RoomInfo, 0)
	for _, room := range h.rooms {
		room.mu.Lock()
		names := make([]string, 0)
		for _, id := range room.order {
			if p := room.players[id]; p != nil {
				names = append(names, p.Name)
			}
		}
		rooms = append(rooms, RoomInfo{
			Code:        room.code,
			PlayerCount: len(room.players),
			MaxPlayers:  maxPlayers,
			Phase:       room.phase,
			PlayerNames: names,
		})
		room.mu.Unlock()
	}
	return rooms
}

func (h *Hub) removeRoom(code string) {
	h.mu.Lock()
	delete(h.rooms, code)
	h.mu.Unlock()
	log.Printf("[Hub] Room %s removed", code)
}

func (h *Hub) generateRoomCode() string {
	for {
		code := fmt.Sprintf("WOLF-%04d", rand.Intn(10000))
		h.mu.RLock()
		_, exists := h.rooms[code]
		h.mu.RUnlock()
		if !exists {
			return code
		}
	}
}
