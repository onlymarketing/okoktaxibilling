# OKOK TAXI Customer Trip Bill Generator

Static GitHub Pages website for entering trip details and generating an A4 customer bill as PDF, PNG image, or print.

## Files
- `index.html` – UI + bill template
- `style.css` – responsive form and A4 bill styling
- `script.js` – raw-data parser, live preview, PDF/image/print buttons
- `logo.png` – temporary logo cropped from the supplied reference image. Replace this with your original high-resolution transparent logo for the clearest PDF.

## Run locally
Open `index.html` in Chrome/Edge. Internet is needed for the CDN libraries used by PDF/image export.

## GitHub Pages
1. Create a GitHub repository, e.g. `okok-taxi-bill-generator`.
2. Upload all files in this folder to the repository root.
3. Go to Settings → Pages.
4. Under Build and deployment, choose `Deploy from a branch`.
5. Select `main` and `/ (root)`, then Save.
6. After deployment, GitHub will show your Pages URL.

## Customize company details
Edit the company header in `index.html`:
- Company name
- Address
- Phone
- Email

Edit the terms text at the bottom of `index.html` if needed.

## Replace logo
Replace `logo.png` with your original logo, keeping the same filename. Recommended: PNG with transparent background, at least 1000px wide.

## Raw data parser
The parser recognizes common text such as vehicle number, driver name/phone, per-km rate, driver bata, waiting charge, toll/parking, customer number, pickup/drop, times, date, amount, payment status, GST, and route. For unusual wording, use the manual fields after parsing.
