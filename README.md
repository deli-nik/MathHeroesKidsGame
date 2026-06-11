# 🌟 Math Heroes 🌟

Welcome to **Math Heroes**, an interactive educational game designed to make practicing addition and subtraction fun and engaging for young learners! 

Join your favorite heroes on a winding adventure map, solve equations, collect items, and defeat levels to unlock new challenges!

---

## 🎮 How to Play

1. **Choose Your Difficulty**: Select between **Easy** (numbers up to 10), **Medium** (up to 30), or **Hard** (up to 50) right from the world map.
2. **Follow the Path**: Travel along a winding serpentine map board, starting with Sonic and Mario.
3. **Earn Stars**: Correct answers score points and earn stars (up to 3 per level). Beat the current level to unlock the next one!
4. **Unlock the Boss World**: Gather **stars** from Sonic and Mario's worlds to unlock Spidey's boss levels in Web City!

---

## 🦸‍♂️ Meet the Heroes & Worlds

### 🦔 Sonic - Speedy Zone (Addition)
* **Goal**: Solve addition equations to help Sonic zoom ahead and grab rings!
* **Friends**: Tails will fly in to drop rings, and Knuckles will dig them up for you.

### 🍄 Mario - Mushroom Kingdom (Subtraction)
* **Goal**: Help Mario save his coins! Solve subtraction equations to buy power-ups or prevent sneaky Goombas and hungry Yoshi from taking coins.

### 🕷️ Spidey - Web City (Add & Subtract Mix)
* **Goal**: Swing into the boss world! Use webs to catch floating balloons or pop them in a mix of addition and subtraction challenges.

### 🪲 Hollow Knight - Hallownest (Add & Subtract Mix)
* **Goal**: Earn stars in Web City to unlock the caverns of Hallownest! Count geos as the Knight slashes beetles and meets friendly Grubs.
* **Friends**: Hornet flies in to toss geo, Grubs pop up from the ground with gifts, and Sly runs a shop stall for spending challenges.

---

## 🌟 Key Features

* **Winding Adventure Map**: Scroll through a classic console-style level map with bridges, trees, and wiggling flags.
* **Interactive Animation Scenes**: Every answer triggers live game action! Watch Sonic spin-dash, Mario leap to bonk question blocks, and Spidey swing from his webs.
* **Sound Effects & Voice**: Features retro game sound effects and full text-to-speech voiceovers that read the math word problems out loud!
* **Score History**: Track your daily high scores for each character and difficulty setting.
* **Reset Progress**: Want to try for a perfect run? Reset your stars at any time to relock levels and start fresh.

---

## 🧩 Project Structure

* `index.html` — all screens (title, world map, game, score history, level complete)
* `style.css` — styling, themes, and animations
* `js/` — game code, split into focused plain scripts loaded in dependency order (no build step, works straight from disk):
  * `utils.js` — small shared helpers (DOM, random, number words)
  * `config.js` — difficulties, zones, unlock and tuning constants
  * `audio.js` — text-to-speech and sound effects
  * `state.js` — save data, level progression, daily score records
  * `art.js` — all SVG art (hero faces, scene actors, items)
  * `scene.js` — the animated action scene (`SceneFX`)
  * `questions.js` — word-problem sentences and question generation
  * `ui.js` — screen switching, map scaling, confetti
  * `map.js` — world map, tooltips, level locking
  * `gameplay.js` — question flow, answering, level completion
  * `history.js` — score history screen
  * `main.js` — button wiring and startup

---

## 🚀 Get Started

1. Download or clone this repository.
2. Open `index.html` in any web browser (works great on desktops, tablets, and phones!).
3. Click **Play!** and start your math adventure!
