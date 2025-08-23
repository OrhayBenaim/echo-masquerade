# Echoes of the Masquerade

A social deduction web game set in a mysterious masquerade ball. Players take on secret roles and must bluff, deceive, and deduce to achieve their hidden objectives.

---

## 🎭 Game Overview

- **Setting**: A masquerade ball full of hidden identities.
- **Players**: Each player is secretly assigned a role with unique objectives.
- **Objective**: Use clues, communication, and deception to survive or accomplish your role’s win condition.

---

## 🕹 Core Gameplay

### Roles

Each game assigns secret roles to players:

- **Spy**: Uncover the identities of other players.
- **Guest**: Survive the night without being eliminated.
- **Assassin**: Eliminate a specific target.
- **Watcher**: Prevent eliminations and gather evidence.

### Communication

- Players can make **open speeches** (accuse, lie, mislead).
- Players can use **limited private chats** per round (via in-game messaging).

### Rounds

Each round (3–5 minutes) has 3 phases:

1. **Gather Clues** – Players receive vague hints about others.
2. **Discuss & Accuse** – Players debate openly, accuse others.
3. **Vote** – Players vote on someone to be unmasked or eliminated.

### The Echoes Mechanic

- At the start of each round, all players receive a cryptic “Echo” message.
- Echoes may contain **truths, lies, or irrelevant noise**, creating paranoia.

---

## 🌀 Game Loop

1. **Host Creates a Room**

   - A host starts a game session, generating a **Room ID**.

2. **Players Join**

   - Players connect via browser using the **Room ID** (PeerJS connection, no backend).

3. **Assign Roles**

   - Each player secretly receives their role and objectives.

4. **Play Rounds**

   - Players gather clues, send private chats, analyze echoes, and vote.

5. **Reveal & Eliminate**

   - Votes reveal roles and shift dynamics.

6. **Win Conditions**
   - **Spies**: Win by unmasking your target.
   - **Guests**: Win by surviving until the end.
   - **Assassins**: Win by eliminating their targets.
   - **Watchers**: Win by exposing all Assassin and Spy.

---

## 🔁 Replayability

- **Randomized Roles** each game.
- **Dynamic Echo Variations** keep each round fresh.
- **Game Modes** (future):
  - **Double Agents** – players hold dual roles.
  - **Time Pressure** – faster rounds for more chaos.

---

## 🛠 Technical Details

- **Platform**: Web only (no mobile app).
- **Networking**: Peer-to-peer connections via **PeerJS**.
- **Room System**:
  - Host generates a **Room ID**.
  - Clients join with the Room ID.
- **No Backend** – all game state is handled client-side with peer-to-peer communication.

---

## 🚀 How to Run (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/echoes-of-the-masquerade.git
   cd echoes-of-the-masquerade
   ```
