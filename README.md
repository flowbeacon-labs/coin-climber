# Coin Climber — Skybound Worlds

A vertical upward-scrolling HTML5 arcade game inspired by the original Coin Climber prototype, upgraded with a Little Shark-style world and level system.

## Worlds and levels

- **World 1 — Sunrise Skies:** Morning Flight, Cloud Hopper, Stormy Summit
- **World 2 — Emerald Jungle:** Leafy Ascent, Temple Towers, Treetop Chase
- **World 3 — Cosmic Clouds:** Star Trail, Meteor Heights, Galaxy Gateway

Each world has its own animated scenery and enemy design. Enemies now patrol across the entire width of the sky. The outer lanes are clearly marked danger zones: staying near an edge for about two seconds causes a hit after a warning. Move toward the center to reset the hazard timer. Collect coins, avoid hazards, pick up shields or hearts, reach checkpoints, and climb to the sky gate. Level unlocks and the high score are saved in the browser using localStorage.

## Controls

- Hold **left/right** to steer. Release to stop immediately.
- Hold **BOOST** to climb faster.
- Desktop: **A/D** or **Left/Right arrows**; **Space/Up** to boost; **P** to pause.
- Mobile supports multi-touch, cancelled touch release, suppressed text selection/context menus, and a fullscreen button when supported.
- iPhone Safari may not allow a website to enter native fullscreen; use **Share → Add to Home Screen** for standalone appearance where supported.

## Publish on GitHub Pages

1. Create a new *public* repository, such as `coin-climber`.
2. Upload `index.html`, `style.css`, `game.js`, and this `README.md` to the repository root.
3. GitHub → Settings → Pages → Deploy from branch → `main`, `/ (root)` → Save.
4. Your game will appear at `https://YOUR-USERNAME.github.io/coin-climber/` when Pages finishes deploying.

## Platform notes

This is a browser-hosting build, not a YouTube Playables-certified package. YouTube publishing may require SDK integration and Playables review. All graphics are original programmatic canvas illustrations; no third-party assets are required.