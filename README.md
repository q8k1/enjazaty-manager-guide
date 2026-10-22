# دليل المسؤول — نظام إنجازاتي

Interactive Arabic/English supervisor manual for Enjazaty (إنجازاتي), with seven HTML/CSS screen recreations, guided tours, and demonstration popups. No screenshot images or uploads are needed.

**Open the guide:** https://q8k1.github.io/enjazaty-manager-guide/multipage/index.html

Pages follow the app sidebar: Home → Add Task → Calendar → Reward → Assign Task → View Enjazaty → Settings.

Enable GitHub Pages under **Settings → Pages → Deploy from a branch → main / (root)**.

The shared assets originate from the [worker guide](https://github.com/q8k1/enjazaty-guide/tree/e4b004b9680a7e5616df73d06d6d7c81ab5c43bb/multipage) (the supplied `main` reference was unavailable). `multipage/styles.css` remains verbatim; only the sample names (now Employee 1, Employee 2, …) and task text in `multipage/script.js` have been anonymized, with its behavior unchanged. Supervisor-only additions are isolated in `manager.css` and `manager.js`.

The supervisor stylesheet uses a left-to-right layout throughout the guide: navigation, main content, headers, forms, dialogs, landing page, and footer. Arabic tour explanations retain right-to-left text. Text is enlarged, and the bottom-left **?** button has a glowing heartbeat (disabled when reduced motion is preferred). Supervisee Tasks has a team-only empty state without an Add Enjaz action; personal achievement creation remains under My tasks.

Supervisee Tasks includes seven task cards from Reward, with employee names, task types, priorities, dates, and Open details. Both screens use `multipage/tasks.js` as their shared task data. Team cards support search, date/status filters, and grid/list display; no-results never offers Add Enjaz.

All seven guides and the landing page share Reward's dark-blue Enjazaty header, pale background, rounded panels, and navy active tabs. Reward (page 4) additionally follows the supplied supervisor screenshot's table layout, three green reward shades, centered pagination, and right-aligned footer. Its screenshot-specific styling is scoped to `.reward-screen`; guide navigation and the interactive walkthrough remain available. Details uses the selected row's data; unseen task descriptions and attachments are not reproduced.

The header uses the uploaded transparent [Kuwait University logo](ku%20logo%20no%20background.png), served locally with descriptive alternative text instead of relying on an external attachment URL. The logo is 56px on desktop and 44px on mobile. The header account label is **USER**. All people are shown as numbered placeholders (Employee 1, Employee 2, …) in chart labels, employee lists, assignees, and project creators. Task descriptions and project/department examples are deliberately generic, without operational system names or identifiers. Enjazaty branding and the university copyright credit are retained.

All data and actions are demonstrations, not connected to the real system. Changes reset when you reload; no files or form data are sent anywhere.

To preview locally, run `python3 -m http.server 8000` from the repository root and open `http://localhost:8000/multipage/index.html`. Each of the seven guide pages opens a welcome popup: **ابدأ** starts its bilingual tips immediately, while **Later** or **Escape** dismisses it. **End / إنهاء** on the final tip closes the tour instead of restarting it. Use **?** to start a fresh tour from the first tip; **Back/Next**, arrow keys, and **Escape** control it.
