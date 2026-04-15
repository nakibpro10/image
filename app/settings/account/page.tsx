import AccountSettingsPanel from "@/components/settings/account-settings-panel"

export const metadata = {
  title: "Account Settings - CloudPix",
}

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your account details and preferences
        </p>
      </div>

      <AccountSettingsPanel />
    </div>
  )
}
