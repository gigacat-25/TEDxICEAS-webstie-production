import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: "url('/noise.svg')" }}></div>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="font-orbitron font-black text-3xl tracking-tight text-white">
            TEDx<span className="text-[#EB0028]">ICEAS</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-white/50 font-orbitron mt-2">
            Ideas Worth Spreading
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              card: "bg-zinc-950/60 border border-white/10 backdrop-blur-md shadow-2xl rounded-2xl",
              headerTitle: "text-white font-orbitron font-bold",
              headerSubtitle: "text-white/60 font-clash",
              socialButtonsBlockButton: "bg-zinc-900 border border-white/10 text-white hover:bg-white/5 transition-colors",
              socialButtonsBlockButtonText: "text-white font-clash",
              dividerLine: "bg-white/10",
              dividerText: "text-white/40 font-clash",
              formFieldLabel: "text-white/70 font-clash text-xs font-semibold uppercase tracking-wider",
              formFieldInput: "bg-zinc-900 border border-white/10 text-white focus:border-[#EB0028] transition-colors rounded-lg py-3 px-4",
              formButtonPrimary: "bg-[#EB0028] hover:bg-[#c30020] text-white font-clash uppercase font-semibold text-xs tracking-wider transition-colors py-3",
              footerActionText: "text-white/60 font-clash",
              footerActionLink: "text-[#EB0028] hover:text-[#c30020] font-clash",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-[#EB0028]",
            },
          }}
        />
      </div>
    </div>
  );
}
