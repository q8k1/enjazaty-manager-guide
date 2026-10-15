# دليل المدير — نظام إنجازاتي

Interactive Arabic/English manager manual for Enjazaty (إنجازاتي), with seven HTML/CSS screen recreations, guided tours, and demonstration popups. No screenshot images or uploads are needed.

**Open the guide:** https://q8k1.github.io/enjazaty-manager-guide/multipage/index.html

Pages follow the app sidebar: Home → Add Task → Calendar → Reward → Assign Task → View Enjazaty → Settings.

Enable GitHub Pages under **Settings → Pages → Deploy from a branch → main / (root)**.

The shared `multipage/styles.css` and `multipage/script.js` are copied verbatim from the [worker guide](https://github.com/q8k1/enjazaty-guide/tree/e4b004b9680a7e5616df73d06d6d7c81ab5c43bb/multipage) (the supplied `main` reference was unavailable). Manager-only additions are isolated in `manager.css` and `manager.js`.

The manager stylesheet places desktop navigation on the left, enlarges text, and adds a glowing heartbeat to the **?** button (disabled when reduced motion is preferred). Supervisee Tasks has a team-only empty state without an Add Enjaz action; personal achievement creation remains under My tasks.

All data and actions are demonstrations, not connected to the real system. Changes reset when you reload; no files or form data are sent anywhere.

To preview locally, run `python3 -m http.server 8000` from the repository root and open `http://localhost:8000/multipage/index.html`. Use **?** on each screen to open the bilingual tour; **Back/Next**, arrow keys, and **Escape** control it.
