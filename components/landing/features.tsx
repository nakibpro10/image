import { Shield, Infinity, Link2, Eye, Globe, Smartphone } from "lucide-react"

const features = [
  {
    icon: Infinity,
    title: "Unlimited Uploads",
    description: "Upload as many images as you want with no storage limits. Your creativity has no bounds.",
  },
  {
    icon: Link2,
    title: "Direct Links",
    description: "Get instant direct URLs for every upload. Share anywhere, embed everywhere.",
  },
  {
    icon: Shield,
    title: "Secure Storage",
    description: "Your images are safely stored with enterprise-grade security via imgBB CDN.",
  },
  {
    icon: Eye,
    title: "Gallery View",
    description: "Browse your uploads in a beautiful, responsive gallery with liquid glass design.",
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "Images served from worldwide CDN nodes for blazing fast load times.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Upload and manage images from any device with our responsive design.",
  },
]

export function Features() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Everything you need for image hosting
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            A complete platform with the tools you need to upload, manage, and share your images effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-card rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
