"use client";

import { useState } from "react";
import Link from "next/link";

// University, College and Department Data
const universitiesData = {
  "sbte-polytechnic": {
    name: "SBTE Bihar Board (Polytechnic College)",
    colleges: {
      "gpt-patna": {
        name: "Government Polytechnic, Patna-13 (Gulzarbagh)",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      ngp: {
        name: "New Government Polytechnic (NGP), Patna",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-muzaffarpur": {
        name: "Government Polytechnic, Muzaffarpur",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-bhagalpur": {
        name: "Government Polytechnic, Bhagalpur",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-gaya": {
        name: "Government Polytechnic, Gaya",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-chapra": {
        name: "Government Polytechnic, Chapra",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-darbhanga": {
        name: "Government Polytechnic, Darbhanga",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-purnia": {
        name: "Government Polytechnic, Purnia",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-saharsa": {
        name: "Government Polytechnic, Saharsa",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-katihar": {
        name: "Government Polytechnic, Katihar",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-madhubani": {
        name: "Government Polytechnic, Madhubani",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-munger": {
        name: "Government Polytechnic, Munger",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-sitamarhi": {
        name: "Government Polytechnic, Sitamarhi",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-jamui": {
        name: "Government Polytechnic, Jamui",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-kishanganj": {
        name: "Government Polytechnic, Kishanganj",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-lakhisarai": {
        name: "Government Polytechnic, Lakhisarai",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-aurangabad": {
        name: "Government Polytechnic, Aurangabad",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-gopalganj": {
        name: "Government Polytechnic, Gopalganj",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-buxar": {
        name: "Government Polytechnic, Buxar",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-jehanabad": {
        name: "Government Polytechnic, Jehanabad",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-khagaria": {
        name: "Government Polytechnic, Khagaria",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-sheohar": {
        name: "Government Polytechnic, Sheohar",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-araria": {
        name: "Government Polytechnic, Araria",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-banka": {
        name: "Government Polytechnic, Banka",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-begusarai": {
        name: "Government Polytechnic, Begusarai",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-kaimur": {
        name: "Kaimur Government Polytechnic",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-motihari": {
        name: "Motihari (Champaran) Government Polytechnic",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-vaishali": {
        name: "Vaishali Government Polytechnic",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gpt-siwan": {
        name: "Siwan Government Polytechnic",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "lnjpit-chapra": {
        name: "Lok Nayak Jai Prakash Institute of Technology (LNJPIT), Chapra",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gwp-patna": {
        name: "Government Women's Polytechnic, Patna",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gwp-muzaffarpur": {
        name: "Government Women's Polytechnic, Muzaffarpur",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gwp-gaya": {
        name: "Government Women's Polytechnic, Gaya",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gwp-darbhanga": {
        name: "Government Women's Polytechnic, Darbhanga",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "mp-purnia": {
        name: "Millia Polytechnic, Purnia",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "bit-gaya": {
        name: "Buddha Institute of Technology (BIT), Gaya",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "sit-aurangabad": {
        name: "Sityog Institute of Technology, Aurangabad",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "crk-hajipur": {
        name: "C.R.K. Polytechnic, Hajipur",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "nsit-patna": {
        name: "Netaji Subhas Institute of Technology (NSIT), Patna",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "hit-patna": {
        name: "Himalaya Institute of Technology (HIT), Patna",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gmcp-nalanda": {
        name: "Ganga Memorial College of Polytechnic, Nalanda",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "fsrp-madhubani": {
        name: "SF Sri Ram Polytechnic, Madhubani",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "acet-kishanganj": {
        name: "Azmet College of Engineering and Technology, Kishanganj",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
    },
  },
  "bihar-engineering": {
    name: "Bihar Engineering University",
    colleges: {
      mit: {
        name: "MIT - Muzaffarpur Institute of Technology",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      bce: {
        name: "BCE - Bhagalpur College of Engineering",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      dce: {
        name: "DCE - Darbhanga College of Engineering",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      gce: {
        name: "Gaya College of Engineering",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      nce: {
        name: "Nalanda College of Engineering",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      mce: {
        name: "MCE - Motihari College of Engineering",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      lnjpit: {
        name: "LNJPIT - Loknayak Jai Prakash Institute of Technology",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      rrsdce: {
        name: "RRSDCE - Rashtrakavi Ramdhari Singh Dinkar College of Engineering, Begusarai",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      kec: {
        name: "Katihar Engineering College",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      pce: {
        name: "PCE - Purnea College of Engineering",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "sce-supaul": {
        name: "SCE - Supaul College of Engineering",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      sit: {
        name: "Sitamarhi Institute of Technology",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "bce-bakhtiyarpur": {
        name: "Bakhtiyarpur College of Engineering",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      bpmce: {
        name: "B.P. Mandal College of Engineering, Madhepura",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "sec-sasaram": {
        name: "SEC - Shershah Engineering College, Sasaram",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "sec-saharsa": {
        name: "SEC - Saharsa Engineering College, Saharsa",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-vaishali": {
        name: "GEC - Government Engineering College, Vaishali",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-jamui": {
        name: "GEC - Government Engineering College, Jamui",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-banka": {
        name: "GEC - Government Engineering College, Banka",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-nawada": {
        name: "GEC - Government Engineering College, Nawada",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-kishanganj": {
        name: "GEC - Government Engineering College, Kishanganj",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      spnrec: {
        name: "Shri Phanishwar Nath Renu Engineering College, Araria",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-munger": {
        name: "GEC - Government Engineering College, Munger",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-sheohar": {
        name: "GEC - Government Engineering College, Sheohar",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-champaran": {
        name: "GEC - Government Engineering College, West Champaran",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-aurangabad": {
        name: "GEC - Government Engineering College, Aurangabad",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-kaimur": {
        name: "GEC - Government Engineering College, Kaimur",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-gopalganj": {
        name: "GEC - Government Engineering College, Gopalganj",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-madhubani": {
        name: "GEC - Government Engineering College, Madhubani",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-siwan": {
        name: "GEC - Government Engineering College, Siwan",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-jehanabad": {
        name: "GEC - Government Engineering College, Jehanabad",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-arwal": {
        name: "GEC - Government Engineering College, Arwal",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-khagaria": {
        name: "GEC - Government Engineering College, Khagaria",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-buxar": {
        name: "GEC - Government Engineering College, Buxar",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-bhojpur": {
        name: "GEC - Government Engineering College, Bhojpur",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-sheikhpura": {
        name: "GEC - Government Engineering College, Sheikhpura",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      "gec-samastipur": {
        name: "GEC - Government Engineering College, Samastipur",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
      bitp: {
        name: "Birla Institute of Technology, Patna",
        departments: [
          "Civil Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Electronics & Communication",
          "Computer Science & Engineering",
          "Chemical Engineering",
        ],
      },
    },
  },
  "bhupendra-narayan": {
    name: "Bhupendra Narayan Mandal University, Madhepura",
    colleges: {
      adarsh: {
        name: "Adarsh College, Ghairh Jiwachpur Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "bss-chandrakanta": {
        name: "B S S Chandrakanta College, Ranjanapuri, Uda Kishunganj Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      bsrk: {
        name: "B.S.R.K. College, Singheshwar Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "bnm-vaijya": {
        name: "Bhupendra Narayan Mandal Vanijya Mahavidyalaya, Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "cm-science": {
        name: "C. M. Science Degree College, Ward No.-01 Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "deo-nandini": {
        name: "Deo Nandini Degree College, Bakhri Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "evening-college": {
        name: "Evening College, Ward No-02, Kaushalya Gram Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "harihar-saha": {
        name: "Harihar Saha College, NH-106, Udakishungunj Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "kb-womens": {
        name: "K.B. Womens College Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "kamla-rana": {
        name: "Kamla Rana Science College, Prashant Nagar, Puraini Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      kamleshwari: {
        name: "Kamleshwari Prasad College, NH-107, Murliganj Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "madhepura-college": {
        name: "Madhepura College, Kaushalya Gram Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "mohan-shakuntala": {
        name: "Mohan Shakuntala Teacher's Training College, University Chowk Madhepura",
        departments: ["Education"],
      },
      "parwati-science": {
        name: "Parwati Science College, Kiritinagar, Ward No.-04 Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      rpm: {
        name: "Rpm College, Tuniyahi Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "sant-awadh": {
        name: "Sant Awadh Kiriti Narayan Degree College, Kiriti Nagar, Ward No-04 Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "shivnandan-prasad": {
        name: "Shivnandan Prasad Mandal Law College, Ward No-20 Madhepura",
        departments: ["Law"],
      },
      "scb-education": {
        name: "Subhash Chandra Bose College Of Education, Israin Khurd, Kumarkhand Madhepura",
        departments: ["Education"],
      },
      "thakur-prasad": {
        name: "Thakur Prasad College, College Chowk Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      uvk: {
        name: "U V K College, Karama, PO-Bhagipur, Puraini Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "womens-college": {
        name: "Women's College, Ward No-02, Kaushalya Gram Madhepura",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
    },
  },
  "saharsa-university": {
    name: "Saharsa District Universities",
    colleges: {
      "banwari-shankar": {
        name: "Banwari Shankar College, Simraha Saharsa",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "east-west-ttc": {
        name: "East N West Teachers Training College, Sahmoura Colony, Patuaha Saharsa",
        departments: ["Education"],
      },
      "evening-saharsa": {
        name: "Evening College Saharsa, By Pass Road, Tiwari Tola Saharsa",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "lahtan-choudhary": {
        name: "Lahtan Choudhary College Pastwar, Baluaha, Mahishi Saharsa",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "laxmi-nath": {
        name: "Laxmi Nath College, PO-Bangaon Saharsa",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "maharaja-hariballav": {
        name: "Maharaja Hariballav Memorial College, SH-59, Soha Sonbarsa Raj Saharsa",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "manohar-lal": {
        name: "Manohar Lal Tekriwal College, Purab Bazaar Saharsa",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
      "rmm-law": {
        name: "R.M.M. Law College, Purab Bazar Saharsa",
        departments: ["Law"],
      },
      "rajendra-mishra": {
        name: "Rajendra Mishra College, By Pass Road, Tiwari Tola Saharsa",
        departments: ["Arts (BA)", "Science (BSc)", "Commerce (BCom)"],
      },
    },
  },
};

export default function RegisterPage() {
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
    // Emergency Contact
    emergencyName: "",
    emergencyNumber: "",
    relationship: "",
    // Security
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const totalSteps = 4;
  const stepTitles = ["Personal", "Academic", "Emergency", "Security"];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

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
    if (!formData.university || !formData.college) return [];
    const universityData = universitiesData[formData.university];
    if (!universityData) return [];
    const collegeData = universityData.colleges[formData.college];
    if (!collegeData) return [];
    return collegeData.departments;
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
    } else if (formData.degree === "Bachelor") {
      return 6; // 3-year non-tech bachelor program (BA/BSc/BCom)
    } else if (formData.degree === "Master") {
      return 4; // 2-year master program (MA/MSc/MCom)
    }
    return 0;
  };

  // Get available internship domains based on degree type
  const getAvailableInternshipDomains = () => {
    if (!formData.degree) return [];

    // Tech domains for Diploma and B.Tech
    const techDomains = [
      "Full Stack Development",
      "Frontend Development",
      "Backend Development",
      "Mobile App Development",
      "Data Science & Machine Learning",
      "DevOps & Cloud Computing",
      "Cybersecurity",
      "IoT & Embedded Systems",
      "Artificial Intelligence",
      "Blockchain Development",
      "Game Development",
      "Web3 & Cryptocurrency",
    ];

    // Non-tech domains for Bachelor and Master
    const nonTechDomains = [
      "Finance & Accounting",
      "Human Resources",
      "Marketing & Branding",
      "Sales & Business Development",
      "Management Consulting",
      "Supply Chain Management",
      "Legal Services",
      "Public Relations",
      "Event Management",
      "Journalism & Media",
      "Tourism & Hospitality",
      "Operations Management",
    ];

    if (formData.degree === "Diploma" || formData.degree === "B.Tech") {
      return techDomains;
    } else if (formData.degree === "Bachelor" || formData.degree === "Master") {
      return nonTechDomains;
    }
    return [];
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim())
        newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Invalid email format";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
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
      if (!formData.internshipDomain)
        newErrors.internshipDomain = "Internship domain is required";
      if (!formData.mode) newErrors.mode = "Mode is required";
    } else if (step === 3) {
      if (!formData.emergencyName.trim())
        newErrors.emergencyName = "Contact person name is required";
      if (!formData.emergencyNumber.trim())
        newErrors.emergencyNumber = "Contact number is required";
      if (!formData.relationship)
        newErrors.relationship = "Relationship is required";
    } else if (step === 4) {
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      console.log("Form submitted:", formData);
      // Here you would send data to your backend
      alert("Registration submitted! Check console for form data.");
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

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.email ? "border-red-500" : "border-border-main"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

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
                      {["Diploma", "B.Tech", "Bachelor", "Master"].map(
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

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Internship Domain *
                    </label>
                    <select
                      name="internshipDomain"
                      value={formData.internshipDomain}
                      onChange={handleInputChange}
                      disabled={!formData.degree}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.internshipDomain
                          ? "border-red-500"
                          : "border-border-main"
                      } ${!formData.degree ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="">
                        {formData.degree
                          ? "Select Internship Domain"
                          : "Select Degree first"}
                      </option>
                      {getAvailableInternshipDomains().map((domain) => (
                        <option key={domain} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
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
                </div>
              </div>
            )}

            {/* Step 3: Emergency Contact */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-main mb-8">
                  Emergency Contact
                </h2>
                <p className="text-text-muted text-sm mb-6">
                  Emergency details are optional. If you fill any field,
                  complete all three.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Emergency Contact Person Name *
                    </label>
                    <input
                      type="text"
                      name="emergencyName"
                      value={formData.emergencyName}
                      onChange={handleInputChange}
                      placeholder="Enter contact person name"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.emergencyName
                          ? "border-red-500"
                          : "border-border-main"
                      }`}
                    />
                    {errors.emergencyName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.emergencyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Emergency Contact Number *
                    </label>
                    <input
                      type="tel"
                      name="emergencyNumber"
                      value={formData.emergencyNumber}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.emergencyNumber
                          ? "border-red-500"
                          : "border-border-main"
                      }`}
                    />
                    {errors.emergencyNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.emergencyNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Relationship *
                    </label>
                    <select
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.relationship
                          ? "border-red-500"
                          : "border-border-main"
                      }`}
                    >
                      <option value="">Select Relationship</option>
                      <option value="mother">Mother</option>
                      <option value="father">Father</option>
                      <option value="sibling">Sibling</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.relationship && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.relationship}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Security & Confirmation */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-main mb-8">
                  Security & Confirmation
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Password *
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

                {/* Payment Summary */}
                <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border-2 border-brand-primary/30 rounded-2xl p-6 my-8">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wide mb-4">
                    Payment Summary
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-text-main">
                      Total Payable
                    </span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                      ₹500
                    </span>
                  </div>
                </div>

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
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:shadow-lg hover:shadow-brand-primary/30 transition-all transform hover:scale-105"
                >
                  Complete Registration
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
