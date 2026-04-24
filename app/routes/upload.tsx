import { prepareInstructions } from "constant/Index";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FlileUploader from "~/components/FlileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdf2Img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

/** Plain text from Puter / Claude-style chat responses. */
function extractAssistantText(response: AIResponse): string {
  const raw = response.message?.content;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    const parts = raw
      .map((item) => {
        if (item && typeof item === "object" && "text" in item) {
          return String((item as { text: string }).text);
        }
        return "";
      })
      .filter(Boolean);
    return parts.join("\n");
  }
  return "";
}

/** Strip optional ```json fences before JSON.parse. */
function parseModelJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const inner = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(inner);
}

const upload = () => {
  const navigate = useNavigate();
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<unknown>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };
  const handleAnalyzeResume = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File | null;
  }) => {
    setIsProcessing(true);
    setFeedbackResult(null);
    setStatusText("Analyzing resume...");
    try {
      if (!file) {
        setStatusText("Error: Please upload a file");
        return;
      }
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) {
        setStatusText("Error:Failed to upload file");
        return;
      }
      setStatusText("Converting to image...");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file) {
        setStatusText("Error:Failed to convert PDF to Image");
        return;
      }
      setStatusText("Uploading the Image...");
      const uploadedImage = await fs.upload([imageFile.file]);
      if (!uploadedImage) {
        setStatusText("Error:Failed to upload image");
        return;
      }
      setStatusText("Preparing the data");
      const uuid = generateUUID();
      let resumePayload = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: null as unknown,
      };
      await kv.set(`resume${uuid}`, JSON.stringify(resumePayload));
      setStatusText("Analyzing resume...");
      const aiResponse = await ai.feedback(
        uploadedImage.path,
        prepareInstructions({ jobTitle, jobDescription }),
      );
      if (!aiResponse) {
        setStatusText("Error:Failed to analyze resume");
        return;
      }
      const feedbackText = extractAssistantText(aiResponse);
      if (!feedbackText.trim()) {
        setStatusText("Error: Empty model response");
        return;
      }
      try {
        resumePayload = {
          ...resumePayload,
          feedback: parseModelJson(feedbackText),
        };
      } catch {
        resumePayload = { ...resumePayload, feedback: feedbackText };
      }
      await kv.set(`resume${uuid}`, JSON.stringify(resumePayload));
      setFeedbackResult(resumePayload.feedback);
      setStatusText("Resume analyzed successfully");
      console.log("Feedback payload:", resumePayload.feedback);
    } catch (err) {
      setStatusText(
        err instanceof Error ? `Error: ${err.message}` : "Error: Analysis failed",
      );
    } finally {
      setIsProcessing(false);
    }
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    handleAnalyzeResume({ companyName, jobTitle, jobDescription, file });
  };
  return (
    <main className="bg-[url('/images/bg-image.png')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job!</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img
                src="/images/resume-scan.gif"
                className="w-full h-full object-cover"
                alt="resume-scan"
              />
            </>
          ) : (
            <h2>Drop you resume for an ATS score and improvment</h2>
          )}
         {/* {!isProcessing && feedbackResult != null && (
            <div className="mt-6 max-w-3xl rounded-lg bg-black/40 p-4 text-left text-sm text-white">
              <h3 className="mb-2 font-semibold">Feedback</h3>
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words font-sans">
                {typeof feedbackResult === "string"
                  ? feedbackResult
                  : JSON.stringify(feedbackResult, null, 2)}
              </pre>
            </div>
          )}  */}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Enter company name"
                  id="company-name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FlileUploader onFileSelect={handleFileSelect} />
              </div>
              <button type="submit" className="primary-button">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default upload;
