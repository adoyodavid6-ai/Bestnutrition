# Marketing playbook

This is the owner's working guide to marketing NourishWell. It covers what to say, who to say it to, where, and how to measure it with the tools built into the site. It contains no statistics, audience numbers or results, because there are none yet. Add your own numbers as you collect them, and keep them out of public pages unless they are real and current.

Related documents: `docs/PROMPT_v3.md` (sections 15 and 16), `docs/MONETIZATION.md`.

---

## 1. Positioning

### 1.1 Positioning statement

For busy people and households in the US, the UK and across Asia who want to eat better without giving up the food they like, NourishWell is a free recipe and meal-planning site that turns familiar American, British and Asian dishes into a realistic weekly plan and a shopping list, with nutrition figures you can trace and health information that is honest about what food can and cannot do.

Unlike diet apps and recipe blogs, NourishWell does not sell cures, hide its sources or lock basic planning behind a paywall.

### 1.2 One-line versions

- Site and social bios: "Familiar food, made lighter. Plan the week, shop once."
- Newsletter signup: "One realistic plan a week: recipes, a shopping list and a tip. Free."
- Free meal plan: "A free 7-day starter plan for an American, British or Asian kitchen, with the shopping list done for you."
- Premium: "More saved plans and export to your calendar and spreadsheet. Everything essential stays free."

### 1.3 Messaging pillars

| Pillar | What we say | Proof on the site | What we never say |
| --- | --- | --- | --- |
| Familiar food, lighter | Dishes you already cook, with more vegetables, whole grains and lean protein | `/discover/american-classics`, `/discover/british-favourites`, `/discover/asian-kitchen` | "Guilt-free", "clean", "detox" |
| Plan once, shop once | Seven days, one consolidated list, a recurring shopping day | `/meal-planner`, `/shopping-list`, `/shopping-calendar` | "Saves you $X a week" (no data) |
| Numbers you can check | Every figure traces to an ingredient and a source; estimates are labelled | Nutrition breakdown on each recipe, `/recipes/compare` | "Exact calories", "lab-verified" |
| Honest about health | What nutrition can and cannot do; review status shown | `/health-conditions`, `/editorial-policy` | "Cures", "reverses", "prevents", "doctor-approved" (unless true and recorded) |
| Free where it matters | Recipes, education and the planner are free | `/pricing`, `/how-we-make-money` | "Limited time", "only X spots left" |

### 1.4 Tone

Plain, warm, specific. Short sentences. British or American spelling to match the audience of the channel (UK newsletter segment: British; US: American). No hype words ("amazing", "revolutionary", "superfood"), no fear, no shame about bodies or food.

---

## 2. Audience profiles

These are working assumptions to test, not research findings. Revise them from what you learn in replies, search queries in Search Console and signup sources.

### 2.1 US busy professional

- Cooks 3 to 5 weeknights, often for one or two.
- Wants: dinner decided fast, leftovers for lunch, a single grocery run.
- Likely searches: "healthy weeknight dinners", "lighter chili recipe", "sheet pan chicken and vegetables", "meal prep for the week".
- Start here: `/discover/under-30-minutes`, `/recipes/sheet-pan-lemon-herb-chicken`, `/recipes/turkey-black-bean-chili`, `/meal-planner`.
- Premium angle: export the plan to a calendar and spreadsheet; more saved plans.

### 2.2 US household (parents, mixed preferences)

- Plans for 3 to 5 people; allergies or dislikes in the family.
- Wants: one plan for everyone, predictable shopping, kid-acceptable food.
- Start here: `/recipes/lighter-mac-and-cheese-broccoli`, `/recipes/banana-oat-pancakes`, allergen filters on `/recipes`, `/shopping-calendar`.
- Premium angle: household planning (when built), saved plan library.

### 2.3 UK busy professional

- Hybrid worker, cooks after the commute, batch cooks at the weekend.
- Wants: lighter versions of British comfort food; freezer-friendly meals.
- Likely searches: "healthy cottage pie", "leek and potato soup recipe", "healthy fakeaway tikka masala", "batch cooking ideas".
- Start here: `/discover/british-favourites`, `/recipes/cottage-pie-with-lentils`, `/recipes/lighter-chicken-tikka-masala`, `/fitness/meal-prep-basics`.

### 2.4 UK household on a budget

- Wants: less waste, lower cost, a list that matches the supermarket.
- Start here: `/discover/budget-friendly`, `/recipes/jacket-potato-tuna-sweetcorn`, `/recipes/beans-on-toast-poached-egg`, `/shopping-list` (enter your own prices).
- Do not quote prices for meals. The site shows relative cost only.

