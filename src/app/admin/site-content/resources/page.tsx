// app/admin/resources/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  isNonEmptyString,
  isNonEmptyArray,
} from "@/lib/contentValidation";
import type { ResourceContent, MagazineItem, SummerProgram, WritingCompetitionItem } from "@/types/resources";
import { extractAssetUrlsFromResources } from "@/lib/extractAssetUrls";
import FloatingSaveBar from "@/components/admin/FloatingSaveBar";
import { compressImageClient } from "@/lib/compressImage";

export default function AdminResourcesPage() {
  const { user, role, authReady } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  const [successMessage, setSuccessMessage] = useState("");
  
  
  // Upload progress states
  const [magazineImageUploadProgress, setMagazineImageUploadProgress] = useState<Record<number, number | null>>({});
  const [competitionImageUploadProgress, setCompetitionImageUploadProgress] = useState<Record<number, number | null>>({});
  const [originalContent, setOriginalContent] = useState<ResourceContent | null>(null);
  const [uploading, setUploading] = useState(false);
  const sessionId = useRef(crypto.randomUUID()).current;
  const [pendingAssets, setPendingAssets] = useState<string[]>([]);

  const [content, setContent] = useState<ResourceContent>({
    magazines: [
      {
        id: 1,
        title: "Works on Paper",
        description: "Joan Jonas's work encompasses video, performance, installation, sound, text, and sculpture.",
        image: {
          src: "",
          alt: "Literacy Today Magazine Cover"
        }
      },
      {
        id: 2,
        title: "Donate to The Paris Review",
        description: "The Paris Review is not only the preeminent literary quarterly in America but also a 501(c)(3) nonprofit organization.",
        image: {
          src: "",
          alt: "Reading Horizons Magazine Cover"
        }
      },
      {
        id: 3,
        title: "Mold and Melancholia",
        description: "In London, trash is called rubbish and taking it out is a science.",
        image: {
          src: "",
          alt: "Word Power Magazine Cover"
        }
      }
    ],
    summerPrograms: [
      {
        id: 1,
        title: "🌴 Summer Writing Sprint",
        duration: "4-6 Weeks",
        location: "Online (Live Virtual Sessions)",
        shortDescription: "A fast-paced program designed to help writers finish a short story, novella, or first draft through weekly prompts, deadlines, and accountability check-ins.",
        fullDescription: "The Summer Writing Sprint is an intensive 4-6 week program designed to help writers complete a substantial writing project. Each week, you'll receive carefully crafted writing prompts, participate in structured writing sessions, and join accountability check-ins with fellow writers. The program includes weekly feedback sessions, progress tracking, and personalized guidance from experienced writing mentors.",
        bestFor: "Writers who need structure and momentum",
        outcome: "A completed draft by summer's end",
        additionalInfo: [
          "Weekly live writing sessions",
          "Personalized feedback on 2 chapters",
          "Access to private writing community",
          "Progress tracking dashboard",
          "Final manuscript review"
        ],
        registrationLink: "/apply",
        category: "Writing & Creative Arts"
      },
      {
        id: 2,
        title: "📚 Teen & YA Summer Writing Camp",
        duration: "8 Weeks",
        location: "New York City, NY Campus",
        shortDescription: "A guided creative writing program for middle grade and young adult writers, featuring craft lessons, writing exercises, and peer feedback in a supportive environment.",
        fullDescription: "Our Summer Coding Bootcamp is designed for beginners and intermediate learners looking to build practical web development skills. Over 8 weeks, you'll learn HTML, CSS, JavaScript, and React through project-based learning. Each module includes hands-on exercises, code reviews, and collaborative projects.",
        bestFor: "Aspiring teen authors",
        outcome: "Polished short stories and stronger writing confidence",
        additionalInfo: [
          "Weekly live writing sessions",
          "Personalized feedback on 2 chapters",
          "Access to private writing community",
          "Progress tracking dashboard",
          "Final manuscript review"
        ],
        registrationLink: "/apply",
        category: "Writing & Creative Arts"
      },
      {
        id: 3,
        title: "✍️ Revise & Polish Bootcamp",
        duration: "6 Weeks",
        location: "Los Angeles, CA Workshop",
        shortDescription: "A revision-focused summer intensive where writers bring an existing draft and work through pacing, character depth, and clarity with targeted feedback.",
        fullDescription: "This masterclass takes you through the complete digital art workflow, from sketching to final rendering. You'll learn to use tools like Photoshop and Procreate, develop your unique style, and create professional-quality illustrations suitable for portfolios and client work.",
        bestFor: "Writers with finished drafts",
        outcome: "Submission-ready manuscripts",
        additionalInfo: [
          "Weekly live writing sessions",
          "Personalized feedback on 2 chapters",
          "Access to private writing community",
          "Progress tracking dashboard",
          "Final manuscript review"
        ],
        registrationLink: "/apply",
        category: "Writing & Creative Arts"
      },
      {
        id: 4,
        title: "🌞 Daily Prompt Challenge",
        duration: "30 Days",
        location: "Online (Self-Paced)",
        shortDescription: "A low-pressure, high-fun challenge with one creative prompt per day to build consistency and experiment with voice, genre, and style.",
        fullDescription: "The Summer Writing Sprint is an intensive 4-6 week program designed to help writers complete a substantial writing project. Each week, you'll receive carefully crafted writing prompts, participate in structured writing sessions, and join accountability check-ins with fellow writers. The program includes weekly feedback sessions, progress tracking, and personalized guidance from experienced writing mentors.",
        bestFor: "Busy writers or beginners",
        outcome: "Stronger habits and creative flow",
        additionalInfo: [
          "Weekly live writing sessions",
          "Personalized feedback on 2 chapters",
          "Access to private writing community",
          "Progress tracking dashboard",
          "Final manuscript review"
        ],
        registrationLink: "/apply",
        category: "Writing & Creative Arts"
      },
      {
        id: 5,
        title: "🧠 Craft Deep-Dive Series",
        duration: "8 Weeks",
        location: "Chicago, IL Creative Center",
        shortDescription: "Weekly mini-courses focusing on one skill at a time—dialogue, tension, worldbuilding, or theme—with examples and short writing assignments.",
        fullDescription: "Our Summer Coding Bootcamp is designed for beginners and intermediate learners looking to build practical web development skills. Over 8 weeks, you'll learn HTML, CSS, JavaScript, and React through project-based learning. Each module includes hands-on exercises, code reviews, and collaborative projects.",
        bestFor: "Skill-builders",
        outcome: "Noticeable craft improvement in targeted areas",
        additionalInfo: [
          "Weekly live writing sessions",
          "Personalized feedback on 2 chapters",
          "Access to private writing community",
          "Progress tracking dashboard",
          "Final manuscript review"
        ],
        registrationLink: "/apply",
        category: "Writing & Creative Arts"
      },
      {
        id: 6,
        title: "👥 Summer Critique Circles",
        duration: "6 Weeks",
        location: "Hybrid (Online + Boston, MA)",
        shortDescription: "Small, moderated critique groups that meet weekly to exchange feedback, discuss craft, and keep each other accountable.",
        fullDescription: "This masterclass takes you through the complete digital art workflow, from sketching to final rendering. You'll learn to use tools like Photoshop and Procreate, develop your unique style, and create professional-quality illustrations suitable for portfolios and client work.",
        bestFor: "Writers who thrive on community",
        outcome: "Actionable feedback and writing friendships",
        additionalInfo: [
          "Weekly live writing sessions",
          "Personalized feedback on 2 chapters",
          "Access to private writing community",
          "Progress tracking dashboard",
          "Final manuscript review"
        ],
        registrationLink: "/apply",
        category: "Writing & Creative Arts"
      },
    ],
writingCompetitions: [
  {
    id: 1,
    title: "Annual Short Story Contest",
    description: "Submit your best unpublished short fiction (up to 5,000 words) for a chance to win cash prizes and publication.",
    deadline: new Date("2025-06-30"), // Date object
    prize: "$2,000 Grand Prize + Publication",
    entryFee: "$15 per entry",
    eligibility: "Open to all writers 18+, worldwide",
    rules: [
      "Stories must be unpublished",
      "Maximum 5,000 words",
      "No simultaneous submissions",
      "Standard manuscript format",
      "Judging is blind"
    ],
    registrationLink: "/apply",
    image: {
      src: "",
      alt: "Short Story Contest Banner"
    },
  },
  {
    id: 2,
    title: "Poetry Prize 2025",
    description: "Awarding excellence in poetry across all forms and styles. Submit up to 3 poems for consideration.",
    deadline: new Date("2025-05-15"), // Changed from string to Date object
    prize: "$1,500 First Prize + Feature",
    entryFee: "$10 for 3 poems",
    eligibility: "All poets writing in English",
    rules: [
      "Up to 3 poems per entry",
      "Maximum 100 lines per poem",
      "Previously published poems accepted if rights retained",
      "No identifying information on poems",
      "Multiple entries allowed"
    ],
    registrationLink: "/apply",
    image: {
      src: "",
      alt: "Poetry Prize Banner"
    }
  },
  {
    id: 3,
    title: "Flash Fiction Challenge",
    description: "Create a complete story in 1,000 words or less. Fast-paced, creative, and open to all genres.",
    deadline: new Date("2025-07-31"), // Changed from string to Date object
    prize: "$500 Winner + Anthology Inclusion",
    entryFee: "Free for first entry",
    eligibility: "Any writer, any age",
    rules: [
      "Exactly 1,000 words maximum",
      "Any genre welcome",
      "Original work only",
      "One free entry per person",
      "Additional entries $5 each"
    ],
    registrationLink: "/apply",
    image: {
      src: "",
      alt: "Flash Fiction Challenge Banner"
    }
  }
],
 viewAllLink: "/apply",
  });

  // Load Firestore data
  useEffect(() => {
    async function loadContent() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ref = doc(db, "siteContent", "resources");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          
          const loaded: ResourceContent = {

            magazines: data.magazines || [
              {
                id: 1,
                title: "Works on Paper",
                description: "Joan Jonas's work encompasses video, performance, installation, sound, text, and sculpture.",
                image: {
                  src: "",
                  alt: "Literacy Today Magazine Cover"
                }
              },
              {
                id: 2,
                title: "Donate to The Paris Review",
                description: "The Paris Review is not only the preeminent literary quarterly in America but also a 501(c)(3) nonprofit organization.",
                image: {
                  src: "",
                  alt: "Reading Horizons Magazine Cover"
                }
              },
              {
                id: 3,
                title: "Mold and Melancholia",
                description: "In London, trash is called rubbish and taking it out is a science.",
                image: {
                  src: "",
                  alt: "Word Power Magazine Cover"
                }
              }
            ],
            summerPrograms: data.summerPrograms || [
              {
                id: 1,
                title: "🌴 Summer Writing Sprint",
                duration: "4-6 Weeks",
                location: "Online (Live Virtual Sessions)",
                shortDescription: "A fast-paced program designed to help writers finish a short story, novella, or first draft through weekly prompts, deadlines, and accountability check-ins.",
                fullDescription: "The Summer Writing Sprint is an intensive 4-6 week program designed to help writers complete a substantial writing project. Each week, you'll receive carefully crafted writing prompts, participate in structured writing sessions, and join accountability check-ins with fellow writers. The program includes weekly feedback sessions, progress tracking, and personalized guidance from experienced writing mentors.",
                bestFor: "Writers who need structure and momentum",
                outcome: "A completed draft by summer's end",
                additionalInfo: [
                  "Weekly live writing sessions",
                  "Personalized feedback on 2 chapters",
                  "Access to private writing community",
                  "Progress tracking dashboard",
                  "Final manuscript review"
                ],
                registrationLink: "/apply",
                category: "Writing & Creative Arts"
              },
            ],
           writingCompetitions: data.writingCompetitions ? data.writingCompetitions.map((comp: any) => ({
              ...comp,
              // Convert string deadline to Date object
             deadline: comp.deadline ? new Date(comp.deadline) : new Date(),
            })) : [
              {
                id: 1,
                title: "Annual Short Story Contest",
                description: "Submit your best unpublished short fiction (up to 5,000 words) for a chance to win cash prizes and publication.",
                deadline: new Date("2025-06-30"), // Date object
                prize: "$2,000 Grand Prize + Publication",
                entryFee: "$15 per entry",
                eligibility: "Open to all writers 18+, worldwide",
                rules: [
                  "Stories must be unpublished",
                  "Maximum 5,000 words",
                  "No simultaneous submissions",
                  "Standard manuscript format",
                  "Judging is blind"
                ],
                registrationLink: "/apply",
                image: {
                  src: "",
                  alt: "Short Story Contest Banner"
                }
              },
              {
                id: 2,
                title: "Poetry Prize 2025",
                description: "Awarding excellence in poetry across all forms and styles. Submit up to 3 poems for consideration.",
                deadline: new Date("2025-05-15"),
                prize: "$1,500 First Prize + Feature",
                entryFee: "$10 for 3 poems",
                eligibility: "All poets writing in English",
                rules: [
                  "Up to 3 poems per entry",
                  "Maximum 100 lines per poem",
                  "Previously published poems accepted if rights retained",
                  "No identifying information on poems",
                  "Multiple entries allowed"
                ],
                registrationLink: "/apply",
                image: {
                  src: "",
                  alt: "Poetry Prize Banner"
                }
              },
              {
                id: 3,
                title: "Flash Fiction Challenge",
                description: "Create a complete story in 1,000 words or less. Fast-paced, creative, and open to all genres.",
                deadline: new Date("2025-07-31"),
                prize: "$500 Winner + Anthology Inclusion",
                entryFee: "Free for first entry",
                eligibility: "Any writer, any age",
                rules: [
                  "Exactly 1,000 words maximum",
                  "Any genre welcome",
                  "Original work only",
                  "One free entry per person",
                  "Additional entries $5 each"
                ],
                registrationLink: "/apply",
                image: {
                  src: "",
                  alt: "Flash Fiction Challenge Banner"
                }
              }
            ],
            viewAllLink: data.viewAllLink || "/apply",
          };

          setContent(loaded);
          setOriginalContent(structuredClone(loaded));
        }
      } catch (err) {
        console.error("Error loading content:", err);
        setErrorMessage("Failed to load content.");
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [user]);

  async function uploadAsset(
    file: File,
    folder: string,
    onProgress?: (p: number) => void
  ): Promise<string> {
    const compressedFile = await compressImageClient(file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const form = new FormData();

      form.append("file", compressedFile);
      form.append("folder", folder);
      form.append("sessionId", sessionId);
      form.append("draft", "true");

      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        console.log("Upload response status:", xhr.status);
        console.log("Upload response text:", xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          setPendingAssets(prev => [...prev, res.url]);
          resolve(res.url);
        } else {
          reject(
            new Error(
              `Upload failed (${xhr.status}): ${xhr.responseText || "no body"}`
            )
          );
        }
      };

      xhr.onerror = () => reject(new Error("Upload error"));
      xhr.send(form);
    });
  }

  function validateResourcesContent(content: ResourceContent): string | null {
    // Validate magazines
    for (let i = 0; i < content.magazines.length; i++) {
      const magazine = content.magazines[i];
      
        if (!isNonEmptyString(content.viewAllLink)) {
          return "View All Link must be filled.";
        }

      if (!isNonEmptyString(magazine.title)) {
        return `Magazine #${i + 1}: Title must be filled.`;
      }
      
      if (!isNonEmptyString(magazine.description)) {
        return `Magazine #${i + 1}: Description must be filled.`;
      }
      
      if (!isNonEmptyString(magazine.image.src)) {
        return `Magazine #${i + 1}: Image must be uploaded.`;
      }
      
      if (!isNonEmptyString(magazine.image.alt)) {
        return `Magazine #${i + 1}: Image alt text must be filled.`;
      }
    }

    // Validate summer programs
    for (let i = 0; i < content.summerPrograms.length; i++) {
      const program = content.summerPrograms[i];
      
      if (!isNonEmptyString(program.title)) {
        return `Summer Program #${i + 1}: Title must be filled.`;
      }
      
      if (!isNonEmptyString(program.duration)) {
        return `Summer Program #${i + 1}: Duration must be filled.`;
      }
      
      if (!isNonEmptyString(program.location)) {
        return `Summer Program #${i + 1}: Location must be filled.`;
      }
      
      if (!isNonEmptyString(program.shortDescription)) {
        return `Summer Program #${i + 1}: Short description must be filled.`;
      }
      
      if (!isNonEmptyString(program.fullDescription)) {
        return `Summer Program #${i + 1}: Full description must be filled.`;
      }
      
      if (!isNonEmptyString(program.bestFor)) {
        return `Summer Program #${i + 1}: 'Best for' must be filled.`;
      }
      
      if (!isNonEmptyString(program.outcome)) {
        return `Summer Program #${i + 1}: Outcome must be filled.`;
      }
      
      if (!isNonEmptyString(program.category)) {
        return `Summer Program #${i + 1}: Category must be filled.`;
      }
      
      if (!isNonEmptyString(program.registrationLink)) {
        return `Summer Program #${i + 1}: Registration link must be filled.`;
      }
      
      if (!isNonEmptyArray(program.additionalInfo)) {
        return `Summer Program #${i + 1}: Additional info must have at least one item.`;
      }
      
      // Validate each additional info point
      for (let j = 0; j < program.additionalInfo.length; j++) {
        if (!isNonEmptyString(program.additionalInfo[j])) {
          return `Summer Program #${i + 1}: Additional info point #${j + 1} cannot be empty.`;
        }
      }
    }

    // Validate writing competitions
    for (let i = 0; i < content.writingCompetitions.length; i++) {
      const competition = content.writingCompetitions[i];
      
      if (!isNonEmptyString(competition.title)) {
        return `Writing Competition #${i + 1}: Title must be filled.`;
      }
      
      if (!isNonEmptyString(competition.description)) {
        return `Writing Competition #${i + 1}: Description must be filled.`;
      }
      
        if (!competition.deadline || !(competition.deadline instanceof Date) || isNaN(competition.deadline.getTime())) {
          return `Writing Competition #${i + 1}: Deadline must be a valid date.`;
        }
      
      if (!isNonEmptyString(competition.prize)) {
        return `Writing Competition #${i + 1}: Prize must be filled.`;
      }
      
      if (!isNonEmptyString(competition.entryFee)) {
        return `Writing Competition #${i + 1}: Entry fee must be filled.`;
      }
      
      if (!isNonEmptyString(competition.eligibility)) {
        return `Writing Competition #${i + 1}: Eligibility must be filled.`;
      }
      
      if (!isNonEmptyString(competition.registrationLink)) {
        return `Writing Competition #${i + 1}: Registration link must be filled.`;
      }
      
      if (!isNonEmptyString(competition.image.src)) {
        return `Writing Competition #${i + 1}: Image must be uploaded.`;
      }
      
      if (!isNonEmptyString(competition.image.alt)) {
        return `Writing Competition #${i + 1}: Image alt text must be filled.`;
      }
      
      if (!isNonEmptyArray(competition.rules)) {
        return `Writing Competition #${i + 1}: Rules must have at least one item.`;
      }
      
      // Validate each rule
      for (let j = 0; j < competition.rules.length; j++) {
        if (!isNonEmptyString(competition.rules[j])) {
          return `Writing Competition #${i + 1}: Rule #${j + 1} cannot be empty.`;
        }
      }
    }

    return null; // ✅ valid
  }

  // Save to Firestore
  async function handleSave() {
    if (!user) {
      setErrorMessage("Please log in to save changes.");
      return;
    }

    // 🔎 Validate BEFORE saving
    const validationError = validateResourcesContent(content);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = await user.getIdTokenResult();

      if (token.claims.role !== "admin" && token.claims.role !== "author") {
        throw new Error("Insufficient permissions. Admin or author role required.");
      }

      const ref = doc(db, "siteContent", "resources");

      // Replace temp URLs with permanent ones
      let finalContent = content;

      if (pendingAssets.length) {
        const usedAssets = extractAssetUrlsFromResources(content);

        const assetsToPromote = pendingAssets.filter(url =>
          usedAssets.includes(url)
        );

        if (assetsToPromote.length) {
          const res = await fetch("/api/promote-assets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: assetsToPromote }),
          });

          const { replacements } = await res.json();

          // Update magazine images
          const updatedMagazines = content.magazines.map(magazine => ({
            ...magazine,
            image: {
              ...magazine.image,
              src: replacements[magazine.image.src] ?? magazine.image.src,
            },
          }));

          // Update competition images
          const updatedCompetitions = content.writingCompetitions.map(competition => ({
            ...competition,
            image: {
              ...competition.image,
              src: replacements[competition.image.src] ?? competition.image.src,
            },
          }));

          finalContent = {
            ...content,
            magazines: updatedMagazines,
            writingCompetitions: updatedCompetitions,
          };

          setContent(finalContent);
        }

        // 🧹 Clear all pending assets
        setPendingAssets([]);
      }

      await setDoc(
        ref,
        {
          magazines: finalContent.magazines.map(magazine => ({
            id: magazine.id,
            title: magazine.title.trim(),
            description: magazine.description.trim(),
            image: {
              src: magazine.image.src.trim(),
              alt: magazine.image.alt.trim(),
            },
          })),
          summerPrograms: finalContent.summerPrograms.map(program => ({
            id: program.id,
            title: program.title.trim(),
            duration: program.duration.trim(),
            location: program.location.trim(),
            shortDescription: program.shortDescription.trim(),
            fullDescription: program.fullDescription.trim(),
            bestFor: program.bestFor.trim(),
            outcome: program.outcome.trim(),
            category: program.category.trim(),
            additionalInfo: program.additionalInfo.map(info => info.trim()),
            registrationLink: program.registrationLink.trim(),
          })),
          // In handleSave function:
          writingCompetitions: finalContent.writingCompetitions.map(competition => ({
            id: competition.id,
            title: competition.title.trim(),
            description: competition.description.trim(),
            deadline: competition.deadline.toISOString(), // Convert Date to ISO string
            prize: competition.prize.trim(),
            entryFee: competition.entryFee.trim(),
            eligibility: competition.eligibility.trim(),
            rules: competition.rules.map(rule => rule.trim()),
            registrationLink: competition.registrationLink.trim(),
            image: {
              src: competition.image.src.trim(),
              alt: competition.image.alt.trim(),
            },
          })),
          viewAllLink: finalContent.viewAllLink?.trim() || "/apply",
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // 🧹 Delete unused R2 assets
      if (originalContent) {
        const before = new Set(extractAssetUrlsFromResources(originalContent));
        const after = new Set(extractAssetUrlsFromResources(finalContent));

        const unusedAssets = [...before].filter((url) => !after.has(url));

        await Promise.all(
          unusedAssets.map((url) =>
            fetch("/api/delete-asset", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url }),
            })
          )
        );
      }

      setSuccessMessage("Resources page content saved successfully!");
      setOriginalContent(structuredClone(finalContent));

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  // Add handler for viewAllLink changes
  const handleViewAllLinkChange = (value: string) => {
    setContent((prev) => ({
      ...prev,
      viewAllLink: value,
    }));
  };

  // Handle magazine changes
  const handleMagazineChange = (index: number, field: keyof MagazineItem, value: any) => {
    setContent((prev) => {
      const updatedMagazines = [...prev.magazines];
      if (field === "image") {
        updatedMagazines[index] = {
          ...updatedMagazines[index],
          image: {
            ...updatedMagazines[index].image,
            ...value,
          },
        };
      } else {
        updatedMagazines[index] = {
          ...updatedMagazines[index],
          [field]: value,
        };
      }
      return {
        ...prev,
        magazines: updatedMagazines,
      };
    });
  };

  // Handle program changes
  const handleProgramChange = (index: number, field: keyof SummerProgram, value: any) => {
    setContent((prev) => {
      const updatedPrograms = [...prev.summerPrograms];
      updatedPrograms[index] = {
        ...updatedPrograms[index],
        [field]: value,
      };
      return {
        ...prev,
        summerPrograms: updatedPrograms,
      };
    });
  };

  // Handle additional info changes for programs
  const handleProgramAdditionalInfoChange = (programIndex: number, infoIndex: number, value: string) => {
    setContent((prev) => {
      const updatedPrograms = [...prev.summerPrograms];
      const updatedAdditionalInfo = [...updatedPrograms[programIndex].additionalInfo];
      updatedAdditionalInfo[infoIndex] = value;
      
      updatedPrograms[programIndex] = {
        ...updatedPrograms[programIndex],
        additionalInfo: updatedAdditionalInfo,
      };
      
      return {
        ...prev,
        summerPrograms: updatedPrograms,
      };
    });
  };

  // Handle competition changes
  const handleCompetitionChange = (index: number, field: keyof WritingCompetitionItem, value: any) => {
    setContent((prev) => {
      const updatedCompetitions = [...prev.writingCompetitions];
      if (field === "image") {
        updatedCompetitions[index] = {
          ...updatedCompetitions[index],
          image: {
            ...updatedCompetitions[index].image,
            ...value,
          },
        };
      } else {
        updatedCompetitions[index] = {
          ...updatedCompetitions[index],
          [field]: value,
        };
      }
      return {
        ...prev,
        writingCompetitions: updatedCompetitions,
      };
    });
  };

  // Handle competition rules changes
  const handleCompetitionRuleChange = (compIndex: number, ruleIndex: number, value: string) => {
    setContent((prev) => {
      const updatedCompetitions = [...prev.writingCompetitions];
      const updatedRules = [...updatedCompetitions[compIndex].rules];
      updatedRules[ruleIndex] = value;
      
      updatedCompetitions[compIndex] = {
        ...updatedCompetitions[compIndex],
        rules: updatedRules,
      };
      
      return {
        ...prev,
        writingCompetitions: updatedCompetitions,
      };
    });
  };

  // Add new magazine
  const addMagazine = () => {
    setContent((prev) => ({
      ...prev,
      magazines: [
        ...prev.magazines,
        {
          id: prev.magazines.length + 1,
          title: "",
          description: "",
          image: {
            src: "",
            alt: "",
          },
        },
      ],
    }));
  };

  // Remove magazine
  const removeMagazine = (index: number) => {
    setContent((prev) => ({
      ...prev,
      magazines: prev.magazines.filter((_, i) => i !== index),
    }));
  };

  // Add new program
  const addProgram = () => {
    setContent((prev) => ({
      ...prev,
      summerPrograms: [
        ...prev.summerPrograms,
        {
          id: prev.summerPrograms.length + 1,
          title: "",
          duration: "",
          location: "",
          shortDescription: "",
          fullDescription: "",
          bestFor: "",
          outcome: "",
          category: "Writing & Creative Arts",
          additionalInfo: [""],
          registrationLink: "",
        },
      ],
    }));
  };

  // Remove program
  const removeProgram = (index: number) => {
    setContent((prev) => ({
      ...prev,
      summerPrograms: prev.summerPrograms.filter((_, i) => i !== index),
    }));
  };

  // Add new competition

