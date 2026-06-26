import type { Metadata } from "next";
import { CalculatorExperience } from "./CalculatorExperience";
import "./calculator.css";

export const metadata: Metadata = {
  title: "Uni High Scientific Calculator | ideamuses",
  description:
    "A focused scientific calculator for high-school and early university math practice."
};

export default function UniHighSchoolScientificCalculatorPage() {
  return <CalculatorExperience />;
}
