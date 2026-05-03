// ─── Ingredient Knowledge Base ──────────────────────────────────────────────
// ~200 entries covering common INCI names found on skincare/beauty labels.
// Keys are lowercase. Multiple keys can point to the same data via aliases.

export interface IngredientInfo {
  category: string;
  benefit: string;
  concern?: string;
  fungalAcneSafe: boolean;
  comedogenic: boolean;
  rating: "good" | "caution" | "avoid";
}

const DB: Record<string, IngredientInfo> = {};

function add(keys: string[], info: IngredientInfo) {
  for (const k of keys) DB[k.toLowerCase()] = info;
}

// ── Solvents / Base ─────────────────────────────────────────────────────────
add(["water", "aqua", "eau", "purified water", "deionized water"], {
  category: "Solvent / Base", benefit: "Base of most formulations, carries other ingredients", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["butylene glycol", "1,3-butylene glycol"], {
  category: "Solvent / Humectant", benefit: "Lightweight humectant, helps other ingredients penetrate, improves texture", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["propanediol", "1,3-propanediol"], {
  category: "Solvent / Humectant", benefit: "Plant-derived alternative to propylene glycol, moisturising, good skin feel", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["propylene glycol"], {
  category: "Humectant / Solvent", benefit: "Draws moisture into skin, enhances absorption of other ingredients", concern: "Can cause irritation in sensitive skin at high concentrations", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["pentylene glycol"], {
  category: "Humectant / Preservative Booster", benefit: "Moisturises and has mild antimicrobial properties, improves product feel", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["hexylene glycol"], {
  category: "Solvent / Emulsifier", benefit: "Helps blend ingredients, mild surfactant properties", concern: "Can be irritating at higher concentrations for sensitive skin", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["ethoxydiglycol"], {
  category: "Solvent", benefit: "Enhances penetration of other ingredients, improves product spread", fungalAcneSafe: true, comedogenic: false, rating: "good",
});

// ── Humectants ──────────────────────────────────────────────────────────────
add(["glycerin", "glycerine", "vegetable glycerin"], {
  category: "Humectant", benefit: "Attracts and retains moisture, strengthens skin barrier", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["hyaluronic acid", "ha"], {
  category: "Humectant", benefit: "Draws moisture into skin, deep hydration, plumping effect", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["sodium hyaluronate", "hydrolyzed hyaluronic acid", "sodium hyaluronate crosspolymer", "hyaluronan"], {
  category: "Humectant", benefit: "Smaller molecular form of hyaluronic acid — penetrates deeper for intense hydration", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["betaine", "trimethylglycine"], {
  category: "Humectant / Conditioning", benefit: "Natural humectant from sugar beet, reduces irritation, gentle on skin", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["trehalose"], {
  category: "Humectant", benefit: "Protects cells from dehydration, stabilises proteins, moisture retention", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["sodium pca"], {
  category: "Humectant", benefit: "Natural moisturising factor (NMF) component, excellent hydration", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["urea"], {
  category: "Humectant / Keratolytic", benefit: "Deeply moisturises, at higher concentrations (10%+) gently exfoliates", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["panthenol", "dexpanthenol", "d-panthenol", "provitamin b5", "dl-panthenol"], {
  category: "Humectant / Vitamin B5", benefit: "Soothes, moisturises, and helps repair the skin barrier", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["sorbitol"], {
  category: "Humectant", benefit: "Mild humectant, draws moisture, improves product texture", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["honey", "mel"], {
  category: "Humectant / Emollient", benefit: "Natural humectant, antibacterial, soothing, antioxidant", fungalAcneSafe: false, comedogenic: false, rating: "good",
});

// ── Emollients / Oils ───────────────────────────────────────────────────────
add(["squalane"], {
  category: "Emollient", benefit: "Lightweight, non-greasy moisturisation, antioxidant, stabilises skin barrier", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["squalene"], {
  category: "Emollient", benefit: "Natural skin lipid, moisturising — less stable than squalane", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["jojoba oil", "simmondsia chinensis seed oil", "simmondsia chinensis oil"], {
  category: "Emollient Oil", benefit: "Mimics skin's sebum, balances oil production, lightweight moisturiser", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["rosehip oil", "rosa canina seed oil", "rosa rubiginosa seed oil", "rosa canina fruit oil"], {
  category: "Emollient Oil", benefit: "Rich in Vitamin A & C, fades scars and pigmentation, anti-ageing", concern: "May not suit acne-prone skin", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["argan oil", "argania spinosa kernel oil"], {
  category: "Emollient Oil", benefit: "Rich in vitamin E and fatty acids, deeply nourishing, anti-ageing", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["coconut oil", "cocos nucifera oil"], {
  category: "Emollient Oil", benefit: "Deeply moisturising, antibacterial, hair conditioning", concern: "Highly comedogenic — can clog pores and cause breakouts on face", fungalAcneSafe: false, comedogenic: true, rating: "caution",
});
add(["shea butter", "butyrospermum parkii butter", "butyrospermum parkii (shea) butter"], {
  category: "Emollient / Occlusive", benefit: "Rich moisturiser, anti-inflammatory, contains vitamins A and E", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["caprylic/capric triglyceride", "caprylic capric triglyceride", "coco-caprylate/caprate"], {
  category: "Emollient", benefit: "Lightweight emollient from coconut, smooth non-greasy feel, skin-replenishing", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["isopropyl myristate"], {
  category: "Emollient / Penetration Enhancer", benefit: "Smooth texture, helps other ingredients absorb", concern: "Can clog pores — not ideal for acne-prone skin", fungalAcneSafe: false, comedogenic: true, rating: "caution",
});
add(["isopropyl palmitate"], {
  category: "Emollient", benefit: "Skin-softening, smooth product texture", concern: "Moderately comedogenic", fungalAcneSafe: false, comedogenic: true, rating: "caution",
});
add(["cetyl alcohol"], {
  category: "Fatty Alcohol / Emollient", benefit: "Thickens and stabilises formulations, moisturises, non-drying", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["cetearyl alcohol"], {
  category: "Fatty Alcohol / Emollient", benefit: "Thickens and stabilises creams and lotions, softens skin", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["stearyl alcohol"], {
  category: "Fatty Alcohol / Emollient", benefit: "Emollient and thickener, softens and smooths skin", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["behenyl alcohol"], {
  category: "Fatty Alcohol / Emollient", benefit: "Stabilises emulsions, thickens, conditions skin and hair", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["mineral oil", "paraffinum liquidum", "petrolatum", "petroleum jelly", "vaseline"], {
  category: "Occlusive", benefit: "Locks in moisture, creates protective barrier, extremely safe and non-sensitising", concern: "Can feel heavy — not ideal for oily/acne-prone skin", fungalAcneSafe: true, comedogenic: true, rating: "caution",
});
add(["lanolin"], {
  category: "Emollient / Occlusive", benefit: "Deeply moisturising, mimics skin lipids, locks in hydration", concern: "Can cause allergic reactions in some people", fungalAcneSafe: false, comedogenic: true, rating: "caution",
});
add(["sunflower oil", "helianthus annuus seed oil", "helianthus annuus oil"], {
  category: "Emollient Oil", benefit: "Rich in linoleic acid, lightweight, anti-inflammatory, barrier repair", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["olive oil", "olea europaea fruit oil", "olea europaea oil"], {
  category: "Emollient Oil", benefit: "Rich in antioxidants and fatty acids, deeply nourishing", concern: "High oleic acid content can be comedogenic for some", fungalAcneSafe: false, comedogenic: true, rating: "caution",
});
add(["castor oil", "ricinus communis seed oil"], {
  category: "Emollient Oil", benefit: "Anti-inflammatory, deeply moisturising, conditions hair and lashes", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["sweet almond oil", "prunus amygdalus dulcis oil"], {
  category: "Emollient Oil", benefit: "Lightweight, vitamin E rich, soothes and softens skin", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["avocado oil", "persea gratissima oil"], {
  category: "Emollient Oil", benefit: "Rich in vitamins A, D, and E, deeply nourishing for dry skin", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["cocoa butter", "theobroma cacao seed butter"], {
  category: "Emollient / Occlusive", benefit: "Rich moisturiser, antioxidant, improves skin elasticity", concern: "Comedogenic — may not suit acne-prone facial skin", fungalAcneSafe: false, comedogenic: true, rating: "caution",
});
add(["mango butter", "mangifera indica seed butter"], {
  category: "Emollient / Occlusive", benefit: "Rich in vitamins A and E, deeply nourishing, non-comedogenic", fungalAcneSafe: false, comedogenic: false, rating: "good",
});

// ── Silicones ───────────────────────────────────────────────────────────────
add(["dimethicone", "polydimethylsiloxane"], {
  category: "Silicone", benefit: "Silky texture, smooths skin, helps ingredients penetrate, locks in moisture", concern: "Can trap debris in pores for some skin types", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["cyclomethicone", "cyclopentasiloxane", "cyclohexasiloxane"], {
  category: "Silicone", benefit: "Volatile silicone — evaporates leaving a smooth, dry feel", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["dimethicone crosspolymer", "dimethicone/vinyl dimethicone crosspolymer"], {
  category: "Silicone", benefit: "Creates a silky, matte finish, helps products spread evenly", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["phenyl trimethicone"], {
  category: "Silicone", benefit: "Adds shine and gloss, conditioning, smoothing agent", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["amodimethicone"], {
  category: "Silicone (Hair)", benefit: "Conditions and detangles hair, reduces frizz, repairs damage", fungalAcneSafe: true, comedogenic: false, rating: "good",
});

// ── Emulsifiers / Surfactants ───────────────────────────────────────────────
add(["ceteareth-20"], {
  category: "Emulsifier", benefit: "Helps oil and water phases blend into stable creams and lotions", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["polysorbate 20"], {
  category: "Emulsifier", benefit: "Blends oil and water phases, helps spread product evenly", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["polysorbate 60"], {
  category: "Emulsifier", benefit: "Stabilises oil-water mixtures, common in creams", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["polysorbate 80"], {
  category: "Emulsifier", benefit: "Solubilises oils in water-based products", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["peg-100 stearate", "peg-40 stearate"], {
  category: "Emulsifier", benefit: "Creates stable oil-in-water emulsions", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["glyceryl stearate", "glyceryl stearate se"], {
  category: "Emulsifier / Emollient", benefit: "Stabilises formulations and softens skin simultaneously", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["cetearyl glucoside"], {
  category: "Emulsifier", benefit: "Gentle, plant-derived emulsifier with good skin compatibility", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["sorbitan oleate", "sorbitan stearate"], {
  category: "Emulsifier", benefit: "Stabilises water-in-oil formulations", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["sodium lauryl sulfate", "sls"], {
  category: "Surfactant", benefit: "Creates lather, removes oil and dirt", concern: "Can be too stripping for dry or sensitive skin — disrupts the lipid barrier", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["sodium laureth sulfate", "sles"], {
  category: "Surfactant", benefit: "Gentler cousin of SLS, effective cleansing with good foam", concern: "Can still be drying for sensitive skin", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["cocamidopropyl betaine", "coco betaine"], {
  category: "Surfactant", benefit: "Mild surfactant, creates soft lather, antistatic, reduces irritation of other surfactants", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["sodium cocoyl isethionate"], {
  category: "Surfactant", benefit: "Very gentle, derived from coconut, excellent for sensitive skin cleansers", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["decyl glucoside", "coco glucoside", "lauryl glucoside"], {
  category: "Surfactant", benefit: "Ultra-gentle plant-derived surfactant, suitable for sensitive skin and babies", fungalAcneSafe: true, comedogenic: false, rating: "good",
});

// ── Thickeners / Stabilisers ────────────────────────────────────────────────
add(["carbomer", "carbomer 940", "carbomer 934"], {
  category: "Thickener", benefit: "Creates gel-like consistency, stabilises emulsions", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["xanthan gum"], {
  category: "Thickener", benefit: "Natural thickener, stabilises product texture, gives smooth application", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["hydroxyethylcellulose"], {
  category: "Thickener", benefit: "Thickening and film-forming agent, improves product texture", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["acrylates/c10-30 alkyl acrylate crosspolymer"], {
  category: "Thickener", benefit: "Stabilises and thickens formulations, creates gel textures", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["cellulose gum", "sodium carboxymethyl cellulose"], {
  category: "Thickener", benefit: "Plant-derived thickener and stabiliser", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["polyacrylamide"], {
  category: "Thickener / Film-forming", benefit: "Improves product texture and spread", fungalAcneSafe: true, comedogenic: false, rating: "good",
});

// ── Preservatives ───────────────────────────────────────────────────────────
add(["phenoxyethanol"], {
  category: "Preservative", benefit: "Broad-spectrum preservative, prevents bacterial growth, extends shelf life", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["ethylhexylglycerin"], {
  category: "Preservative Booster / Conditioning", benefit: "Enhances preservative efficacy, skin-conditioning agent", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["sodium benzoate"], {
  category: "Preservative", benefit: "Prevents growth of yeast and bacteria, safe at cosmetic levels", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["potassium sorbate"], {
  category: "Preservative", benefit: "Inhibits mould and yeast growth, widely used and well-tolerated", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["chlorphenesin"], {
  category: "Preservative", benefit: "Prevents microbial contamination in cosmetics", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["methylparaben", "propylparaben", "butylparaben", "ethylparaben", "parabens"], {
  category: "Preservative", benefit: "Prevents microbial growth, extends shelf life", concern: "Debated endocrine disruption concerns — regulated to safe levels in cosmetics", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["benzyl alcohol"], {
  category: "Preservative / Fragrance", benefit: "Preserves products, naturally occurs in some essential oils", concern: "Can be sensitising for very reactive skin", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["sorbic acid"], {
  category: "Preservative", benefit: "Prevents microbial growth, safe and effective at low concentrations", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["dmdm hydantoin"], {
  category: "Preservative (Formaldehyde Releaser)", benefit: "Effective broad-spectrum preservative", concern: "Releases formaldehyde slowly — can cause sensitisation and contact dermatitis", fungalAcneSafe: true, comedogenic: false, rating: "avoid",
});
add(["imidazolidinyl urea", "diazolidinyl urea"], {
  category: "Preservative (Formaldehyde Releaser)", benefit: "Prevents bacterial growth", concern: "Formaldehyde releaser — can cause sensitisation", fungalAcneSafe: true, comedogenic: false, rating: "avoid",
});
add(["caprylyl glycol"], {
  category: "Preservative Booster / Conditioning", benefit: "Boosts preservative efficacy, conditions and moisturises skin", fungalAcneSafe: true, comedogenic: false, rating: "good",
});

// ── pH Adjusters ────────────────────────────────────────────────────────────
add(["citric acid"], {
  category: "pH Adjuster / Antioxidant", benefit: "Adjusts product pH, mild antioxidant, chelating agent", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["sodium hydroxide", "lye"], {
  category: "pH Adjuster", benefit: "Adjusts pH to optimal range for active ingredients and skin compatibility", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["triethanolamine", "tea"], {
  category: "pH Adjuster / Emulsifier", benefit: "Balances pH and helps emulsify formulations", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["aminomethyl propanol"], {
  category: "pH Adjuster", benefit: "Neutralises carbomer gels, adjusts formula pH", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["tromethamine", "trometamol", "tris"], {
  category: "pH Adjuster", benefit: "Adjusts and buffers pH in skincare formulations", fungalAcneSafe: true, comedogenic: false, rating: "good",
});

// ── Chelating Agents ────────────────────────────────────────────────────────
add(["disodium edta", "tetrasodium edta", "trisodium edta", "edta"], {
  category: "Chelating Agent", benefit: "Binds metal ions that can destabilise formulas, improves preservative efficacy", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["phytic acid"], {
  category: "Chelating Agent / Antioxidant", benefit: "Natural chelator from rice bran, brightening properties", fungalAcneSafe: true, comedogenic: false, rating: "good",
});

// ── Actives / Acids ─────────────────────────────────────────────────────────
add(["niacinamide", "nicotinamide", "vitamin b3"], {
  category: "Active", benefit: "Brightens skin tone, reduces pores, controls oil, anti-inflammatory, barrier repair", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["retinol", "vitamin a"], {
  category: "Active (Vitamin A)", benefit: "Speeds cell turnover, reduces fine lines and wrinkles, fades dark spots", concern: "Can cause irritation, dryness, and photosensitivity — use at night and always apply SPF", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["retinal", "retinaldehyde"], {
  category: "Active (Vitamin A)", benefit: "More potent than retinol with fewer conversion steps, faster results, antibacterial", concern: "Can cause irritation — start with low frequency", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["retinyl palmitate", "retinyl acetate"], {
  category: "Active (Vitamin A)", benefit: "Gentlest retinoid, antioxidant, suitable for sensitive skin beginners", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["salicylic acid", "beta hydroxy acid"], {
  category: "BHA Exfoliant", benefit: "Unclogs pores, anti-inflammatory, excellent for acne-prone skin", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["glycolic acid"], {
  category: "AHA Exfoliant", benefit: "Strong exfoliation, reduces fine lines, brightens skin tone", concern: "Can increase photosensitivity — always use SPF", fungalAcneSafe: false, comedogenic: false, rating: "caution",
});
add(["lactic acid"], {
  category: "AHA Exfoliant", benefit: "Gentle exfoliation, brightening, hydrating — well tolerated by sensitive skin", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["mandelic acid"], {
  category: "AHA Exfoliant", benefit: "Larger molecule AHA — gentler exfoliation, good for sensitive and darker skin tones", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["azelaic acid"], {
  category: "Multi-active", benefit: "Targets acne, rosacea, hyperpigmentation simultaneously — suitable for sensitive skin", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["kojic acid"], {
  category: "Brightening", benefit: "Inhibits melanin production, reduces hyperpigmentation and dark spots", fungalAcneSafe: false, comedogenic: false, rating: "caution",
});
add(["kojic dipalmitate"], {
  category: "Brightening", benefit: "More stable form of kojic acid — reduces hyperpigmentation", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["tranexamic acid"], {
  category: "Brightening", benefit: "Reduces hyperpigmentation and melasma with minimal irritation", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["alpha arbutin", "arbutin"], {
  category: "Brightening", benefit: "Inhibits melanin production, reduces dark spots with less irritation than hydroquinone", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["benzoyl peroxide"], {
  category: "Antibacterial", benefit: "Kills acne-causing bacteria, reduces inflammation", concern: "Can bleach fabrics and hair. May be drying at high concentrations", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["aha", "alpha hydroxy acid"], {
  category: "Chemical Exfoliant", benefit: "Exfoliates dead skin cells, brightens, improves texture", concern: "Increases photosensitivity — always use SPF", fungalAcneSafe: false, comedogenic: false, rating: "caution",
});
add(["bha", "beta hydroxy acid"], {
  category: "Chemical Exfoliant", benefit: "Oil-soluble exfoliant — unclogs pores, reduces acne", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["pha", "polyhydroxy acid", "gluconolactone", "lactobionic acid"], {
  category: "Gentle Exfoliant", benefit: "Gentlest chemical exfoliant, hydrating, antioxidant — ideal for sensitive skin", fungalAcneSafe: true, comedogenic: false, rating: "good",
});

// ── Vitamins / Antioxidants ─────────────────────────────────────────────────
add(["vitamin c", "l-ascorbic acid", "ascorbic acid"], {
  category: "Antioxidant (Vitamin C)", benefit: "Brightens skin, stimulates collagen synthesis, neutralises free radicals", concern: "Unstable in high concentrations — may sting sensitive skin", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["ascorbyl glucoside", "sodium ascorbyl phosphate", "ascorbyl tetraisopalmitate", "3-o-ethyl ascorbic acid", "ethyl ascorbic acid", "magnesium ascorbyl phosphate"], {
  category: "Antioxidant (Vitamin C Derivative)", benefit: "Stable form of vitamin C — brightens, protects from UV damage, boosts collagen", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["tocopherol", "tocopheryl acetate", "vitamin e", "tocopheryl linoleate", "mixed tocopherols"], {
  category: "Antioxidant / Vitamin E", benefit: "Antioxidant protection, moisturising, stabilises other ingredients, supports skin barrier", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["ferulic acid"], {
  category: "Antioxidant", benefit: "Boosts efficacy of Vitamins C and E, protects from UV damage", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["resveratrol"], {
  category: "Antioxidant", benefit: "Potent antioxidant, anti-ageing, anti-inflammatory", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["coenzyme q10", "ubiquinone"], {
  category: "Antioxidant", benefit: "Protects cells from oxidative damage, anti-ageing, energises skin", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["green tea extract", "camellia sinensis leaf extract", "epigallocatechin gallate", "egcg"], {
  category: "Antioxidant", benefit: "Anti-inflammatory, antioxidant, helps with oiliness and skin brightening", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["caffeine"], {
  category: "Active", benefit: "Reduces puffiness and dark circles, antioxidant, improves microcirculation", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["bakuchiol"], {
  category: "Active (Plant Retinol)", benefit: "Natural retinol alternative — anti-ageing, fewer side effects, pregnancy-safe", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["bht", "butylated hydroxytoluene"], {
  category: "Antioxidant / Preservative", benefit: "Prevents product oxidation, extends shelf life", concern: "Potential sensitiser — debated safety at high concentrations", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});

// ── Barrier Lipids / Ceramides ──────────────────────────────────────────────
add(["ceramide", "ceramides", "ceramide np", "ceramide ap", "ceramide eop", "ceramide ns", "ceramide 3", "ceramide 1", "ceramide 6-ii", "ceramide 6 ii"], {
  category: "Barrier Lipid", benefit: "Restores and strengthens the skin barrier, locks in moisture, soothes sensitivity", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["cholesterol"], {
  category: "Barrier Lipid", benefit: "Essential component of the skin barrier, works with ceramides and fatty acids", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["phytosphingosine"], {
  category: "Barrier Lipid", benefit: "Precursor to ceramides, antimicrobial, anti-inflammatory, strengthens barrier", fungalAcneSafe: true, comedogenic: false, rating: "good",
});

// ── Peptides ────────────────────────────────────────────────────────────────
add(["peptides", "copper peptide", "copper tripeptide-1", "palmitoyl tripeptide-1", "palmitoyl tetrapeptide-7", "acetyl hexapeptide-8", "matrixyl", "argireline", "palmitoyl pentapeptide-4", "sh-oligopeptide-1"], {
  category: "Active (Peptide)", benefit: "Signal skin to produce collagen, reduce wrinkles, firm and smooth, wound healing", fungalAcneSafe: true, comedogenic: false, rating: "good",
});

// ── Soothing / Botanical ────────────────────────────────────────────────────
add(["centella asiatica", "cica", "centella asiatica extract", "madecassoside", "asiaticoside", "asiatic acid", "madecassic acid"], {
  category: "Soothing", benefit: "Calms inflammation, aids wound healing, excellent for sensitive/acne skin", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["aloe vera", "aloe barbadensis leaf juice", "aloe barbadensis", "aloe barbadensis leaf extract", "aloe barbadensis leaf water"], {
  category: "Soothing", benefit: "Soothes irritation and redness, lightweight hydration, anti-inflammatory", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["allantoin"], {
  category: "Soothing", benefit: "Calms irritation, promotes cell renewal, safe for sensitive skin", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["bisabolol", "alpha-bisabolol"], {
  category: "Soothing", benefit: "Anti-inflammatory, derived from chamomile, soothes irritated skin", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["chamomile extract", "matricaria recutita flower extract", "chamomilla recutita flower extract", "chamomilla recutita"], {
  category: "Soothing / Antioxidant", benefit: "Calms redness and irritation, antioxidant, suitable for sensitive skin", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["licorice root extract", "glycyrrhiza glabra root extract", "dipotassium glycyrrhizate", "glycyrrhizin"], {
  category: "Soothing / Brightening", benefit: "Anti-inflammatory, brightens skin, reduces hyperpigmentation, calms redness", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["witch hazel", "hamamelis virginiana", "hamamelis virginiana extract"], {
  category: "Astringent", benefit: "Tightens pores, reduces oiliness, mild anti-inflammatory", concern: "Can be drying — some formulations contain alcohol", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["tea tree oil", "melaleuca alternifolia leaf oil", "melaleuca alternifolia"], {
  category: "Antibacterial", benefit: "Natural antibacterial and anti-inflammatory, helps with acne", concern: "Can be irritating undiluted — use at 5% or less", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["turmeric extract", "curcuma longa root extract", "curcumin"], {
  category: "Anti-inflammatory / Brightening", benefit: "Potent anti-inflammatory, antioxidant, brightens skin", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["neem extract", "azadirachta indica leaf extract", "neem oil", "azadirachta indica seed oil"], {
  category: "Antibacterial / Soothing", benefit: "Antibacterial, anti-inflammatory, traditional remedy for acne and skin conditions", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["cucumber extract", "cucumis sativus fruit extract"], {
  category: "Soothing / Hydrating", benefit: "Cooling, hydrating, antioxidant, reduces puffiness", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["rose water", "rosa damascena flower water", "rosa centifolia flower water"], {
  category: "Soothing / Toning", benefit: "Hydrating, anti-inflammatory, helps balance skin pH", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["beta-glucan"], {
  category: "Soothing / Humectant", benefit: "Anti-inflammatory, deeply hydrating, supports skin healing, mimics hyaluronic acid", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["colloidal oatmeal", "avena sativa kernel flour", "avena sativa"], {
  category: "Soothing / Barrier Repair", benefit: "FDA-approved skin protectant, soothes eczema, strengthens barrier", fungalAcneSafe: false, comedogenic: false, rating: "good",
});

// ── Amino Acids / Proteins ──────────────────────────────────────────────────
add(["arginine"], {
  category: "Amino Acid", benefit: "Repairs skin barrier, antioxidant, improves hydration and wound healing", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["collagen", "hydrolyzed collagen", "soluble collagen"], {
  category: "Protein", benefit: "Moisturising and film-forming on skin surface — cannot penetrate to replace lost collagen", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["silk amino acids", "hydrolyzed silk"], {
  category: "Protein", benefit: "Moisturising, film-forming, adds smoothness and shine to skin and hair", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["adenosine"], {
  category: "Active (Anti-ageing)", benefit: "Reduces wrinkles, anti-inflammatory, promotes wound healing", fungalAcneSafe: true, comedogenic: false, rating: "good",
});

// ── Sunscreen Filters ───────────────────────────────────────────────────────
add(["zinc oxide"], {
  category: "Mineral Sunscreen", benefit: "Broad-spectrum UVA/UVB protection, anti-inflammatory, reef-safe", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["titanium dioxide", "ci 77891"], {
  category: "Mineral Sunscreen", benefit: "Broad-spectrum UV protection, gentle for sensitive skin", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["octinoxate", "ethylhexyl methoxycinnamate", "octyl methoxycinnamate"], {
  category: "Chemical Sunscreen", benefit: "UVB protection, widely used, lightweight", concern: "Potential hormone disruption, not reef-safe — banned in Hawaii/Palau", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["avobenzone", "butyl methoxydibenzoylmethane"], {
  category: "Chemical Sunscreen", benefit: "Broad-spectrum UVA protection", concern: "Degrades in sunlight — requires stabilisers like octocrylene", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["octocrylene"], {
  category: "Chemical Sunscreen / Stabiliser", benefit: "UVB protection, stabilises avobenzone", concern: "Can cause photoallergic reactions in rare cases", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["homosalate"], {
  category: "Chemical Sunscreen", benefit: "UVB protection, lightweight, commonly combined with other filters", concern: "Potential endocrine disruption at high doses", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["octisalate", "ethylhexyl salicylate"], {
  category: "Chemical Sunscreen", benefit: "UVB protection, helps stabilise avobenzone", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["bis-ethylhexyloxyphenol methoxyphenyl triazine", "tinosorb s", "bemotrizinol"], {
  category: "Chemical Sunscreen", benefit: "Broad-spectrum UVA/UVB, photostable, newer-generation filter", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["diethylamino hydroxybenzoyl hexyl benzoate", "uvinul a plus"], {
  category: "Chemical Sunscreen", benefit: "Strong UVA protection, photostable, oil-soluble", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["ethylhexyl triazone", "uvinul t 150"], {
  category: "Chemical Sunscreen", benefit: "Potent UVB filter, photostable, high SPF at low concentrations", fungalAcneSafe: true, comedogenic: false, rating: "good",
});

// ── Fragrance / Essential Oils ──────────────────────────────────────────────
add(["fragrance", "parfum", "aroma"], {
  category: "Fragrance", benefit: "Adds scent to the product", concern: "Common allergen — can irritate sensitive or reactive skin, may trigger dermatitis", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["lavender oil", "lavandula angustifolia oil"], {
  category: "Essential Oil / Fragrance", benefit: "Calming scent, mild antiseptic properties", concern: "Contains linalool — can sensitise skin over time", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["rosemary extract", "rosmarinus officinalis leaf extract"], {
  category: "Antioxidant / Preservative", benefit: "Natural antioxidant, helps preserve formulas, mild anti-inflammatory", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["linalool"], {
  category: "Fragrance Component", benefit: "Naturally occurring in lavender and citrus, provides floral scent", concern: "Known sensitiser — can cause contact dermatitis over time", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["limonene"], {
  category: "Fragrance Component", benefit: "Naturally occurring citrus scent", concern: "Oxidises on skin and can become sensitising — common fragrance allergen", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["citronellol", "geraniol", "eugenol", "coumarin", "cinnamal"], {
  category: "Fragrance Allergen", benefit: "Fragrance component, naturally occurring in various essential oils", concern: "EU-listed fragrance allergen — must be declared on labels, can cause sensitisation", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});

// ── Fatty Acids ─────────────────────────────────────────────────────────────
add(["stearic acid"], {
  category: "Fatty Acid / Emulsifier", benefit: "Thickens and stabilises formulations, mild cleansing properties", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["palmitic acid"], {
  category: "Fatty Acid", benefit: "Emollient, commonly found in palm oil, conditions skin", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["oleic acid"], {
  category: "Fatty Acid", benefit: "Rich emollient, enhances penetration of other ingredients", concern: "Can disrupt skin barrier for acne-prone skin", fungalAcneSafe: false, comedogenic: true, rating: "caution",
});
add(["linoleic acid"], {
  category: "Fatty Acid", benefit: "Essential fatty acid, anti-inflammatory, strengthens skin barrier, non-comedogenic", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["myristic acid"], {
  category: "Fatty Acid / Surfactant", benefit: "Cleansing and thickening, creates foam in cleansers", concern: "Can be comedogenic for acne-prone skin", fungalAcneSafe: false, comedogenic: true, rating: "caution",
});
add(["lauric acid"], {
  category: "Fatty Acid / Antibacterial", benefit: "Antimicrobial properties, found naturally in coconut oil", concern: "Comedogenic — can clog pores", fungalAcneSafe: false, comedogenic: true, rating: "caution",
});

// ── Miscellaneous / Common Fillers ──────────────────────────────────────────
add(["alcohol denat", "alcohol denat.", "denatured alcohol", "sd alcohol", "sd alcohol 40-b", "alcohol"], {
  category: "Solvent / Astringent", benefit: "Helps other ingredients penetrate skin, light feel, quick-drying", concern: "Can be drying and disrupt the skin barrier with prolonged use", fungalAcneSafe: true, comedogenic: false, rating: "caution",
});
add(["cetrimonium chloride", "behentrimonium chloride", "cetrimonium bromide"], {
  category: "Conditioning / Preservative", benefit: "Hair conditioning, antistatic, mild preservative properties", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["hydrogenated lecithin", "lecithin", "soy lecithin"], {
  category: "Emollient / Emulsifier", benefit: "Natural emulsifier from soy, moisturising, helps deliver active ingredients", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["snail mucin", "snail secretion filtrate"], {
  category: "Active / Humectant", benefit: "Hydrating, wound healing, contains glycoproteins, hyaluronic acid, and glycolic acid naturally", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["rice extract", "oryza sativa bran extract", "oryza sativa extract", "rice water", "rice bran oil", "oryza sativa bran oil"], {
  category: "Brightening / Antioxidant", benefit: "Brightens skin, antioxidant, contains ferulic acid and vitamin E naturally", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["mugwort", "artemisia vulgaris extract", "artemisia princeps extract"], {
  category: "Soothing / Anti-inflammatory", benefit: "Calms irritation, anti-inflammatory, antioxidant — popular in K-beauty", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["propolis", "propolis extract"], {
  category: "Antibacterial / Soothing", benefit: "Natural antibacterial, anti-inflammatory, rich in antioxidants, wound healing", fungalAcneSafe: false, comedogenic: false, rating: "good",
});
add(["sulfur"], {
  category: "Antibacterial / Keratolytic", benefit: "Treats acne and fungal conditions, reduces oil production", concern: "Can be drying and has a strong smell", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["biotin", "vitamin b7", "vitamin h"], {
  category: "Vitamin", benefit: "Supports hair and nail strength, conditioning for skin", fungalAcneSafe: true, comedogenic: false, rating: "good",
});
add(["zinc pca"], {
  category: "Active / Sebum Regulator", benefit: "Controls oil production, antimicrobial, helps reduce acne", fungalAcneSafe: true, comedogenic: false, rating: "good",
});

export default DB;
