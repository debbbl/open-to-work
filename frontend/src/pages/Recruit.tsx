"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  Briefcase,
  Brain,
  FileText,
  Github,
  Linkedin,
  Star,
  Zap,
  Users,
  Search,
} from "lucide-react";

type EvaluatedCandidate = {
  candidate_id: string;
  name?: string;
  skills?: string[];
  resume_summary?: string;
  years_of_experience?: number;
  education?: any[];
  experience?: any[];
  projects?: any[];
  applied_to_job?: boolean;
  original_job_id?: string;
  original_job_title?: string;
  evaluation: { overall_score_0_to_100: number; summary: string };
};

const API_BASE =
  (typeof process !== "undefined" &&
    (process as any).env?.NEXT_PUBLIC_API_BASE) ||
  "http://127.0.0.1:8000";

// Mock data for demo purposes
const MOCK_JOB_DESCRIPTION = `**Position: Senior Frontend Developer**

**Company:** TechCorp Inc.

**About the Role:**
We are seeking a talented Senior Frontend Developer to join our dynamic engineering team. You will be responsible for building and maintaining user-facing applications using modern JavaScript frameworks.

**Key Responsibilities:**
• Develop responsive web applications using React, TypeScript, and modern CSS
• Collaborate with UX/UI designers to implement pixel-perfect designs
• Optimize application performance and ensure cross-browser compatibility
• Write clean, maintainable, and well-documented code
• Mentor junior developers and contribute to technical decisions

**Required Qualifications:**
• 5+ years of experience in frontend development
• Proficiency in React, TypeScript, HTML5, CSS3
• Experience with state management libraries (Redux, Zustand)
• Knowledge of modern build tools (Vite, Webpack)
• Understanding of RESTful APIs and GraphQL

**Nice to Have:**
• Experience with Next.js or other SSR frameworks
• Knowledge of testing frameworks (Jest, Cypress)
• Familiarity with cloud platforms (AWS, Azure)
• Experience with design systems and component libraries

**Compensation:**
• Competitive salary: $130,000 - $160,000
• Equity package
• Health, dental, and vision insurance
• 25 days PTO + holidays
• $3,000 learning budget

Join us in building the future of web applications!`;

const MOCK_EXISTING_JOBS = [
  {
    job_id: "job_001",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    created_at: "2024-01-15",
    applications: 45,
    status: "active"
  },
  {
    job_id: "job_002", 
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    created_at: "2024-01-10",
    applications: 32,
    status: "active"
  },
  {
    job_id: "job_003",
    title: "Data Scientist",
    department: "Data",
    location: "New York, NY", 
    type: "Full-time",
    created_at: "2024-01-08",
    applications: 28,
    status: "active"
  },
  {
    job_id: "job_004",
    title: "UX Designer",
    department: "Design",
    location: "Austin, TX",
    type: "Full-time", 
    created_at: "2024-01-05",
    applications: 19,
    status: "active"
  }
];

