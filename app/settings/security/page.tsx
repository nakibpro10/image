import SecuritySettingsPanel from "@/components/settings/security-settings-panel"

export const metadata = {
  title: "Security Settings - CloudPix",
}

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Security Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your password, two-factor authentication, and login security
        </p>
      </div>

      <SecuritySettingsPanel />
    </div>
  )
}
