import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Resumind | Auth" },
  { name: "description", content: "Description" },
];
function Auth() {
  const {isLoading, auth} = usePuterStore();
  const location = useLocation();
  const next = location.search.split('next=')[1];
  const navigate = useNavigate();
  useEffect(() =>{
if(auth.isAuthenticated) navigate(next || '/');
  }, [auth.isAuthenticated, next])
  return (
  <main className="bg-[url('/images/bg-auth.png')] bg-cover min-h-screen flex items-center justify-center">
    <div className="gradient-border shadow-lg">
      <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
        <div className="flex flex-col gap-2 items-center text-center">
        <h1 className="">Welcome to Resumind</h1>
        <h2>Log in to your account</h2>
        </div>
        <div className="">{
          isLoading ? (
            <button className="auth-button animate-pulse">
              <p>signing in...</p>
            </button>
          ) : (
            <>
            {auth.isAuthenticated ? (
              <button className="auth-button" onClick={auth.signOut}><p>Log Out</p></button>
            ):(
              <button className="auth-button" onClick={auth.signIn}> <p> Log In</p></button>
            )}
            </>
          )
          }</div>
      </section>
    </div>
  </main>
);
}

export default Auth;
