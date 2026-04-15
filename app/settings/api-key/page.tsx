import ApiKeySettingsPanel from "@/components/settings/api-key-settings-panel"

export const metadata = {
  title: "API Key Settings - CloudPix",
}

export default function ApiKeyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">API Key Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your imgBB API key for image uploads
        </p>
      </div>

      <ApiKeySettingsPanel />
    </div>
  )
}
