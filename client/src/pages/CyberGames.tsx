import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Gamepad2,
  Trophy,
  Users,
  Clock,
  Swords,
  Zap,
  ArrowRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container, Grid, Flex, SectionHeading } from "@/components/ui/layout";

const leaderboard = [
  { rank: 1, name: "neural_ninja", score: 9842, wins: 47 },
  { rank: 2, name: "deep_dragon", score: 9120, wins: 42 },
  { rank: 3, name: "tensor_titan", score: 8875, wins: 39 },
  { rank: 4, name: "backprop_beast", score: 8450, wins: 35 },
  { rank: 5, name: "gradient_ghost", score: 8012, wins: 31 },
];

const activeChallenges = [
  { id: 1, name: "MNIST Speedrun", entries: 234, deadline: "3 days", prize: "500 Hex" },
  { id: 2, name: "ImageNet Micro", entries: 156, deadline: "1 week", prize: "1,200 Hex" },
  { id: 3, name: "RL Arena", entries: 89, deadline: "2 weeks", prize: "2,500 Hex" },
];

export default function CyberGames() {
  return (
    <Container className="py-8 pt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Flex justify="between" wrap>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Gamepad2 className="h-7 w-7 text-violet-400" />
              CyberGames Arena
            </h1>
            <p className="mt-1 text-neutral-400">Compete. Climb. Conquer.</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button>
              <Swords className="h-4 w-4 mr-2" />
              Enter Arena
            </Button>
          </div>
        </Flex>
      </motion.div>

      {/* Stats */}
      <Grid cols={3} gap="md" className="mb-8">
        {[
          { icon: Trophy, label: "Top Rank", value: "#42", color: "text-amber-400" },
          { icon: Users, label: "Active Players", value: "3,847", color: "text-green-400" },
          { icon: Zap, label: "Live Matches", value: "23", color: "text-emerald-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-neutral-800 flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-extrabold font-mono ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-neutral-500">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Grid>

      <Grid cols={2} gap="md">
        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {leaderboard.map((player, i) => (
                  <div
                    key={player.name}
                    className="flex items-center justify-between rounded-xl px-4 py-2.5 hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center font-mono text-sm font-bold ${
                        i === 0 ? "text-amber-400" : i === 1 ? "text-neutral-300" : i === 2 ? "text-amber-600" : "text-neutral-600"
                      }`}>
                        #{player.rank}
                      </span>
                      <span className="text-sm font-medium text-white">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-neutral-400">{player.score.toLocaleString()} pts</span>
                      <span className="text-xs text-neutral-600">{player.wins} wins</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeChallenges.map((challenge) => (
                  <Link
                    key={challenge.id}
                    to={`/cybergames/${challenge.id}`}
                    className="block rounded-xl border border-neutral-800/60 bg-neutral-850/50 p-4 hover:border-green-500/20 hover:shadow-[0_0_15px_rgba(34, 197, 94,0.08)] transition-all duration-300"
                  >
                    <Flex justify="between" className="mb-2">
                      <h4 className="font-semibold text-white">{challenge.name}</h4>
                      <Badge variant="default">{challenge.prize}</Badge>
                    </Flex>
                    <Flex gap="sm">
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Users className="h-3 w-3" /> {challenge.entries} entries
                      </span>
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {challenge.deadline}
                      </span>
                    </Flex>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    </Container>
  );
}