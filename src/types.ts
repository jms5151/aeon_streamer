export interface TimelineReport {
  currentVibe: string;
  businessAsUsual2075: string;
  sdgHero2075: string;
  advice: string[];
  businessImageB64?: string;
  heroImageB64?: string;
}

export interface SimulationResult {
  city: string;
  report: TimelineReport;
  rawResponse: string;
}
