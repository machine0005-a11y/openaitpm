import type { Metadata } from "next";
import { PetFoodCrmExperience } from "./PetFoodCrmExperience";
import "./pet-food-crm.css";

export const metadata: Metadata = {
  title: "TailTreat CRM | Pet Food Retention Console",
  description:
    "A pet food CRM prototype that rewards operators while they save subscriptions, delight pet parents, and keep pets fed."
};

export default function PetFoodCrmPage() {
  return <PetFoodCrmExperience />;
}