const addCompetition = () => {
  setContent((prev) => ({
    ...prev,
    writingCompetitions: [
      ...prev.writingCompetitions,
      {
        id: prev.writingCompetitions.length + 1,
        title: "",
        description: "",
        deadline: new Date(), // Changed from empty string to Date
        prize: "",
        entryFee: "",
        eligibility: "",
        rules: [""],
        registrationLink: "",
        image: {
          src: "",
          alt: "",
        },
      },
    ],
  }));
};

  // Remove competition
  const removeCompetition = (index: number) => {
    setContent((prev) => ({
      ...prev,
      writingCompetitions: prev.writingCompetitions.filter((_, i) => i !== index),
    }));
  };

  // Add additional info point to program
  const addProgramAdditionalInfo = (programIndex: number) => {
    setContent((prev) => {
      const updatedPrograms = [...prev.summerPrograms];
      updatedPrograms[programIndex] = {
        ...updatedPrograms[programIndex],
        additionalInfo: [...updatedPrograms[programIndex].additionalInfo, ""],
      };
      return {
        ...prev,
        summerPrograms: updatedPrograms,
      };
    });
  };

  // Remove additional info point from program
  const removeProgramAdditionalInfo = (programIndex: number, infoIndex: number) => {
    setContent((prev) => {
      const updatedPrograms = [...prev.summerPrograms];
      updatedPrograms[programIndex] = {
        ...updatedPrograms[programIndex],
        additionalInfo: updatedPrograms[programIndex].additionalInfo.filter((_, i) => i !== infoIndex),
      };
      return {
        ...prev,
        summerPrograms: updatedPrograms,
      };
    });
  };

  // Add rule to competition
  const addCompetitionRule = (compIndex: number) => {
    setContent((prev) => {
      const updatedCompetitions = [...prev.writingCompetitions];
      updatedCompetitions[compIndex] = {
        ...updatedCompetitions[compIndex],
        rules: [...updatedCompetitions[compIndex].rules, ""],
      };
      return {
        ...prev,
        writingCompetitions: updatedCompetitions,
      };
    });
  };

  // Remove rule from competition
  const removeCompetitionRule = (compIndex: number, ruleIndex: number) => {
    setContent((prev) => {
      const updatedCompetitions = [...prev.writingCompetitions];
      updatedCompetitions[compIndex] = {
        ...updatedCompetitions[compIndex],
        rules: updatedCompetitions[compIndex].rules.filter((_, i) => i !== ruleIndex),
      };
      return {
        ...prev,
        writingCompetitions: updatedCompetitions,
      };
    });
  };

  if (loading || !authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">
          Loading site content resources...
        </p>
      </div>
    );
  }

  // Not admin state
  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans!">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#4A3820] mb-4 font-sans!">
            Access Denied
          </h1>
          <p className="text-[#4A3820]/70 font-sans!">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Render upload input for images
  const renderImageUpload = (
    label: string,
    currentSrc: string,
    onUpload: (file: File) => Promise<void>,
    uploadProgress: number | null,
    previewAlt?: string
  ) => (
    <div>
      <label className="block text-sm font-medium text-[#4A3820] mb-2">
        {label}
      </label>
      <input
        type="file"
        accept=".png, .jpg, .jpeg, .webp, .gif, .avif"
        className="hidden"
        id={`upload-${label.replace(/\s+/g, "-")}`}
        onChange={async (e) => {
          if (!e.target.files?.[0]) return;
          await onUpload(e.target.files[0]);
        }}
      />
      <div
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("ring-2", "ring-[#805C2C]");
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("ring-2", "ring-[#805C2C]");
        }}
        onDrop={async (e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("ring-2", "ring-[#805C2C]");
          const file = e.dataTransfer.files?.[0];
          if (!file) return;
          await onUpload(file);
        }}
      >
        <label
          htmlFor={`upload-${label.replace(/\s+/g, "-")}`}
          className="
            flex items-center justify-center
            w-full px-4 py-6
            border-2 border-dashed border-[#805C2C]
            rounded-lg
            bg-[#F9F5F0]
            text-[#4A3820]
            font-medium
            cursor-pointer
            hover:bg-[#F0E8DB]
            hover:border-[#6B4C24]
            transition-colors
          "
        >
          Click or drag an image here
        </label>
      </div>
      {uploadProgress !== null && (
        <div className="mt-2">
          <div className="h-2 w-full bg-gray-200 rounded">
            <div
              className="h-2 bg-[#805C2C] rounded transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs mt-1 text-[#4A3820]">
            Uploading… {uploadProgress}%
          </p>
        </div>
      )}
      {currentSrc && (
        <div className="mt-4">
          <p className="text-sm mb-2 text-[#4A3820]">Preview</p>
          <img
            src={currentSrc}
            alt={previewAlt || "Preview"}
            className="max-h-48 rounded-lg border"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="px-6 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">
          Resources Page Management
        </h1>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-medium text-[#4A3820] mb-6 font-sans!">
            Edit Resources Page Content
          </h2>

          {loading ? (
            <p className="text-center text-[#4A3820] py-8">Loading content...</p>
          ) : (
            <div className="space-y-8">

               {/* View All Link Section - Add this new section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <h3 className="text-xl font-bold text-[#4A3820] mb-4 font-sans!">
                  Magazine Section Settings
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-[#4A3820] mb-2">
                    View All Link
                  </label>
                  <input
                    type="url"
                    value={content.viewAllLink || ""}
                    onChange={(e) => handleViewAllLinkChange(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                    placeholder="https://example.com/magazines"
                  />
                </div>
              </div>

              {/* Literacy Magazines Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#4A3820] font-sans!">
                    Literacy Magazines
                  </h3>
                  <button
                    onClick={addMagazine}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors font-sans!"
                  >
                    + Add Magazine
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  {content.magazines.map((magazine, index) => (
                    <div key={index} className="border-2 border-[#D8CDBE] rounded-lg p-5 bg-[#F9F5F0]">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-[#4A3820] font-sans!">
                          Magazine #{index + 1}
                        </h4>
                        <button
                          onClick={() => removeMagazine(index)}
                          className="px-3 py-1 rounded-lg border-2 border-red-500 text-red-500 text-sm hover:bg-red-50 transition-colors font-sans!"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={magazine.title}
                            onChange={(e) => handleMagazineChange(index, "title", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="Magazine title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Description
                          </label>
                          <textarea
                            value={magazine.description}
                            onChange={(e) => handleMagazineChange(index, "description", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-20"
                            placeholder="Magazine description"
                          />
                        </div>

                        {/* Magazine Image Upload */}
                        {renderImageUpload(
                          `Magazine ${index + 1} Image`,
                          magazine.image.src,
                          async (file) => {
                            setUploading(true);
                            try {
                              setMagazineImageUploadProgress((prev) => ({ ...prev, [index]: 0 }));
                              const url = await uploadAsset(
                                file,
                                "resources/magazines",
                                (p) => setMagazineImageUploadProgress((prev) => ({ ...prev, [index]: p }))
                              );
                              handleMagazineChange(index, "image", { src: url });
                            } catch (err) {
                              console.error("Upload error:", err);
                            } finally {
                              setMagazineImageUploadProgress((prev) => ({ ...prev, [index]: null }));
                              setUploading(false);
                            }
                          },
                          magazineImageUploadProgress[index] || null,
                          magazine.image.alt
                        )}

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Image Alt Text
                          </label>
                          <input
                            type="text"
                            value={magazine.image.alt}
                            onChange={(e) => handleMagazineChange(index, "image", { alt: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="Describe the magazine image"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Writing Competitions Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#4A3820] font-sans!">
                    Writing Competitions
                  </h3>
                  <button
                    onClick={addCompetition}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors font-sans!"
                  >
                    + Add Competition
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  {content.writingCompetitions.map((competition, index) => (
                    <div key={index} className="border-2 border-[#D8CDBE] rounded-lg p-5 bg-[#F9F5F0]">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-[#4A3820] font-sans!">
                          Competition #{index + 1}
                        </h4>
                        <button
                          onClick={() => removeCompetition(index)}
                          className="px-3 py-1 rounded-lg border-2 border-red-500 text-red-500 text-sm hover:bg-red-50 transition-colors font-sans!"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={competition.title}
                            onChange={(e) => handleCompetitionChange(index, "title", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="Competition title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Description
                          </label>
                          <textarea
                            value={competition.description}
                            onChange={(e) => handleCompetitionChange(index, "description", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-20"
                            placeholder="Brief description of the competition"
                          />
                        </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Deadline
                          </label>
                          <input
                            type="date"
                            value={competition.deadline && !isNaN(competition.deadline.getTime()) 
                              ? competition.deadline.toISOString().split('T')[0] 
                              : ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                handleCompetitionChange(index, "deadline", new Date(value));
                              } else {
                                handleCompetitionChange(index, "deadline", new Date());
                              }
                            }}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Prize
                          </label>
                          <input
                            type="text"
                            value={competition.prize}
                            onChange={(e) => handleCompetitionChange(index, "prize", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="e.g., $2,000 Grand Prize + Publication"
                          />
                        </div>
                      </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#4A3820] mb-2">
                              Entry Fee
                            </label>
                            <input
                              type="text"
                              value={competition.entryFee}
                              onChange={(e) => handleCompetitionChange(index, "entryFee", e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                              placeholder="e.g., $15 per entry"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#4A3820] mb-2">
                              Eligibility
                            </label>
                            <input
                              type="text"
                              value={competition.eligibility}
                              onChange={(e) => handleCompetitionChange(index, "eligibility", e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                              placeholder="e.g., Open to all writers 18+, worldwide"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Registration Link
                          </label>
                          <input
                            type="url"
                            value={competition.registrationLink}
                            onChange={(e) => handleCompetitionChange(index, "registrationLink", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="https://example.com/register"
                          />
                        </div>

                        {/* Competition Image Upload */}
                        {renderImageUpload(
                          `Competition ${index + 1} Image`,
                          competition.image.src,
                          async (file) => {
                            setUploading(true);
                            try {
                              setCompetitionImageUploadProgress((prev) => ({ ...prev, [index]: 0 }));
                              const url = await uploadAsset(
                                file,
                                "resources/competitions",
                                (p) => setCompetitionImageUploadProgress((prev) => ({ ...prev, [index]: p }))
                              );
                              handleCompetitionChange(index, "image", { src: url });
                            } catch (err) {
                              console.error("Upload error:", err);
                            } finally {
                              setCompetitionImageUploadProgress((prev) => ({ ...prev, [index]: null }));
                              setUploading(false);
                            }
                          },
                          competitionImageUploadProgress[index] || null,
                          competition.image.alt
                        )}

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Image Alt Text
                          </label>
                          <input
                            type="text"
                            value={competition.image.alt}
                            onChange={(e) => handleCompetitionChange(index, "image", { alt: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="Describe the competition image"
                          />
                        </div>

                        {/* Rules */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-[#4A3820]">
                              Competition Rules
                            </label>
                            <button
                              type="button"
                              onClick={() => addCompetitionRule(index)}
                              className="px-3 py-1 text-sm rounded-lg border border-[#805C2C] text-[#805C2C] hover:bg-[#F0E8DB] transition-colors font-sans!"
                            >
                              + Add Rule
                            </button>
                          </div>
                          {competition.rules.map((rule, ruleIndex) => (
                            <div key={ruleIndex} className="flex items-start gap-2 mb-2">
                              <span className="mt-2 text-[#4A3820]">•</span>
                              <div className="flex-1 flex items-center gap-2">
                                <textarea
                                  value={rule}
                                  onChange={(e) => handleCompetitionRuleChange(index, ruleIndex, e.target.value)}
                                  className="flex-1 px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-15"
                                  placeholder={`Rule ${ruleIndex + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeCompetitionRule(index, ruleIndex)}
                                  className="px-2 py-1 text-sm rounded-lg border border-red-500 text-red-500 hover:bg-red-50 transition-colors font-sans!"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summer Programs Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#4A3820] font-sans!">
                    Summer Programs
                  </h3>
                  <button
                    onClick={addProgram}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors font-sans!"
                  >
                    + Add Program
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  {content.summerPrograms.map((program, index) => (
                    <div key={index} className="border-2 border-[#D8CDBE] rounded-lg p-5 bg-[#F9F5F0]">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-[#4A3820] font-sans!">
                          Program #{index + 1}
                        </h4>
                        <button
                          onClick={() => removeProgram(index)}
                          className="px-3 py-1 rounded-lg border-2 border-red-500 text-red-500 text-sm hover:bg-red-50 transition-colors font-sans!"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={program.title}
                            onChange={(e) => handleProgramChange(index, "title", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="Program title"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#4A3820] mb-2">
                              Duration
                            </label>
                            <input
                              type="text"
                              value={program.duration}
                              onChange={(e) => handleProgramChange(index, "duration", e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                              placeholder="e.g., 4-6 Weeks"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#4A3820] mb-2">
                              Location
                            </label>
                            <input
                              type="text"
                              value={program.location}
                              onChange={(e) => handleProgramChange(index, "location", e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                              placeholder="Program location"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Short Description
                          </label>
                          <textarea
                            value={program.shortDescription}
                            onChange={(e) => handleProgramChange(index, "shortDescription", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-20"
                            placeholder="Brief description of the program"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Full Description
                          </label>
                          <textarea
                            value={program.fullDescription}
                            onChange={(e) => handleProgramChange(index, "fullDescription", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-40"
                            placeholder="Detailed description of the program"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#4A3820] mb-2">
                              Best For
                            </label>
                            <input
                              type="text"
                              value={program.bestFor}
                              onChange={(e) => handleProgramChange(index, "bestFor", e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                              placeholder="Who is this program best for?"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#4A3820] mb-2">
                              Outcome
                            </label>
                            <input
                              type="text"
                              value={program.outcome}
                              onChange={(e) => handleProgramChange(index, "outcome", e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                              placeholder="What will participants achieve?"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Category
                          </label>
                          <input
                            type="text"
                            value={program.category}
                            onChange={(e) => handleProgramChange(index, "category", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="Program category"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Registration Link
                          </label>
                          <input
                            type="url"
                            value={program.registrationLink}
                            onChange={(e) => handleProgramChange(index, "registrationLink", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="https://example.com/register"
                          />
                        </div>

                        {/* Additional Info */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-[#4A3820]">
                              Additional Information
                            </label>
                            <button
                              type="button"
                              onClick={() => addProgramAdditionalInfo(index)}
                              className="px-3 py-1 text-sm rounded-lg border border-[#805C2C] text-[#805C2C] hover:bg-[#F0E8DB] transition-colors font-sans!"
                            >
                              + Add Point
                            </button>
                          </div>
                          {program.additionalInfo.map((info, infoIndex) => (
                            <div key={infoIndex} className="flex items-start gap-2 mb-2">
                              <span className="mt-2 text-[#4A3820]">•</span>
                              <div className="flex-1 flex items-center gap-2">
                                <textarea
                                  value={info}
                                  onChange={(e) => handleProgramAdditionalInfoChange(index, infoIndex, e.target.value)}
                                  className="flex-1 px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-15"
                                  placeholder={`Information point ${infoIndex + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeProgramAdditionalInfo(index, infoIndex)}
                                  className="px-2 py-1 text-sm rounded-lg border border-red-500 text-red-500 hover:bg-red-50 transition-colors font-sans!"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <FloatingSaveBar
          onClick={handleSave}
          saving={saving || uploading}
          label="Save All Changes"
        />
      </div>
    </div>
  );
}