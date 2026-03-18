import type { Metadata } from "next";
import ProfileWizard from "@/components/ProfileWizard";

export const metadata: Metadata = {
  title: "Build Your Style Profile",
  description: "Answer a few questions and upload photos to get personalized styling recommendations",
};

export default function ProfilePage() {
  return <ProfileWizard />;
}
