import { useEffect } from "react";
import { DebugLogger } from "../Utility/DebugLogger";

export const useNotice = (setNoticeMessage: Function) => {
  // Pogly Standalone is self-host only; the upstream notice feed at
  // PoglyApp/.github/beacons/notice is for the Pogly team's own deployments.
  // We still fetch it for `localhost` so developers working on this codebase
  // can test the banner end-to-end, but skip it everywhere else.
  const isDevInstance: Boolean = window.location.href.includes("localhost");

  // TODO: Support for multiple notices at the same time

  useEffect(() => {
    if (!isDevInstance) return;

    DebugLogger("Fetching notice");

    (async () => {
      const response = await fetch("https://raw.githubusercontent.com/PoglyApp/.github/main/beacons/notice");
      const responseJson = await response.json();

      const closedNoticeId = localStorage.getItem("notice_id") || null;

      if (responseJson.notice === "") return setNoticeMessage(null);
      if (closedNoticeId === responseJson.id) return;

      setNoticeMessage({ noticeId: responseJson.id, notice: responseJson.notice });
    })();
  }, [isDevInstance, setNoticeMessage]);
};