### 2.5 Asia-based professional

- English-reading, urban (for example Singapore, Malaysia, India, the Philippines), eats out often, wants balanced home versions.
- Wants: quick balanced meals, sodium awareness, rice and noodle dishes done lighter.
- Start here: `/discover/asian-kitchen`, `/recipes/chicken-teriyaki-rice-bowl`, `/recipes/vegetable-egg-fried-brown-rice`, `/nutrition/sodium-and-salt`.

### 2.6 Asian diaspora household in the US or UK

- Cooks heritage dishes alongside local food; shops at both a large supermarket and an Asian grocer.
- Wants: a mixed week; substitutes for hard-to-find ingredients.
- Start here: `/recipes/palak-dal`, `/recipes/chana-masala`, `/recipes/vegetable-bibimbap`, `/recipes/steamed-ginger-fish-bok-choy` (substitution sections), `/meal-planner` with mixed regions.

### 2.7 People reading about a health condition

They are a real audience but not a marketing target. Do not run campaigns aimed at a condition, do not retarget condition-page visitors, and keep newsletter CTAs and Premium prompts off `/health-conditions/*`.

---

## 3. SEO keyword clusters

How to use this section:

1. Keywords below are candidates. Check them in Google Search Console (once the site has impressions) or a keyword tool before writing. No search volumes are given here because none have been measured.
2. Each cluster has a pillar page (usually an existing collection or guide) and supporting pages. Every supporting page links to the pillar and to two or three siblings.
3. "Exists" means the page is live now. "To write" is a new recipe or article; add it only at the quality bar in `docs/CONTENT.md`.

### 3.1 United States

**Cluster US-1: Lighter American classics.** Pillar: `/discover/american-classics`.

| Candidate queries | Page | Status |
| --- | --- | --- |
| healthy turkey chili, turkey and black bean chili | `/recipes/turkey-black-bean-chili` | Exists |
| healthier mac and cheese, mac and cheese with broccoli | `/recipes/lighter-mac-and-cheese-broccoli` | Exists |
| healthy jambalaya, shrimp jambalaya brown rice | `/recipes/shrimp-brown-rice-jambalaya` | Exists |
| healthy cobb salad | `/recipes/lighter-cobb-salad` | Exists |
| lighter sloppy joes, turkey meatloaf, chicken pot pie lighter | New recipes | To write |
| "how we make American classics lighter" | Article under `/nutrition` (building-a-balanced-meal angle) | To write |

**Cluster US-2: Weeknight and sheet-pan dinners.** Pillar: `/discover/under-30-minutes`.

| Candidate queries | Page | Status |
| --- | --- | --- |
| sheet pan chicken and vegetables | `/recipes/sheet-pan-lemon-herb-chicken` | Exists |
| black bean tacos healthy | `/recipes/black-bean-tacos` | Exists |
| 30 minute healthy dinners | `/discover/under-30-minutes` | Exists |
| tofu stir fry easy | `/recipes/tofu-vegetable-stir-fry` | Exists |

**Cluster US-3: Healthy breakfasts.** Pillar: a "breakfast" filtered view of `/recipes` or a new collection.

| Candidate queries | Page | Status |
| --- | --- | --- |
| banana oat pancakes | `/recipes/banana-oat-pancakes` | Exists |
| baked oatmeal apple cinnamon | `/recipes/apple-cinnamon-baked-oatmeal` | Exists |
| overnight oats berries | `/recipes/berry-overnight-oats` | Exists |
| high protein breakfast ideas | Article under `/nutrition/protein` (links to recipes) | Exists as guide; add links |

**Cluster US-4: Meal planning and grocery lists.** Pillar: `/meal-planner`.

| Candidate queries | Page | Status |
| --- | --- | --- |
| free meal planner, weekly meal plan with grocery list | `/meal-planner`, `/free-meal-plan` | Exists |
| meal prep for beginners | `/fitness/meal-prep-basics` | Exists |
| grocery list template, recurring grocery reminder | `/shopping-calendar` | Exists |

### 3.2 United Kingdom

**Cluster UK-1: British favourites, lighter.** Pillar: `/discover/british-favourites`.

| Candidate queries | Page | Status |
| --- | --- | --- |
| healthy cottage pie, cottage pie with lentils | `/recipes/cottage-pie-with-lentils` | Exists |
| oven baked fish and chips | `/recipes/oven-fish-and-chips` | Exists |
| healthy chicken tikka masala, fakeaway curry | `/recipes/lighter-chicken-tikka-masala` | Exists |
| leek and potato soup | `/recipes/leek-and-potato-soup` | Exists |
| jacket potato fillings healthy | `/recipes/jacket-potato-tuna-sweetcorn` | Exists |
| lighter shepherd's pie, toad in the hole lighter, healthy fry-up | New recipes | To write |

