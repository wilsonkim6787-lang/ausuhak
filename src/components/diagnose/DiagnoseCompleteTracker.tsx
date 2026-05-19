"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

type Props = {
  education: string;
  english_level: string;
  preferred_region: string;
  major: string;
  budget_range: string;
  is_medical: boolean;
};

export default function DiagnoseCompleteTracker({
  education,
  english_level,
  preferred_region,
  major,
  budget_range,
  is_medical,
}: Props) {
  useEffect(() => {
    track("diagnostic_complete", {
      education,
      english_level,
      region: preferred_region,
      major,
      budget: budget_range,
      medical: is_medical,
    });
  }, [education, english_level, preferred_region, major, budget_range, is_medical]);

  return null;
}
