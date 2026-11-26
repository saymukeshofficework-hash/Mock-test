import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/store/auth";
import { activeDays, countToday, listAttempts, type AttemptStatus } from "@/services/attempts";
import { caDay, caIndex } from "@/services/currentAffairs";

export const useUid = () => useAuth((s) => s.session?.user.id ?? null);

export function useAttempts(status?: AttemptStatus) {
  const uid = useUid();
  return useQuery({ queryKey: ["attempts", uid, status ?? "all"], enabled: !!uid, staleTime: 0, queryFn: () => listAttempts(uid!, status) });
}

export function useStudyStats() {
  const uid = useUid();
  return useQuery({
    queryKey: ["attempts", uid, "stats"],
    enabled: !!uid,
    staleTime: 0,
    queryFn: async () => {
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      since.setDate(since.getDate() - 6);
      const [days, today] = await Promise.all([activeDays(uid!, since.getTime()), countToday(uid!)]);
      return { days, today, since };
    },
  });
}

export function useCaDay(day?: string) {
  return useQuery({ queryKey: ["ca", day ?? "latest"], queryFn: () => caDay(day), staleTime: 15 * 60 * 1000 });
}
export function useCaIndex() {
  return useQuery({ queryKey: ["ca-index"], queryFn: caIndex, staleTime: 15 * 60 * 1000 });
}