**Cluster UK-2: Cheap healthy meals.** Pillar: `/discover/budget-friendly`.

| Candidate queries | Page | Status |
| --- | --- | --- |
| beans on toast healthy, cheap healthy breakfast | `/recipes/beans-on-toast-poached-egg` | Exists |
| porridge recipes | `/recipes/porridge-with-stewed-apples` | Exists |
| batch cooking on a budget | `/fitness/meal-prep-basics` | Exists |
| "how to cut food waste with a weekly plan" | Article | To write |

**Cluster UK-3: Soups and winter comfort.** Pillar: `/discover/warming-soups-and-stews`.

| Candidate queries | Page | Status |
| --- | --- | --- |
| lentil soup, Greek lentil soup | `/recipes/greek-lentil-soup` | Exists |
| chicken and vegetable soup | `/recipes/chicken-vegetable-soup` | Exists |
| freezer friendly soups | Collection page copy | Exists; strengthen copy |

**Cluster UK-4: Nutrition basics, UK framing.** Pillar: `/nutrition`.

| Candidate queries | Page | Status |
| --- | --- | --- |
| how much salt per day, reading traffic light labels | `/nutrition/sodium-and-salt`, `/nutrition/reading-food-labels` | Exists; check UK references (NHS, Eatwell Guide) |
| how much fibre per day | `/nutrition/fibre` | Exists |

### 3.3 Asia and the Asian diaspora

**Cluster AS-1: Asian weeknight dinners.** Pillar: `/discover/asian-kitchen`.

| Candidate queries | Page | Status |
| --- | --- | --- |
| chicken teriyaki rice bowl healthy | `/recipes/chicken-teriyaki-rice-bowl` | Exists |
| thai green curry chicken lighter | `/recipes/thai-green-curry-chicken` | Exists |
| bibimbap vegetable | `/recipes/vegetable-bibimbap` | Exists |
| brown rice egg fried rice | `/recipes/vegetable-egg-fried-brown-rice` | Exists |
| vietnamese prawn noodle salad | `/recipes/vietnamese-prawn-noodle-salad` | Exists |
| lighter laksa, chicken adobo, nasi lemak lighter, gado-gado | New recipes (Southeast Asia gap) | To write |

**Cluster AS-2: South Asian everyday.** Pillar: `/discover/asian-kitchen` (or a new South Asian collection when there are enough recipes).

| Candidate queries | Page | Status |
| --- | --- | --- |
| palak dal, spinach dal | `/recipes/palak-dal` | Exists |
| chana masala healthy | `/recipes/chana-masala` | Exists |
| rajma, vegetable khichdi, egg bhurji | New recipes | To write |

**Cluster AS-3: Fish, tofu and light East Asian dishes.**

| Candidate queries | Page | Status |
| --- | --- | --- |
| steamed fish ginger | `/recipes/steamed-ginger-fish-bok-choy` | Exists |
| miso salmon | `/recipes/miso-glazed-salmon` | Exists |
| miso soup tofu wakame | `/recipes/miso-soup-tofu-wakame` | Exists |

**Cluster AS-4: Sodium and rice.** Pillar: `/nutrition/sodium-and-salt`.

| Candidate queries | Page | Status |
| --- | --- | --- |
| lower sodium soy sauce swaps, reducing salt in Asian cooking | Article linked to AS-1 recipes | To write |
| brown rice vs white rice | `/nutrition/carbohydrates` (section) | Exists; add section if missing |

### 3.4 On-page checklist for every SEO piece

- One clear `<h1>` that matches the main query in natural language.
- Intro answers the query in the first two sentences.
- Links to the pillar, two siblings and the planner.
- Inline newsletter CTA at the end (recipes and non-medical articles only).
- No health claims without a reference.
- Image with descriptive alt text; AI images labelled.

---

## 4. Twelve-week launch content calendar

Assumes one person working part-time. Week 1 starts when monetization pages are live in Stripe test mode and the newsletter webhook is connected to an email provider. Adjust the pace to your capacity; consistency matters more than volume.