const Recruit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"jobs" | "upload" | "screening">(
    "jobs"
  );
  const [biasFreeModeEnabled, setBiasFreeModeEnabled] = useState(false);

  // Job form
  const [jobTitle, setJobTitle] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [niceToHave, setNiceToHave] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [industryProj, setIndustryProj] = useState("");
  const [eduReq, setEduReq] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [currentJobTitle, setCurrentJobTitle] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Existing jobs
  const [existingJobId, setExistingJobId] = useState("");
  const [jobOptions, setJobOptions] = useState<
    { job_id: string; title?: string }[]
  >([]);

  // Upload
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [serverFiles, setServerFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Screening
  const [summary, setSummary] = useState<{
    fast_filter_processed: number;
    fast_filter_filtered: number;
    semantic_matched: number;
    llm_evaluated: number;
  } | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [topCandidates, setTopCandidates] = useState<EvaluatedCandidate[]>([]);
  const [searchAllCandidates, setSearchAllCandidates] = useState(true);
  const [appliedCandidates, setAppliedCandidates] = useState<
    EvaluatedCandidate[]
  >([]);
  const [potentialCandidates, setPotentialCandidates] = useState<
    EvaluatedCandidate[]
  >([]);
  const [screeningStats, setScreeningStats] = useState<{
    total_evaluated: number;
    applied_candidates: number;
    potential_candidates: number;
    returned_count: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const TabButton = ({
    id,
    label,
    icon: Icon,
    active,
  }: {
    id: "jobs" | "upload" | "screening";
    label: string;
    icon: any;
    active: boolean;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? "bg-primary-500 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      type="button"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );

  const jobRequestBody = useMemo(
    () => ({
      job_title: jobTitle,
      required_skills: requiredSkills,
      nice_to_have_skills: niceToHave,
      years_experience: yearsExp,
      relevant_industry_project_experience: industryProj,
      education_requirement: eduReq,
      responsibilities,
    }),
    [
      jobTitle,
      requiredSkills,
      niceToHave,
      yearsExp,
      industryProj,
      eduReq,
      responsibilities,
    ]
  );

  function uploadDisabledReason() {
    if (!jobId) return "Create or pick a job first";
    if (!uploadedFiles.length) return "Choose one or more PDF files";
    if (uploading) return "Uploading...";
    return "";
  }
  function processDisabledReason() {
    if (!jobId) return "Create or pick a job first";
    if (processing) return "Processing...";
    return "";
  }

  // ---------------- API calls ----------------
  async function generateJD() {
    if (!jobTitle) return alert("Enter a Job Title first.");
    
    setIsGenerating(true);
    try {
      // Call the Python AI service to generate job description with Gemini
      const response = await fetch('http://localhost:8000/api/ai/job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_title: jobTitle,
          required_skills: requiredSkills,
          nice_to_have: niceToHave,
          years_experience: yearsExp,
          responsibilities: responsibilities,
          education_requirements: eduReq,
          industry_projects: industryProj
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setJobDescription(data.description || MOCK_JOB_DESCRIPTION);
      
      // Show success message if it's not a fallback
      if (!data.fallback) {
        console.log("✅ Job description generated with Gemini AI!");
      }
      
    } catch (error) {
      console.error("Error generating job description:", error);
      console.log("🔄 Using fallback mock data");
      setJobDescription(MOCK_JOB_DESCRIPTION);
    } finally {
      setIsGenerating(false);
    }
  }

  async function createJob() {
    if (!jobTitle) return alert("Job Title is required");
    try {
      // Simulate job creation with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockJobId = `job_${Date.now()}`;
      setJobId(mockJobId);
        setCurrentJobTitle(jobTitle);
      
      if (!jobDescription) {
        setJobDescription(MOCK_JOB_DESCRIPTION);
      }
      
      alert(`Job created successfully: ${jobTitle}`);
      setActiveTab("upload");
    } catch (err) {
      console.error("Create job error", err);
      alert("Create job error. See console.");
    }
  }

  async function loadExistingJobs() {
    try {
      // Use mock data instead of API call for demo
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setJobOptions(MOCK_EXISTING_JOBS);
    } catch (e) {
      console.error(e);
      // Fallback to mock data
      setJobOptions(MOCK_EXISTING_JOBS);
    }
  }

  async function useExistingJob() {
    if (!existingJobId) return alert("Enter or select a job_id");
    try {
      // Find job in mock data
      const jobOption = jobOptions.find((j) => j.job_id === existingJobId);
      if (!jobOption) {
        return alert("Job not found");
      }
      
      setJobId(jobOption.job_id);
      setCurrentJobTitle(jobOption.title || "Untitled Job");
      setJobDescription(MOCK_JOB_DESCRIPTION);
      
      alert(`Using job: ${jobOption.title}`);
      setActiveTab("upload");
    } catch (e) {
      console.error(e);
      alert("Failed to use existing job");
    }
  }

  function onChooseFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadedFiles((prev) => [...prev, ...files]);
  }
  function removeSelectedFile(name: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== name));
  }

  async function refreshServerFiles(currentJobId?: string | null) {
    const id = currentJobId ?? jobId;
    if (!id) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/resumes/upload?job_id=${encodeURIComponent(id)}`
      );
      const data = await res.json();
      if (Array.isArray(data?.files)) setServerFiles(data.files);
    } catch (e) {
      console.error(e);
    }
  }

  async function uploadResumes() {
    if (!jobId) return alert("Create or pick a job first.");
    if (uploadedFiles.length === 0)
      return alert("Please choose one or more PDF resumes.");
    setUploading(true);
    try {
      console.log("📁 Uploading resumes to AI service...");
      
      // Try real upload to AI service first
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('job_id', jobId);
      
      const response = await fetch('http://localhost:8000/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("✅ Files uploaded successfully to AI service!", result);
        
        // Add uploaded files to server files list
        const uploadedFileNames = uploadedFiles.map(f => f.name);
        setServerFiles(prev => {
          const newFiles = [...prev, ...uploadedFileNames];
          return [...new Set(newFiles)];
        });
        
        alert(`Successfully uploaded ${uploadedFiles.length} files to AI service.`);
        setUploadedFiles([]);
      } else {
        throw new Error(`Upload failed: ${response.status}`);
      }
    } catch (e) {
      console.error("Upload to AI service failed:", e);
      console.log("🔄 Using fallback mock upload");
      
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      const uploadedFileNames = uploadedFiles.map(f => f.name);
      setServerFiles(prev => {
        const newFiles = [...prev, ...uploadedFileNames];
        return [...new Set(newFiles)];
      });
      
      alert(`Successfully uploaded ${uploadedFiles.length} files (mock mode).`);
      setUploadedFiles([]);
    } finally {
      setUploading(false);
    }
  }

  async function removeServerFile(name: string) {
    if (!jobId) return;
    try {
      const url = `${API_BASE}/api/resumes/upload?job_id=${encodeURIComponent(
        jobId
      )}&filename=${encodeURIComponent(name)}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || res.statusText);
      }
      await refreshServerFiles(jobId);
      alert(`Deleted ${name}`);
    } catch (e: any) {
      alert(`Failed to delete ${name}: ${e?.message || "Unknown error"}`);
    }
  }

  async function processWithAI() {
    if (!jobId) return alert("Create or pick a job first.");
    if (serverFiles.length === 0) return alert("Upload some resumes first.");
    setProcessing(true);
    try {
      console.log("🤖 Processing resumes with AI service...");
      
      // Try real AI processing first
      const response = await fetch('http://localhost:8000/api/resumes/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          files: serverFiles
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("✅ AI processing completed!", result);
        alert(`Successfully processed ${result.processed_count || serverFiles.length} candidates with AI. You can now run evaluation in the AI Screening tab.`);
      } else {
        throw new Error(`Processing failed: ${response.status}`);
      }
    } catch (e) {
      console.error("AI processing failed:", e);
      console.log("🔄 Using fallback mock processing");
      
      // Fallback to mock processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      const processedCount = serverFiles.length;
      alert(`Successfully processed ${processedCount} candidates with AI (mock mode). You can now run evaluation in the AI Screening tab.`);
    } finally {
      setProcessing(false);
    }
  }

  async function fetchScreeningSummary() {
    if (!jobId) return;
    try {
      console.log("📊 Fetching screening summary from AI service...");
      
      // Try real AI service first
      const response = await fetch(`http://localhost:8000/api/screening/summary?job_id=${jobId}`);
      
      if (response.ok) {
        const summary = await response.json();
        console.log("✅ Screening summary fetched from AI service!", summary);
        setSummary(summary);
      } else {
        throw new Error(`Failed to fetch screening summary: ${response.status}`);
      }
    } catch (e) {
      console.error("Failed to fetch screening summary from AI service:", e);
      console.log("🔄 Using fallback mock screening summary");
      
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockSummary = {
        job_title: currentJobTitle || "Senior Frontend Developer",
        total_resumes: serverFiles.length || 45,
        processed_resumes: serverFiles.length || 45,
        top_candidates_count: Math.min(8, serverFiles.length || 8),
        average_score: 78.5,
        last_updated: new Date().toISOString()
      };
      
      setSummary(mockSummary);
    }
  }

  async function runEvaluation() {
    if (!jobId) return alert("Create/pick a job and process resumes first.");
    setEvaluating(true);
    try {
      console.log("🎯 Running AI evaluation...");
      
      // Try real AI evaluation first
      const response = await fetch('http://localhost:8000/api/screening/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          job_description: jobDescription || "Senior Frontend Developer position"
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("✅ AI evaluation completed!", result);
        
        if (result.candidates && result.candidates.length > 0) {
          setEvaluationData(result.candidates);
          alert(`AI evaluation completed! Found ${result.candidates.length} evaluated candidates.`);
          setActiveTab("screening");
        return;
      }
      } else {
        throw new Error(`Evaluation failed: ${response.status}`);
      }
    } catch (e) {
      console.error("AI evaluation failed:", e);
      console.log("🔄 Using fallback mock evaluation");
      
      // Fallback to mock evaluation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock evaluated candidates data
      const mockTopCandidates = [
        {
          candidate_id: "cand_001",
          name: "JAYLA RAMIREZ",
          skills: ["Data Analyst", "Python", "SQL", "Machine Learning", "React", "TypeScript"],
          resume_summary: "Experienced Data Science Engineer with 7 years of experience in data analysis, machine learning, and business intelligence. Strong background in React and TypeScript development.",
          years_of_experience: 7.0,
          evaluation: {
            overall_score_0_to_100: 92,
            summary: "Excellent match for Senior Frontend Developer role. Strong technical skills in React and TypeScript, plus valuable data science background that adds unique perspective to product development."
          }
        },
        {
          candidate_id: "cand_002", 
          name: "ALEX CHEN",
          skills: ["React", "TypeScript", "Node.js", "JavaScript", "CSS", "HTML"],
          resume_summary: "Frontend Developer with 5 years experience building scalable web applications using modern JavaScript frameworks.",
          years_of_experience: 5.0,
          evaluation: {
            overall_score_0_to_100: 88,
            summary: "Strong frontend developer with excellent React and TypeScript skills. Perfect match for the role requirements with proven track record in modern web development."
          }
        },
        {
          candidate_id: "cand_003",
          name: "SARAH MARTINEZ", 
          skills: ["React", "Vue.js", "JavaScript", "CSS", "Python", "Django"],
          resume_summary: "Full-stack developer with expertise in React frontend development and Python backend systems.",
          years_of_experience: 6.0,
          evaluation: {
            overall_score_0_to_100: 85,
            summary: "Well-rounded full-stack developer with strong React skills. Backend experience is a plus for cross-team collaboration."
          }
        },
        {
          candidate_id: "cand_004",
          name: "MICHAEL JOHNSON",
          skills: ["JavaScript", "React", "Angular", "Node.js", "GraphQL"],
          resume_summary: "Senior Frontend Engineer with experience in multiple JavaScript frameworks and modern development practices.",
          years_of_experience: 8.0,
          evaluation: {
            overall_score_0_to_100: 81,
            summary: "Very experienced frontend developer with broad framework knowledge. Strong candidate with leadership potential."
          }
        }
      ];

      const mockAppliedCandidates = mockTopCandidates.slice(0, 2);
      const mockPotentialCandidates = mockTopCandidates.slice(2);

      const mockStats = {
        total_evaluated: 45,
        applied_candidates: 2,
        potential_candidates: 6,
        returned_count: 4,
        average_score: 86.5,
        processing_time: "2.3 seconds"
      };

      setTopCandidates(mockTopCandidates);
      setAppliedCandidates(mockAppliedCandidates);
      setPotentialCandidates(mockPotentialCandidates);
      setScreeningStats(mockStats);
      setActiveTab("screening");
    } finally {
      setEvaluating(false);
    }
  }

  const renderCandidateCard = (c: EvaluatedCandidate, idx: number) => {
    const score = c?.evaluation?.overall_score_0_to_100 ?? 0;
    const stars = Math.max(1, Math.min(5, Math.round((score / 100) * 5)));

    return (
      <div
        key={c?.candidate_id || idx}
        className="border border-gray-200 rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">
            {biasFreeModeEnabled
              ? `Candidate #${idx + 1}`
              : c?.name || `Candidate #${idx + 1}`}
          </h4>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < stars
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-600">{score}%</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div>
            <span className="text-xs font-medium text-gray-500">SKILLS</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {(c?.skills ?? []).slice(0, 10).map((s) => (
                <span
                  key={`${s}-${idx}`}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">YOE</span>
            <p className="text-sm text-gray-700 mt-1">
              {c?.years_of_experience ?? "—"} years
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">SUMMARY</span>
            <p className="text-sm text-gray-700 mt-1">
              {c?.evaluation?.summary || "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            {c?.applied_to_job ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                Applied to Job
              </span>
            ) : (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                Potential Match
              </span>
            )}
            {c?.original_job_id && c?.original_job_id !== jobId && (
              <span className="text-xs text-gray-500">
                Originally applied to:{" "}
                {c?.original_job_title || c.original_job_id}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button className="btn-secondary text-sm" type="button">
              View Profile
            </button>
            <button className="btn-primary text-sm" type="button">
              Move to Interviews
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Load recent jobs when Jobs tab opens
  useEffect(() => {
    if (activeTab === "jobs") loadExistingJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // When Upload tab opens (or jobId changes), list server files for that job
  useEffect(() => {
    if (activeTab === "upload" && jobId) refreshServerFiles(jobId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, jobId]);

  // If Screening tab open, fetch summary
  useEffect(() => {
    if (activeTab === "screening") fetchScreeningSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, jobId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Recruit Module</h1>
        <p className="text-muted-foreground">
          AI-powered job posting and candidate screening
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton
          id="jobs"
          label="Job Creation"
          icon={Briefcase}
          active={activeTab === "jobs"}
        />
        <TabButton
          id="upload"
          label="Resume Upload"
          icon={Upload}
          active={activeTab === "upload"}
        />
        <TabButton
          id="screening"
          label="AI Screening"
          icon={Brain}
          active={activeTab === "screening"}
        />
        {jobId && (
          <span className="text-xs text-muted-foreground ml-auto">
            Active Job:{" "}
            <span className="font-medium">
              {currentJobTitle || "Untitled Job"}
            </span>
          </span>
        )}
      </div>

      {/* Jobs */}
      {activeTab === "jobs" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create New Job */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Job
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  type="text"
                  className="input-field"
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills (comma separated)
                </label>
                <input
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  type="text"
                  className="input-field"
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nice To Have (comma separated)
                </label>
                <input
                  value={niceToHave}
                  onChange={(e) => setNiceToHave(e.target.value)}
                  type="text"
                  className="input-field"
                  placeholder="GraphQL, AWS"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    value={yearsExp}
                    onChange={(e) => setYearsExp(e.target.value)}
                    type="text"
                    className="input-field"
                    placeholder="3-5 years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education Requirement
                  </label>
                  <input
                    value={eduReq}
                    onChange={(e) => setEduReq(e.target.value)}
                    type="text"
                    className="input-field"
                    placeholder="Bachelor's in CS"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relevant Industry / Project Experience
                </label>
                <input
                  value={industryProj}
                  onChange={(e) => setIndustryProj(e.target.value)}
                  type="text"
                  className="input-field"
                  placeholder="e-commerce, fintech, SaaS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsibilities
                </label>
                <textarea
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  className="input-field min-h-[90px]"
                  placeholder="Build features, collaborate with backend, mentor juniors"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    AI Assistant
                  </span>
                </div>
                <p className="text-blue-800 text-sm mb-3">
                  Let AI help you create the perfect job description!
                </p>
                <button
                  className="btn-primary text-sm"
                  onClick={generateJD}
                  type="button"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Generate Description with AI
                </button>
              </div>
              {jobDescription && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Generated Job Description
                  </label>
                  <textarea
                    className="input-field min-h-[180px]"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              )}
              <button
                className="btn-primary w-full"
                onClick={createJob}
                type="button"
              >
                Create Job & Save
              </button>
            </div>
          </div>

          {/* Use Existing Job */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Use Existing Job
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pick from recent
                </label>
                <div className="flex gap-2">
                  <select
                    className="input-field"
                    onChange={(e) => setExistingJobId(e.target.value)}
                    value={existingJobId}
                  >
                    <option value="">— Select a job —</option>
                    {jobOptions.map((j) => (
                      <option key={j.job_id} value={j.job_id}>
                        {j.title || "(untitled)"} • {j.job_id}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={loadExistingJobs}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Or paste job_id
                </label>
                <div className="flex gap-2">
                  <input
                    className="input-field"
                    placeholder="e.g. 769a7894"
                    value={existingJobId}
                    onChange={(e) => setExistingJobId(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={useExistingJob}
                  >
                    Use Job
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use the custom <code>job_id</code>, not the Weaviate
                  object UUID.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload */}
      {activeTab === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resume Upload & Parsing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">
                    Bulk Upload
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose one or more PDF resumes
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={onChooseFiles}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-primary cursor-pointer"
                  >
                    Choose Files
                  </label>
                  <div className="mt-3 flex gap-2 justify-center">
                    <button
                      onClick={uploadResumes}
                      className="btn-secondary"
                      disabled={uploading || !uploadedFiles.length || !jobId}
                      title={uploadDisabledReason()}
                      type="button"
                    >
                      {uploading ? "Uploading..." : "Upload to Server"}
                    </button>
                    <button
                      onClick={processWithAI}
                      className="btn-primary"
                      disabled={processing || !jobId}
                      title={processDisabledReason()}
                      type="button"
                    >
                      {processing ? "Processing..." : "Process with AI"}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    jobId: {jobId ?? "null"} • files: {uploadedFiles.length} •
                    uploading: {String(uploading)} • processing:{" "}
                    {String(processing)}
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">
                    ATS Integration
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect to Workday, Greenhouse
                  </p>
                  <button className="btn-secondary" disabled type="button">
                    Configure API (coming soon)
                  </button>
                </div>
              </div>

              {/* Selected (not yet uploaded) */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Selected Files ({uploadedFiles.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded"
                      >
                        <div>
                          <span className="text-sm text-gray-700">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {Math.round(file.size / 1024)} KB
                          </span>
                        </div>
                        <button
                          type="button"
                          className="text-xs text-red-600 hover:underline"
                          onClick={() => removeSelectedFile(file.name)}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded to server */}
              {serverFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Uploaded to Server ({serverFiles.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {serverFiles.map((name) => (
                      <div
                        key={name}
                        className="flex items-center justify-between bg-green-50 p-3 rounded"
                      >
                        <span className="text-sm text-gray-700">{name}</span>
                        <button
                          type="button"
                          className="text-xs text-red-700 hover:underline"
                          onClick={() => removeServerFile(name)}
                        >
                          🗑 Delete from server
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Parsing Settings
            </h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={biasFreeModeEnabled}
                  onChange={(e) => setBiasFreeModeEnabled(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Bias-Free Mode</span>
              </label>
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 text-sm mb-2">
                  AI Parsing Features
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Extract skills & experience</li>
                  <li>• Education background</li>
                  <li>• Work history timeline</li>
                  <li>• Contact information</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <h4 className="font-medium text-purple-900 text-sm mb-2">
                  Social Crawling
                </h4>
                <div className="flex items-center space-x-2">
                  <Github className="h-4 w-4" />
                  <Linkedin className="h-4 w-4" />
                  <span className="text-xs">GitHub & LinkedIn data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screening */}
      {activeTab === "screening" && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Multi-Stage AI Screening Pipeline
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-600" />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchAllCandidates}
                      onChange={(e) => setSearchAllCandidates(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">
                      Search All Candidates
                    </span>
                  </label>
                </div>
                <button
                  className="btn-primary"
                  onClick={runEvaluation}
                  disabled={evaluating || !jobId}
                  type="button"
                >
                  {evaluating ? "Evaluating..." : "Run Evaluation"}
                </button>
              </div>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {searchAllCandidates
                  ? "🔍 Searching ALL candidates in database (applied + potential matches from other jobs)"
                  : "📋 Searching only candidates who applied to this specific job"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <h4 className="font-medium text-yellow-900">Fast Filter</h4>
                </div>
                <p className="text-sm text-yellow-800">
                  Remove non-tech resumes
                </p>
                <div className="mt-2 text-xs text-yellow-700">
                  ✓ {summary?.fast_filter_processed ?? 0} processed • ❌{" "}
                  {summary?.fast_filter_filtered ?? 0} filtered out
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <h4 className="font-medium text-blue-900">Semantic Search</h4>
                </div>
                <p className="text-sm text-blue-800">Match relevant skills</p>
                <div className="mt-2 text-xs text-blue-700">
                  ✓ {summary?.semantic_matched ?? 0} candidates matched
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <h4 className="font-medium text-green-900">LLM Evaluation</h4>
                </div>
                <p className="text-sm text-green-800">Detailed assessment</p>
                <div className="mt-2 text-xs text-green-700">
                  ✓ {summary?.llm_evaluated ?? 0} candidates evaluated
                </div>
              </div>
            </div>

            {screeningStats && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Screening Results
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Evaluated:</span>
                    <span className="ml-2 font-medium">
                      {screeningStats.total_evaluated}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Applied:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {screeningStats.applied_candidates}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Potential:</span>
                    <span className="ml-2 font-medium text-blue-600">
                      {screeningStats.potential_candidates}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Returned:</span>
                    <span className="ml-2 font-medium">
                      {screeningStats.returned_count}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {appliedCandidates.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Applied Candidates ({appliedCandidates.length})
                  </h3>
                </div>
                <button
                  className="btn-secondary"
                  onClick={fetchScreeningSummary}
                  disabled={!jobId}
                  type="button"
                >
                  Refresh Summary
                </button>
              </div>
              <div className="space-y-4">
                {appliedCandidates.map((c, idx) => renderCandidateCard(c, idx))}
              </div>
            </div>
          )}

          {potentialCandidates.length > 0 && (
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Potential Matches ({potentialCandidates.length})
                </h3>
              </div>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  These candidates didn't apply to this job but match your
                  requirements based on their profiles from other applications.
                </p>
              </div>
              <div className="space-y-4">
                {potentialCandidates.map((c, idx) =>
                  renderCandidateCard(c, idx)
                )}
              </div>
            </div>
          )}

          {/* Fallback for legacy single list */}
          {topCandidates.length > 0 &&
            appliedCandidates.length === 0 &&
            potentialCandidates.length === 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top Screened Candidates
                  </h3>
                  <button
                    className="btn-secondary"
                    onClick={fetchScreeningSummary}
                    disabled={!jobId}
                    type="button"
                  >
                    Refresh Summary
                  </button>
                </div>
                <div className="space-y-4">
                  {topCandidates.map((c, idx) => renderCandidateCard(c, idx))}
                </div>
              </div>
            )}

          {/* No results state */}
          {topCandidates.length === 0 &&
            appliedCandidates.length === 0 &&
            potentialCandidates.length === 0 && (
              <div className="card">
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Results Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Click "Run Evaluation" to start the AI screening process.
                  </p>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Recruit;
