import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  Shield,
  Terminal,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container, Grid, Stack, Flex } from "@/components/ui/layout";
import { useAuth } from "@/contexts/auth";
import { SkeletonPage } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) return <SkeletonPage rows={3} />;

  return (
    <Container className="py-8 pt-24" narrow>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Settings className="h-7 w-7 text-cyan-400" />
          Settings
        </h1>
        <p className="mt-1 text-neutral-400">Manage your account and preferences</p>
      </motion.div>

      <Grid cols={2} gap="md">
        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-400" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Stack gap="md">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-2xl font-extrabold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{user.username}</p>
                    <p className="text-sm text-neutral-500">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400">Username</label>
                  <input
                    type="text"
                    defaultValue={user.username}
                    className="input-cyber"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400">Email</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="input-cyber"
                  />
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-violet-400" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Stack gap="sm">
                {["Training completions", "Experiment failures", "Model deployment status", "Weekly digests"].map((item) => (
                  <label key={item} className="flex items-center justify-between py-2 cursor-pointer">
                    <span className="text-sm text-neutral-300">{item}</span>
                    <input type="checkbox" defaultChecked className="rounded border-neutral-700 bg-neutral-800 text-cyan-500 focus:ring-cyan-500/50" />
                  </label>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Stack gap="sm">
                <Button variant="outline" className="w-full justify-start">
                  <Terminal className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start text-rose-400 hover:text-rose-300 border-rose-500/20 hover:border-rose-500/40">
                  Delete Account
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    </Container>
  );
}