| Week | Site and SEO | Social (Pinterest, Instagram, TikTok) | Email | Partnerships and PR | Measure |
| --- | --- | --- | --- | --- | --- |
| 1 | Verify Search Console, submit sitemap. Check `/free-meal-plan` prints well. Set up Plausible goals. | Create accounts and bios with UTM links. Pin 10 existing US/UK/Asian recipes. | Load the 5-email welcome series. Test it on yourself. | List 20 dietitians, 10 meal-prep businesses, 10 community groups to contact later. | Baseline: visitors, signups |
| 2 | Strengthen copy on the three lead collections. | 3 short videos: chili, cottage pie, teriyaki bowl. | Send first weekly plan email (even to a small list). | | Signup rate by source |
| 3 | Write 1 new US recipe (cluster US-1). | 3 pins per new or updated page; 2 carousels. | Weekly email | Send 5 dietitian outreach emails (template 8.1). | |
| 4 | Write 1 new UK recipe (UK-1). | 3 videos: fish and chips, tikka masala, porridge. | Weekly email | Send 5 meal-prep business emails (8.2). | Week 1 to 4 review |
| 5 | Write 1 new Southeast Asian recipe (AS-1). | Carousel: "plan once, shop once" walkthrough of the shopping calendar. | Weekly email | Follow up on weeks 3 and 4 outreach. | |
| 6 | Write the sodium article (AS-4). | 3 videos | Weekly email | Pitch 3 food editors with a seasonal angle (8.4). | Organic sessions per cluster |
| 7 | Write 1 new US recipe (US-1). | Pins for all new pages | Weekly email | Send 5 more dietitian emails. | |
| 8 | Write the food-waste article (UK-2). | 3 videos | Weekly email | If any sponsor interest: send media kit (on request only, real numbers). | Week 5 to 8 review; set first targets |
| 9 | Write 1 new South Asian recipe (AS-2). | Carousel: free meal plan preview | Weekly email; begin Premium nurture for engaged readers (if Premium is live). | | Free-to-Premium funnel |
| 10 | Refresh titles and descriptions for pages with impressions but few clicks (Search Console). | 3 videos | Weekly email | Partner check-ins | CTR by page |
| 11 | Write 1 new UK recipe (UK-1). | Pins | Weekly email; win-back for anyone inactive since signup. | Pitch 3 more editors. | |
| 12 | Review all clusters: what got impressions, what converted. Plan next 12 weeks. | Keep the 3 best-performing formats; drop the rest. | Weekly email | Summarise partnerships: replies, referrals. | Full 12-week review |

---

## 5. Email

### 5.1 Setup

- Connect `NEWSLETTER_WEBHOOK_URL` to your email provider (directly or through Zapier or Make). Turn on double opt-in.
- Store `source` and the attribution fields as subscriber fields or tags so you can segment by where people came from.
- Every email needs: your business name, a valid postal address, a clear unsubscribe link that works in one click, and a reason they are receiving it ("You signed up at nourishwell…").
- Use British spelling for the UK segment and American spelling for the US segment if your provider supports segmentation by region. Otherwise pick one and be consistent.

Placeholders below: `{first_name|there}`, `{site}` (your domain), `{unsubscribe}`, `{postal_address}`, `{utm}` (the UTM suffix for that email, for example `?utm_source=newsletter&utm_medium=email&utm_campaign=welcome-1`).

### 5.2 Welcome series (5 emails)

**Email 1. Send immediately after confirmation.**

Subject: Your free 7-day plan is inside
Preview text: American, British or Asian kitchen. Shopping list included.

> Hi {first_name|there},
>
> Thanks for joining NourishWell. Here is the free 7-day starter plan you asked for:
>
> **Open your plan:** https://{site}/free-meal-plan{utm}
>
> Pick the kitchen that suits your week: American, British or Asian. Each plan comes with a shopping list grouped by aisle, and you can print it.
>
> A quick word on what we do. NourishWell takes dishes people already cook, like chili, cottage pie and teriyaki bowls, and makes them a bit lighter with more vegetables, whole grains and lean protein. Every nutrition figure on the site is an estimate you can trace back to the ingredients and their sources.
>
> Over the next two weeks I'll send four short emails on planning a week of meals in one sitting. You can unsubscribe at any time.
>
> Eat well,
> The NourishWell team
>
> {postal_address} · {unsubscribe}

**Email 2. Day 2.**

Subject: Plan your week in one sitting
Preview text: How to get seven days of meals decided before Monday.

> Hi {first_name|there},
>
> The hardest part of eating well on a busy week is deciding what to cook. Here is how to do it once, on a Sunday:
>
> 1. Open the meal planner: https://{site}/meal-planner{utm}
> 2. Tell it what you don't eat, any allergies, how many people you're cooking for and how much time you have.
> 3. Generate a week. Swap anything you don't fancy, or move meals between days.
> 4. Press "Add to shopping list". Ingredients are combined across recipes, so you see "600 g chicken thighs", not three separate lines.
>
> The planner never ignores allergies or foods you've said you don't eat. If it has to relax your time or budget preference to fill a day, it tells you.
>
> Everything is saved on your device. Nothing is sent to us.
>
> The NourishWell team
>
> {postal_address} · {unsubscribe}

