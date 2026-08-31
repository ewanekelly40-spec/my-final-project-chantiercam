import React from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
};

const make = (paths) => (props) =>
  (
    <svg {...base} {...props}>
      {paths}
    </svg>
  );

export const IconUser = make(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </>
);
export const IconHardHat = make(
  <>
    <path d="M3 18h18" />
    <path d="M5 18a7 7 0 0 1 14 0" />
    <path d="M12 7V4" />
    <path d="M9 4h6" />
  </>
);
export const IconClipboard = make(
  <>
    <rect x="6" y="4" width="12" height="17" rx="2" />
    <rect x="9" y="2.5" width="6" height="3.5" rx="1" />
    <path d="M9 11h6M9 15h6" />
  </>
);
export const IconMail = make(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </>
);
export const IconLock = make(
  <>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </>
);
export const IconEye = make(
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </>
);
export const IconEyeOff = make(
  <>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a13.9 13.9 0 0 1-3 3.9M6.2 6.2C3.9 7.7 2 10 2 12s3.5 7 10 7a10.3 10.3 0 0 0 4.2-.9" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </>
);
export const IconHome = make(
  <>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10v10h12V10" />
  </>
);
export const IconFolder = make(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />);
export const IconUsers = make(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.8 20c0-3.6 2.9-6 6.2-6s6.2 2.4 6.2 6" />
    <path d="M16 8.2a3 3 0 1 1 0 6" />
    <path d="M18.5 14.3c2 .4 3.7 2.2 3.7 5.7" />
  </>
);
export const IconCheckSquare = make(
  <>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </>
);
export const IconPackage = make(
  <>
    <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </>
);
export const IconCreditCard = make(
  <>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 10h19" />
    <path d="M6 15h4" />
  </>
);
export const IconPieChart = make(
  <>
    <path d="M12 2v10l8.5 5" />
    <path d="M21.5 12A9.5 9.5 0 1 1 12 2.5" />
  </>
);
export const IconCamera = make(
  <>
    <path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13.5" r="3.6" />
  </>
);
export const IconMessage = make(<path d="M21 12a8 8 0 1 1-3.4-6.5L21 4l-1.2 4.3A7.9 7.9 0 0 1 21 12Z" />);
export const IconBell = make(
  <>
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>
);
export const IconSettings = make(
  <>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 13.5a1.8 1.8 0 0 0 .36 1.98l.05.05a2.2 2.2 0 1 1-3.1 3.1l-.05-.05a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.65V20a2.2 2.2 0 1 1-4.4 0v-.08a1.8 1.8 0 0 0-1.18-1.65 1.8 1.8 0 0 0-1.98.36l-.05.05a2.2 2.2 0 1 1-3.1-3.1l.05-.05a1.8 1.8 0 0 0 .36-1.98 1.8 1.8 0 0 0-1.65-1.1H2a2.2 2.2 0 1 1 0-4.4h.08a1.8 1.8 0 0 0 1.65-1.18 1.8 1.8 0 0 0-.36-1.98l-.05-.05a2.2 2.2 0 1 1 3.1-3.1l.05.05a1.8 1.8 0 0 0 1.98.36H8.5a1.8 1.8 0 0 0 1.1-1.65V2a2.2 2.2 0 1 1 4.4 0v.08a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 1.98-.36l.05-.05a2.2 2.2 0 1 1 3.1 3.1l-.05.05a1.8 1.8 0 0 0-.36 1.98v.07a1.8 1.8 0 0 0 1.65 1.1H22a2.2 2.2 0 1 1 0 4.4h-.08a1.8 1.8 0 0 0-1.65 1.1Z" />
  </>
);
export const IconLogOut = make(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </>
);
export const IconPlus = make(<path d="M12 5v14M5 12h14" />);
export const IconX = make(<path d="M18 6 6 18M6 6l12 12" />);
export const IconChevronDown = make(<path d="M6 9l6 6 6-6" />);
export const IconMapPin = make(
  <>
    <path d="M12 22s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z" />
    <circle cx="12" cy="10" r="2.4" />
  </>
);
export const IconCalendar = make(
  <>
    <rect x="3.5" y="5" width="17" height="16" rx="2.2" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </>
);
export const IconPhone = make(
  <path d="M4.5 3.5h3.7l1.6 4.5-2.2 1.8a13 13 0 0 0 6.1 6.1l1.8-2.2 4.5 1.6v3.7a1.6 1.6 0 0 1-1.7 1.6A17.6 17.6 0 0 1 2.9 5.2a1.6 1.6 0 0 1 1.6-1.7Z" />
);
export const IconTrash = make(
  <>
    <path d="M4 7h16" />
    <path d="M9 7V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V7" />
    <path d="M6 7l1 13.2A2 2 0 0 0 9 22h6a2 2 0 0 0 2-1.8L18 7" />
    <path d="M10 11v6M14 11v6" />
  </>
);
export const IconEdit = make(
  <>
    <path d="M4 20h4.2L19 9.2a2.5 2.5 0 0 0-4.2-4.2L4 15.8V20Z" />
    <path d="M13.5 6.5l4 4" />
  </>
);
export const IconCheck = make(<path d="M4 12.5l5.5 5.5L20 6" />);
export const IconXCircle = make(
  <>
    <circle cx="12" cy="12" r="9.2" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </>
);
export const IconUpload = make(
  <>
    <path d="M12 16V4" />
    <path d="M7 9l5-5 5 5" />
    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </>
);
export const IconCopy = make(
  <>
    <rect x="9" y="9" width="12" height="12" rx="2.2" />
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
  </>
);
export const IconSearch = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </>
);
export const IconArrowRight = make(<path d="M5 12h14M13 6l6 6-6 6" />);
export const IconBuilding = make(
  <>
    <rect x="4" y="3" width="10" height="18" rx="1" />
    <rect x="14" y="9" width="6" height="12" rx="1" />
    <path d="M7 7h1M10 7h1M7 11h1M10 11h1M7 15h1M10 15h1" />
  </>
);
export const IconDollar = make(
  <>
    <path d="M12 2v20" />
    <path d="M17 6.5C17 4.6 14.8 3 12 3S7 4.6 7 6.5 9.2 9.5 12 9.5s5 1.4 5 3.5-2.2 3.5-5 3.5-5-1.6-5-3.5" />
  </>
);
export const IconMenu = make(<path d="M3 6h18M3 12h18M3 18h18" />);
export const IconImage = make(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2.2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M21 16l-5.5-5.5L4 21" />
  </>
);
export const IconVideo = make(
  <>
    <rect x="2.5" y="6" width="13" height="12" rx="2" />
    <path d="M15.5 10l6-3.2v10.4l-6-3.2" />
  </>
);
export const IconTrendUp = make(
  <>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </>
);
export const IconAlert = make(
  <>
    <path d="M12 3 2 21h20L12 3Z" />
    <path d="M12 10v5" />
    <circle cx="12" cy="18" r="0.6" fill="currentColor" />
  </>
);
export const IconSend = make(<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />);
export const IconGlobe = make(
  <>
    <circle cx="12" cy="12" r="9.2" />
    <path d="M2.8 12h18.4M12 2.8c2.6 2.6 4 6 4 9.2s-1.4 6.6-4 9.2c-2.6-2.6-4-6-4-9.2s1.4-6.6 4-9.2Z" />
  </>
);
export const IconMoon = make(<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z" />);
export const IconLayers = make(
  <>
    <path d="M12 2 2 7l10 5 10-5-10-5Z" />
    <path d="M2 12l10 5 10-5" />
    <path d="M2 17l10 5 10-5" />
  </>
);
export const IconFileText = make(
  <>
    <path d="M7 2h7l5 5v15H7Z" />
    <path d="M14 2v5h5" />
    <path d="M9.5 12.5h5M9.5 16h5" />
  </>
);
export const IconArrowUp = make(<path d="M12 19V5M6 11l6-6 6 6" />);
export const IconArrowDown = make(<path d="M12 5v14M6 13l6 6 6-6" />);
export const IconPrinter = make(
  <>
    <path d="M6 9V3h12v6" />
    <rect x="4" y="9" width="16" height="8" rx="1.5" />
    <path d="M6 14h12v7H6Z" />
  </>
);
export const IconChevronLeft = make(<path d="M15 5l-7 7 7 7" />);
export const IconChevronRight = make(<path d="M9 5l7 7-7 7" />);
