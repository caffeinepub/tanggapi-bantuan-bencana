import { useQueryClient } from "@tanstack/react-query";
/**
 * Hook to initialize access control for password-based admin sessions.
 *
 * When an admin logs in via the password panel (no Internet Identity),
 * the actor is anonymous and the backend won't recognize them as admin/validator.
 * This hook re-runs `_initializeAccessControlWithSecret` whenever the actor
 * becomes ready AND there is an active password-admin session.
 *
 * Returns `isReady` - true once initialization has completed (or not needed).
 */
import { useEffect, useRef, useState } from "react";
import { getSecretParameter } from "../utils/urlParams";
import { useActor } from "./useActor";

const SESSION_KEY = "admin_panel_auth";

export function usePasswordAdminInit() {
  const { actor, isFetching } = useActor();
  const initializedRef = useRef<object | null>(null);
  const [isReady, setIsReady] = useState(false);
  const queryClient = useQueryClient();

  const isPasswordAdmin =
    typeof window !== "undefined" &&
    sessionStorage.getItem(SESSION_KEY) === "true";

  useEffect(() => {
    // If not a password admin session, mark as ready immediately
    if (!isPasswordAdmin) {
      setIsReady(true);
      return;
    }

    // Wait for actor to be ready
    if (isFetching || !actor) return;

    // Already initialized this actor instance
    if (initializedRef.current === actor) {
      setIsReady(true);
      return;
    }

    const adminToken = getSecretParameter("caffeineAdminToken") || "";
    setIsReady(false);

    actor
      ._initializeAccessControlWithSecret(adminToken)
      .then(() => {
        initializedRef.current = actor;
        setIsReady(true);
        // Invalidate permission-related queries so UI reflects admin status
        queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
        queryClient.invalidateQueries({
          queryKey: ["isCallerAdminOrValidator"],
        });
        queryClient.invalidateQueries({ queryKey: ["isCallerValidator"] });
      })
      .catch((err: unknown) => {
        console.warn(
          "usePasswordAdminInit: failed to init access control",
          err,
        );
        // Even if it failed, unblock the UI
        setIsReady(true);
      });
  }, [actor, isFetching, isPasswordAdmin, queryClient]);

  return { isReady: !isPasswordAdmin || isReady };
}