**Email 3. Day 5.**

Subject: Pick a shopping day and forget about it
Preview text: Your list shows up on our homepage when it's time to shop.

> Hi {first_name|there},
>
> If you shop on the same day each week, or every other week, set it once in the shopping calendar:
>
> https://{site}/shopping-calendar{utm}
>
> Choose how often you shop (every 1, 2, 3 or 4 weeks) and when to stop (never, after a number of trips, or on a date). On shopping day, your list appears at the top of the NourishWell homepage until you mark it done. You can have it show up a day or two early if you like to plan ahead.
>
> Prefer your own calendar? Download the .ics file and add it to Google Calendar, Apple Calendar or Outlook.
>
> The NourishWell team
>
> {postal_address} · {unsubscribe}

**Email 4. Day 9.**

Subject: Why our nutrition numbers say "estimate"
Preview text: And how to check any figure yourself.

> Hi {first_name|there},
>
> You'll notice every recipe on NourishWell labels its calories, protein, fibre and sodium as estimates. That's deliberate.
>
> We calculate each figure from the weight of each ingredient and published reference values (mostly USDA FoodData Central). Open the nutrition breakdown on any recipe and you'll see which ingredient contributes what, and where the reference value came from. If we used a similar food because the exact one wasn't in the database, we say so.
>
> Real dishes vary with brands, portion sizes and how you cook them, so we'd rather be clear than precise-looking.
>
> Try it on one of these:
> - Turkey and black bean chili: https://{site}/recipes/turkey-black-bean-chili{utm}
> - Cottage pie with lentils: https://{site}/recipes/cottage-pie-with-lentils{utm}
> - Chicken teriyaki rice bowl: https://{site}/recipes/chicken-teriyaki-rice-bowl{utm}
>
> Want to compare two recipes side by side? https://{site}/recipes/compare{utm}
>
> The NourishWell team
>
> {postal_address} · {unsubscribe}

**Email 5. Day 14.**

Subject: What's free, what's Premium, and how we make money
Preview text: The short version: the essentials stay free.

> Hi {first_name|there},
>
> A straight answer to a fair question.
>
> **Free, for everyone, always:** every recipe, all our nutrition and health guides, the seven-day planner, the shopping list and the shopping calendar.
>
> **Premium (optional):** more saved weekly plans and export of your plan and shopping list to a spreadsheet and your calendar. Current prices are on the pricing page, and you can cancel any time: https://{site}/pricing{utm}
>
> One honest limitation: until we launch accounts, Premium works on the device and browser you subscribe on.
>
> We also earn money from featured listings for verified businesses and from clearly labelled sponsorships. Sponsors never write or approve our health content. The full explanation is here: https://{site}/how-we-make-money{utm}
>
> From next week you'll get one email a week with a plan idea, three recipes and a tip. If that's not for you, you can unsubscribe below.
>
> The NourishWell team
>
> {postal_address} · {unsubscribe}

If Premium is not yet live, replace the Premium paragraph in Email 5 with: "Premium is coming soon. If you'd like to know when it launches, you'll hear it here first. Nothing you use today will move behind a paywall."

### 5.3 Weekly newsletter template

Subject line formula: `[Theme]: [3 dish names or a benefit]`. Examples: "Freezer week: cottage pie, dal and leek soup", "Thirty-minute week: tacos, teriyaki, sheet-pan chicken".

> **This week: {theme}**
>
> {One or two sentences on the theme. Practical, not promotional.}
>
> **Three recipes**
> 1. {Recipe name}: {one line on why it fits}. {link + utm}
> 2. {Recipe name}: {one line}. {link + utm}
> 3. {Recipe name}: {one line}. {link + utm}
>
> **Plan it:** Add all three to your week in the planner, then send them to your shopping list. {planner link + utm}
>
> **One tip:** {A cooking, storage or shopping tip. If it is a nutrition fact, link the guide it comes from.}
>
> **From the guides:** {One nutrition or fitness guide link. Never a health-condition page as a promotion.}
>
> {Optional, only when real: "Sponsored: {brand}" block, clearly labelled, at the bottom.}
>
> {Optional, max once a week, only for non-Premium subscribers: one line about a Premium feature with a link to /pricing.}
>
> The NourishWell team · {postal_address} · {unsubscribe}

UTM convention for weekly emails: `utm_source=newsletter&utm_medium=email&utm_campaign=weekly-YYYY-MM-DD&utm_content=recipe-1` (change `utm_content` per link).

