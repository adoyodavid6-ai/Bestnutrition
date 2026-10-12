import type { Reference } from "@/lib/types";

// Authoritative sources cited across the platform. Each entry links to a public page
// maintained by the publisher. Editors must re-verify URLs during each content review.
export const references: Reference[] = [
  { id: "who-healthy-diet", title: "Healthy diet — fact sheet", publisher: "World Health Organization", url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet", kind: "public-health-agency" },
  { id: "who-sodium", title: "Sodium reduction — fact sheet", publisher: "World Health Organization", url: "https://www.who.int/news-room/fact-sheets/detail/salt-reduction", kind: "public-health-agency" },
  { id: "who-sugars", title: "Guideline: sugars intake for adults and children", publisher: "World Health Organization", url: "https://www.who.int/publications/i/item/9789241549028", year: "2015", kind: "clinical-guideline" },
  { id: "who-hypertension", title: "Hypertension — fact sheet", publisher: "World Health Organization", url: "https://www.who.int/news-room/fact-sheets/detail/hypertension", kind: "public-health-agency" },
  { id: "who-diabetes", title: "Diabetes — fact sheet", publisher: "World Health Organization", url: "https://www.who.int/news-room/fact-sheets/detail/diabetes", kind: "public-health-agency" },
  { id: "who-anaemia", title: "Anaemia — fact sheet", publisher: "World Health Organization", url: "https://www.who.int/news-room/fact-sheets/detail/anaemia", kind: "public-health-agency" },
  { id: "who-physical-activity", title: "Physical activity — fact sheet", publisher: "World Health Organization", url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity", kind: "public-health-agency" },
  { id: "who-food-safety", title: "Five keys to safer food", publisher: "World Health Organization", url: "https://www.who.int/publications/i/item/9789241594639", kind: "public-health-agency" },
  { id: "who-infant-feeding", title: "Infant and young child feeding — fact sheet", publisher: "World Health Organization", url: "https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding", kind: "public-health-agency" },
  { id: "who-obesity", title: "Obesity and overweight — fact sheet", publisher: "World Health Organization", url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight", kind: "public-health-agency" },
  { id: "who-cvd", title: "Cardiovascular diseases (CVDs) — fact sheet", publisher: "World Health Organization", url: "https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)", kind: "public-health-agency" },
  { id: "who-ageing", title: "Ageing and health — fact sheet", publisher: "World Health Organization", url: "https://www.who.int/news-room/fact-sheets/detail/ageing-and-health", kind: "public-health-agency" },

  { id: "nhs-eatwell", title: "The Eatwell Guide", publisher: "NHS", url: "https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/the-eatwell-guide/", kind: "national-health-service" },
  { id: "nhs-hbp", title: "High blood pressure (hypertension)", publisher: "NHS", url: "https://www.nhs.uk/conditions/high-blood-pressure-hypertension/", kind: "national-health-service" },
  { id: "nhs-cholesterol", title: "High cholesterol", publisher: "NHS", url: "https://www.nhs.uk/conditions/high-cholesterol/", kind: "national-health-service" },
  { id: "nhs-type2", title: "Type 2 diabetes", publisher: "NHS", url: "https://www.nhs.uk/conditions/type-2-diabetes/", kind: "national-health-service" },
  { id: "nhs-type1", title: "Type 1 diabetes", publisher: "NHS", url: "https://www.nhs.uk/conditions/type-1-diabetes/", kind: "national-health-service" },
  { id: "nhs-gestational", title: "Gestational diabetes", publisher: "NHS", url: "https://www.nhs.uk/conditions/gestational-diabetes/", kind: "national-health-service" },
  { id: "nhs-constipation", title: "Constipation", publisher: "NHS", url: "https://www.nhs.uk/conditions/constipation/", kind: "national-health-service" },
  { id: "nhs-ibs", title: "Irritable bowel syndrome (IBS)", publisher: "NHS", url: "https://www.nhs.uk/conditions/irritable-bowel-syndrome-ibs/", kind: "national-health-service" },
  { id: "nhs-coeliac", title: "Coeliac disease", publisher: "NHS", url: "https://www.nhs.uk/conditions/coeliac-disease/", kind: "national-health-service" },
  { id: "nhs-lactose", title: "Lactose intolerance", publisher: "NHS", url: "https://www.nhs.uk/conditions/lactose-intolerance/", kind: "national-health-service" },
  { id: "nhs-ckd", title: "Chronic kidney disease", publisher: "NHS", url: "https://www.nhs.uk/conditions/kidney-disease/", kind: "national-health-service" },
  { id: "nhs-nafld", title: "Non-alcoholic fatty liver disease (NAFLD)", publisher: "NHS", url: "https://www.nhs.uk/conditions/non-alcoholic-fatty-liver-disease/", kind: "national-health-service" },
  { id: "nhs-gallstones", title: "Gallstones", publisher: "NHS", url: "https://www.nhs.uk/conditions/gallstones/", kind: "national-health-service" },
  { id: "nhs-osteoporosis", title: "Osteoporosis", publisher: "NHS", url: "https://www.nhs.uk/conditions/osteoporosis/", kind: "national-health-service" },
  { id: "nhs-iron-anaemia", title: "Iron deficiency anaemia", publisher: "NHS", url: "https://www.nhs.uk/conditions/iron-deficiency-anaemia/", kind: "national-health-service" },
  { id: "nhs-pregnancy-diet", title: "Have a healthy diet in pregnancy", publisher: "NHS", url: "https://www.nhs.uk/pregnancy/keeping-well/have-a-healthy-diet/", kind: "national-health-service" },
  { id: "nhs-pregnancy-avoid", title: "Foods to avoid in pregnancy", publisher: "NHS", url: "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/", kind: "national-health-service" },
  { id: "nhs-food-labels", title: "Food labels", publisher: "NHS", url: "https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/how-to-read-food-labels/", kind: "national-health-service" },
  { id: "nhs-fibre", title: "How to get more fibre into your diet", publisher: "NHS", url: "https://www.nhs.uk/live-well/eat-well/digestive-health/how-to-get-more-fibre-into-your-diet/", kind: "national-health-service" },
  { id: "nhs-water", title: "Water, drinks and your health", publisher: "NHS", url: "https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/water-drinks-nutrition/", kind: "national-health-service" },
  { id: "nhs-vitamins", title: "Vitamins and minerals", publisher: "NHS", url: "https://www.nhs.uk/conditions/vitamins-and-minerals/", kind: "national-health-service" },
  { id: "nhs-exercise", title: "Physical activity guidelines for adults aged 19 to 64", publisher: "NHS", url: "https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-for-adults-aged-19-to-64/", kind: "national-health-service" },
  { id: "nhs-older-exercise", title: "Physical activity guidelines for older adults", publisher: "NHS", url: "https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-older-adults/", kind: "national-health-service" },
  { id: "nhs-sleep", title: "How to get to sleep", publisher: "NHS", url: "https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/", kind: "national-health-service" },
  { id: "nhs-stress", title: "Stress", publisher: "NHS Every Mind Matters", url: "https://www.nhs.uk/every-mind-matters/mental-health-issues/stress/", kind: "national-health-service" },
  { id: "nhs-cancer-diet", title: "Diet and cancer treatment", publisher: "NHS", url: "https://www.nhs.uk/conditions/cancer/", kind: "national-health-service" },

  { id: "cdc-food-safety", title: "Four steps to food safety", publisher: "U.S. Centers for Disease Control and Prevention", url: "https://www.cdc.gov/food-safety/prevention/index.html", kind: "public-health-agency" },
  { id: "cdc-prediabetes", title: "About prediabetes", publisher: "U.S. Centers for Disease Control and Prevention", url: "https://www.cdc.gov/diabetes/prevention-type-2/prediabetes-prevent-type-2.html", kind: "public-health-agency" },
  { id: "cdc-physical-activity", title: "Physical activity basics", publisher: "U.S. Centers for Disease Control and Prevention", url: "https://www.cdc.gov/physical-activity-basics/index.html", kind: "public-health-agency" },

  { id: "dga-2020", title: "Dietary Guidelines for Americans, 2020–2025", publisher: "U.S. Department of Agriculture & HHS", url: "https://www.dietaryguidelines.gov/", year: "2020", kind: "clinical-guideline" },
  { id: "nhlbi-dash", title: "DASH eating plan", publisher: "U.S. National Heart, Lung, and Blood Institute", url: "https://www.nhlbi.nih.gov/education/dash-eating-plan", kind: "public-health-agency" },
  { id: "niddk-ckd-nutrition", title: "Eating right for chronic kidney disease", publisher: "U.S. National Institute of Diabetes and Digestive and Kidney Diseases", url: "https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/eating-nutrition", kind: "public-health-agency" },
  { id: "niddk-diabetes-diet", title: "Diabetes diet, eating, & physical activity", publisher: "U.S. National Institute of Diabetes and Digestive and Kidney Diseases", url: "https://www.niddk.nih.gov/health-information/diabetes/overview/diet-eating-physical-activity", kind: "public-health-agency" },
  { id: "niddk-celiac", title: "Eating, diet, & nutrition for celiac disease", publisher: "U.S. National Institute of Diabetes and Digestive and Kidney Diseases", url: "https://www.niddk.nih.gov/health-information/digestive-diseases/celiac-disease/eating-diet-nutrition", kind: "public-health-agency" },
  { id: "niddk-ibs", title: "Eating, diet, & nutrition for irritable bowel syndrome", publisher: "U.S. National Institute of Diabetes and Digestive and Kidney Diseases", url: "https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome/eating-diet-nutrition", kind: "public-health-agency" },
  { id: "niddk-nafld", title: "Eating, diet, & nutrition for NAFLD & NASH", publisher: "U.S. National Institute of Diabetes and Digestive and Kidney Diseases", url: "https://www.niddk.nih.gov/health-information/liver-disease/nafld-nash/eating-diet-nutrition", kind: "public-health-agency" },
  { id: "niddk-gallstones", title: "Eating, diet, & nutrition for gallstones", publisher: "U.S. National Institute of Diabetes and Digestive and Kidney Diseases", url: "https://www.niddk.nih.gov/health-information/digestive-diseases/gallstones/eating-diet-nutrition", kind: "public-health-agency" },
  { id: "nci-nutrition-treatment", title: "Nutrition in cancer care (PDQ®) — patient version", publisher: "U.S. National Cancer Institute", url: "https://www.cancer.gov/about-cancer/treatment/side-effects/appetite-loss/nutrition-pdq", kind: "public-health-agency" },
  { id: "nia-healthy-eating", title: "Healthy eating as you age", publisher: "U.S. National Institute on Aging", url: "https://www.nia.nih.gov/health/healthy-eating-nutrition-and-diet", kind: "public-health-agency" },

  { id: "ods-vitamin-d", title: "Vitamin D — fact sheet for health professionals", publisher: "NIH Office of Dietary Supplements", url: "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/", kind: "public-health-agency" },
  { id: "ods-iron", title: "Iron — fact sheet for health professionals", publisher: "NIH Office of Dietary Supplements", url: "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/", kind: "public-health-agency" },
  { id: "ods-b12", title: "Vitamin B12 — fact sheet for health professionals", publisher: "NIH Office of Dietary Supplements", url: "https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/", kind: "public-health-agency" },
  { id: "ods-folate", title: "Folate — fact sheet for health professionals", publisher: "NIH Office of Dietary Supplements", url: "https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/", kind: "public-health-agency" },
  { id: "ods-calcium", title: "Calcium — fact sheet for health professionals", publisher: "NIH Office of Dietary Supplements", url: "https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/", kind: "public-health-agency" },
  { id: "ods-magnesium", title: "Magnesium — fact sheet for health professionals", publisher: "NIH Office of Dietary Supplements", url: "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/", kind: "public-health-agency" },
  { id: "ods-omega3", title: "Omega-3 fatty acids — fact sheet for health professionals", publisher: "NIH Office of Dietary Supplements", url: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/", kind: "public-health-agency" },
  { id: "ods-probiotics", title: "Probiotics — fact sheet for health professionals", publisher: "NIH Office of Dietary Supplements", url: "https://ods.od.nih.gov/factsheets/Probiotics-HealthProfessional/", kind: "public-health-agency" },
  { id: "ods-zinc", title: "Zinc — fact sheet for health professionals", publisher: "NIH Office of Dietary Supplements", url: "https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/", kind: "public-health-agency" },
  { id: "ods-exercise", title: "Dietary supplements for exercise and athletic performance", publisher: "NIH Office of Dietary Supplements", url: "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/", kind: "public-health-agency" },
  { id: "ods-using-supplements", title: "Dietary supplements: what you need to know", publisher: "NIH Office of Dietary Supplements", url: "https://ods.od.nih.gov/factsheets/WYNTK-Consumer/", kind: "public-health-agency" },
  { id: "nccih-probiotics", title: "Probiotics: what you need to know", publisher: "U.S. National Center for Complementary and Integrative Health", url: "https://www.nccih.nih.gov/health/probiotics-what-you-need-to-know", kind: "public-health-agency" },

  { id: "aha-diet", title: "The American Heart Association diet and lifestyle recommendations", publisher: "American Heart Association", url: "https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics/aha-diet-and-lifestyle-recommendations", kind: "medical-organization" },
  { id: "ada-standards", title: "Standards of Care in Diabetes", publisher: "American Diabetes Association", url: "https://diabetesjournals.org/care/issue/48/Supplement_1", year: "2025", kind: "clinical-guideline" },
  { id: "kdigo-ckd", title: "KDIGO clinical practice guideline for the evaluation and management of CKD", publisher: "Kidney Disease: Improving Global Outcomes", url: "https://kdigo.org/guidelines/ckd-evaluation-and-management/", year: "2024", kind: "clinical-guideline" },
  { id: "issn-protein", title: "Position stand: protein and exercise", publisher: "International Society of Sports Nutrition (J Int Soc Sports Nutr)", url: "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8", year: "2017", kind: "systematic-review" },

  { id: "usda-fdc", title: "FoodData Central", publisher: "U.S. Department of Agriculture, Agricultural Research Service", url: "https://fdc.nal.usda.gov/", kind: "nutrient-database" },
  { id: "fao-infoods", title: "INFOODS: International Network of Food Data Systems", publisher: "Food and Agriculture Organization of the United Nations", url: "https://www.fao.org/infoods/infoods/en/", kind: "nutrient-database" },
];

const byId = new Map(references.map((r) => [r.id, r]));

export function getReference(id: string): Reference | undefined {
  return byId.get(id);
}

export function getReferences(ids: string[]): Reference[] {
  return ids.map((id) => byId.get(id)).filter((r): r is Reference => Boolean(r));
}
