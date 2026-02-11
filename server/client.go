package main

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 65536
)

type Client struct {
	hub      *Hub
	room     *Room
	conn     *websocket.Conn
	send     chan []byte
	playerID string
}

func (c *Client) readPump() {
	defer func() {
		if c.room != nil {
			c.room.removeClient(c)
		}
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				log.Printf("WebSocket read error: %v", err)
			}
			break
		}

		var msg ClientMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			c.sendError("Invalid message format")
			continue
		}
		c.handleMessage(msg)
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) handleMessage(msg ClientMessage) {
	switch msg.Type {
	case "JOIN_GAME":
		var payload JoinGamePayload
		if err := json.Unmarshal(msg.Payload, &payload); err != nil {
			c.sendError("Invalid JOIN_GAME payload")
			return
		}
		if payload.Name == "" {
			c.sendError("Name is required")
			return
		}
		c.hub.handleJoinGame(c, payload)

	case "LIST_ROOMS":
		rooms := c.hub.listRooms()
		c.sendRoomList(rooms)

	case "TOGGLE_READY":
		if c.room == nil {
			c.sendError("You are not in a room")
			return
		}
		c.room.handleToggleReady(c)

	case "TOGGLE_WANTS_MAYOR":
		if c.room == nil {
			c.sendError("You are not in a room")
			return
		}
		c.room.handleToggleWantsMayor(c)

	case "START_GAME":
		if c.room == nil {
			c.sendError("You are not in a room")
			return
		}
		c.room.handleStartGame(c)

	case "ADD_BOT":
		if c.room == nil {
			c.sendError("You are not in a room")
			return
		}
		c.room.handleAddBot()

	case "SUBMIT_GUESS":
		if c.room == nil {
			c.sendError("You are not in a room")
			return
		}
		var payload SubmitGuessPayload
		if err := json.Unmarshal(msg.Payload, &payload); err != nil {
			c.sendError("Invalid SUBMIT_GUESS payload")
			return
		}
		c.room.handleSubmitGuess(c, payload)

	case "CHOOSE_WORD":
		if c.room == nil {
			c.sendError("You are not in a room")
			return
		}
		var payload ChooseWordPayload
		if err := json.Unmarshal(msg.Payload, &payload); err != nil {
			c.sendError("Invalid CHOOSE_WORD payload")
			return
		}
		c.room.handleChooseWord(c, payload)

	case "SUBMIT_TOKEN":
		if c.room == nil {
			c.sendError("You are not in a room")
			return
		}
		var payload SubmitTokenPayload
		if err := json.Unmarshal(msg.Payload, &payload); err != nil {
			c.sendError("Invalid SUBMIT_TOKEN payload")
			return
		}
		c.room.handleSubmitToken(c, payload)

	case "VOTE":
		if c.room == nil {
			c.sendError("You are not in a room")
			return
		}
		var payload VotePayload
		if err := json.Unmarshal(msg.Payload, &payload); err != nil {
			c.sendError("Invalid VOTE payload")
			return
		}
		c.room.handleVote(c, payload)

	case "RESET_GAME":
		if c.room == nil {
			c.sendError("You are not in a room")
			return
		}
		c.room.handleResetGame(c)

	case "SEND_REACTION":
		if c.room == nil {
			c.sendError("You are not in a room")
			return
		}
		var payload SendReactionPayload
		if err := json.Unmarshal(msg.Payload, &payload); err != nil {
			c.sendError("Invalid SEND_REACTION payload")
			return
		}
		c.room.handleSendReaction(c, payload)

	case "REVEAL_HINT":
		if c.room == nil {
			c.sendError("You are not in a room")
			return
		}
		c.room.handleRevealHint(c)

	case "SET_DIFFICULTY":
		if c.room == nil {
			c.sendError("You are not in a room")
			return
		}
		var payload SetDifficultyPayload
		if err := json.Unmarshal(msg.Payload, &payload); err != nil {
			c.sendError("Invalid SET_DIFFICULTY payload")
			return
		}
		c.room.handleSetDifficulty(c, payload)

	default:
		c.sendError("Unknown message type: " + msg.Type)
	}
}

func (c *Client) sendError(message string) {
	msg := ServerMessage{Type: "ERROR", Payload: ErrorPayload{Message: message}}
	data, _ := json.Marshal(msg)
	select {
	case c.send <- data:
	default:
	}
}

func (c *Client) sendState(state GameState) {
	msg := ServerMessage{Type: "STATE_UPDATE", Payload: state}
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}
	select {
	case c.send <- data:
	default:
	}
}

func (c *Client) sendReaction(reaction ReactionBroadcast) {
	msg := ServerMessage{Type: "REACTION", Payload: reaction}
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}
	select {
	case c.send <- data:
	default:
	}
}

func (c *Client) sendRoomList(rooms []RoomInfo) {
	msg := ServerMessage{Type: "ROOM_LIST", Payload: RoomListPayload{Rooms: rooms}}
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}
	select {
	case c.send <- data:
	default:
	}
}