### 5.4 Win-back email

Subject: Still want weekly meal plans?
Body: one paragraph saying you noticed they haven't opened in a while, a button "Yes, keep sending" (links to a page or a tagging link in your provider) and a line "If we don't hear from you, we'll stop emailing you in two weeks." Then do it.

---

## 6. Social post templates

Use the recipe illustration or a labelled AI image. When you post an AI image, add "AI-generated image" in the caption or on the image. Video of your own cooking is better than any image.

### 6.1 Pinterest

Pin format: vertical 2:3. Text overlay: dish name plus one benefit ("30 minutes", "freezer-friendly", "one pan").

Title template: `{Dish name} ({benefit})`
Example: `Turkey and Black Bean Chili (One Pot, Freezer-Friendly)`

Description template:

> {Dish} made lighter with {key swap}. {Time} minutes, serves {n}. Ingredients, step-by-step method and nutrition estimates on NourishWell, plus a free planner to add it to your week.

Link: `https://{site}/recipes/{slug}?utm_source=pinterest&utm_medium=social&utm_campaign={board-or-campaign}`

Boards to create: Lighter American Classics; British Favourites Made Lighter; Asian Weeknight Dinners; Healthy Breakfasts; Meal Prep and Planning; Budget Meals.

### 6.2 Instagram

**Carousel (5 to 7 slides):**

1. Cover: "{Dish}, made lighter" with the image.
2. "What we changed": two or three swaps.
3. Ingredients (short list).
4. Method in four steps.
5. "Plan it": screenshot of the planner or shopping list.
6. CTA: "Full recipe and nutrition estimate: link in bio."

Caption template:

> {Dish}, the way you know it, with {swap}. {Time} minutes.
>
> Full recipe, nutrition estimate and a free 7-day plan: link in bio.
>
> #{dish} #{cuisine}food #weeknightdinner #mealplanning

Link in bio: `/free-meal-plan?utm_source=instagram&utm_medium=social&utm_campaign=bio`

**Reel:** same as TikTok below.

### 6.3 TikTok (and Instagram Reels)

Length 20 to 45 seconds. Structure:

1. 0 to 2 s: hook on screen. "Cottage pie, but half the mince is lentils."
2. 2 to 25 s: hands-only cooking, captions for each step.
3. Last 3 s: finished dish and "Recipe and free meal plan: link in bio."

Caption template:

> {Dish} with {swap}. Recipe and a free 7-day meal plan on NourishWell (link in bio). #{dish} #mealprep #easyrecipes

Rules: no before-and-after body content, no weight-loss claims, no "what I eat in a day to lose X". Do not reply to health questions with medical advice; point to the relevant guide and suggest speaking to a clinician.

### 6.4 Bio link

Use a single link to `/free-meal-plan` with channel UTMs. Do not use third-party link-in-bio tools that add tracking pixels.

---

## 7. Measuring: UTM builder and attribution

### 7.1 UTM conventions

All values lowercase, words joined with hyphens.

| Parameter | Use | Examples |
| --- | --- | --- |
| `utm_source` | Where the click came from | `pinterest`, `instagram`, `tiktok`, `newsletter`, `partner-{name}`, `press-{outlet}` |
| `utm_medium` | Type of channel | `social`, `email`, `referral`, `pr`, `cpc` (only if paid ads start) |
| `utm_campaign` | The campaign | `launch-2026`, `free-meal-plan`, `weekly-2026-11-02`, `british-favourites` |
| `utm_content` | Which link or creative | `bio`, `pin-chili`, `recipe-1`, `carousel-cottage-pie` |
| `utm_term` | Rarely needed | Keyword, for paid search only |
| `ref` | Short partner code | `ref=dietitian-jane` (agree it with the partner) |

### 7.2 Using the UTM builder in `/admin`

1. Sign in to `/admin` (Basic Auth) and open the Monetization and marketing panel.
2. Choose the destination page (for example `/free-meal-plan` or a recipe).
3. Fill in source, medium and campaign (and content if you will use several links in one place).
4. Copy the generated link. Keep a simple spreadsheet of every link you create: date, channel, campaign, link.
5. Test each link once in a private window before posting.

### 7.3 Where attribution shows up

