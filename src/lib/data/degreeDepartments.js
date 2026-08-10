/**
 * Dynamic Degree and Department extraction utility based on universities.js dataset
 */

import { universitiesData } from "./universities";

// Cache for extracted mapping
let cachedMapping = null;

/**
 * Parses universitiesData to extract all degrees and their corresponding departments
 */
export function buildDegreeDepartmentMap() {
  if (cachedMapping) return cachedMapping;

  const map = {};

  try {
    Object.values(universitiesData || {}).forEach((university) => {
      Object.values(university.colleges || {}).forEach((college) => {
        if (college.departments && typeof college.departments === "object") {
          Object.entries(college.departments).forEach(([degreeName, deptsArray]) => {
            const cleanDegree = degreeName.trim();
            if (!map[cleanDegree]) {
              map[cleanDegree] = new Set();
            }
            if (Array.isArray(deptsArray)) {
              deptsArray.forEach((dept) => {
                if (dept && typeof dept === "string" && dept.trim()) {
                  map[cleanDegree].add(dept.trim());
                }
              });
            }
          });
        }
      });
    });
  } catch (err) {
    console.error("Error parsing universitiesData for degree departments:", err);
  }

  // Fallback defaults if dataset extraction is empty
  if (Object.keys(map).length === 0) {
    map["B.Tech"] = new Set([
      "Computer Science & Engineering",
      "Information Technology (IT)",
      "Artificial Intelligence & Machine Learning (AI & ML)",
      "Data Science",
      "Cyber Security",
      "Electronics & Communication",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
    ]);
    map["Diploma"] = new Set([
      "Computer Science & Engineering",
      "Civil Engineering",
      "Mechanical Engineering",
      "Electrical Engineering",
      "Electronics & Communication",
    ]);
  }

  const resultMap = {};
  Object.keys(map).sort().forEach((degree) => {
    resultMap[degree] = Array.from(map[degree]).sort();
  });

  cachedMapping = resultMap;
  return cachedMapping;
}

export const DEGREE_DEPARTMENT_MAP = buildDegreeDepartmentMap();

export const DEGREE_LIST = Object.keys(DEGREE_DEPARTMENT_MAP);

/**
 * Normalizes degree string for lookup
 */
export function normalizeDegree(degreeStr) {
  if (!degreeStr) return "B.Tech";
  const str = degreeStr.toString().trim();
  
  // Exact match first
  const allDegrees = Object.keys(buildDegreeDepartmentMap());
  const exact = allDegrees.find((d) => d.toLowerCase() === str.toLowerCase());
  if (exact) return exact;

  // Fuzzy match
  const upper = str.replace(/[\.\s-]/g, "").toUpperCase();
  if (upper.includes("BTECH") || upper.includes("BE")) {
    return allDegrees.find((d) => d.toLowerCase().includes("btech") || d.toLowerCase().includes("b.tech")) || "B.Tech";
  }
  if (upper.includes("DIPLOMA") || upper.includes("POLYTECHNIC")) {
    return allDegrees.find((d) => d.toLowerCase().includes("diploma")) || "Diploma";
  }
  if (upper.includes("BCA")) return allDegrees.find((d) => d.toLowerCase().includes("bca")) || "BCA";
  if (upper.includes("MCA")) return allDegrees.find((d) => d.toLowerCase().includes("mca")) || "MCA";
  if (upper.includes("BSC")) return allDegrees.find((d) => d.toLowerCase().includes("bsc") || d.toLowerCase().includes("b.sc")) || "B.Sc";
  if (upper.includes("MTECH") || upper.includes("ME")) return allDegrees.find((d) => d.toLowerCase().includes("mtech") || d.toLowerCase().includes("m.tech")) || "M.Tech";
  
  return allDegrees[0] || "B.Tech";
}

/**
 * Returns available departments for a given degree dynamically extracted from universitiesData
 */
export function getDepartmentsForDegree(degreeStr) {
  const map = buildDegreeDepartmentMap();
  if (!degreeStr) {
    const firstKey = Object.keys(map)[0];
    return map[firstKey] || [];
  }

  // Exact match
  if (map[degreeStr]) return map[degreeStr];

  // Normalized lookup
  const norm = normalizeDegree(degreeStr);
  return map[norm] || map[Object.keys(map)[0]] || [];
}
