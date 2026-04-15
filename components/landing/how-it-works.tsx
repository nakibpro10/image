import { UserPlus, Key, Upload } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up with your email and password. It takes just a few seconds.",
  },
  {
    step: "02",
    icon: Key,
    title: "Add API Key",
    description: "Enter your free imgBB API key once. It gets saved securely and you never need to enter it again.",
  },
  {
    step: "03",
    icon: Upload,
    title: "Start Uploading",
    description: "Drag and drop or select images to upload. Get instant links and manage your gallery.",
  },
]

export function HowItWorks() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Three simple steps
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto text-balance">
            Get started in minutes. No complicated setup required.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="flex-1 relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-[60%] w-[80%] h-px bg-border" />
              )}
              <div className="glass-card rounded-3xl p-8 text-center relative z-10 h-full">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary/60 tracking-widest uppercase mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
