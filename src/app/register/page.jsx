"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// University, College and Department Data
const universitiesData = {
  "sbte-polytechnic": {
    name: "SBTE Bihar Board (Polytechnic College)",
    colleges: {
      "gpt-patna": {
        name: "Government Polytechnic, Patna-13 (Gulzarbagh)",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      ngp: {
        name: "New Government Polytechnic (NGP), Patna",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-muzaffarpur": {
        name: "Government Polytechnic, Muzaffarpur",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-bhagalpur": {
        name: "Government Polytechnic, Bhagalpur",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-gaya": {
        name: "Government Polytechnic, Gaya",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-chapra": {
        name: "Government Polytechnic, Chapra",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-darbhanga": {
        name: "Government Polytechnic, Darbhanga",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-purnia": {
        name: "Government Polytechnic, Purnia",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-saharsa": {
        name: "Government Polytechnic, Saharsa",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-katihar": {
        name: "Government Polytechnic, Katihar",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-madhubani": {
        name: "Government Polytechnic, Madhubani",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-munger": {
        name: "Government Polytechnic, Munger",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-sitamarhi": {
        name: "Government Polytechnic, Sitamarhi",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-jamui": {
        name: "Government Polytechnic, Jamui",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-kishanganj": {
        name: "Government Polytechnic, Kishanganj",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-lakhisarai": {
        name: "Government Polytechnic, Lakhisarai",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-aurangabad": {
        name: "Government Polytechnic, Aurangabad",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-gopalganj": {
        name: "Government Polytechnic, Gopalganj",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-buxar": {
        name: "Government Polytechnic, Buxar",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-jehanabad": {
        name: "Government Polytechnic, Jehanabad",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-khagaria": {
        name: "Government Polytechnic, Khagaria",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-sheohar": {
        name: "Government Polytechnic, Sheohar",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-araria": {
        name: "Government Polytechnic, Araria",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-banka": {
        name: "Government Polytechnic, Banka",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-begusarai": {
        name: "Government Polytechnic, Begusarai",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-kaimur": {
        name: "Kaimur Government Polytechnic",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-motihari": {
        name: "Motihari (Champaran) Government Polytechnic",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-vaishali": {
        name: "Vaishali Government Polytechnic",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gpt-siwan": {
        name: "Siwan Government Polytechnic",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "lnjpit-chapra": {
        name: "Lok Nayak Jai Prakash Institute of Technology (LNJPIT), Chapra",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gwp-patna": {
        name: "Government Women's Polytechnic, Patna",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gwp-muzaffarpur": {
        name: "Government Women's Polytechnic, Muzaffarpur",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gwp-gaya": {
        name: "Government Women's Polytechnic, Gaya",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gwp-darbhanga": {
        name: "Government Women's Polytechnic, Darbhanga",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "mp-purnia": {
        name: "Millia Polytechnic, Purnia",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "bit-gaya": {
        name: "Buddha Institute of Technology (BIT), Gaya",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "sit-aurangabad": {
        name: "Sityog Institute of Technology, Aurangabad",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "crk-hajipur": {
        name: "C.R.K. Polytechnic, Hajipur",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "nsit-patna": {
        name: "Netaji Subhas Institute of Technology (NSIT), Patna",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "hit-patna": {
        name: "Himalaya Institute of Technology (HIT), Patna",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gmcp-nalanda": {
        name: "Ganga Memorial College of Polytechnic, Nalanda",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "fsrp-madhubani": {
        name: "SF Sri Ram Polytechnic, Madhubani",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "acet-kishanganj": {
        name: "Azmet College of Engineering and Technology, Kishanganj",
        departments: {
          "Diploma": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
    },
  },
  "bihar-engineering": {
    name: "Bihar Engineering University",
    colleges: {
      mit: {
        name: "MIT - Muzaffarpur Institute of Technology",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      bce: {
        name: "BCE - Bhagalpur College of Engineering",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      dce: {
        name: "DCE - Darbhanga College of Engineering",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      gce: {
        name: "Gaya College of Engineering",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      nce: {
        name: "Nalanda College of Engineering",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      mce: {
        name: "MCE - Motihari College of Engineering",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      lnjpit: {
        name: "LNJPIT - Loknayak Jai Prakash Institute of Technology",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      rrsdce: {
        name: "RRSDCE - Rashtrakavi Ramdhari Singh Dinkar College of Engineering, Begusarai",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      kec: {
        name: "Katihar Engineering College",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      pce: {
        name: "PCE - Purnea College of Engineering",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "sce-supaul": {
        name: "SCE - Supaul College of Engineering",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      sit: {
        name: "Sitamarhi Institute of Technology",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "bce-bakhtiyarpur": {
        name: "Bakhtiyarpur College of Engineering",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      bpmce: {
        name: "B.P. Mandal College of Engineering, Madhepura",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "sec-sasaram": {
        name: "SEC - Shershah Engineering College, Sasaram",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "sec-saharsa": {
        name: "SEC - Saharsa Engineering College, Saharsa",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-vaishali": {
        name: "GEC - Government Engineering College, Vaishali",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-jamui": {
        name: "GEC - Government Engineering College, Jamui",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-banka": {
        name: "GEC - Government Engineering College, Banka",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-nawada": {
        name: "GEC - Government Engineering College, Nawada",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-kishanganj": {
        name: "GEC - Government Engineering College, Kishanganj",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      spnrec: {
        name: "Shri Phanishwar Nath Renu Engineering College, Araria",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-munger": {
        name: "GEC - Government Engineering College, Munger",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-sheohar": {
        name: "GEC - Government Engineering College, Sheohar",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-champaran": {
        name: "GEC - Government Engineering College, West Champaran",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-aurangabad": {
        name: "GEC - Government Engineering College, Aurangabad",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-kaimur": {
        name: "GEC - Government Engineering College, Kaimur",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-gopalganj": {
        name: "GEC - Government Engineering College, Gopalganj",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-madhubani": {
        name: "GEC - Government Engineering College, Madhubani",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-siwan": {
        name: "GEC - Government Engineering College, Siwan",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-jehanabad": {
        name: "GEC - Government Engineering College, Jehanabad",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-arwal": {
        name: "GEC - Government Engineering College, Arwal",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-khagaria": {
        name: "GEC - Government Engineering College, Khagaria",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-buxar": {
        name: "GEC - Government Engineering College, Buxar",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-bhojpur": {
        name: "GEC - Government Engineering College, Bhojpur",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-sheikhpura": {
        name: "GEC - Government Engineering College, Sheikhpura",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      "gec-samastipur": {
        name: "GEC - Government Engineering College, Samastipur",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
      bitp: {
        name: "Birla Institute of Technology, Patna",
        departments: {
          "B.Tech": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Electronics & Communication",
            "Computer Science & Engineering",
            "Chemical Engineering",
          ]
        },
      },
    },
  },
  "bhupendra-narayan": {
    name: "Bhupendra Narayan Mandal University, Madhepura",
    colleges: {
      adarsh: {
        name: "Adarsh College, Ghairh Jiwachpur Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "bss-chandrakanta": {
        name: "B S S Chandrakanta College, Ranjanapuri, Uda Kishunganj Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      bsrk: {
        name: "B.S.R.K. College, Singheshwar Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "bnm-vaijya": {
        name: "Bhupendra Narayan Mandal Vanijya Mahavidyalaya, Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "cm-science": {
        name: "C. M. Science Degree College, Ward No.-01 Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "deo-nandini": {
        name: "Deo Nandini Degree College, Bakhri Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "evening-college": {
        name: "Evening College, Ward No-02, Kaushalya Gram Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "harihar-saha": {
        name: "Harihar Saha College, NH-106, Udakishungunj Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "kb-womens": {
        name: "K.B. Womens College Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "kamla-rana": {
        name: "Kamla Rana Science College, Prashant Nagar, Puraini Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      kamleshwari: {
        name: "Kamleshwari Prasad College, NH-107, Murliganj Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "madhepura-college": {
        name: "Madhepura College, Kaushalya Gram Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "mohan-shakuntala": {
        name: "Mohan Shakuntala Teacher's Training College, University Chowk Madhepura",
        departments: {
          "Education": ["General Teacher Training"]
        },
      },
      "parwati-science": {
        name: "Parwati Science College, Kiritinagar, Ward No.-04 Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      rpm: {
        name: "Rpm College, Tuniyahi Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "sant-awadh": {
        name: "Sant Awadh Kiriti Narayan Degree College, Kiriti Nagar, Ward No-04 Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "shivnandan-prasad": {
        name: "Shivnandan Prasad Mandal Law College, Ward No-20 Madhepura",
        departments: {
          "Law": ["Civil Law", "Criminal Law", "Corporate Law"]
        },
      },
      "scb-education": {
        name: "Subhash Chandra Bose College Of Education, Israin Khurd, Kumarkhand Madhepura",
        departments: {
          "Education": ["General Teacher Training"]
        },
      },
      "thakur-prasad": {
        name: "Thakur Prasad College, College Chowk Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      uvk: {
        name: "U V K College, Karama, PO-Bhagipur, Puraini Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "womens-college": {
        name: "Women's College, Ward No-02, Kaushalya Gram Madhepura",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
    },
  },
  "saharsa-university": {
    name: "Saharsa District Universities",
    colleges: {
      "banwari-shankar": {
        name: "Banwari Shankar College, Simraha Saharsa",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "east-west-ttc": {
        name: "East N West Teachers Training College, Sahmoura Colony, Patuaha Saharsa",
        departments: {
          "Education": ["General Teacher Training"]
        },
      },
      "evening-saharsa": {
        name: "Evening College Saharsa, By Pass Road, Tiwari Tola Saharsa",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "lahtan-choudhary": {
        name: "Lahtan Choudhary College Pastwar, Baluaha, Mahishi Saharsa",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "laxmi-nath": {
        name: "Laxmi Nath College, PO-Bangaon Saharsa",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "maharaja-hariballav": {
        name: "Maharaja Hariballav Memorial College, SH-59, Soha Sonbarsa Raj Saharsa",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "manohar-lal": {
        name: "Manohar Lal Tekriwal College, Purab Bazaar Saharsa",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
      "rmm-law": {
        name: "R.M.M. Law College, Purab Bazar Saharsa",
        departments: {
          "Law": ["Civil Law", "Criminal Law", "Corporate Law"]
        },
      },
      "rajendra-mishra": {
        name: "Rajendra Mishra College, By Pass Road, Tiwari Tola Saharsa",
        departments: {
          "BA": ["Humanities", "Social Sciences", "Languages", "Arts & Media", "Vocational/Applied"],
          "BSc": ["Physics", "Chemistry", "Mathematics", "Statistics", "Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Computer Science", "Data Science", "Agriculture", "Nursing", "Forensic Science"],
          "BCom": ["Accounting & Finance", "Business Administration", "Banking & Insurance", "Taxation", "Economics", "Sales & Marketing", "Computer Applications"]
        },
      },
    },
  },
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dbInternships, setDbInternships] = useState([]);
  const [isLoadingInternships, setIsLoadingInternships] = useState(true);

  const [purchaseType, setPurchaseType] = useState("internship");
  const [itemId, setItemId] = useState(null);
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get("type") || "internship";
    const id = searchParams.get("id");
    
    setPurchaseType(type);
    setItemId(id);
    
    if (type === "course" && id) {
      fetch(`/api/course?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setSelectedItemDetails(data.data);
            setFormData((prev) => ({
              ...prev,
              internshipDomain: data.data.domain || "",
              mode: "online",
            }));
          }
        })
        .catch((err) => console.error("Error fetching course:", err));
    } else if (type === "internship" && id) {
      fetch(`/api/internship?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setSelectedItemDetails(data.data);
            setFormData((prev) => ({
              ...prev,
              internshipDomain: data.data.domain || "",
              mode: data.data.mode?.toLowerCase() || "",
            }));
          }
        })
        .catch((err) => console.error("Error fetching internship:", err));
    }
  }, []);

  useEffect(() => {
    async function fetchDbInternships() {
      try {
        const res = await fetch("/api/internship");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setDbInternships(data.data);
        }
      } catch (err) {
        console.error("Error fetching internships:", err);
      } finally {
        setIsLoadingInternships(false);
      }
    }
    fetchDbInternships();
  }, []);

  const getPayableAmount = () => {
    if (purchaseType === "course") {
      return selectedItemDetails?.price || 0;
    }
    if (selectedItemDetails) {
      return selectedItemDetails.RegistrationFee?.amount || 500;
    }
    if (formData.internshipDomain) {
      const matched = dbInternships.find(
        (item) => item.domain === formData.internshipDomain || item.category === formData.internshipDomain
      );
      return matched?.RegistrationFee?.amount || 500;
    }
    return 500;
  };

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    parentName: "",
    // Academic Info
    university: "",
    college: "",
    degree: "",
    department: "",
    subject: "",
    semester: "",
    session: "",
    registrationNumber: "",
    internshipDomain: "",
    mode: "",
    // Security
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [completedPaymentDetails, setCompletedPaymentDetails] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Email Verification states
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    setOtpError("");
    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email is required to send OTP" }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        setOtpCooldown(60);
        alert(data.message || "OTP sent successfully!");
        if (data.otp) {
          console.log(`[DEV ONLY] OTP Code: ${data.otp}`);
        }
      } else {
        setOtpError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Failed to request OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError("");
    if (otpInput.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code");
      return;
    }

    setOtpVerifyLoading(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsEmailVerified(true);
        setOtpSent(false);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      } else {
        setOtpError(data.error || "Invalid OTP code.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Verification failed. Please try again.");
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  const totalSteps = 4;
  const stepTitles = ["Personal", "Academic", "Security & Payments","Register"];

  const handlePayFee = async () => {
    setIsLoading(true);
    try {
      let finalItemId = itemId;
      if (!finalItemId && purchaseType === "internship" && formData.internshipDomain) {
        const matched = dbInternships.find(
          (item) => item.domain === formData.internshipDomain || item.category === formData.internshipDomain
        );
        finalItemId = matched?._id;
      }

      const payableAmount = getPayableAmount();

      const resOrder = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: purchaseType, itemId: finalItemId }),
      });

      const orderData = await resOrder.json();
      if (!resOrder.ok) {
        throw new Error(orderData.error || "Failed to initiate payment");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Please check your internet connection.");
        setIsLoading(false);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: "KpInterns",
        description: `Payment for ${orderData.title}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          const paymentInfo = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            type: purchaseType,
            itemId: finalItemId,
            amount: payableAmount,
          };
          setCompletedPaymentDetails(paymentInfo);
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.payment;
            return newErrors;
          });
          alert("Payment successful! You can now proceed to the next step.");
          setIsLoading(false);
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.message || "An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (["university", "college", "degree", "internshipDomain"].includes(name)) {
      setCompletedPaymentDetails(null);
    }

    if (name === "university") {
      // Reset college and department when university changes
      setFormData((prev) => ({
        ...prev,
        university: value,
        college: "",
        department: "",
      }));
    } else if (name === "college") {
      // Reset department when college changes
      setFormData((prev) => ({
        ...prev,
        college: value,
        department: "",
      }));
    } else if (name === "degree") {
      // Reset internship domain when degree changes (since domains differ by tech/non-tech)
      setFormData((prev) => ({
        ...prev,
        degree: value,
        internshipDomain: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Get available colleges for selected university
  const getAvailableColleges = () => {
    if (!formData.university) return [];
    const universityData = universitiesData[formData.university];
    if (!universityData) return [];
    return Object.entries(universityData.colleges).map(([key, college]) => ({
      id: key,
      name: college.name,
    }));
  };

  // Get available departments for selected college
  const getAvailableDepartments = () => {
    if (!formData.university || !formData.college || !formData.degree) return [];
    const universityData = universitiesData[formData.university];
    if (!universityData) return [];
    const collegeData = universityData.colleges[formData.college];
    if (!collegeData) return [];
    
    let degreeKey = formData.degree;
    if (degreeKey === "Bcom") degreeKey = "BCom";
    if (degreeKey === "Bsc") degreeKey = "BSc";
    
    const depts = collegeData.departments?.[degreeKey];
    return Array.isArray(depts) ? depts : [];
  };

  // Get available semesters count based on degree
  const getAvailableSemestersCount = () => {
    // Diploma: 6 semesters (3 years)
    // B.Tech: 8 semesters (4 years)
    // Bachelor (BA/BSc/BCom - Non-Tech): 6 semesters (3 years)
    // Master (MA/MSc/MCom - Non-Tech): 4 semesters (2 years)
    if (!formData.degree) return 0;

    if (formData.degree === "Diploma") {
      return 6; // 3-year diploma program
    } else if (formData.degree === "B.Tech") {
      return 8; // 4-year B.Tech program
    } else if (["Bachelor", "BA", "Bcom", "Bsc"].includes(formData.degree)) {
      return 6; // 3-year non-tech bachelor program (BA/BSc/BCom)
    } else if (formData.degree === "Master") {
      return 4; // 2-year master program (MA/MSc/MCom)
    }
    return 0;
  };

  const isMatchingDepartmentGroup = (internshipDept, studentDept, studentDegree) => {
    if (!internshipDept || !studentDept || !studentDegree) return false;

    const lowerStudentDept = studentDept.toLowerCase();
    const lowerStudentDeg = studentDegree.toLowerCase();
     
    const isStudentTech = (
      lowerStudentDeg === "b.tech" || 
      lowerStudentDeg === "diploma" || 
      lowerStudentDept.includes("computer") || 
      lowerStudentDept.includes("cs") || 
      lowerStudentDept.includes("it") || 
      lowerStudentDept.includes("software") || 
      lowerStudentDept.includes("electronics") || 
      lowerStudentDept.includes("bca")
    );

    const isStudentBusiness = (
      lowerStudentDeg === "ba" ||
      lowerStudentDeg === "bcom" ||
      lowerStudentDeg === "bsc" ||
      lowerStudentDept.includes("commerce") || 
      lowerStudentDept.includes("bcom") || 
      lowerStudentDept.includes("bba") || 
      lowerStudentDept.includes("business") || 
      lowerStudentDept.includes("management")
    );

    const techDepts = ["BTech", "BCA","Diploma"];
    const businessDepts = ["BA", "BCom","Bsc"];

    if (isStudentTech) {
      return techDepts.includes(internshipDept);
    }
    if (isStudentBusiness) {
      return businessDepts.includes(internshipDept);
    }
    // Else General (BA, Bsc, Other)
    return !techDepts.includes(internshipDept) && !businessDepts.includes(internshipDept);
  };

  // Get available internship domains based on degree type and database availability
  const getAvailableInternshipDomains = () => {
    if (!formData.department || !formData.degree) return [];

    // Filter the dbInternships by matching department group
    const matchingInternships = dbInternships.filter(item => 
      (item.status === "Active" || item.status === "Published") &&
      isMatchingDepartmentGroup(item.department, formData.department, formData.degree)
    );

    // Extract unique domains
    const domains = matchingInternships.map(item => item.domain || item.category).filter(Boolean);
    return [...new Set(domains)];
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim())
        newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      } else if (!isEmailVerified) {
        newErrors.email = "Please verify your email address using OTP.";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(formData.phone.trim())) {
        newErrors.phone = "Phone number must be exactly 10 digits";
      }
      if (!formData.gender) newErrors.gender = "Please select gender";
      if (!formData.parentName.trim())
        newErrors.parentName = "Parent name is required";
    } else if (step === 2) {
      if (!formData.university) newErrors.university = "University is required";
      if (!formData.college) newErrors.college = "College is required";
      if (!formData.degree) newErrors.degree = "Degree is required";
      if (!formData.department) newErrors.department = "Department is required";
      if (!formData.semester) newErrors.semester = "Semester is required";
      if (!formData.session) newErrors.session = "Session is required";
      if (!formData.registrationNumber.trim())
        newErrors.registrationNumber = "Registration number is required";
      
      if (purchaseType !== "course") {
        if (!formData.internshipDomain)
          newErrors.internshipDomain = "Internship domain is required";
        if (!formData.mode) newErrors.mode = "Mode is required";
      }
    } else if (step === 3) {
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
      
      const payableAmount = getPayableAmount();
      if (payableAmount > 0 && !completedPaymentDetails) {
        newErrors.payment = "Please complete the registration fee payment to proceed.";
      }
    } else if (step === 4) {
      if (!formData.agreeTerms)
        newErrors.agreeTerms = "You must agree to terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep()) {
      setIsLoading(true);
      try {
        let finalItemId = itemId;
        if (!finalItemId && purchaseType === "internship" && formData.internshipDomain) {
          const matched = dbInternships.find(
            (item) => item.domain === formData.internshipDomain || item.category === formData.internshipDomain
          );
          finalItemId = matched?._id;
        }

        const payableAmount = getPayableAmount();

        const hasValidExistingPayment = 
          completedPaymentDetails &&
          completedPaymentDetails.type === purchaseType &&
          completedPaymentDetails.itemId === finalItemId &&
          completedPaymentDetails.amount === payableAmount;

        if (payableAmount > 0 && !hasValidExistingPayment) {
          alert("Payment is required to complete registration. Please complete payment first.");
          setStep(3);
          setIsLoading(false);
          return;
        }

        // Register directly
        const userPayload = {
          ...formData,
          courseId: purchaseType === "course" ? finalItemId : undefined,
          internshipId: purchaseType === "internship" ? finalItemId : undefined,
          paymentDetails: hasValidExistingPayment ? completedPaymentDetails : undefined,
        };

        const response = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userPayload),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Registration successful! Redirecting to login...");
          router.push("/login");
        } else {
          alert(data.error || "Registration failed. Please check your details.");
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert(error.message || "An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-main via-bg-main to-bg-main dark:from-bg-card-900 dark:via-blue-50-900 dark:to-bg-main-800 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="text-xl font-extrabold tracking-tight text-text-main mb-4">
            <span className="text-bg-main bg-text-main rounded-full p-2">
              Kp
            </span>
            <span className="text-brand-primary">Interns</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-text-main mb-3 font-poppins">
            Student Registration
          </h1>
          <p className="text-lg text-text-muted">
            Complete your registration for the UGC-mandated internship program
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    index + 1 <= step
                      ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg"
                      : "bg-bg-card border-2 border-border-main text-text-muted"
                  }`}
                >
                  {index + 1 < step ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-semibold transition-colors ${index + 1 <= step ? "text-brand-primary" : "text-text-muted"}`}
                >
                  {title}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Line */}
          <div className="h-1 bg-border-main rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-500"
              style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-bg-card rounded-3xl shadow-xl p-8 sm:p-12 border border-border-main backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-main mb-8">
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.fullName
                          ? "border-red-500"
                          : "border-border-main"
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.gender ? "border-red-500" : "border-border-main"
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Email Address *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isEmailVerified}
                        placeholder="you@example.com"
                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                          errors.email ? "border-red-500" : "border-border-main"
                        } ${isEmailVerified ? "opacity-60 cursor-not-allowed bg-emerald-500/5 border-emerald-500/30" : ""}`}
                      />
                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpLoading || otpCooldown > 0}
                          className="px-4 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-semibold font-poppins text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[110px]"
                        >
                          {otpLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : otpCooldown > 0 ? (
                            `Resend in ${otpCooldown}s`
                          ) : (
                            "Send OTP"
                          )}
                        </button>
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                    {isEmailVerified && (
                      <p className="text-brand-success text-xs mt-1 flex items-center gap-1 font-semibold">
                        <span>✓</span> Email verified successfully!
                      </p>
                    )}
                  </div>

                  {otpSent && !isEmailVerified && (
                    <div className="sm:col-span-2 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-5 animate-fade-in space-y-3">
                      <label className="block text-sm font-semibold text-text-main">
                        Enter Verification Code *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter 6-digit OTP"
                          className="flex-1 px-4 py-3 rounded-xl border-2 border-border-main focus:outline-none focus:border-brand-primary bg-bg-main font-mono text-center tracking-widest text-lg font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpInput.length !== 6 || otpVerifyLoading}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold font-poppins text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {otpVerifyLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "Verify Code"
                          )}
                        </button>
                      </div>
                      {otpError && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {otpError}
                        </p>
                      )}
                      <p className="text-text-muted text-[11px] font-poppins">
                        An OTP code was sent to <span className="font-semibold text-text-main">{formData.email}</span>. Please check your inbox or spam folder.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.phone ? "border-red-500" : "border-border-main"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Parent/Guardian Name *
                    </label>
                    <input
                      type="text"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      placeholder="Enter parent/guardian name"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.parentName
                          ? "border-red-500"
                          : "border-border-main"
                      }`}
                    />
                    {errors.parentName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.parentName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Academic Information */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-main mb-8">
                  Academic Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      University *
                    </label>
                    <select
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.university
                          ? "border-red-500"
                          : "border-border-main"
                      }`}
                    >
                      <option value="">Select University</option>
                      {Object.entries(universitiesData).map(
                        ([key, university]) => (
                          <option key={key} value={key}>
                            {university.name}
                          </option>
                        ),
                      )}
                    </select>
                    {errors.university && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.university}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      College *
                    </label>
                    <select
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      disabled={!formData.university}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.college ? "border-red-500" : "border-border-main"
                      } ${!formData.university ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="">
                        {formData.university
                          ? "Select College"
                          : "Select University first"}
                      </option>
                      {getAvailableColleges().map((college) => (
                        <option key={college.id} value={college.id}>
                          {college.name}
                        </option>
                      ))}
                    </select>
                    {errors.college && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.college}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Degree *
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["Diploma", "B.Tech", "BA", "Bcom","Bsc"].map(
                        (degree) => (
                          <label
                            key={degree}
                            className="flex items-center cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="degree"
                              value={degree}
                              checked={formData.degree === degree}
                              onChange={handleInputChange}
                              className="w-4 h-4 accent-brand-primary cursor-pointer"
                            />
                            <span className="ml-2 text-sm font-medium text-text-main">
                              {degree}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                    {errors.degree && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.degree}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={!formData.college}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.department
                          ? "border-red-500"
                          : "border-border-main"
                      } ${!formData.college ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="">
                        {formData.college
                          ? "Select Department"
                          : "Select College first"}
                      </option>
                      {getAvailableDepartments().map((dept, index) => (
                        <option key={index} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.department}
                      </p>
                    )}
                  </div>

                  {/* Dynamically Generated Semester Options */}
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Semester *
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      disabled={!formData.university || !formData.degree}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.semester
                          ? "border-red-500"
                          : "border-border-main"
                      } ${!formData.university || !formData.degree ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="">
                        {formData.university && formData.degree
                          ? "Select Semester"
                          : "Select University & Degree first"}
                      </option>
                      {formData.university &&
                        Array.from(
                          { length: getAvailableSemestersCount() },
                          (_, i) => i + 1,
                        ).map((sem) => {
                          // Appends correct ordinal suffix (1st, 2nd, 3rd, 4th...)
                          const suffix =
                            sem === 1
                              ? "st"
                              : sem === 2
                                ? "nd"
                                : sem === 3
                                  ? "rd"
                                  : "th";
                          return (
                            <option key={sem} value={sem}>
                              {sem}
                              {suffix} Semester
                            </option>
                          );
                        })}
                    </select>
                    {errors.semester && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.semester}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Session *
                    </label>
                    <select
                      name="session"
                      value={formData.session}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.session ? "border-red-500" : "border-border-main"
                      }`}
                    >
                      <option value="">Select Session</option>
                      <option value="2024-25">2024-25</option>
                      <option value="2025-26">2025-26</option>
                    </select>
                    {errors.session && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.session}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      placeholder="Enter registration number"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.registrationNumber
                          ? "border-red-500"
                          : "border-border-main"
                      }`}
                    />
                    {errors.registrationNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.registrationNumber}
                      </p>
                    )}
                  </div>

                  {purchaseType === "course" ? (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-text-main mb-2">
                        Selected Course
                      </label>
                      <div className="w-full px-4 py-3 rounded-xl border-2 border-border-main bg-bg-main font-poppins font-medium text-brand-primary">
                        📚 {selectedItemDetails?.title || "Loading course..."}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">
                          Internship Domain *
                        </label>
                        <select
                          name="internshipDomain"
                          value={formData.internshipDomain}
                          onChange={handleInputChange}
                          disabled={!formData.degree || !formData.department || isLoadingInternships || getAvailableInternshipDomains().length === 0}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                            errors.internshipDomain
                              ? "border-red-500"
                              : "border-border-main"
                          } ${(!formData.degree || !formData.department || isLoadingInternships || getAvailableInternshipDomains().length === 0) ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <option value="">
                            {isLoadingInternships
                              ? "Loading available internships..."
                              : !formData.degree
                                ? "Select Degree first"
                                : !formData.department
                                  ? "Select Department first"
                                  : getAvailableInternshipDomains().length === 0
                                    ? "Internship domain is coming soon"
                                    : "Select Internship Domain"}
                          </option>
                          {getAvailableInternshipDomains().map((domain) => (
                            <option key={domain} value={domain}>
                              {domain}
                            </option>
                          ))}
                        </select>
                        {formData.degree && formData.department && !isLoadingInternships && getAvailableInternshipDomains().length === 0 && (
                          <p className="text-amber-500 text-xs mt-2 font-semibold">
                            ⚠️ Internship domain is coming soon for this stream!
                          </p>
                        )}
                        {errors.internshipDomain && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.internshipDomain}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">
                          Mode *
                        </label>
                        <select
                          name="mode"
                          value={formData.mode}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                            errors.mode ? "border-red-500" : "border-border-main"
                          }`}
                        >
                          <option value="">Select Mode</option>
                          <option value="online">Online</option>
                          <option value="offline">Offline</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                        {errors.mode && (
                          <p className="text-red-500 text-xs mt-1">{errors.mode}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            {/* Step 3: Security & Payments */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-main mb-8">
                  Security & Payments
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-border-main/50">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-text-main mb-2">
                     Create Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a strong password"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                          errors.password
                            ? "border-red-500"
                            : "border-border-main"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3 text-text-muted hover:text-text-main"
                      >
                        {showPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-border-main"
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payments Block */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-main font-poppins">
                    Registration Fee Payment
                  </h3>

                  {getPayableAmount() > 0 ? (
                    <div className="bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 border border-border-main rounded-2xl p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <span className="text-xs text-text-muted uppercase tracking-wider font-semibold block mb-1">Total Payable</span>
                          <span className="text-3xl font-extrabold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent font-poppins">
                            ₹{getPayableAmount()}
                          </span>
                        </div>

                        {completedPaymentDetails ? (
                          <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2">
                            <span>✅</span>
                            <div>
                              <span>Payment Successful</span>
                              <span className="block text-[10px] font-mono text-text-muted mt-0.5 select-all">Ref ID: {completedPaymentDetails.razorpay_payment_id}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handlePayFee}
                            disabled={isLoading}
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/95 hover:to-brand-secondary/95 text-white font-bold rounded-xl shadow-lg hover:shadow-brand-primary/25 active:scale-95 transition-all text-sm font-poppins"
                          >
                            Pay Registration Fee (₹{getPayableAmount()})
                          </button>
                        )}
                      </div>

                      {errors.payment && (
                        <p className="text-red-500 text-xs mt-3 font-semibold">
                          ⚠️ {errors.payment}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-3">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block">No Payment Required</span>
                        <span className="text-text-muted text-sm">This internship/course registration is free. You can proceed directly.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Register & Review */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-main mb-6">
                  Review & Register
                </h2>
                <p className="text-text-muted text-sm mb-6">
                  Please review your details carefully before completing registration.
                </p>

                {/* Summary Details Grid */}
                <div className="bg-bg-main border border-border-main rounded-2xl p-6 space-y-4 text-sm font-poppins">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div>
                      <span className="text-text-muted text-xs block">Full Name</span>
                      <span className="text-text-main font-semibold">{formData.fullName}</span>
                    </div>
                    <div>
                      <span className="text-text-muted text-xs block">Email</span>
                      <span className="text-text-main font-semibold break-all">{formData.email}</span>
                    </div>
                    <div>
                      <span className="text-text-muted text-xs block">Phone</span>
                      <span className="text-text-main font-semibold">{formData.phone}</span>
                    </div>
                    <div>
                      <span className="text-text-muted text-xs block">Parent's Name</span>
                      <span className="text-text-main font-semibold">{formData.parentName}</span>
                    </div>
                    <div className="col-span-2 border-t border-border-main/50 my-1"></div>
                    <div>
                      <span className="text-text-muted text-xs block">College</span>
                      <span className="text-text-main font-semibold">{formData.college}</span>
                    </div>
                    <div>
                      <span className="text-text-muted text-xs block">Degree & Dept</span>
                      <span className="text-text-main font-semibold">{formData.degree} ({formData.department})</span>
                    </div>
                    <div>
                      <span className="text-text-muted text-xs block">Reg No / Sem</span>
                      <span className="text-text-main font-semibold">{formData.registrationNumber} (Sem {formData.semester})</span>
                    </div>
                    <div>
                      <span className="text-text-muted text-xs block">{purchaseType === "course" ? "Selected Course" : "Internship Domain"}</span>
                      <span className="text-brand-primary font-bold">
                        {purchaseType === "course" 
                          ? (selectedItemDetails?.title || "Selected Course")
                          : `${formData.internshipDomain} (${formData.mode})`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Status Summary */}
                {getPayableAmount() > 0 && completedPaymentDetails && (
                  <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-sm">✅ Payment Verified</span>
                      <span className="text-text-muted font-mono text-[10px] select-all">Ref: {completedPaymentDetails.razorpay_payment_id}</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{getPayableAmount()}</span>
                  </div>
                )}

                {/* Terms Checkbox */}
                <label className="flex items-start cursor-pointer p-4 rounded-xl border-2 border-border-main hover:border-brand-primary transition-colors group">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded accent-brand-primary cursor-pointer mt-1 flex-shrink-0"
                  />
                  <span className="ml-3 text-sm text-text-muted group-hover:text-text-main transition-colors">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-brand-primary hover:underline font-semibold"
                    >
                      Terms & Privacy Policy
                    </Link>{" "}
                    and internship terms.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-red-500 text-xs">{errors.agreeTerms}</p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-8 border-t border-border-main">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-border-main text-text-main font-semibold hover:border-brand-primary hover:bg-bg-main transition-all hover:shadow-md"
                >
                  ← Back
                </button>
              )}
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:shadow-lg hover:shadow-brand-primary/30 transition-all transform hover:scale-105"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:shadow-lg hover:shadow-brand-primary/30 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Registering...</span>
                    </div>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              )}
            </div>

            {/* Login Link */}
            <p className="text-center mt-6 text-text-muted text-sm">
              Already registered?{" "}
              <Link
                href="/login"
                className="text-brand-primary font-semibold hover:underline"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
