# Stay Fair! — Project Page

Project page for **Stay Fair! Ensuring Group Fairness in Diffusion Models Across Guidance Scales** (NeurIPS 2026).
Paper: https://arxiv.org/abs/2605.28036 · Code: https://github.com/Kim-Myeong-Soo/stay-fair

- `index.html` — the page (static, no build step). Math is rendered with MathJax from a CDN.
- `assets/css/style.css`, `assets/js/main.js` — styles and the interactive figures (inline SVG).
- `assets/js/results-data.js` — per-occupation female ratios for the Results plots, from `results/female_ratio_*.csv` of the code repo (mean over three seeds).
- `static/images/` — the method figure, Figure 7 crop, sample images for the Motivation demo (`demo/`), and the share image (`og.png`).

Local preview: `python3 -m http.server` in this folder, then open http://localhost:8000.
Publish: Settings → Pages → Deploy from branch `main` / root → https://kim-myeong-soo.github.io/stayfair/.

When editing CSS or JS, bump the `?v=` query in `index.html` so browsers pick up the change.
