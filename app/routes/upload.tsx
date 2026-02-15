import {useState, type FormEvent} from 'react'
import FlileUploader from '~/components/FlileUploader';
import Navbar from '~/components/Navbar'

const upload = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file,setFile] = useState<File | null>(null)


    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {

    }
    return (
    <main className="bg-[url('/images/bg-image.png')] bg-cover">

      <Navbar />
      <section className="main-section">
            <div className="page-heading py-16">
                <h1>Smart feedback for your dream job!</h1>
                {isProcessing ? (
                    <>
                    <h2>{statusText}</h2>
                    <img src="/images/resume-scan.gif" className="w-full h-full object-cover" alt="resume-scan" />
                    </>
                ):(
                    <h2>Drop you resume for an ATS score and improvment</h2>
                )}
                {!isProcessing &&(
                    <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                        <div className="form-div">
                            <label htmlFor="company-name">Company Name</label>
                            <input type="text" name='company-name' placeholder="Enter company name" id='company-name' />
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-title">Job Title</label>
                            <input type="text" name='job-title' placeholder="Job Title" id='job-title' />
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-description">Job Title</label>
                            <textarea rows={5} name='job-description' placeholder="Job Title" id='job-description' />
                        </div>
                        <div className="form-div">
                            <label htmlFor="uploader">Upload Resume</label>
                           <FlileUploader onFileSelect={handleFileSelect}/>
                        </div>
                        <button type="submit" className="primary-button">Analyze Resume</button>
                    </form>
                )}
            </div>
        </section>
        </main>
  )
}

export default upload