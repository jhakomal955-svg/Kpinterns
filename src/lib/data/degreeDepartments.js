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

  // Ensure Education has standard departments if not explicitly defined in universitiesData
  if (!map["Education"] || map["Education"].size === 0) {
    map["Education"] = new Set([
      "Education — Teacher Training",
      "General Teacher Training",
    ]);
  }

  const resultMap = {};
  // Preferred ordering: Diploma, B.Tech, BCA, MCA, BBA, BA, BSc, BCom, Education, Law
  const preferredOrder = ["Diploma", "B.Tech", "BCA", "MCA", "BBA", "BA", "BSc", "BCom", "Education", "Law"];
  
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
  if (upper.includes("MCA")) {
    return "MCA";
  }
  if (upper.includes("BCA")) {
    return "BCA";
  }
  if (upper.includes("BBA")) {
    return "BBA";
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

  // Computer Applications (BCA / MCA)
  if (map["BCA"] && map["BCA"].length > 0) {
    groups["Computer Applications (BCA)"] = map["BCA"];
  }
  if (map["MCA"] && map["MCA"].length > 0) {
    groups["Computer Applications (MCA)"] = map["MCA"];
  }

  // Business Administration & Management (BBA)
  if (map["BBA"] && map["BBA"].length > 0) {
    groups["Management & Business Administration (BBA)"] = map["BBA"];
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
    if (!["B.Tech", "Diploma", "BCA", "MCA", "BBA", "BA", "BSc", "BCom", "Education", "Law"].includes(degreeKey)) {
      if (map[degreeKey] && map[degreeKey].length > 0) {
        groups[degreeKey] = map[degreeKey];
      }
    }
  });

  return groups;
})();

/**
 * Helper to resolve University key from key ID or full name
 */
export function findUniversityKey(univInput) {
  if (!univInput || univInput === "others") return null;
  if (universitiesData[univInput]) return univInput;

  const inputClean = univInput.toString().toLowerCase().trim();
  const entry = Object.entries(universitiesData).find(
    ([key, u]) => u.name && u.name.toLowerCase().trim() === inputClean
  );
  return entry ? entry[0] : null;
}

/**
 * Helper to resolve College key from key ID or full name under a University
 */
export function findCollegeKey(univKey, collegeInput) {
  if (!univKey || !collegeInput || collegeInput === "others") return null;
  const resolvedUnivKey = findUniversityKey(univKey) || univKey;
  const univObj = universitiesData[resolvedUnivKey];
  if (!univObj || !univObj.colleges) return null;

  if (univObj.colleges[collegeInput]) return collegeInput;

  const inputClean = collegeInput.toString().toLowerCase().trim();
  const entry = Object.entries(univObj.colleges).find(
    ([key, c]) => c.name && c.name.toLowerCase().trim() === inputClean
  );
  return entry ? entry[0] : null;
}

/**
 * Gets available degrees dynamically for a specific University and College
 */
export function getDegreesForUniversityAndCollege(universityIdOrName, collegeIdOrName) {
  const univKey = findUniversityKey(universityIdOrName);
  const preferredOrder = ["Diploma", "B.Tech", "BCA", "MCA", "BBA", "BA", "BSc", "BCom", "Education", "Law"];

  const sortDegrees = (degSet) => {
    const arr = Array.from(degSet);
    return arr.sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  };

  if (univKey) {
    const collegeKey = findCollegeKey(univKey, collegeIdOrName);
    const univObj = universitiesData[univKey];

    if (collegeKey && univObj?.colleges?.[collegeKey]?.departments) {
      const collegeDepts = univObj.colleges[collegeKey].departments;
      const degSet = new Set();
      Object.keys(collegeDepts).forEach((degreeKey) => {
        degSet.add(normalizeDegree(degreeKey));
      });
      if (degSet.size > 0) {
        return sortDegrees(degSet);
      }
    }

    // Fall back to all degrees under this university across all its colleges
    if (univObj?.colleges) {
      const degSet = new Set();
      Object.values(univObj.colleges).forEach((college) => {
        if (college.departments && typeof college.departments === "object") {
          Object.keys(college.departments).forEach((degreeKey) => {
            degSet.add(normalizeDegree(degreeKey));
          });
        }
      });
      if (degSet.size > 0) {
        return sortDegrees(degSet);
      }
    }
  }

  // Global fallback
  return DEGREE_LIST;
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

  const norm = normalizeDegree(degreeStr);
  if (map[norm]) return map[norm];
  if (map[degreeStr]) return map[degreeStr];

  return map[Object.keys(map)[0]] || [];
}

