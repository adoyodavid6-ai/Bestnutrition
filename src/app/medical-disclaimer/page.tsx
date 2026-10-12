import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Medical Disclaimer", description: "NourishWell provides general education, not medical advice.", alternates: { canonical: "/medical-disclaimer" } };

export default function MedicalDisclaimerPage() {
  return (
    <InfoPage path="/medical-disclaimer" eyebrow="Important" title="Medical disclaimer" updated="2026-10-01">
      <div className="callout callout-danger">
        <span className="callout-title">In an emergency</span>
        <p className="small">If you think you or someone else may be seriously unwell, contact your local emergency number or go to the nearest emergency department. Don&apos;t wait for online information.</p>
      </div>
      <h2>General information only</h2>
      <p>
        Content on NourishWell — including recipes, nutrition estimates, meal plans, health-condition guides, supplement guides and fitness routines — is for general education. It is not medical advice and
        is not a substitute for diagnosis, treatment or advice from a qualified health professional who knows your circumstances.
      </p>
      <h2>Medication and treatment</h2>
      <p>
        Never stop, start or change prescribed medicine or treatment because of something you read here. Some dietary changes interact with medicines (for example, insulin and other glucose-lowering
        drugs, blood thinners, blood-pressure medicines and kidney treatments). Speak to your clinician or pharmacist first.
      </p>
      <h2>Specialised diets</h2>
      <p>
        Kidney disease, diabetes treated with medication, cancer treatment, pregnancy, eating disorders, coeliac disease and other complex conditions need individual plans from qualified professionals.
        Our guides help you prepare questions; they don&apos;t replace that care.
      </p>
      <h2>Nutrition estimates</h2>
      <p>Nutrient values are calculated estimates and can vary. Don&apos;t use them for clinical dosing decisions, such as insulin, without verifying against product labels or verified sources.</p>
      <h2>Allergies</h2>
      <p>Allergen information is derived from listed ingredients and may not reflect cross-contamination or the ingredients in branded products. Always check labels if you have a food allergy.</p>
      <h2>Exercise</h2>
      <p>Check with a health professional before starting a new exercise programme if you have a medical condition, are pregnant, or have not been active for some time.</p>
    </InfoPage>
  );
}
