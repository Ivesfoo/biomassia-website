# Biomassia Sdn. Bhd. — Company Website

Static multi-page website for Biomassia Sdn. Bhd., a Malaysian wood manufacturing company.

## File Structure

```
Website/
├── index.html              # Home page
├── about.html              # About the company
├── products.html           # Product catalog
├── sustainability.html     # Sustainability commitments
├── contact.html            # Contact form & locations
├── css/
│   └── styles.css          # All site styles
├── js/
│   └── script.js           # Interactivity (nav, form, animations)
└── README.md               # This file
```

## Pages

| Page | Purpose |
|------|---------|
| **Home** | Hero, intro, product preview, values, CTA |
| **About** | Story, mission/vision, differentiators |
| **Products** | Wood pellets, biofuels, plywood, sawn timber, other |
| **Sustainability** | Pillars, practices, commitments |
| **Contact** | Contact cards, inquiry form, locations |

## Design System

- **Primary colour:** Forest green `#2d5016`
- **Accent colour:** Warm wood brown `#8b6b3d`
- **Typography:** Georgia (headings) + Inter / system sans (body)
- **Layout:** Responsive (mobile, tablet, desktop)
- **Icons:** Inline SVG (no external dependencies)

## Running Locally

Open `index.html` directly in a browser, or serve the folder:

```bash
# Any static server works, e.g.:
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Placeholders to Replace

Before publishing, update:

- Contact email addresses in `contact.html` (currently `info@biomassia.com` / `sales@biomassia.com`)
- Phone number in `contact.html` (currently `+60 XX-XXX XXXX`)
- Full street addresses for both locations in `contact.html`
- Contact form submission endpoint in `js/script.js` (currently simulated)
- Favicon (not yet added)
- Real photography for hero sections and product pages (currently uses SVG illustrations and gradients)

## Tech

- Pure HTML, CSS, and vanilla JavaScript — no build step, no frameworks.