| Where | What you see | How to read it |
| --- | --- | --- |
| Plausible (after consent) | Visitors by source, medium and campaign; goal conversions | Add each event as a custom-event goal in Plausible site settings. Filter by `utm_campaign` to see a campaign's visitors and goals. Remember Plausible only counts visitors who allowed analytics. |
| Newsletter webhook payload | `source` plus an `attribution` object (first-touch UTM fields, `ref`, landing page and referrer domain) for each signup | Map these to subscriber fields in your email provider. Count signups by first-touch `utm_source`. |
| Listing applications | The same attribution fields | Shows which outreach brings businesses. |
| Stripe metadata | The same attribution fields, as keys starting `attr_` (for example `attr_utm_source`), on the Checkout Session and the subscription | Open a test purchase in the Stripe Dashboard and look at the subscription's metadata. Use it to count subscriptions by first-touch source. The billing events webhook (if set) also forwards `source` and `campaign`. |

First-touch means the first tracked visit on that browser. If someone finds you on Pinterest and subscribes a month later from an email, the first-touch source is still Pinterest. Use Plausible's campaign reports for last-click views.

### 7.4 Events available

`recipe_view`, `search`, `recipe_saved`, `meal_plan_created`, `shopping_list_created`, `newsletter_signup`, `pricing_view`, `checkout_started`, `subscription_started`, `lead_magnet_view`, `upgrade_prompt_click`, `share`.

Search terms, health-condition page views and planner preferences are never sent.

---

## 8. Partnership and outreach templates

Send these personally, one at a time, with a specific reason you chose the recipient. Never buy lists. Respect the email law of the recipient's country (see section 10).

### 8.1 Registered dietitians and nutritionists

Subject: A free resource your clients might use between appointments

> Hi {name},
>
> I run NourishWell ({site}), a free recipe and meal-planning site focused on lighter versions of American, British and Asian dishes. I came across your {practice/article/profile} on {topic} and thought there might be a fit.
>
> Two things that may be useful to you:
>
> - Free tools your clients can use between appointments: a seven-day planner that respects allergies and dislikes, a combined shopping list, and a recurring shopping reminder. No sign-up needed.
> - Transparent nutrition estimates: every figure traces back to ingredients and their reference values, and the site says clearly that it doesn't replace individual advice.
>
> I'm also looking for qualified professionals to review our health-condition guides. Reviewers are credited by name on the pages they review, and we pay for review time. If that interests you, I can send the review brief and our editorial policy ({site}/editorial-policy).
>
> If neither is relevant, no reply needed. Thank you for reading.
>
> {your name}
> NourishWell · {postal_address}

Only mention paid review if you have a budget for it. If you list them in the directory, they must go through verification like anyone else.

### 8.2 Meal-prep and healthy food businesses

Subject: A free listing on NourishWell for {business name}

> Hi {name},
>
> I run NourishWell ({site}), a free recipe and meal-planning site for people in the {US/UK/region} who want to eat better without much fuss. We're building a directory of verified healthy-food businesses.
>
> A basic listing is free. We verify every business before it appears (we check registration and what you offer) and we don't accept detox, cure or miracle claims. If you'd like more visibility later, there is an optional paid featured listing, always labelled "Featured".
>
> You can apply here: {site}/for-businesses?utm_source=outreach&utm_medium=email&utm_campaign=business-listings
>
> Happy to answer questions.
>
> {your name}
> NourishWell · {postal_address}

### 8.3 Sponsors and brand partners

Subject: Partnership enquiry: NourishWell {sponsored collection / newsletter}

> Hi {name},
>
> I run NourishWell ({site}), a free recipe, meal-planning and nutrition education site. I think {brand}'s {product} could fit naturally with our {collection/theme}, for example {specific idea: "a sponsored 'Asian weeknight pantry' collection featuring your sauces in tested recipes"}.
>
> How we work with partners:
>
> - Everything sponsored is labelled "Sponsored" or "In partnership with {brand}" at the top.
> - Partners don't write or approve health information, and we never place partner content on health-condition pages.
> - We don't target by health interest and don't use third-party ad pixels.
>
> Formats and current audience numbers are in our media kit, which I can send on request. Our partnership page is {site}/advertise.
>
> Would a 20-minute call be useful?
>
> {your name}
> NourishWell · {postal_address}

### 8.4 Press pitch

Subject: Story idea: {angle}, e.g. "Five British classics, lighter, without losing the point of them"

> Hi {name},
>
> I read your piece on {recent article}. Here's an idea for {season/theme}: {two sentences on the angle}. I can provide recipes, ingredient-level nutrition estimates with sources, and images (illustrations or AI images, clearly labelled as such; no photographs yet).
>
> NourishWell ({site}) is a free recipe and meal-planning site. We don't make health claims we can't source.
>
> {your name} · {phone/email}

Do not offer statistics, survey results or user numbers unless you have real, current data.

---

## 9. KPIs

Definitions only. Set targets after four to eight weeks of baseline data. Do not publish targets or results on the website.

