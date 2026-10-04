// Shared by the résumé page and its Home preview.
export const resumeSections = [
  { id: "experience", number: "01", title: "Experience", detail: "Web apps & systems" },
  { id: "skills", number: "02", title: "Technical skills", detail: "Tools & technologies" },
  { id: "work", number: "03", title: "Selected work", detail: "Projects & contributions" },
];

// References to the canonical project records, not a second project catalog.
export const resumeFocus = [
  { id: "all", label: "All experience", icon: "apps", projects: [] },
  { id: "web", label: "Web platforms", icon: "web", projects: ["arilvo", "arvand-termo-tec", "raymand-group"] },
  { id: "ai", label: "Applied AI", icon: "psychology", projects: ["docintel"] },
];
