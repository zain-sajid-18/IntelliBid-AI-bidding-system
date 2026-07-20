// Pure scoring function — no DB calls, takes plain objects
export const scoreAuctionForUser = (auction, userProfile, seenAuctionIds = new Set()) => {
    // Exclude items user already bid on
    if (seenAuctionIds.has(auction._id.toString())) return -1;

    const categoryScores = userProfile?.categoryScores || {};
    const tagScores = userProfile?.tagScores || {};
    const priceRange = userProfile?.priceRange || { min: 0, max: 999999 };

    // ── 1. RELEVANCE (0–1) ──────────────────────────────────
    const catScore = categoryScores[auction.category] || 0;

    const auctionTags = auction.tags || [];
    const tagScore = auctionTags.length > 0
        ? auctionTags.reduce((sum, tag) => sum + (tagScores[tag] || 0), 0) / auctionTags.length
        : 0;

    let priceFit = 1.0;
    const price = auction.currentPrice || auction.startingPrice;
    if (price > priceRange.max * 1.5) priceFit = 0.3;
    else if (price > priceRange.max) priceFit = 0.7;

    const relevance = (catScore * 0.5) + (tagScore * 0.3) + (priceFit * 0.2);

    // ── 2. POPULARITY (0–1) ─────────────────────────────────
    const bidScore = Math.min((auction.bidCount || 0) / 15, 1.0);
    const viewScore = Math.min((auction.viewCount || 0) / 150, 1.0);
    const popularity = (bidScore * 0.7) + (viewScore * 0.3);

    // ── 3. URGENCY (0–1) ────────────────────────────────────
    const hoursLeft = (new Date(auction.endTime).getTime() - Date.now()) / 3600000;
    let urgency = 0;
    if (hoursLeft <= 0) urgency = 0;
    else if (hoursLeft <= 1) urgency = 1.0;
    else if (hoursLeft <= 6) urgency = 0.85;
    else if (hoursLeft <= 24) urgency = 0.60;
    else if (hoursLeft <= 72) urgency = 0.30;
    else urgency = Math.max(0, 1 - (hoursLeft / 720));

    // ── 4. NOVELTY (0–1) ────────────────────────────────────
    // Handled by exclusion set above — if we get here, item is novel
    const novelty = 1.0;

    // ── FINAL SCORE ─────────────────────────────────────────
    const finalScore = (relevance * 0.40) + (popularity * 0.20) + (urgency * 0.25) + (novelty * 0.15);

    return Number(finalScore.toFixed(4));
};

// Shuffle within score bands so feed doesn't feel like a sorted list
export const softShuffle = (items, bandSize = 5) => {
    const result = [];
    for (let i = 0; i < items.length; i += bandSize) {
        const band = items.slice(i, i + bandSize);
        band.sort(() => Math.random() - 0.5);
        result.push(...band);
    }
    return result;
};