/**
 * Gets departments for a specific university, college, and degree combination
 */
export function getDepartmentsForCollegeAndDegree(universityIdOrName, collegeIdOrName, degreeStr) {
  if (!universityIdOrName || !collegeIdOrName || universityIdOrName === "others" || collegeIdOrName === "others") {
    return getDepartmentsForDegree(degreeStr);
  }

  const univKey = findUniversityKey(universityIdOrName);
  if (!univKey) return getDepartmentsForDegree(degreeStr);

  const collegeKey = findCollegeKey(univKey, collegeIdOrName);
  if (!collegeKey) return getDepartmentsForDegree(degreeStr);

  const collegeObj = universitiesData[univKey]?.colleges?.[collegeKey];
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

/**
 * Dynamically builds department groups strictly for selected degrees (used in admin internship create/edit forms)
 */
export function getDepartmentGroupsForDegrees(selectedDegrees) {
  if (!selectedDegrees || (Array.isArray(selectedDegrees) && selectedDegrees.length === 0)) {
    return DEPARTMENT_GROUPS;
  }

  const degreesArr = Array.isArray(selectedDegrees) ? selectedDegrees : [selectedDegrees];
  const normalizedDegrees = degreesArr.map((d) => normalizeDegree(d));

  const groups = {};

  if (normalizedDegrees.includes("B.Tech") || normalizedDegrees.includes("Diploma")) {
    const map = buildDegreeDepartmentMap();
    const engDepts = Array.from(
      new Set([
        ...(normalizedDegrees.includes("B.Tech") ? map["B.Tech"] || [] : []),
        ...(normalizedDegrees.includes("Diploma") ? map["Diploma"] || [] : []),
      ])
    ).sort();
    if (engDepts.length > 0) {
      groups["Engineering (B.Tech / Diploma)"] = engDepts;
    }
  }

  if (normalizedDegrees.includes("BCA") && DEPARTMENT_GROUPS["Computer Applications (BCA)"]) {
    groups["Computer Applications (BCA)"] = DEPARTMENT_GROUPS["Computer Applications (BCA)"];
  }

  if (normalizedDegrees.includes("MCA") && DEPARTMENT_GROUPS["Computer Applications (MCA)"]) {
    groups["Computer Applications (MCA)"] = DEPARTMENT_GROUPS["Computer Applications (MCA)"];
  }

  if (normalizedDegrees.includes("BBA") && DEPARTMENT_GROUPS["Management & Business Administration (BBA)"]) {
    groups["Management & Business Administration (BBA)"] = DEPARTMENT_GROUPS["Management & Business Administration (BBA)"];
  }

  if (normalizedDegrees.includes("BSc") && DEPARTMENT_GROUPS["Pure & Applied Sciences (BSc)"]) {
    groups["Pure & Applied Sciences (BSc)"] = DEPARTMENT_GROUPS["Pure & Applied Sciences (BSc)"];
  }

  if (normalizedDegrees.includes("BA") && DEPARTMENT_GROUPS["Arts & Humanities (BA)"]) {
    groups["Arts & Humanities (BA)"] = DEPARTMENT_GROUPS["Arts & Humanities (BA)"];
  }

  if (normalizedDegrees.includes("BCom") && DEPARTMENT_GROUPS["Commerce (BCom)"]) {
    groups["Commerce (BCom)"] = DEPARTMENT_GROUPS["Commerce (BCom)"];
  }

  if (normalizedDegrees.includes("Education") && DEPARTMENT_GROUPS["Education"]) {
    groups["Education"] = DEPARTMENT_GROUPS["Education"];
  }

  if (normalizedDegrees.includes("Law") && DEPARTMENT_GROUPS["Law"]) {
    groups["Law"] = DEPARTMENT_GROUPS["Law"];
  }

  // Include any other custom degrees selected
  normalizedDegrees.forEach((normDeg) => {
    if (!["B.Tech", "Diploma", "BCA", "MCA", "BBA", "BA", "BSc", "BCom", "Education", "Law"].includes(normDeg)) {
      const depts = getDepartmentsForDegree(normDeg);
      if (depts.length > 0) {
        groups[normDeg] = depts;
      }
    }
  });

  return Object.keys(groups).length > 0 ? groups : DEPARTMENT_GROUPS;
}