| KPI | Formula | How to measure with the built tools | Review |
| --- | --- | --- | --- |
| Unique visitors | count of unique visitors in period | Plausible (consenting visitors only) | Weekly |
| Newsletter signup rate | `newsletter_signup` conversions / unique visitors | Plausible goal conversion rate | Weekly |
| Signups by source | signups grouped by first-touch `utm_source` | Webhook payloads in your email provider or spreadsheet | Weekly |
| Lead magnet conversion | signups with `source=free-meal-plan` / visitors with `lead_magnet_view` | Email provider count / Plausible goal | Weekly |
| Activation rate | visitors firing `meal_plan_created` / unique visitors | Plausible | Weekly |
| Shopping list rate | visitors firing `shopping_list_created` / visitors firing `meal_plan_created` | Plausible | Monthly |
| Pricing interest | visitors firing `pricing_view` / unique visitors | Plausible | Monthly |
| Upgrade prompt click-through | `upgrade_prompt_click` / visitors who hit a limit (proxy: `upgrade_prompt_click` per `meal_plan_created`) | Plausible | Monthly |
| Checkout completion | `subscription_started` / `checkout_started` | Plausible; cross-check with Stripe completed sessions | Monthly |
| Free-to-Premium conversion | new paid subscriptions in period / newsletter subscribers (or planner users) in period | Stripe / email provider | Monthly |
| Email click rate | unique clicks / delivered | Email provider. Prefer clicks to opens; open counts are inflated by mail privacy features. | Per send |
| Unsubscribe rate | unsubscribes / delivered | Email provider | Per send |
| Organic search clicks and CTR | clicks; clicks / impressions | Google Search Console, per page and per query | Monthly |
| Share rate | `share` / `recipe_view` | Plausible | Monthly |

Revenue KPIs (MRR, churn, ARPU, LTV) are defined in `docs/MONETIZATION.md`.

---

## 10. Compliance checklist

This is a working checklist, not legal advice. Assess each item with counsel for the markets you target. Do not state on the site that NourishWell "complies" with any law.

### 10.1 Advertising, sponsorships and endorsements

- [ ] Every sponsored item is labelled clearly and before the content ("Sponsored", "Ad" or "In partnership with {brand}"). Assess with counsel against the US FTC Endorsement Guides and the UK CAP Code and ASA guidance.
- [ ] Social posts made with a partner carry the platform's paid-partnership label plus "#ad" (UK) or a clear disclosure (US).
- [ ] No fake, bought or incentivised reviews or testimonials. Assess against the FTC rule on consumer reviews and testimonials and UK CMA guidance.
- [ ] Affiliate links (when used) are disclosed near the link and use `rel="sponsored"`. Check any affiliate programme's own disclosure wording requirements.
- [ ] No health claims in ads or social posts beyond what the cited guide supports. For the UK, check claims against the GB nutrition and health claims rules; for the US, FTC substantiation standards.
- [ ] `/how-we-make-money` is current.

### 10.2 Email

- [ ] Double opt-in and a stored consent record (timestamp, `source`, wording shown).
- [ ] Sender identity, postal address and one-click unsubscribe in every email; unsubscribes processed promptly.
- [ ] No purchased lists; B2B outreach sent individually with a relevant reason.
- [ ] Assess with counsel: US CAN-SPAM; UK PECR and UK GDPR; EU GDPR and ePrivacy if you target EU readers; Singapore PDPA and Spam Control Act; Malaysia PDPA; India DPDP Act 2023; Canada CASL if you target Canada.

### 10.3 Privacy and analytics

- [ ] Plausible loads only after consent; check in a private window that no request goes to the analytics host before consent.
- [ ] No third-party ad pixels on the site.
- [ ] Health-condition pages send no analytics events.
- [ ] Privacy policy lists the email provider, Plausible and Stripe as processors (after legal review).
- [ ] Assess with counsel: US state consumer health data laws (for example Washington's My Health My Data Act), the FTC Health Breach Notification Rule, UK GDPR.

### 10.4 Subscriptions

- [ ] `/pricing` shows price, currency, interval, auto-renewal, trial terms and how to cancel before the Subscribe button.
- [ ] Cancellation is online and easy (Stripe Customer Portal).
- [ ] Renewal reminders configured in Stripe where required.
- [ ] Assess with counsel: US ROSCA; California Automatic Renewal Law and other state laws; UK Consumer Contracts Regulations 2013; UK DMCC Act 2024 subscription rules (check which provisions are in force).

### 10.5 Content

- [ ] AI images labelled in captions and on the site.
- [ ] No before-and-after images, no weight-loss promises, no content aimed at children's weight.
- [ ] Health-condition content never used as ad or social bait.
