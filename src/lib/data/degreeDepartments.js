/**
 * Dynamic Degree and Department extraction engine strictly based on universities.js dataset
 */

import { universitiesData } from "./universities.js";

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
            const cleanDegree = normalizeDegree(degreeName.trim());
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

  const resultMap = {};
  // Preferred ordering: Diploma, B.Tech, BA, BSc, BCom, Education, Law
  const preferredOrder = ["Diploma", "B.Tech", "BA", "BSc", "BCom", "Education", "Law"];
  
  const extractedKeys = Object.keys(map);
  const sortedKeys = extractedKeys.sort((a, b) => {
    const idxA = preferredOrder.indexOf(a);
    const idxB = preferredOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  sortedKeys.forEach((degree) => {
    resultMap[degree] = Array.from(map[degree]).sort();
  });

  cachedMapping = resultMap;
  return cachedMapping;
}

/**
 * Normalizes degree string to match the exact canonical degree in universitiesData
 */
export function normalizeDegree(degreeStr) {
  if (!degreeStr) return "Diploma";
  const str = degreeStr.toString().trim();
  const upper = str.replace(/[\.\s-]/g, "").toUpperCase();

  if (upper.includes("BTECH") || upper.includes("BE")) {
    return "B.Tech";
  }
  if (upper.includes("DIPLOMA") || upper.includes("POLYTECHNIC")) {
    return "Diploma";
  }
  if (upper.includes("BSC")) {
    return "BSc";
  }
  if (upper.includes("BCOM")) {
    return "BCom";
  }
  if (upper.includes("BA") || upper.includes("ARTS")) {
    return "BA";
  }
  if (upper.includes("EDU") || upper.includes("TEACHER")) {
    return "Education";
  }
  if (upper.includes("LAW")) {
    return "Law";
  }
  
  return str;
}

export const DEGREE_DEPARTMENT_MAP = buildDegreeDepartmentMap();

export const DEGREE_LIST = Object.keys(DEGREE_DEPARTMENT_MAP);

// Complete deduplicated list of all departments across all degrees from universities.js
export const ALL_DEPARTMENTS = Array.from(
  new Set(Object.values(DEGREE_DEPARTMENT_MAP).flat())
).sort();

// Grouped department mapping for Admin & Instructors selection panels (strictly from universities.js)
export const DEPARTMENT_GROUPS = (() => {
  const map = buildDegreeDepartmentMap();
  const groups = {};

  // Engineering (B.Tech / Diploma)
  const engDepts = Array.from(
    new Set([...(map["B.Tech"] || []), ...(map["Diploma"] || [])])
  ).sort();
  if (engDepts.length > 0) {
    groups["Engineering (B.Tech / Diploma)"] = engDepts;
  }

  // Pure & Applied Sciences (BSc)
  if (map["BSc"] && map["BSc"].length > 0) {
    groups["Pure & Applied Sciences (BSc)"] = map["BSc"];
  }

  // Arts & Humanities (BA)
  if (map["BA"] && map["BA"].length > 0) {
    groups["Arts & Humanities (BA)"] = map["BA"];
  }

  // Commerce (BCom)
  if (map["BCom"] && map["BCom"].length > 0) {
    groups["Commerce (BCom)"] = map["BCom"];
  }

  // Education
  if (map["Education"] && map["Education"].length > 0) {
    groups["Education"] = map["Education"];
  }

  // Law
  if (map["Law"] && map["Law"].length > 0) {
    groups["Law"] = map["Law"];
  }

  // Any extra degrees dynamically present in universities.js
  Object.keys(map).forEach((degreeKey) => {
    if (!["B.Tech", "Diploma", "BA", "BSc", "BCom", "Education", "Law"].includes(degreeKey)) {
      if (map[degreeKey] && map[degreeKey].length > 0) {
        groups[degreeKey] = map[degreeKey];
      }
    }
  });

  return groups;
})();

/**
 * Returns available departments for a given degree dynamically extracted from universitiesData
 */
export function getDepartmentsForDegree(degreeStr) {
  const map = buildDegreeDepartmentMap();
  if (!degreeStr) {
    const firstKey = Object.keys(map)[0];
    return map[firstKey] || [];
  }

  const norm = normalizeDegree(degreeStr);
  if (map[norm]) return map[norm];
  if (map[degreeStr]) return map[degreeStr];

  return map[Object.keys(map)[0]] || [];
}

/**
 * Gets departments for a specific university, college, and degree combination
 */
export function getDepartmentsForCollegeAndDegree(universityId, collegeId, degreeStr) {
  if (!universityId || !collegeId || universityId === "others" || collegeId === "others") {
    return getDepartmentsForDegree(degreeStr);
  }

  const universityObj = universitiesData[universityId];
  if (!universityObj) return getDepartmentsForDegree(degreeStr);

  const collegeObj = universityObj.colleges?.[collegeId];
  if (!collegeObj || !collegeObj.departments) return getDepartmentsForDegree(degreeStr);

  const normDeg = normalizeDegree(degreeStr);

  // Check exact key match first, then normalized key
  let rawDepts = collegeObj.departments[degreeStr] || collegeObj.departments[normDeg];
  if (!rawDepts) {
    const matchedKey = Object.keys(collegeObj.departments).find(
      (k) => normalizeDegree(k) === normDeg
    );
    if (matchedKey) {
      rawDepts = collegeObj.departments[matchedKey];
    }
  }

  if (Array.isArray(rawDepts) && rawDepts.length > 0) {
    return Array.from(new Set(rawDepts)).sort();
  }

  return getDepartmentsForDegree(degreeStr);
}
