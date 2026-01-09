import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import { resumes } from "../../constant/Index";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Reusmind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const {auth} = usePuterStore();
  const navigate = useNavigate();
  useEffect(() =>{
if(!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated])
  return (
    <main className="bg-[url('/images/bg-image.png')] bg-cover bg-center bg-no-repeat">

      <Navbar />
      <section className="main-section container mx-auto">
        <div className="page-heading">
          <h1>Track Your Applications & Resume</h1>
          <h2>
            Review your submissions and check AI-powered feedback on your resume
          </h2>
        </div>
      </section>

      {resumes.length > 0 && (
        <div className="resumes-section container mx-auto">
          {resumes.map((resume) => (
            <div className="">
              <ResumeCard key={resume.id} resume={resume} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
